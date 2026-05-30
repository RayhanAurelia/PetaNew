import type { IGrowthLogRepository } from "@/src/domain/repositories/IGrowthLogRepository";
import type { ISubjectRepository } from "@/src/domain/repositories/ISubjectRepository";
import {
  SubjectNotFoundError,
  SubjectPermissionDeniedError,
} from "@/src/domain/errors/subjectErrors";
import type {
  CreateGrowthLogInputDTO,
  GrowthLogDTO,
} from "../../dtos/growthLogs/growthLogDTO";
import { toDTO } from "./listGrowthLogsUseCase";

export class CreateGrowthLogUseCase {
  constructor(
    private readonly growthRepo: IGrowthLogRepository,
    private readonly subjectRepo: ISubjectRepository,
  ) {}

  async execute(
    profileId: string,
    subjectId: string,
    input: CreateGrowthLogInputDTO,
  ): Promise<GrowthLogDTO> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new SubjectNotFoundError();
    if (subject.profileId !== profileId) {
      throw new SubjectPermissionDeniedError();
    }

    const log = await this.growthRepo.create(subjectId, {
      weightKg: input.weightKg,
      heightCm: input.heightCm,
      recordedAt: input.recordedAt,
      description: input.description ?? null,
    });
    return toDTO(log);
  }
}
