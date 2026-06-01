import {
  NutritionLog,
  type DailyNutritionSummary,
  type MealType,
} from "@/src/domain/entities/nutritionLog";

export interface NutritionLogRow {
  id: string;
  subject_id: string;
  food_id: string | null;
  food_name: string;
  serving_quantity: string | number;
  serving_unit: string;
  calories: string | number;
  protein: string | number;
  carbs: string | number;
  fat: string | number;
  meal: MealType;
  logged_at: string;
  log_date: string;
}

export interface DailyNutritionSummaryRow {
  subject_id: string;
  log_date: string;
  total_calories: string | number;
  total_protein: string | number;
  total_carbs: string | number;
  total_fat: string | number;
  meal_count: string | number;
}

export class NutritionLogMapper {
  static toDomain(row: NutritionLogRow): NutritionLog {
    return new NutritionLog(
      row.id,
      row.subject_id,
      row.food_id,
      row.food_name,
      Number(row.serving_quantity),
      row.serving_unit,
      Number(row.calories),
      Number(row.protein),
      Number(row.carbs),
      Number(row.fat),
      row.meal,
      new Date(row.logged_at),
      row.log_date,
    );
  }

  static summaryToDomain(row: DailyNutritionSummaryRow): DailyNutritionSummary {
    return {
      subjectId: row.subject_id,
      logDate: row.log_date,
      totalCalories: Number(row.total_calories),
      totalProtein: Number(row.total_protein),
      totalCarbs: Number(row.total_carbs),
      totalFat: Number(row.total_fat),
      mealCount: Number(row.meal_count),
    };
  }
}
