import type {
  Gender,
  LifeStage,
  Relationship,
} from "@/src/domain/entities/subject";
import type { StuntingStatus } from "@/src/domain/entities/growthLog";

export interface LatestGrowthSnapshotDTO {
  weightKg: number;
  heightCm: number;
  bmi: number | null;
  recordedAt: string;
  stuntingStatus: StuntingStatus | null;
}

export interface SubjectDTO {
  id: string;
  profileId: string;
  name: string;
  gender: Gender;
  birthDate: string;
  relationship: Relationship;
  heightCm: number | null;
  activityLevel: number;
  isPrimary: boolean;
  avatarUrl: string | null;
  lifeStage: LifeStage;
  ageYears: number;
  ageMonths: number;
  createdAt: string;
  updatedAt: string;
  latestGrowth: LatestGrowthSnapshotDTO | null;
}

export interface CreateSubjectInputDTO {
  name: string;
  gender: Gender;
  birthDate: string;
  relationship: Relationship;
  heightCm: number | null;
  activityLevel: number;
  isPrimary: boolean;
  avatarUrl?: string | null;
}

export interface UpdateSubjectInputDTO {
  name?: string;
  gender?: Gender;
  birthDate?: string;
  relationship?: Relationship;
  heightCm?: number | null;
  activityLevel?: number;
  isPrimary?: boolean;
  avatarUrl?: string | null;
}
