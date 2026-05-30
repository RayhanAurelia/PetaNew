import type { SupabaseClient } from "@supabase/supabase-js";
import type { Subject } from "@/src/domain/entities/subject";
import type {
  CreateSubjectInput,
  ISubjectRepository,
  UpdateSubjectInput,
} from "@/src/domain/repositories/ISubjectRepository";
import {
  InvalidSubjectDataError,
  PrimarySelfAlreadyExistsError,
  SubjectNotFoundError,
  SubjectOperationFailedError,
} from "@/src/domain/errors/subjectErrors";
import {
  SubjectMapper,
  type LatestGrowthRow,
  type SubjectEnrichedRow,
} from "../../mappers/subjectMapper";

const ENRICHED_VIEW = "subjects_enriched";
const LATEST_GROWTH_VIEW = "latest_growth";
const SUBJECTS_TABLE = "subjects";

export class SupabaseSubjectRepository implements ISubjectRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listByProfile(profileId: string): Promise<Subject[]> {
    const { data, error } = await this.client
      .from(ENRICHED_VIEW)
      .select("*")
      .eq("profile_id", profileId)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw new SubjectOperationFailedError(error.message);
    }

    const rows = (data ?? []) as SubjectEnrichedRow[];
    if (rows.length === 0) return [];

    const latestMap = await this.fetchLatestGrowthMap(rows.map((r) => r.id));

    return rows.map((row) =>
      SubjectMapper.toDomain(row, latestMap.get(row.id) ?? null),
    );
  }

  async findById(id: string): Promise<Subject | null> {
    const { data, error } = await this.client
      .from(ENRICHED_VIEW)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new SubjectOperationFailedError(error.message);
    }
    if (!data) return null;

    const latestMap = await this.fetchLatestGrowthMap([id]);
    return SubjectMapper.toDomain(
      data as SubjectEnrichedRow,
      latestMap.get(id) ?? null,
    );
  }

  /**
   * Ambil 1 row per subject dari view `latest_growth`. Fail-soft: kalau view
   * tidak bisa diakses (mis. RLS), kembalikan map kosong supaya card tetap
   * tampil dengan status "Belum diukur".
   */
  private async fetchLatestGrowthMap(
    subjectIds: string[],
  ): Promise<Map<string, LatestGrowthRow>> {
    if (subjectIds.length === 0) return new Map();

    const { data, error } = await this.client
      .from(LATEST_GROWTH_VIEW)
      .select(
        "subject_id, weight_kg, height_cm, bmi, recorded_at, stunting_status",
      )
      .in("subject_id", subjectIds);

    if (error || !data) {
      console.warn(
        `[SupabaseSubjectRepository] latest_growth lookup failed: ${error?.message ?? "no data"}`,
      );
      return new Map();
    }

    return new Map(
      (data as LatestGrowthRow[]).map((row) => [row.subject_id, row]),
    );
  }

  async create(
    profileId: string,
    input: CreateSubjectInput,
  ): Promise<Subject> {
    const { data, error } = await this.client
      .from(SUBJECTS_TABLE)
      .insert({
        profile_id: profileId,
        name: input.name,
        gender: input.gender,
        birth_date: input.birthDate,
        relationship: input.relationship,
        height_cm: input.heightCm,
        activity_level: input.activityLevel,
        is_primary: input.isPrimary,
        avatar_url: input.avatarUrl ?? null,
      })
      .select("id")
      .single();

    if (error) {
      mapDbError(error);
    }
    if (!data) {
      throw new SubjectOperationFailedError("Gagal membuat subjek baru");
    }

    const created = await this.findById(data.id);
    if (!created) throw new SubjectOperationFailedError();
    return created;
  }

  async update(id: string, input: UpdateSubjectInput): Promise<Subject> {
    const patch: Record<string, unknown> = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.gender !== undefined) patch.gender = input.gender;
    if (input.birthDate !== undefined) patch.birth_date = input.birthDate;
    if (input.relationship !== undefined) patch.relationship = input.relationship;
    if (input.heightCm !== undefined) patch.height_cm = input.heightCm;
    if (input.activityLevel !== undefined)
      patch.activity_level = input.activityLevel;
    if (input.isPrimary !== undefined) patch.is_primary = input.isPrimary;
    if (input.avatarUrl !== undefined) patch.avatar_url = input.avatarUrl;

    if (Object.keys(patch).length === 0) {
      const current = await this.findById(id);
      if (!current) throw new SubjectNotFoundError();
      return current;
    }

    const { error } = await this.client
      .from(SUBJECTS_TABLE)
      .update(patch)
      .eq("id", id);

    if (error) {
      mapDbError(error);
    }

    const updated = await this.findById(id);
    if (!updated) throw new SubjectNotFoundError();
    return updated;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from(SUBJECTS_TABLE)
      .delete()
      .eq("id", id);

    if (error) {
      throw new SubjectOperationFailedError(error.message);
    }
  }
}

/** Petakan error Postgres jadi domain error yang lebih jelas. */
function mapDbError(error: { code?: string; message: string }): never {
  const msg = error.message.toLowerCase();
  // 23505 = unique_violation (Postgres)
  if (
    error.code === "23505" ||
    msg.includes("unique_one_primary_subject_per_profile") ||
    (msg.includes("duplicate") && msg.includes("primary"))
  ) {
    throw new PrimarySelfAlreadyExistsError();
  }
  // 23514 = check_violation
  if (error.code === "23514" || msg.includes("check constraint")) {
    if (msg.includes("check_self_relationship")) {
      throw new InvalidSubjectDataError(
        "Subjek utama hanya boleh untuk relationship 'self'",
      );
    }
    if (msg.includes("check_subject_birth_past")) {
      throw new InvalidSubjectDataError(
        "Tanggal lahir tidak boleh di masa depan",
      );
    }
    if (msg.includes("check_subject_height")) {
      throw new InvalidSubjectDataError("Tinggi harus antara 0 dan 300 cm");
    }
    if (msg.includes("check_subject_activity")) {
      throw new InvalidSubjectDataError(
        "Level aktivitas harus antara 1.0 dan 2.5",
      );
    }
    throw new InvalidSubjectDataError(error.message);
  }
  throw new SubjectOperationFailedError(error.message);
}
