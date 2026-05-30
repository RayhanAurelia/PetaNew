import {
  Subject,
  type Gender,
  type LifeStage,
  type Relationship,
} from "@/src/domain/entities/subject";
import type { StuntingStatus } from "@/src/domain/entities/growthLog";

export interface SubjectEnrichedRow {
  id: string;
  profile_id: string;
  name: string;
  gender: Gender;
  birth_date: string;
  relationship: Relationship;
  height_cm: string | number | null;
  activity_level: string | number | null;
  is_primary: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  life_stage: LifeStage;
  age_years: number;
  age_months: number;
}

/** Row dari view `latest_growth` (1 row per subject_id). */
export interface LatestGrowthRow {
  subject_id: string;
  weight_kg: string | number;
  height_cm: string | number;
  bmi: string | number | null;
  recorded_at: string;
  stunting_status: StuntingStatus | null;
}

export class SubjectMapper {
  static toDomain(
    row: SubjectEnrichedRow,
    latest: LatestGrowthRow | null = null,
  ): Subject {
    const heightCm = row.height_cm == null ? null : Number(row.height_cm);
    const activityLevel =
      row.activity_level == null ? 1.2 : Number(row.activity_level);

    const latestGrowth = latest
      ? {
          weightKg: Number(latest.weight_kg),
          heightCm: Number(latest.height_cm),
          bmi: latest.bmi == null ? null : Number(latest.bmi),
          recordedAt: latest.recorded_at,
          stuntingStatus: latest.stunting_status,
        }
      : null;

    return new Subject(
      row.id,
      row.profile_id,
      row.name,
      row.gender,
      row.birth_date,
      row.relationship,
      heightCm,
      activityLevel,
      row.is_primary,
      row.avatar_url,
      new Date(row.created_at),
      new Date(row.updated_at),
      row.life_stage,
      Number(row.age_years),
      Number(row.age_months),
      latestGrowth,
    );
  }
}
