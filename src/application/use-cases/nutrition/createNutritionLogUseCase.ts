import type { INutritionLogRepository } from "@/src/domain/repositories/INutritionLogRepository";
import type { ISubjectRepository } from "@/src/domain/repositories/ISubjectRepository";
import {
  SubjectNotFoundError,
  SubjectPermissionDeniedError,
} from "@/src/domain/errors/subjectErrors";
import type {
  CreateNutritionLogInputDTO,
  NutritionLogDTO,
} from "../../dtos/nutrition/nutritionLogDTO";
import { toDTO } from "./listNutritionLogsUseCase";

export class CreateNutritionLogUseCase {
  constructor(
    private readonly nutritionRepo: INutritionLogRepository,
    private readonly subjectRepo: ISubjectRepository,
  ) {}

  async execute(
    profileId: string,
    subjectId: string,
    input: CreateNutritionLogInputDTO,
  ): Promise<NutritionLogDTO> {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new SubjectNotFoundError();
    if (subject.profileId !== profileId) {
      throw new SubjectPermissionDeniedError();
    }

    const log = await this.nutritionRepo.create(subjectId, {
      foodId: input.foodId,
      foodName: input.foodName,
      servingQuantity: input.servingQuantity,
      servingUnit: input.servingUnit,
      calories: input.calories,
      protein: input.protein,
      carbs: input.carbs,
      fat: input.fat,
      meal: input.meal,
      loggedAt: input.loggedAt,
    });
    return toDTO(log);
  }
}
