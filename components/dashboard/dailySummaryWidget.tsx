import React from "react";
import type { DailyTarget } from "@/components/dashboard/nutrition/nutritionTypes";

const formatNumber = (num: number) => new Intl.NumberFormat("id-ID").format(num);



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
        {/* Centered Circular Progress */}
        <div className="flex w-full flex-col items-center justify-center pt-2">
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
                className="text-[#1B5E3C] transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-bold text-slate-900">
                {progressPercent}%
              </span>
              <span className="mt-1 text-xs font-medium text-slate-500">
                Terpenuhi
              </span>
            </div>
          </div>
          
          {/* Status Label */}
          <div className="mt-6 flex w-full items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#1B5E3C]"></div>
              <span className="font-medium text-slate-600">Kalori Masuk</span>
            </div>
            <span className="font-bold text-slate-900">
              {formatNumber(caloriesConsumed)} <span className="text-xs font-normal text-slate-500">/ {formatNumber(totalCaloriesTarget)} kcal</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
