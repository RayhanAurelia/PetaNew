import type { ISubjectRepository } from "@/src/domain/repositories/ISubjectRepository";
import type { Subject } from "@/src/domain/entities/subject";
import type { SubjectDTO } from "../../dtos/subjects/subjectDTO";

export class ListSubjectsUseCase {
  constructor(private readonly repo: ISubjectRepository) {}

  async execute(profileId: string): Promise<SubjectDTO[]> {
    const subjects = await this.repo.listByProfile(profileId);
    return subjects.map(toDTO);
  }
}

export function toDTO(s: Subject): SubjectDTO {
  return {
    id: s.id,
    profileId: s.profileId,
    name: s.name,
    gender: s.gender,
    birthDate: s.birthDate,
    relationship: s.relationship,
    heightCm: s.heightCm,
    activityLevel: s.activityLevel,
    isPrimary: s.isPrimary,
    avatarUrl: s.avatarUrl,
    lifeStage: s.lifeStage,
    ageYears: s.ageYears,
    ageMonths: s.ageMonths,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    latestGrowth: s.latestGrowth
      ? {
          weightKg: s.latestGrowth.weightKg,
          heightCm: s.latestGrowth.heightCm,
          bmi: s.latestGrowth.bmi,
          recordedAt: s.latestGrowth.recordedAt,
          stuntingStatus: s.latestGrowth.stuntingStatus,
        }
      : null,
  };
}
