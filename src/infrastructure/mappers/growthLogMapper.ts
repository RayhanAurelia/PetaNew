import {
  GrowthLog,
  type StuntingStatus,
  type WastingStatus,
} from "@/src/domain/entities/growthLog";

export interface GrowthLogRow {
  id: string;
  subject_id: string;
  weight_kg: string | number;
  height_cm: string | number;
  bmi: string | number | null;
  height_for_age: string | number | null;
  weight_for_age: string | number | null;
  weight_for_height: string | number | null;
  stunting_status: StuntingStatus | null;
  wasting_status: WastingStatus | null;
  description: string | null;
  recorded_at: string;
  created_at: string;
}

export class GrowthLogMapper {
  static toDomain(row: GrowthLogRow): GrowthLog {
    return new GrowthLog(
      row.id,
      row.subject_id,
      Number(row.weight_kg),
      Number(row.height_cm),
      row.bmi == null ? null : Number(row.bmi),
      row.height_for_age == null ? null : Number(row.height_for_age),
      row.weight_for_age == null ? null : Number(row.weight_for_age),
      row.weight_for_height == null ? null : Number(row.weight_for_height),
      row.stunting_status,
      row.wasting_status,
      row.description,
      row.recorded_at,
      new Date(row.created_at),
    );
  }
}
