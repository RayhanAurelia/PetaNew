"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  Loader,
  Ruler,
  Scale,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { RecentFoodsCard } from "@/components/dashboard/dashboardWidgets";
import {
  getDefaultTarget,
  todayISO,
  type DailyTarget,
  type NutritionLogDTO,
} from "@/components/dashboard/nutrition/nutritionTypes";
import {
  readActiveSubjectId,
  writeActiveSubjectId,
  type SubjectDTO,
} from "@/components/dashboard/subjects/subjectTypes";
import type { GrowthLogDTO } from "@/components/dashboard/growth/growthTypes";
import { formatDateShortID } from "@/components/dashboard/growth/growthTypes";
import type { ArticleListItemDTO } from "@/components/dashboard/articles/articleTypes";

const formatNumber = (num: number) =>
  new Intl.NumberFormat("id-ID").format(Math.round(num));

interface Summary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface DashboardViewProps {
  userFirstName: string;
  subjects: SubjectDTO[];
  primarySubjectId: string | null;
  initialSummary: Summary | null;
  initialLogs: NutritionLogDTO[];
  initialGrowth: GrowthLogDTO[];
  articles: ArticleListItemDTO[];
}

export function DashboardView({
  userFirstName,
  subjects,
  primarySubjectId,
  initialSummary,
  initialLogs,
  initialGrowth,
  articles,
}: DashboardViewProps) {
  const [selectedId, setSelectedId] = useState(primarySubjectId ?? "");
  const [summary, setSummary] = useState<Summary | null>(initialSummary);
  const [logs, setLogs] = useState<NutritionLogDTO[]>(initialLogs);
  const [growth, setGrowth] = useState<GrowthLogDTO[]>(initialGrowth);
  const [loading, setLoading] = useState(false);
  const firstRun = useRef(true);

  const selectedSubject = subjects.find((s) => s.id === selectedId) ?? null;
  const target: DailyTarget | null = selectedSubject
    ? getDefaultTarget(selectedSubject.lifeStage)
    : null;

  // Pulihkan subjek terakhir yang dipilih (lintas halaman) saat mount, selama
  // subjek tersebut masih ada. Kalau tidak ada, biarkan default subjek utama.
  useEffect(() => {
    const stored = readActiveSubjectId();
    if (
      stored &&
      stored !== selectedId &&
      subjects.some((s) => s.id === stored)
    ) {
      setSelectedId(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simpan pilihan subjek agar konsisten di halaman lain (mis. catat makanan).
  useEffect(() => {
    if (selectedId) writeActiveSubjectId(selectedId);
  }, [selectedId]);

  // Ketika subjek diganti, ambil ulang data gizi & pertumbuhan subjek tersebut.
  // Render pertama dilewati karena data subjek utama sudah disuplai server.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (!selectedId) return;

    const date = todayISO();
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [sRes, lRes, gRes] = await Promise.all([
          fetch(`/api/subjects/${selectedId}/nutrition/summary?date=${date}`, {
            cache: "no-store",
          }),
          fetch(`/api/subjects/${selectedId}/nutrition?date=${date}`, {
            cache: "no-store",
          }),
          fetch(`/api/subjects/${selectedId}/growth`, { cache: "no-store" }),
        ]);
        const [s, l, g] = await Promise.all([
          sRes.json(),
          lRes.json(),
          gRes.json(),
        ]);
        if (cancelled) return;
        setSummary(s.success ? s.data : null);
        setLogs(l.success ? l.data : []);
        setGrowth(g.success ? g.data : []);
      } catch {
        if (!cancelled) {
          setSummary(null);
          setLogs([]);
          setGrowth([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  return (
    <div className="mx-auto max-w-6xl">
      <DashboardHero
        subject={selectedSubject}
        summary={summary}
        growth={growth}
      />

      <div className="mt-6 flex flex-col gap-6 pb-12">
        {/* Sapaan + pemilih subjek, tepat di atas kartu konten */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {subjects.length > 0 && (
            <SubjectSwitcher
              subjects={subjects}
              selectedId={selectedId}
              onChange={setSelectedId}
              loading={loading}
            />
          )}
        </div>

        {/* Analisis makro + kalori, dan makanan hari ini */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MacroAnalysisCard summary={summary} target={target} />
          </div>
          <div className="lg:col-span-1">
            <RecentFoodsCard logs={logs} subjectId={selectedId} />
          </div>
        </div>

        {/* Perkembangan tinggi & berat badan */}
        <GrowthSection
          growth={growth}
          subjectName={selectedSubject?.name ?? null}
          subjectId={selectedId}
        />
      </div>
    </div>
  );
}

// --- Dashboard Hero (gaya "si kecil": badge, judul beraksen, masuk lembut) ---
function DashboardHero({
  subject,
  summary,
  growth,
}: {
  subject: SubjectDTO | null;
  summary: Summary | null;
  growth: GrowthLogDTO[];
}) {
  // "si kecil" untuk balita/anak, selain itu pakai nama subjek.
  const isChild =
    subject?.lifeStage === "balita" || subject?.lifeStage === "anak";
  const subjectFirst = subject?.name.split(" ")[0] ?? null;
  const subjectLabel = isChild ? "si kecil" : (subjectFirst ?? "keluarga");

  const kcal = summary?.totalCalories ?? 0;
  const latest = growth[0] ?? null;
  const heightCm = latest?.heightCm ?? subject?.latestGrowth?.heightCm ?? null;
  const weightKg = latest?.weightKg ?? subject?.latestGrowth?.weightKg ?? null;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-brand-primary/12 bg-linear-to-br from-brand-soft via-white to-brand-soft px-6 py-7 sm:px-10 sm:py-9">
      {/* Dekorasi blur lembut */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-brand-accent/10 blur-3xl"
      />

      <div className="relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h1
              className="animate-peta-fade-up text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl"
              style={{ animationDelay: "0.08s" }}
            >
              Pantau gizi &amp;{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-brand-primary">
                  tumbuh kembang
                </span>
                <svg
                  className="absolute -bottom-1.5 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M2 9C50 3 150 3 298 7"
                    stroke="#f59e0b"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              {subjectLabel}
            </h1>
            <p
              className="animate-peta-fade-up mt-5 max-w-lg text-base text-slate-600"
              style={{ animationDelay: "0.16s" }}
            >
              Catat asupan harian, ukur perkembangan, dan pantau target gizi
              <b>{subjectFirst ? ` ${subjectFirst}` : " keluarga"}</b>. Semua
              dalam satu ringkasan yang mudah dibaca
            </p>
          </div>

          {/* Kartu mengambang berisi data nyata (gaya "si kecil") */}
          <div className="relative hidden h-40 w-72 shrink-0 lg:block">
            <FloatCard
              className="left-0 top-0"
              delay="0.5s"
              icon={<Flame className="h-5 w-5" />}
              tone="text-brand-primary bg-brand-primary/12"
              label="Kalori hari ini"
              value={`${formatNumber(kcal)} kcal`}
            />
            <FloatCard
              className="right-0 top-14"
              delay="1.4s"
              icon={<Scale className="h-5 w-5" />}
              tone="text-brand-accent bg-brand-accent/15"
              label={`Berat ${subjectFirst ?? "subjek"}`}
              value={weightKg != null ? `${weightKg} kg` : "Belum ada"}
            />
            <FloatCard
              className="bottom-0 left-10"
              delay="2.2s"
              icon={<Ruler className="h-5 w-5" />}
              tone="text-sky-600 bg-sky-500/12"
              label={`Tinggi ${subjectFirst ?? "subjek"}`}
              value={heightCm != null ? `${heightCm} cm` : "Belum ada"}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatCard({
  className,
  delay,
  icon,
  tone,
  label,
  value,
}: {
  className: string;
  delay: string;
  icon: React.ReactNode;
  tone: string;
  label: string;
  value: string;
}) {
  return (
    <div
      className={`animate-peta-float absolute flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-lg shadow-slate-200/60 ${className}`}
      style={{ animationDelay: delay }}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-slate-400">{label}</p>
        <p className="truncate text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

// --- Subject Switcher (dropdown) ---
function SubjectSwitcher({
  subjects,
  selectedId,
  onChange,
  loading,
}: {
  subjects: SubjectDTO[];
  selectedId: string;
  onChange: (id: string) => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = subjects.find((s) => s.id === selectedId) ?? null;

  // Tutup saat klik di luar atau tekan Escape. Memakai event "click" (bukan
  // "mousedown") agar menu tetap ter-mount sampai klik item selesai —
  // mencegah klik "tembus" ke kartu/link di bawahnya.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleSelect(id: string) {
    onChange(id);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="group flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-[#16a34a]/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#16a34a]/15"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#16a34a]/10 text-xs font-bold text-[#16a34a]">
          {selected?.name.charAt(0).toUpperCase() ?? "?"}
        </span>
        <span className="flex flex-col text-left">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Subjek
          </span>
          <span className="max-w-40 truncate text-sm font-semibold text-slate-800">
            {selected?.name ?? "Pilih subjek"}
            {selected?.isPrimary ? " (Utama)" : ""}
          </span>
        </span>
        {loading ? (
          <Loader className="h-4 w-4 shrink-0 animate-spin text-[#16a34a]" />
        ) : (
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-slate-600 ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5"
        >
          {subjects.map((s) => {
            const active = s.id === selectedId;
            return (
              <button
                key={s.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => handleSelect(s.id)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${
                  active ? "bg-[#16a34a]/8" : "hover:bg-slate-100"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    active
                      ? "bg-[#16a34a] text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {s.name.charAt(0).toUpperCase()}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold text-slate-800">
                    {s.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {s.isPrimary ? "Subjek Utama" : "Anggota"}
                  </span>
                </span>
                {active && (
                  <Check className="h-4 w-4 shrink-0 text-[#16a34a]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Macro Analysis + Calories ---
function MacroAnalysisCard({
  summary,
  target,
}: {
  summary: Summary | null;
  target: DailyTarget | null;
}) {
  if (!target) {
    return (
      <div className="flex h-full min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
        Belum ada subjek aktif. Tambahkan subjek terlebih dahulu.
      </div>
    );
  }

  const kcal = summary?.totalCalories ?? 0;
  const kcalPct =
    target.kcal > 0 ? Math.min(100, Math.round((kcal / target.kcal) * 100)) : 0;

  // Lingkaran progres kalori
  const size = 150;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circ = radius * 2 * Math.PI;
  const offset = circ - (kcalPct / 100) * circ;

  // Api "menyala" saat asupan kalori mendekati target; emas penuh saat tercapai.
  const flameLit = kcalPct >= 85;
  const flameComplete = kcalPct >= 100;
  const ringColor = flameComplete ? "#f59e0b" : "#16a34a";

  const macros = [
    {
      name: "Protein",
      consumed: summary?.totalProtein ?? 0,
      target: target.protein,
      color: "#16a34a",
    },
    {
      name: "Karbohidrat",
      consumed: summary?.totalCarbs ?? 0,
      target: target.carbs,
      color: "#22c55e",
    },
    {
      name: "Lemak",
      consumed: summary?.totalFat ?? 0,
      target: target.fat,
      color: "#4ade80",
    },
  ];

  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Analisis Makro
          </h3>
          <p className="text-xs text-slate-400">Asupan harian vs target gizi</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#16a34a]/10 text-[#16a34a]">
          <Activity className="h-4 w-4" />
        </span>
      </div>

      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center">
        {/* Kalori — lingkaran progres */}
        <div className="flex shrink-0 flex-col items-center">
          <div
            className="relative flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            <svg width={size} height={size} className="-rotate-90 transform">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={stroke}
                className="text-slate-100"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                style={{ color: ringColor }}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center text-center">
              <Flame
                className={
                  flameLit
                    ? "h-5 w-5 fill-amber-400 text-orange-500 animate-peta-flame"
                    : "h-4 w-4 text-[#16a34a]"
                }
              />
              <span className="mt-0.5 text-3xl font-bold text-slate-900">
                {kcalPct}%
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                Kalori
              </span>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-700">
            {formatNumber(kcal)}
            <span className="font-normal text-slate-400">
              {" "}
              / {formatNumber(target.kcal)} kcal
            </span>
          </p>
        </div>

        {/* Bar makro */}
        <div className="flex w-full flex-col justify-center gap-5">
          {macros.map((m) => {
            const pct = Math.min(
              100,
              m.target > 0 ? (m.consumed / m.target) * 100 : 0,
            );
            return (
              <div key={m.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                    {m.name}
                  </span>
                  <span className="tabular-nums font-medium text-slate-500">
                    {formatNumber(m.consumed)} / {formatNumber(m.target)}g
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${pct}%`, backgroundColor: m.color }}
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

// --- Growth Development Section ---
function GrowthSection({
  growth,
  subjectName,
  subjectId,
}: {
  growth: GrowthLogDTO[];
  subjectName: string | null;
  subjectId: string;
}) {
  // Kronologis: paling lama → paling baru (API mengirim DESC).
  const chronological = [...growth].reverse();

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Perkembangan Pertumbuhan
          </h3>
          <p className="text-xs text-slate-400">
            Tinggi, berat, dan BMI dari waktu ke waktu
          </p>
        </div>
        {subjectId && (
          <Link
            href={`/subjects/${subjectId}/growth`}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Detail <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {chronological.length < 2 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#16a34a]/10 text-[#16a34a]">
            <TrendingUp className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium text-slate-600">
            Belum cukup data pengukuran
          </p>
          <p className="max-w-sm text-xs text-slate-400">
            Catat minimal 2 kali pengukuran tinggi &amp; berat badan
            {subjectName ? ` untuk ${subjectName}` : ""} agar grafik
            perkembangan muncul di sini.
          </p>
          {subjectId && (
            <Link
              href={`/subjects/${subjectId}/growth`}
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[#16a34a] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#15803d]"
            >
              <Ruler className="h-3.5 w-3.5" /> Catat Pengukuran
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <GrowthSparkline
            title="Tinggi"
            icon={<Ruler className="h-4 w-4" />}
            entries={chronological}
            field="heightCm"
            color="#16a34a"
            unit="cm"
          />
          <GrowthSparkline
            title="Berat"
            icon={<Scale className="h-4 w-4" />}
            entries={chronological}
            field="weightKg"
            color="#22c55e"
            unit="kg"
          />
          <GrowthSparkline
            title="BMI"
            icon={<Activity className="h-4 w-4" />}
            entries={chronological.filter((e) => e.bmi != null)}
            field="bmi"
            color="#4ade80"
            unit=""
          />
        </div>
      )}
    </div>
  );
}

function GrowthSparkline({
  title,
  icon,
  entries,
  field,
  color,
  unit,
}: {
  title: string;
  icon: React.ReactNode;
  entries: GrowthLogDTO[];
  field: "heightCm" | "weightKg" | "bmi";
  color: string;
  unit: string;
}) {
  const values = entries
    .map((e) => (field === "bmi" ? e.bmi : (e[field] as number)))
    .filter((v): v is number => v != null);

  if (values.length < 2) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <span style={{ color }}>{icon}</span>
          {title}
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Butuh minimal 2 pengukuran.
        </p>
      </div>
    );
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const last = values[values.length - 1];
  const first = values[0];
  const delta = last - first;

  const w = 300;
  const h = 80;
  const pad = 6;
  const xStep = (w - pad * 2) / (values.length - 1);

  const points = values.map((v, i) => {
    const x = pad + i * xStep;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return { x, y };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const area = `${path} L ${(w - pad).toFixed(1)} ${(h - pad).toFixed(1)} L ${pad} ${(h - pad).toFixed(1)} Z`;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <span style={{ color }}>{icon}</span>
          {title}
        </div>
        <span
          className={`text-[10px] font-semibold tabular-nums ${
            delta > 0
              ? "text-emerald-600"
              : delta < 0
                ? "text-red-500"
                : "text-slate-400"
          }`}
        >
          {delta > 0 ? "▲" : delta < 0 ? "▼" : "·"}
          {Math.abs(delta).toFixed(1)} {unit}
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>
          {field === "bmi" ? last.toFixed(1) : last}
        </span>
        {unit && (
          <span className="text-xs font-medium text-slate-400">{unit}</span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="mt-2 h-20 w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d={area} fill={color} fillOpacity={0.08} />
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === points.length - 1 ? 3 : 2}
            fill={color}
          />
        ))}
      </svg>

      <div className="mt-1 flex justify-between text-[9px] text-slate-400">
        <span>{formatDateShortID(entries[0].recordedAt)}</span>
        <span>{formatDateShortID(entries[entries.length - 1].recordedAt)}</span>
      </div>
    </div>
  );
}

// --- Featured Article Carousel (5 artikel terbaru, geser otomatis) ---
function FeaturedArticleCarousel({
  articles,
}: {
  articles: ArticleListItemDTO[];
}) {
  const items = articles.slice(0, 5);
  const count = items.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = (i: number) => setIndex(((i % count) + count) % count);

  // Geser otomatis tiap 8 detik. Timer di-reset setiap index berubah
  // (termasuk navigasi manual) dan dijeda saat kursor berada di atas kartu.
  useEffect(() => {
    if (count <= 1 || paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), 8000);
    return () => clearTimeout(t);
  }, [index, count, paused]);

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-slate-100 bg-[#052e16] shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Track yang bergeser */}
      <div
        className="flex h-64 transition-transform duration-700 ease-out sm:h-72"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {items.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="group relative block h-full w-full shrink-0"
          >
            {/* Gambar artikel sebagai backdrop */}
            {article.coverImageUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${article.coverImageUrl})` }}
              />
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-[#16a34a] to-[#052e16]" />
            )}
            {/* Overlay gradient agar teks tetap terbaca */}
            <div className="absolute inset-0 bg-linear-to-r from-[#052e16] via-[#052e16]/85 to-[#052e16]/30" />

            <div className="relative z-10 flex h-full flex-col justify-center gap-3 p-6 sm:p-10">
              <h3 className="max-w-2xl text-2xl font-bold leading-tight text-white sm:text-3xl">
                {article.title}
              </h3>
              {article.excerpt && (
                <p className="max-w-xl text-sm text-white/70 line-clamp-2 sm:text-base">
                  {article.excerpt}
                </p>
              )}
              <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-white">
                Baca selengkapnya
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Tombol navigasi manual + indikator (di atas link, tidak ikut navigasi) */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Artikel sebelumnya"
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:scale-105 hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Artikel berikutnya"
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:scale-105 hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ke artikel ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === index
                    ? "w-6 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
