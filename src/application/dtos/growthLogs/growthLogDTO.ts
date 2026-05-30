import type {
  StuntingStatus,
  WastingStatus,
} from "@/src/domain/entities/growthLog";

export interface GrowthLogDTO {
  id: string;
  subjectId: string;
  weightKg: number;
  heightCm: number;
  bmi: number | null;
  heightForAge: number | null;
  weightForAge: number | null;
  weightForHeight: number | null;
  stuntingStatus: StuntingStatus | null;
  wastingStatus: WastingStatus | null;
  description: string | null;
  recordedAt: string;
  createdAt: string;
}

export interface CreateGrowthLogInputDTO {
  weightKg: number;
  heightCm: number;
  recordedAt: string;
  description?: string | null;
}
