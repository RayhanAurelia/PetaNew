import type { INutritionLogRepository } from "@/src/domain/repositories/INutritionLogRepository";
import type { ISubjectRepository } from "@/src/domain/repositories/ISubjectRepository";
import {
  SubjectNotFoundError,
  SubjectPermissionDeniedError,
} from "@/src/domain/errors/subjectErrors";
import type { DailySummaryDTO } from "../../dtos/nutrition/nutritionLogDTO";

export class GetDailySummaryUseCase {
  constructor(
    private readonly nutritionRepo: INutritionLogRepository,
    private readonly subjectRepo: ISubjectRepository,
  ) {}

  async execute(
    profileId: string,
    subjectId: string,
    date: string,
  ): Promise<DailySummaryDTO> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new SubjectNotFoundError();
    if (subject.profileId !== profileId) {
      throw new SubjectPermissionDeniedError();
    }

    const summary = await this.nutritionRepo.getDailySummary(subjectId, date);

    // Kalau belum ada catatan → return zero summary, bukan null.
    return (
      summary ?? {
        subjectId,
        logDate: date,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        mealCount: 0,
      }
    );
  }
}
