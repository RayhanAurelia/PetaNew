import type { StuntingStatus } from "./growthLog";

export type Gender = "male" | "female" | "other";

export type Relationship =
  | "self"
  | "child"
  | "wife"
  | "husband"
  | "parent"
  | "sibling"
  | "other";

export type LifeStage = "balita" | "anak" | "remaja" | "dewasa";

/**
 * Snapshot pengukuran terakhir per subject — berasal dari view `latest_growth`
 * (DISTINCT ON subject_id ORDER BY recorded_at DESC).
 */
export interface LatestGrowthSnapshot {
  weightKg: number;
  heightCm: number;
  bmi: number | null;
  recordedAt: string; // YYYY-MM-DD
  stuntingStatus: StuntingStatus | null;
}

export class Subject {
  constructor(
    public readonly id: string,
    public readonly profileId: string,
    public readonly name: string,
    public readonly gender: Gender,
    public readonly birthDate: string,
    public readonly relationship: Relationship,
    public readonly heightCm: number | null,
    public readonly activityLevel: number,
    public readonly isPrimary: boolean,
    public readonly avatarUrl: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly lifeStage: LifeStage,
    public readonly ageYears: number,
    public readonly ageMonths: number,
    public readonly latestGrowth: LatestGrowthSnapshot | null,
  ) {}
}
