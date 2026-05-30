"use client";

import {
  AlertTriangle,
  Beef,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Flame,
  Loader,
  Search,
  ShieldCheck,
  Wheat,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/dashboard/pageHeader";
import { FoodDetailModal } from "./foodDetailModal";
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  type FoodDTO,
  type SearchFoodsResult,
} from "./foodTypes";

interface ApiOk<T> {
  success: true;
  data: T;
}
interface ApiErr {
  success: false;
  error: { code: string; message: string };
}
type ApiResponse<T> = ApiOk<T> | ApiErr;

const SUGGESTIONS = [
  "nasi",
  "tempe",
  "ayam",
  "telur",
  "tahu",
  "pisang",
  "indomie",
  "susu",
  "yogurt",
  "kacang",
];
const DEBOUNCE_MS = 400;
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];
const DEFAULT_PAGE_SIZE: PageSize = 20;

export function FoodsView() {
  const [query, setQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);

  const [results, setResults] = useState<FoodDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFood, setActiveFood] = useState<FoodDTO | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);
  const resultsTopRef = useRef<HTMLDivElement | null>(null);
  const isFirstRun = useRef(true);

  const runSearch = useCallback(async (q: string, p: number, size: number) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setTotal(0);
      setError(null);
      setLoading(false);
      return;
    }

    const myId = ++requestId.current;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/foods/search?q=${encodeURIComponent(trimmed)}&page=${p}&pageSize=${size}`,
        { cache: "no-store" },
      );
      if (myId !== requestId.current) return;

      const json: ApiResponse<SearchFoodsResult> = await res.json();
      if (!json.success) {
        throw new Error(json.error.message);
      }
      setResults(json.data.items);
      setTotal(json.data.total);
    } catch (e) {
      if (myId !== requestId.current) return;
      setError(e instanceof Error ? e.message : "Gagal memuat hasil pencarian");
      setResults([]);
      setTotal(0);
    } finally {
      if (myId === requestId.current) setLoading(false);
    }
  }, []);

  // Debounce ketikan user → commit query + reset ke page 1.
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setCommittedQuery(query);
      setPage(1);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  // Fetch saat committedQuery / page / pageSize berubah.
  useEffect(() => {
    runSearch(committedQuery, page, pageSize);
  }, [committedQuery, page, pageSize, runSearch]);

  function pickSuggestion(s: string) {
    setQuery(s);
  }

  function handlePageSizeChange(size: PageSize) {
    if (size === pageSize) return;
    setPageSize(size);
    setPage(1);
  }

  function handlePageChange(next: number) {
    setPage(next);
    // Scroll ke atas hasil saat ganti halaman (skip initial mount).
    if (!isFirstRun.current && resultsTopRef.current) {
      resultsTopRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    isFirstRun.current = false;
  }

  const trimmedQuery = query.trim();
  const hasResults = results.length > 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showPagination = hasResults && totalPages > 1;
  const startItem = hasResults ? (page - 1) * pageSize + 1 : 0;
  const endItem = hasResults ? startItem + results.length - 1 : 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Database Makanan"
        title="Cari Nutrisi Makanan"
        description="Cari informasi kalori & makro per 100 gram dari database makanan"
      />

      {/* Search bar */}
      <div className="mb-4">
        <div className="relative">
          {loading ? (
            <Loader className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-brand-primary" />
          ) : (
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          )}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik nama makanan (min. 2 huruf), misal: nasi goreng, tempe..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            autoFocus
          />
        </div>

        {/* Suggestions */}
        {trimmedQuery.length < 2 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Coba:
            </span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => pickSuggestion(s)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Gagal memuat data</p>
            <p className="mt-0.5 wrap-break-word text-xs text-red-600">
              {error}
            </p>
            <p className="mt-1 text-[11px] text-red-500/80">
              OpenFoodFacts kadang lambat / overload. Coba lagi atau ganti kata
              kunci.
            </p>
          </div>
          <button
            type="button"
            onClick={() => runSearch(committedQuery, page, pageSize)}
            className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Anchor untuk scroll-to-top saat ganti halaman */}
      <div ref={resultsTopRef} />

      {/* Initial state */}
      {!trimmedQuery && !loading && <EmptyHero />}

      {/* Results bar — meta + page size selector */}
      {trimmedQuery.length >= 2 && (loading || hasResults || !error) && (
        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="text-xs text-slate-500">
            {loading && !hasResults ? (
              <span>Mencari...</span>
            ) : hasResults ? (
              <span>
                Menampilkan{" "}
                <span className="font-semibold tabular-nums text-slate-900">
                  {startItem.toLocaleString("id-ID")}–
                  {endItem.toLocaleString("id-ID")}
                </span>{" "}
                dari{" "}
                <span className="font-semibold tabular-nums text-slate-900">
                  {total.toLocaleString("id-ID")}
                </span>{" "}
                hasil
              </span>
            ) : (
              <span>Tidak ada hasil</span>
            )}
          </div>

          <PageSizeSelector
            value={pageSize}
            onChange={handlePageSizeChange}
            disabled={loading}
          />
        </div>
      )}

      {/* Loading skeleton */}
      {loading && results.length === 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: Math.min(6, pageSize) }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* No results */}
      {!loading &&
        trimmedQuery.length >= 2 &&
        results.length === 0 &&
        !error && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
              <Search className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">
              Tidak ada hasil untuk &quot;{query}&quot;
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Coba kata kunci yang lebih umum atau ejaan bahasa Inggris.
            </p>
          </div>
        )}

      {/* Results */}
      {hasResults && (
        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${
            loading ? "opacity-60 transition-opacity" : ""
          }`}
        >
          {results.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onClick={() => setActiveFood(food)}
            />
          ))}
        </div>
      )}

      {/* Pagination bottom */}
      {showPagination && (
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            Halaman{" "}
            <span className="font-semibold tabular-nums text-slate-900">
              {page}
            </span>{" "}
            dari{" "}
            <span className="font-semibold tabular-nums text-slate-900">
              {totalPages.toLocaleString("id-ID")}
            </span>
          </p>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            disabled={loading}
            onChange={handlePageChange}
          />
        </div>
      )}

      <FoodDetailModal
        open={activeFood !== null}
        foodId={activeFood?.id ?? null}
        preview={activeFood}
        onClose={() => setActiveFood(null)}
      />
    </div>
  );
}

function PageSizeSelector({
  value,
  onChange,
  disabled,
}: {
  value: PageSize;
  onChange: (size: PageSize) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Per halaman
      </span>
      <div
        role="radiogroup"
        aria-label="Jumlah hasil per halaman"
        className="inline-flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white p-1"
      >
        {PAGE_SIZE_OPTIONS.map((size) => {
          const active = size === value;
          return (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(size)}
              disabled={disabled}
              className={`rounded-lg px-3 py-1 text-xs font-semibold tabular-nums transition disabled:cursor-not-allowed disabled:opacity-50 ${
                active
                  ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/20"
                  : "text-slate-600 hover:bg-brand-soft hover:text-brand-primary"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PaginationControls({
  page,
  totalPages,
  disabled,
  onChange,
}: {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onChange: (page: number) => void;
}) {
  const pages = getPageNumbers(page, totalPages);
  const canPrev = page > 1 && !disabled;
  const canNext = page < totalPages && !disabled;

  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex flex-wrap items-center justify-center gap-1"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={!canPrev}
        aria-label="Halaman sebelumnya"
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Sebelumnya</span>
      </button>

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span
            key={`ellipsis-${i}`}
            className="px-1.5 text-xs font-semibold text-slate-400"
          >
            ···
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            disabled={disabled}
            aria-current={p === page ? "page" : undefined}
            className={`min-w-[2.25rem] rounded-lg px-2.5 py-1.5 text-xs font-semibold tabular-nums transition disabled:cursor-not-allowed disabled:opacity-50 ${
              p === page
                ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/20"
                : "border border-slate-200 bg-white text-slate-700 hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={!canNext}
        aria-label="Halaman berikutnya"
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700"
      >
        <span className="hidden sm:inline">Berikutnya</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </nav>
  );
}

/**
 * Susun nomor halaman dengan ellipsis untuk navigasi singkat.
 * Contoh: total 20, current 8 → [1, "...", 7, 8, 9, "...", 20]
 */
function getPageNumbers(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", total];
  }
  if (current >= total - 3) {
    return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

function FoodCard({ food, onClick }: { food: FoodDTO; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5"
    >
      {/* Banner image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-linear-to-br from-brand-soft via-slate-50 to-slate-100">
        {food.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={food.imageUrl}
            alt={food.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-brand-primary/30 transition-transform duration-500 group-hover:scale-110">
            <Flame className="h-14 w-14" />
          </div>
        )}

        {/* Bottom gradient untuk readability badge */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-slate-900/40 to-transparent"
        />

        {/* Category badge — bottom-left overlay */}
        <span
          className={`absolute bottom-2.5 left-2.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider shadow-sm ring-1 ${CATEGORY_COLOR[food.category]}`}
        >
          {CATEGORY_LABEL[food.category]}
        </span>

        {/* Verified badge — top-right overlay */}
        {food.isVerified && (
          <span
            title="Terverifikasi tim PETA"
            className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-primary shadow-sm ring-1 ring-brand-primary/20 backdrop-blur"
          >
            <ShieldCheck className="h-3 w-3" />
            Verified
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <p
            className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-brand-primary"
            title={food.name}
          >
            {food.name}
          </p>
          {food.brand && (
            <p className="mt-0.5 truncate text-[11px] text-slate-500">
              {food.brand}
            </p>
          )}
        </div>

        <div className="flex items-baseline gap-1.5">
          <Flame className="h-4 w-4 text-brand-warning" />
          <span className="text-xl font-bold tabular-nums text-slate-900">
            {food.caloriesPer100g}
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            kcal · per 100g
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5">
          <Macro
            icon={<Beef className="h-3 w-3" />}
            label="Protein"
            value={`${food.proteinPer100g}g`}
          />
          <Macro
            icon={<Wheat className="h-3 w-3" />}
            label="Karbo"
            value={`${food.carbsPer100g}g`}
          />
          <Macro
            icon={<Droplet className="h-3 w-3" />}
            label="Lemak"
            value={`${food.fatPer100g}g`}
          />
        </div>
      </div>
    </button>
  );
}

function Macro({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </div>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">
        {value}
      </p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-[16/10] w-full animate-pulse bg-slate-200" />
      <div className="flex flex-col gap-3 p-4">
        <div className="space-y-2">
          <div className="h-3 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-6 w-24 animate-pulse rounded bg-slate-100" />
        <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

function EmptyHero() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand-primary">
        <Search className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">
        Mulai cari makanan
      </h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        Ketik nama makanan di kolom pencarian di atas
      </p>
    </div>
  );
}
