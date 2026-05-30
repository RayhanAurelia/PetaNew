import type { SupabaseClient } from "@supabase/supabase-js";
import type { GrowthLog } from "@/src/domain/entities/growthLog";
import type {
  CreateGrowthLogInput,
  IGrowthLogRepository,
} from "@/src/domain/repositories/IGrowthLogRepository";
import {
  GrowthLogOperationFailedError,
  InvalidGrowthLogDataError,
} from "@/src/domain/errors/growthLogErrors";
import {
  GrowthLogMapper,
  type GrowthLogRow,
} from "../../mappers/growthLogMapper";

const TABLE = "growth_log";

export class SupabaseGrowthLogRepository implements IGrowthLogRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listBySubject(subjectId: string): Promise<GrowthLog[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("subject_id", subjectId)
      .order("recorded_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw new GrowthLogOperationFailedError(error.message);
    return (data ?? []).map((r) => GrowthLogMapper.toDomain(r as GrowthLogRow));
  }

  async findById(id: string): Promise<GrowthLog | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new GrowthLogOperationFailedError(error.message);
    if (!data) return null;
    return GrowthLogMapper.toDomain(data as GrowthLogRow);
  }

  async create(
    subjectId: string,
    input: CreateGrowthLogInput,
  ): Promise<GrowthLog> {
    const { data, error } = await this.client
      .from(TABLE)
      .insert({
        subject_id: subjectId,
        weight_kg: input.weightKg,
        height_cm: input.heightCm,
        recorded_at: input.recordedAt,
        description: input.description ?? null,
      })
      .select("*")
      .single();

    if (error) {
      mapDbError(error);
    }
    if (!data) {
      throw new GrowthLogOperationFailedError("Gagal membuat catatan pengukuran");
    }
    return GrowthLogMapper.toDomain(data as GrowthLogRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from(TABLE).delete().eq("id", id);
    if (error) throw new GrowthLogOperationFailedError(error.message);
  }
}

function mapDbError(error: { code?: string; message: string }): never {
  const msg = error.message.toLowerCase();
  if (error.code === "23514" || msg.includes("check constraint")) {
    if (msg.includes("check_growth_log_weight")) {
      throw new InvalidGrowthLogDataError("Berat harus antara 0 dan 500 kg");
    }
    if (msg.includes("check_growth_log_height")) {
      throw new InvalidGrowthLogDataError("Tinggi harus antara 0 dan 300 cm");
    }
    throw new InvalidGrowthLogDataError(error.message);
  }
  throw new GrowthLogOperationFailedError(error.message);
}
