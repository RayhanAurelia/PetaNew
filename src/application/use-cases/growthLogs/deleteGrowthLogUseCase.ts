import type { IGrowthLogRepository } from "@/src/domain/repositories/IGrowthLogRepository";
import type { ISubjectRepository } from "@/src/domain/repositories/ISubjectRepository";
import {
  SubjectNotFoundError,
  SubjectPermissionDeniedError,
} from "@/src/domain/errors/subjectErrors";
import {
  GrowthLogNotFoundError,
  GrowthLogPermissionDeniedError,
} from "@/src/domain/errors/growthLogErrors";

export class DeleteGrowthLogUseCase {
  constructor(
    private readonly growthRepo: IGrowthLogRepository,
    private readonly subjectRepo: ISubjectRepository,
  ) {}

  async execute(
    profileId: string,
    subjectId: string,
    logId: string,
  ): Promise<void> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new SubjectNotFoundError();
    if (subject.profileId !== profileId) {
      throw new SubjectPermissionDeniedError();
    }

    const log = await this.growthRepo.findById(logId);
    if (!log) throw new GrowthLogNotFoundError();
    if (log.subjectId !== subjectId) {
      throw new GrowthLogPermissionDeniedError();
    }

    await this.growthRepo.delete(logId);
  }
}
