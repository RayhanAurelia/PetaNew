"use client";

import {
  AlertTriangle,
  Beef,
  CheckCircle2,
  ChevronLeft,
  Droplet,
  Flame,
  Loader,
  Save,
  Search,
  ShieldCheck,
  Wheat,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import type { FoodDTO } from "@/components/dashboard/foods/foodTypes";
import {
  MEAL_LABEL,
  MEAL_ORDER,
  type MealType,
  type NutritionLogDTO,
} from "./nutritionTypes";

interface AddNutritionLogModalProps {
  open: boolean;
  subjectId: string | null;
  subjectName?: string;
  /** Tanggal aktif di parent — dipakai sebagai default loggedAt. */
  date: string;
  onClose: () => void;
  onSaved: (log: NutritionLogDTO) => void;
}

interface ApiOk<T> {
  success: true;
  data: T;
}
interface ApiErr {
  success: false;
  error: { code: string; message: string };
}
type ApiResponse<T> = ApiOk<T> | ApiErr;

interface SearchFoodsResult {
  items: FoodDTO[];
  total: number;
  page: number;
  pageSize: number;
}

const SEARCH_DEBOUNCE_MS = 400;

export function AddNutritionLogModal({
  open,
  subjectId,
  subjectName,
  date,
  onClose,
  onSaved,
}: AddNutritionLogModalProps) {
  const [step, setStep] = useState<"search" | "portion">("search");

  // Step 1: search
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodDTO[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  // Step 2: portion + meal
  const [selected, setSelected] = useState<FoodDTO | null>(null);
  const [grams, setGrams] = useState("100");
  const [meal, setMeal] = useState<MealType>(suggestMealByTime);

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Reset semua state saat modal dibuka.
  useEffect(() => {
    if (!open) return;
    setStep("search");
    setQuery("");
    setResults([]);
    setSearching(false);
    setSearchError(null);
    setSelected(null);
    setGrams("100");
    setMeal(suggestMealByTime());
    setSubmitting(false);
    setServerError(null);
  }, [open]);

  // Debounced search ke OpenFoodFacts via /api/foods/search.
  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearchError(null);
      setSearching(false);
      return;
    }
    const myId = ++requestId.current;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `/api/foods/search?q=${encodeURIComponent(trimmed)}&pageSize=15`,
        { cache: "no-store" },
      );
      if (myId !== requestId.current) return;
      const json: ApiResponse<SearchFoodsResult> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setResults(json.data.items);
    } catch (e) {
      if (myId !== requestId.current) return;
      setSearchError(
        e instanceof Error ? e.message : "Gagal mencari makanan",
      );
      setResults([]);
    } finally {
      if (myId === requestId.current) setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (step !== "search") return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => runSearch(query), SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, step, runSearch]);

  function pickFood(food: FoodDTO) {
    setSelected(food);
    setStep("portion");
  }

  function backToSearch() {
    setStep("search");
    setSelected(null);
    setServerError(null);
  }

  // Hitung total nutrisi dari food per-100g × (grams/100).
  const gramsNum = parseFloat(grams);
  const multiplier =
    !Number.isNaN(gramsNum) && gramsNum > 0 ? gramsNum / 100 : 0;
  const computed = selected
    ? {
        calories: round(selected.caloriesPer100g * multiplier),
        protein: round(selected.proteinPer100g * multiplier),
        carbs: round(selected.carbsPer100g * multiplier),
        fat: round(selected.fatPer100g * multiplier),
      }
    : null;

  async function handleSubmit() {
    if (!subjectId || !selected || !computed) return;
    const validGrams = !Number.isNaN(gramsNum) && gramsNum > 0 && gramsNum < 5000;
    if (!validGrams) {
      setServerError("Porsi (gram) harus antara 1 dan 5000 gram.");
      return;
    }
    setSubmitting(true);
    setServerError(null);

    // loggedAt: kombinasi date (dari parent) + jam sekarang.
    // Kalau parent date = hari ini → biarkan loggedAt default (NOW di server).
    // Kalau parent date != hari ini → kirim eksplisit dengan jam 12:00 supaya
    // log_date trigger menghasilkan tanggal yang benar.
    const today = new Date().toISOString().slice(0, 10);
    let loggedAt: string | undefined;
    if (date !== today) {
      loggedAt = new Date(`${date}T12:00:00`).toISOString();
    }

    const payload = {
      foodId: selected.id,
      foodName: selected.name + (selected.brand ? ` (${selected.brand})` : ""),
      servingQuantity: gramsNum,
      servingUnit: "gram",
      calories: computed.calories,
      protein: computed.protein,
      carbs: computed.carbs,
      fat: computed.fat,
      meal,
      ...(loggedAt && { loggedAt }),
    };

    try {
      const res = await fetch(`/api/subjects/${subjectId}/nutrition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json: ApiResponse<NutritionLogDTO> = await res.json();
      if (!json.success) {
        setServerError(json.error.message);
        return;
      }
      onSaved(json.data);
      onClose();
    } catch (e) {
      setServerError(
        e instanceof Error ? e.message : "Gagal menyimpan catatan",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={step === "search" ? "Cari Makanan" : "Atur Porsi"}
      description={
        step === "search"
          ? subjectName
            ? `Cari makanan untuk dicatat ke ${subjectName}`
            : "Cari makanan dari database OpenFoodFacts"
          : "Tentukan berapa gram yang dikonsumsi dan waktu makan"
      }
      size="lg"
      footer={
        step === "portion" ? (
          <>
            <button
              type="button"
              onClick={backToSearch}
              disabled={submitting}
              className="mr-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <ChevronLeft className="h-4 w-4" />
              Pilih Makanan Lain
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !computed}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {submitting ? "Menyimpan..." : "Catat Konsumsi"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Tutup
          </button>
        )
      }
    >
      {step === "search" ? (
        <SearchStep
          query={query}
          onQuery={setQuery}
          loading={searching}
          error={searchError}
          results={results}
          onPick={pickFood}
        />
      ) : selected ? (
        <PortionStep
          food={selected}
          grams={grams}
          onGrams={setGrams}
          meal={meal}
          onMeal={setMeal}
          computed={computed}
          serverError={serverError}
        />
      ) : null}
    </Modal>
  );
}

function SearchStep({
  query,
  onQuery,
  loading,
  error,
  results,
  onPick,
}: {
  query: string;
  onQuery: (v: string) => void;
  loading: boolean;
  error: string | null;
  results: FoodDTO[];
  onPick: (f: FoodDTO) => void;
}) {
  const trimmed = query.trim();

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        {loading ? (
          <Loader className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-brand-primary" />
        ) : (
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Cari nasi, tempe, ayam, susu..."
          autoFocus
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
        />
      </div>

      {trimmed.length < 2 && (
        <p className="text-[11px] text-slate-400">
          Ketik minimal 2 huruf nama makanan untuk mulai pencarian.
        </p>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="max-h-[50vh] overflow-y-auto rounded-xl">
        {loading && results.length === 0 ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : results.length === 0 && trimmed.length >= 2 && !loading && !error ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">
            Tidak ada hasil. Coba kata kunci lain.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {results.map((food) => (
              <li key={food.id}>
                <button
                  type="button"
                  onClick={() => onPick(food)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-brand-primary/30 hover:bg-brand-soft/40"
                >
                  {food.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={food.imageUrl}
                      alt={food.name}
                      className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 bg-slate-50 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-primary">
                      <Flame className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      title={food.name}
                      className="truncate text-sm font-semibold text-slate-900 group-hover:text-brand-primary"
                    >
                      {food.name}
                    </p>
                    {food.brand && (
                      <p className="truncate text-[11px] text-slate-500">
                        {food.brand}
                      </p>
                    )}
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {food.caloriesPer100g} kcal · P {food.proteinPer100g}g · K{" "}
                      {food.carbsPer100g}g · L {food.fatPer100g}g (per 100g)
                    </p>
                  </div>
                  {food.isVerified && (
                    <ShieldCheck className="h-4 w-4 shrink-0 text-brand-primary" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PortionStep({
  food,
  grams,
  onGrams,
  meal,
  onMeal,
  computed,
  serverError,
}: {
  food: FoodDTO;
  grams: string;
  onGrams: (v: string) => void;
  meal: MealType;
  onMeal: (v: MealType) => void;
  computed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null;
  serverError: string | null;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Selected food */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
        {food.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={food.imageUrl}
            alt={food.name}
            className="h-14 w-14 shrink-0 rounded-lg border border-slate-200 bg-slate-50 object-cover"
          />
        ) : (
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-primary">
            <Flame className="h-6 w-6" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold text-slate-900">
            {food.name}
          </p>
          {food.brand && (
            <p className="truncate text-[11px] text-slate-500">{food.brand}</p>
          )}
          <p className="mt-0.5 text-[11px] text-slate-500">
            {food.caloriesPer100g} kcal per 100g
          </p>
        </div>
        <CheckCircle2 className="h-5 w-5 text-brand-primary" />
      </div>

      {serverError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Porsi (gram) */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
          Porsi (gram) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          inputMode="decimal"
          min="1"
          max="4999"
          step="1"
          value={grams}
          onChange={(e) => onGrams(e.target.value)}
          placeholder="100"
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold tabular-nums text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[50, 100, 150, 200, 250].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onGrams(String(g))}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                grams === String(g)
                  ? "bg-brand-primary text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary"
              }`}
            >
              {g}g
            </button>
          ))}
        </div>
      </div>

      {/* Meal picker */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
          Waktu Makan <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {MEAL_ORDER.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onMeal(m)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                m === meal
                  ? "border-brand-primary bg-brand-primary text-white shadow-sm shadow-brand-primary/20"
                  : "border-slate-200 bg-white text-slate-700 hover:border-brand-primary/30 hover:bg-brand-soft"
              }`}
            >
              {MEAL_LABEL[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {computed && (
        <div className="rounded-2xl border border-brand-primary/20 bg-brand-soft/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-primary">
            Total dicatat
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <Flame className="h-5 w-5 text-brand-warning" />
            <span className="text-2xl font-bold tabular-nums text-slate-900">
              {computed.calories}
            </span>
            <span className="text-xs font-medium text-slate-500">kcal</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <MacroChip
              icon={<Beef className="h-3 w-3" />}
              label="Protein"
              value={computed.protein}
            />
            <MacroChip
              icon={<Wheat className="h-3 w-3" />}
              label="Karbo"
              value={computed.carbs}
            />
            <MacroChip
              icon={<Droplet className="h-3 w-3" />}
              label="Lemak"
              value={computed.fat}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MacroChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg bg-white p-2">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        <span className="text-brand-primary">{icon}</span>
        {label}
      </div>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">
        {value}g
      </p>
    </div>
  );
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Tebak waktu makan berdasarkan jam sekarang (zona lokal). */
function suggestMealByTime(): MealType {
  const h = new Date().getHours();
  if (h < 10) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 21) return "dinner";
  return "snack";
}
