import type { NutritionLog } from "@/src/domain/entities/nutritionLog";
import type { INutritionLogRepository } from "@/src/domain/repositories/INutritionLogRepository";
import type { ISubjectRepository } from "@/src/domain/repositories/ISubjectRepository";
import {
  SubjectNotFoundError,
  SubjectPermissionDeniedError,
} from "@/src/domain/errors/subjectErrors";
import type { NutritionLogDTO } from "../../dtos/nutrition/nutritionLogDTO";

export class ListNutritionLogsUseCase {
  constructor(
    private readonly nutritionRepo: INutritionLogRepository,
    private readonly subjectRepo: ISubjectRepository,
  ) {}

  async execute(
    profileId: string,
    subjectId: string,
    date: string,
  ): Promise<NutritionLogDTO[]> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new SubjectNotFoundError();
    if (subject.profileId !== profileId) {
      throw new SubjectPermissionDeniedError();
    }
    const logs = await this.nutritionRepo.listBySubjectAndDate(subjectId, date);
    return logs.map(toDTO);
  }
}

export function toDTO(n: NutritionLog): NutritionLogDTO {
  return {
    id: n.id,
    subjectId: n.subjectId,
    foodId: n.foodId,
    foodName: n.foodName,
    servingQuantity: n.servingQuantity,
    servingUnit: n.servingUnit,
    calories: n.calories,
    protein: n.protein,
    carbs: n.carbs,
    fat: n.fat,
    meal: n.meal,
    loggedAt: n.loggedAt.toISOString(),
    logDate: n.logDate,
  };
}