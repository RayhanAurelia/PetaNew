export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export class NutritionLog {
  constructor(
    public readonly id: string,
    public readonly subjectId: string,
    public readonly foodId: string | null,
    public readonly foodName: string,
    public readonly servingQuantity: number,
    public readonly servingUnit: string,
    public readonly calories: number,
    public readonly protein: number,
    public readonly carbs: number,
    public readonly fat: number,
    public readonly meal: MealType,
    public readonly loggedAt: Date,
    public readonly logDate: string, // YYYY-MM-DD
  ) {}
}

export interface DailyNutritionSummary {
  subjectId: string;
  logDate: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
}
