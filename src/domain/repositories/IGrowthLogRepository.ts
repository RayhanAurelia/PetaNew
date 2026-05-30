import type { GrowthLog } from "../entities/growthLog";

export interface CreateGrowthLogInput {
  weightKg: number;
  heightCm: number;
  recordedAt: string; // YYYY-MM-DD
  description?: string | null;
}

export interface IGrowthLogRepository {
  listBySubject(subjectId: string): Promise<GrowthLog[]>;
  findById(id: string): Promise<GrowthLog | null>;
  create(subjectId: string, input: CreateGrowthLogInput): Promise<GrowthLog>;
  delete(id: string): Promise<void>;
}
