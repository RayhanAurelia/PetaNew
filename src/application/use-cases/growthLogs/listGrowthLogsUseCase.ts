import type { GrowthLog } from "@/src/domain/entities/growthLog";
import type { IGrowthLogRepository } from "@/src/domain/repositories/IGrowthLogRepository";
import type { ISubjectRepository } from "@/src/domain/repositories/ISubjectRepository";
import {
  SubjectNotFoundError,
  SubjectPermissionDeniedError,
} from "@/src/domain/errors/subjectErrors";
import type { GrowthLogDTO } from "../../dtos/growthLogs/growthLogDTO";

export class ListGrowthLogsUseCase {
  constructor(
    private readonly growthRepo: IGrowthLogRepository,
    private readonly subjectRepo: ISubjectRepository,
  ) {}

  async execute(profileId: string, subjectId: string): Promise<GrowthLogDTO[]> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new SubjectNotFoundError();
    if (subject.profileId !== profileId) {
      throw new SubjectPermissionDeniedError();
    }

    const logs = await this.growthRepo.listBySubject(subjectId);
    return logs.map(toDTO);
  }
}

export function toDTO(g: GrowthLog): GrowthLogDTO {
  return {
    id: g.id,
    subjectId: g.subjectId,
    weightKg: g.weightKg,
    heightCm: g.heightCm,
    bmi: g.bmi,
    heightForAge: g.heightForAge,
    weightForAge: g.weightForAge,
    weightForHeight: g.weightForHeight,
    stuntingStatus: g.stuntingStatus,
    wastingStatus: g.wastingStatus,
    description: g.description,
    recordedAt: g.recordedAt,
    createdAt: g.createdAt.toISOString(),
  };
}
