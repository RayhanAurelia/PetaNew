import type { INutritionLogRepository } from "@/src/domain/repositories/INutritionLogRepository";
import type { ISubjectRepository } from "@/src/domain/repositories/ISubjectRepository";
import {
  SubjectNotFoundError,
  SubjectPermissionDeniedError,
} from "@/src/domain/errors/subjectErrors";
import {
  NutritionLogNotFoundError,
  NutritionLogPermissionDeniedError,
} from "@/src/domain/errors/nutritionLogErrors";

export class DeleteNutritionLogUseCase {
  constructor(
    private readonly nutritionRepo: INutritionLogRepository,
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

    const log = await this.nutritionRepo.findById(logId);
    if (!log) throw new NutritionLogNotFoundError();
    if (log.subjectId !== subjectId) {
      throw new NutritionLogPermissionDeniedError();
    }

    await this.nutritionRepo.delete(logId);
  }
}
