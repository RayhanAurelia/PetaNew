import { Clock, Plus, Salad, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/pageHeader";

type Meal = "sarapan" | "makan_siang" | "makan_malam" | "camilan";

interface LogEntry {
  id: string;
  foodName: string;
  serving: string;
  meal: Meal;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
  time: string;
}

const MEAL_LABEL: Record<Meal, string> = {
  sarapan: "Sarapan",
  makan_siang: "Makan Siang",
  makan_malam: "Makan Malam",
  camilan: "Camilan",
};

const SAMPLE_LOGS: LogEntry[] = [
  {
    id: "1",
    foodName: "Nasi Goreng Kampung",
    serving: "1.5 porsi (150g)",
    meal: "sarapan",
    kcal: 281,
    protein: 8,
    carb: 36,
    fat: 12,
    time: "07:30",
  },
  {
    id: "2",
    foodName: "Pisang Ambon",
    serving: "1 buah sedang (100g)",
    meal: "camilan",
    kcal: 89,
    protein: 1.1,
    carb: 23,
    fat: 0.3,
    time: "10:15",
  },
];

const TARGET = { kcal: 1000, protein: 35, carb: 130, fat: 40 };

export default function LogPage() {
  const total = SAMPLE_LOGS.reduce(
    (acc, l) => ({
      kcal: acc.kcal + l.kcal,
      protein: acc.protein + l.protein,
      carb: acc.carb + l.carb,
      fat: acc.fat + l.fat,
    }),
    { kcal: 0, protein: 0, carb: 0, fat: 0 },
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        kicker="Pencatatan Harian"
        title="Catat Makanan"
        description="Cari makanan dari database, tentukan porsi, lalu simpan ke catatan harian subjek aktif."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Tambah Catatan
          </button>
        }
      />

      {/* Quick search */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Cari Cepat
        </p>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Ketik nama makanan..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Tip: ketik minimal 2 huruf untuk autocomplete fuzzy search.
        </p>
      </div>

      {/* Progress + Logs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Progress card */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Progres Hari Ini
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {total.kcal} <span className="text-sm text-slate-400">/ {TARGET.kcal} kcal</span>
          </p>

          <div className="mt-5 flex flex-col gap-4">
            <Progress label="Kalori" current={total.kcal} target={TARGET.kcal} unit="kcal" tint="bg-brand-primary" />
            <Progress label="Protein" current={total.protein} target={TARGET.protein} unit="g" tint="bg-red-500" />
            <Progress label="Karbo" current={total.carb} target={TARGET.carb} unit="g" tint="bg-amber-500" />
            <Progress label="Lemak" current={total.fat} target={TARGET.fat} unit="g" tint="bg-blue-500" />
          </div>
        </aside>

        {/* Log list */}
        <section className="flex flex-col gap-3">
          {SAMPLE_LOGS.length === 0 ? (
            <EmptyLog />
          ) : (
            SAMPLE_LOGS.map((l) => <LogCard key={l.id} entry={l} />)
          )}
        </section>
      </div>
    </div>
  );
}

function LogCard({ entry }: { entry: LogEntry }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-primary/30 hover:shadow-sm">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-primary">
        <Salad className="h-6 w-6" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-slate-900">{entry.foodName}</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            {MEAL_LABEL[entry.meal]}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{entry.serving}</p>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
          <span>P {entry.protein}g</span>
          <span>K {entry.carb}g</span>
          <span>L {entry.fat}g</span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-base font-bold tabular-nums text-slate-900">
          {entry.kcal}
          <span className="ml-0.5 text-xs font-medium text-slate-400">kcal</span>
        </p>
        <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="h-3 w-3" />
          {entry.time}
        </p>
      </div>
    </div>
  );
}

function EmptyLog() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand-primary">
        <Salad className="h-6 w-6" />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-900">
        Belum ada catatan hari ini
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Mulai dari pencarian cepat di atas atau pilih dari database makanan.
      </p>
    </div>
  );
}

function Progress({
  label,
  current,
  target,
  unit,
  tint,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  tint: string;
}) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="tabular-nums text-slate-500">
          {current} / {target} {unit}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${tint} transition-[width] duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
