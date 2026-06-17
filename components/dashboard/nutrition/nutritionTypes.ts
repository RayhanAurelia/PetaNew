import type { LifeStage } from "@/components/dashboard/subjects/subjectTypes";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

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

export const MEAL_LABEL: Record<MealType, string> = {
  breakfast: "Sarapan",
  lunch: "Makan Siang",
  dinner: "Makan Malam",
  snack: "Camilan",
};

export const MEAL_ORDER: MealType[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
];

export const MEAL_COLOR: Record<MealType, string> = {
  breakfast: "bg-amber-50 text-amber-700 ring-amber-200",
  lunch: "bg-orange-50 text-orange-700 ring-orange-200",
  dinner: "bg-purple-50 text-purple-700 ring-purple-200",
  snack: "bg-blue-50 text-blue-700 ring-blue-200",
};

/** Gradien ikon entri per jenis makan (selaras dengan badge section). */
export const MEAL_GRADIENT: Record<MealType, string> = {
  breakfast: "from-amber-400 to-orange-500",
  lunch: "from-orange-400 to-red-500",
  dinner: "from-violet-500 to-purple-600",
  snack: "from-sky-500 to-blue-600",
};

/**
 * Target gizi default berdasarkan tahap usia (perkiraan AKG 2019 Indonesia).
 * Akan digantikan oleh modul `nutrition_target` (per subjek) saat itu jadi.
 */
export interface DailyTarget {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

const TARGETS_BY_LIFE_STAGE: Record<LifeStage, DailyTarget> = {
  balita: { kcal: 1000, protein: 25, carbs: 155, fat: 40 },
  anak: { kcal: 1500, protein: 35, carbs: 220, fat: 50 },
  remaja: { kcal: 2000, protein: 55, carbs: 290, fat: 65 },
  dewasa: { kcal: 2200, protein: 60, carbs: 300, fat: 70 },
};

export function getDefaultTarget(lifeStage: LifeStage): DailyTarget {
  return TARGETS_BY_LIFE_STAGE[lifeStage];
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const today = todayISO();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);

  if (iso === today) return "Hari ini";
  if (iso === yesterday) return "Kemarin";
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
