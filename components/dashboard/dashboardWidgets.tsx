import React from "react";
import { Flame, Droplet, User, Activity, Clock, ChevronUp, Plus, Search, Calendar } from "lucide-react";
import Link from "next/link";
import type { DailyTarget } from "@/components/dashboard/nutrition/nutritionTypes";

const formatNumber = (num: number) => new Intl.NumberFormat("id-ID").format(num);

// --- 1. Quick Stat Cards (Top Row) ---
export function QuickStatCards({ summary, target, recentLogsCount }: { summary: any, target: DailyTarget | null, recentLogsCount: number }) {
  if (!target) return null;

  const totalKcal = summary?.totalCalories ?? 0;
  const isKcalGood = totalKcal <= target.kcal;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Kalori Utama (Dark Green) */}
      <div className="flex flex-col justify-between rounded-3xl bg-[#1B5E3C] p-6 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium opacity-90">Kalori Masuk</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Flame className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-4xl font-bold">{formatNumber(totalKcal)}</span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs">
          <div className={`flex items-center justify-center rounded-full bg-white/20 px-2 py-0.5 ${isKcalGood ? 'text-green-300' : 'text-red-300'}`}>
            <span className="mr-1">Target: {formatNumber(target.kcal)}</span>
          </div>
        </div>
      </div>

      {/* Card 2: Protein */}
      <div className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Protein</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200">
            <ChevronUp className="h-4 w-4 text-slate-400" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-4xl font-bold text-slate-900">{formatNumber(summary?.totalProtein ?? 0)}<span className="text-lg text-slate-400">g</span></span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <div className="flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
            Target {formatNumber(target.protein)}g
          </div>
        </div>
      </div>

      {/* Card 3: Karbohidrat */}
      <div className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Karbohidrat</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200">
            <ChevronUp className="h-4 w-4 text-slate-400" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-4xl font-bold text-slate-900">{formatNumber(summary?.totalCarbs ?? 0)}<span className="text-lg text-slate-400">g</span></span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <div className="flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
            Target {formatNumber(target.carbs)}g
          </div>
        </div>
      </div>

      {/* Card 4: Lemak */}
      <div className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Lemak</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200">
            <ChevronUp className="h-4 w-4 text-slate-400" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-4xl font-bold text-slate-900">{formatNumber(summary?.totalFat ?? 0)}<span className="text-lg text-slate-400">g</span></span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <div className="flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
            Target {formatNumber(target.fat)}g
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 2. Macro Progress Card (Middle Left) ---
export function MacroProgressCard({ summary, target }: { summary: any, target: DailyTarget | null }) {
  if (!target) return null;

  const macros = [
    { name: "Protein", consumed: summary?.totalProtein ?? 0, target: target.protein, color: "bg-[#298E63]" },
    { name: "Karbo", consumed: summary?.totalCarbs ?? 0, target: target.carbs, color: "bg-[#52B788]" },
    { name: "Lemak", consumed: summary?.totalFat ?? 0, target: target.fat, color: "bg-[#74C69D]" },
  ];

  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Analisis Makro</h3>
      </div>
      <div className="flex h-full flex-col justify-center gap-6">
        {macros.map((macro) => {
          const pct = Math.min(100, Math.max(0, macro.target > 0 ? (macro.consumed / macro.target) * 100 : 0));
          return (
            <div key={macro.name} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{macro.name}</span>
                <span className="font-medium text-slate-500">
                  {formatNumber(macro.consumed)} / {formatNumber(macro.target)}g
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${macro.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- 3. Recent Foods List (Middle Right) ---
export function RecentFoodsCard({ logs }: { logs: any[] }) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Makanan Hari Ini</h3>
        <Link href="/log" className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
          <Plus className="h-3 w-3" /> New
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-center text-sm text-slate-500">
          Belum ada catatan makanan hari ini.
        </div>
      ) : (
        <div className="flex flex-col gap-4 overflow-y-auto">
          {logs.slice(0, 4).map((log) => (
            <div key={log.id} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <span className="text-lg">🍽️</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-semibold text-slate-800">{log.foodName || "Makanan Custom"}</p>
                <p className="text-xs text-slate-500">Waktu: {new Date(log.loggedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- 4. Active Subjects Card (Bottom Left) ---
export function SubjectsCard({ subjects }: { subjects: any[] }) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Daftar Subjek</h3>
        <Link href="/dashboard/subjects/new" className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
          <Plus className="h-3 w-3" /> Add Member
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {subjects.map((sub) => (
          <div key={sub.id} className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B5E3C]/10 text-[#1B5E3C]">
              {sub.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">{sub.name}</p>
              <p className="text-xs text-slate-500">{sub.isPrimary ? 'Subjek Utama' : 'Anggota'}</p>
            </div>
            <div className={`rounded-full px-2 py-0.5 text-xs font-medium ${sub.isPrimary ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
              {sub.isPrimary ? 'Active' : 'Standby'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 5. Health Highlight / Glassmorphism Card (Bottom Right) ---
export function HealthHighlightCard({ subject }: { subject: any }) {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-[#0D2818] p-6 text-white shadow-md">
      {/* Abstract Background Decoration */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl"></div>
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[#1B5E3C]/40 blur-3xl"></div>

      <div className="relative z-10">
        <h3 className="text-sm font-medium opacity-90">Status Gizi</h3>
        <div className="mt-2 text-3xl font-bold tracking-tight">
          Tetap Sehat!
        </div>
        <p className="mt-2 text-sm text-white/70">
          Lanjutkan kebiasaan baik mencatat makanan setiap hari untuk mencapai target.
        </p>
      </div>

      <div className="relative z-10 mt-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
          <Activity className="h-5 w-5" />
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/80 backdrop-blur-md">
          <HeartIcon />
        </div>
      </div>
    </div>
  );
}

function HeartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
