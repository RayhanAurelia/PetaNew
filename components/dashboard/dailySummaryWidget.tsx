import React from "react";
import type { DailyTarget } from "@/components/dashboard/nutrition/nutritionTypes";

const formatNumber = (num: number) => new Intl.NumberFormat("id-ID").format(num);

interface NutrientGoal {
  name: string;
  consumed: number;
  target: number;
  unit: string;
  color: string;
}

interface DailySummaryWidgetProps {
  summary: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
  } | null;
  target: DailyTarget | null;
}

export function DailySummaryWidget({ summary, target }: DailySummaryWidgetProps) {
  if (!target) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
        Belum ada subjek aktif. Tambahkan subjek terlebih dahulu.
      </div>
    );
  }

  const totalCaloriesTarget = target.kcal;
  const caloriesConsumed = summary?.totalCalories ?? 0;

  const progressPercent =
    totalCaloriesTarget > 0
      ? Math.min(100, Math.round((caloriesConsumed / totalCaloriesTarget) * 100))
      : 0;

  const nutrients: NutrientGoal[] = [
    {
      name: "Kalori",
      consumed: caloriesConsumed,
      target: totalCaloriesTarget,
      unit: "kcal",
      color: "bg-blue-500",
    },
    {
      name: "Protein",
      consumed: summary?.totalProtein ?? 0,
      target: target.protein,
      unit: "g",
      color: "bg-purple-500",
    },
    {
      name: "Karbohidrat",
      consumed: summary?.totalCarbs ?? 0,
      target: target.carbs,
      unit: "g",
      color: "bg-orange-500",
    },
    {
      name: "Lemak",
      consumed: summary?.totalFat ?? 0,
      target: target.fat,
      unit: "g",
      color: "bg-yellow-500",
    },
  ];

  // Ukuran SVG Circle
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-500">
        Progres Gizi Harian
      </h3>

      <div className="flex flex-col items-center gap-8 md:flex-row md:items-stretch">
        {/* Kiri: Circular Progress */}
        <div className="flex shrink-0 flex-col items-center justify-center">
          <div
            className="relative flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            {/* Background Circle */}
            <svg width={size} height={size} className="-rotate-90 transform">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-slate-100"
              />
              {/* Progress Circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="text-blue-500 transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-slate-800">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Kanan: Nutrient Bars */}
        <div className="flex w-full flex-col justify-center gap-4 border-t border-slate-100 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          {nutrients.map((nut) => {
            const pct = nut.target > 0 ? (nut.consumed / nut.target) * 100 : 0;
            const safePct = Math.min(100, Math.max(0, pct));

            return (
              <div key={nut.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{nut.name}</span>
                  <span className="font-medium text-slate-500">
                    {formatNumber(nut.consumed)} / {formatNumber(nut.target)} {nut.unit}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${nut.color}`}
                    style={{ width: `${safePct}%` }}
                  />
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
