import type { MealType } from "@/src/domain/entities/nutritionLog";

export interface NutritionLogDTO {
  id: string;
  subjectId: string;
  foodId: string | null;
  foodName: string;
  servingQuantity: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: MealType;
  loggedAt: string;
  logDate: string;
}

export interface DailySummaryDTO {
  subjectId: string;
  logDate: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
}

export interface CreateNutritionLogInputDTO {
  foodId: string | null;
  foodName: string;
  servingQuantity: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: MealType;
  loggedAt?: string;
}
