import type {
  DailyNutritionSummary,
  MealType,
  NutritionLog,
} from "../entities/nutritionLog";

export interface CreateNutritionLogInput {
  foodId: string | null;
  foodName: string;
  servingQuantity: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: MealType;
  /** ISO timestamp; optional, default = now. */
  loggedAt?: string;
}

export interface INutritionLogRepository {
  listBySubjectAndDate(
    subjectId: string,
    date: string,
  ): Promise<NutritionLog[]>;
  findById(id: string): Promise<NutritionLog | null>;
  create(
    subjectId: string,
    input: CreateNutritionLogInput,
  ): Promise<NutritionLog>;
  delete(id: string): Promise<void>;
  getDailySummary(
    subjectId: string,
    date: string,
  ): Promise<DailyNutritionSummary | null>;
}
