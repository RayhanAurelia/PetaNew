"use client";

import { Dropdown, DropdownItem } from "flowbite-react";
import {
  AlertTriangle,
  Beef,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Flame,
  Loader,
  Plus,
  Salad,
  Trash2,
  Users,
  Wheat,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/pageHeader";
import {
  readActiveSubjectId,
  RELATIONSHIP_LABEL,
  writeActiveSubjectId,
  type SubjectDTO,
} from "@/components/dashboard/subjects/subjectTypes";
import { AddNutritionLogModal } from "./addNutritionLogModal";
import {
  formatDayLabel,
  getDefaultTarget,
  MEAL_COLOR,
  MEAL_GRADIENT,
  MEAL_LABEL,
  MEAL_ORDER,
  todayISO,
  type DailyTarget,
  type MealType,
  type NutritionLogDTO,
} from "./nutritionTypes";

interface ApiOk<T> {
  success: true;
  data: T;
}
interface ApiErr {
  success: false;
  error: { code: string; message: string };
}
type ApiResponse<T> = ApiOk<T> | ApiErr;

export function NutritionLogView() {
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [date, setDate] = useState<string>(todayISO());

  const [logs, setLogs] = useState<NutritionLogDTO[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [presetMeal, setPresetMeal] = useState<MealType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function openAddModal(meal: MealType | null = null) {
    setPresetMeal(meal);
    setShowAdd(true);
  }

  // Load subjects sekali, pilih primary-self atau yang pertama.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/subjects", { cache: "no-store" });
        const json: ApiResponse<SubjectDTO[]> = await res.json();
        if (cancelled) return;
        if (!json.success) throw new Error(json.error.message);
        setSubjects(json.data);
        if (json.data.length > 0 && !activeSubjectId) {
          // Prioritas: ?subject= dari URL → subjek aktif tersimpan → primary.
          const exists = (id: string | null) =>
            !!id && json.data.some((s) => s.id === id);
          const fromQuery = new URLSearchParams(window.location.search).get(
            "subject",
          );
          const fromStorage = readActiveSubjectId();
          const fallback =
            json.data.find((s) => s.isPrimary && s.relationship === "self") ??
            json.data[0];
          const initial = exists(fromQuery)
            ? fromQuery!
            : exists(fromStorage)
              ? fromStorage!
              : fallback.id;
          setActiveSubjectId(initial);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Gagal memuat daftar subjek",
          );
        }
      } finally {
        if (!cancelled) setLoadingSubjects(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(async () => {
    if (!activeSubjectId) return;
    setLoadingLogs(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/subjects/${activeSubjectId}/nutrition?date=${date}`,
        { cache: "no-store" },
      );
      const json: ApiResponse<NutritionLogDTO[]> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setLogs(json.data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Gagal memuat catatan konsumsi",
      );
    } finally {
      setLoadingLogs(false);
    }
  }, [activeSubjectId, date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Simpan subjek aktif agar konsisten dengan dashboard & halaman lain.
  useEffect(() => {
    if (activeSubjectId) writeActiveSubjectId(activeSubjectId);
  }, [activeSubjectId]);

  const activeSubject = useMemo(
    () => subjects.find((s) => s.id === activeSubjectId) ?? null,
    [subjects, activeSubjectId],
  );

  const target: DailyTarget | null = activeSubject
    ? getDefaultTarget(activeSubject.lifeStage)
    : null;

  const totals = useMemo(() => {
    return logs.reduce(
      (acc, l) => ({
        kcal: acc.kcal + l.calories,
        protein: acc.protein + l.protein,
        carbs: acc.carbs + l.carbs,
        fat: acc.fat + l.fat,
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }, [logs]);

  const grouped = useMemo(() => {
    const map: Record<MealType, NutritionLogDTO[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };
    for (const log of logs) map[log.meal].push(log);
    return map;
  }, [logs]);

  function handleNewLog(log: NutritionLogDTO) {
    // Pastikan log_date sesuai dengan tanggal aktif sebelum ditambahkan ke list.
    if (log.logDate !== date) {
      // Server menentukan log_date dari logged_at (zona Asia/Jakarta).
      // Bisa jadi user catat untuk tanggal lain, jadi tidak tampilkan di list saat ini.
      return;
    }
    setLogs((prev) =>
      [...prev, log].sort((a, b) => (a.loggedAt < b.loggedAt ? -1 : 1)),
    );
  }

  async function handleDelete(id: string) {
    if (!activeSubjectId) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(
        `/api/subjects/${activeSubjectId}/nutrition/${id}`,
        { method: "DELETE" },
      );
      const json: ApiResponse<unknown> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setLogs((prev) => prev.filter((l) => l.id !== id));
      setConfirmDeleteId(null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Gagal menghapus catatan konsumsi",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function shiftDate(deltaDays: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + deltaDays);
    setDate(d.toISOString().slice(0, 10));
  }

  const noSubjects = !loadingSubjects && subjects.length === 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Pencatatan Konsumsi"
        title="Catat Makanan"
        description="Cari makanan, tentukan porsi, dan catat ke subjek yang diinginkan"
        actions={
          <button
            type="button"
            onClick={() => openAddModal()}
            disabled={!activeSubjectId}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Catat Makanan
          </button>
        }
      />

      {/* Empty state when no subjects */}
      {noSubjects && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand-primary">
            <Users className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Belum ada subjek
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Tambahkan subjek terlebih dahulu di halaman{" "}
            <span className="font-semibold">Subjek</span> sebelum mencatat
            konsumsi.
          </p>
        </div>
      )}

      {!noSubjects && (
        <>
          <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
            <SubjectPicker
              subjects={subjects}
              activeId={activeSubjectId}
              loading={loadingSubjects}
              onChange={setActiveSubjectId}
            />
            <DatePicker date={date} onChange={setDate} onShift={shiftDate} />
          </section>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Terjadi kesalahan</p>
                <p className="mt-0.5 text-xs">{error}</p>
              </div>
              <button
                type="button"
                onClick={refresh}
                className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
              >
                Coba lagi
              </button>
            </div>
          )}

          {target && (
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
              <header className="flex items-baseline justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Progres Gizi
                  </p>
                  <p className="text-lg font-bold tabular-nums text-slate-900">
                    {Math.round(totals.kcal)}{" "}
                    <span className="text-sm font-medium text-slate-400">
                      / {target.kcal} kcal
                    </span>
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  {logs.length} entri dicatat
                </p>
              </header>

              <div className="mt-4 flex flex-col gap-3">
                <Progress
                  label="Kalori"
                  current={totals.kcal}
                  target={target.kcal}
                  unit="kcal"
                  tint="bg-brand-primary"
                />
                <Progress
                  label="Protein"
                  current={totals.protein}
                  target={target.protein}
                  unit="g"
                  tint="bg-red-500"
                  icon={<Beef className="h-3.5 w-3.5" />}
                />
                <Progress
                  label="Karbo"
                  current={totals.carbs}
                  target={target.carbs}
                  unit="g"
                  tint="bg-amber-500"
                  icon={<Wheat className="h-3.5 w-3.5" />}
                />
                <Progress
                  label="Lemak"
                  current={totals.fat}
                  target={target.fat}
                  unit="g"
                  tint="bg-blue-500"
                  icon={<Droplet className="h-3.5 w-3.5" />}
                />
              </div>

              <p className="mt-4 text-[11px] text-slate-400">
                Target di atas adalah perkiraan berdasarkan tahap usia (
                {activeSubject?.lifeStage})
              </p>
            </section>
          )}
          {loadingLogs ? (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-sm text-slate-500">
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Memuat catatan konsumsi...
            </div>
          ) : (
            <section className="flex flex-col gap-4">
              {MEAL_ORDER.map((m) => (
                <MealSection
                  key={m}
                  meal={m}
                  entries={grouped[m]}
                  confirmDeleteId={confirmDeleteId}
                  deletingId={deletingId}
                  onConfirmDelete={setConfirmDeleteId}
                  onDelete={handleDelete}
                  onAdd={openAddModal}
                />
              ))}
            </section>
          )}
        </>
      )}

      <AddNutritionLogModal
        open={showAdd}
        subjectId={activeSubjectId}
        subjectName={activeSubject?.name}
        date={date}
        presetMeal={presetMeal}
        onClose={() => {
          setShowAdd(false);
          setPresetMeal(null);
        }}
        onSaved={handleNewLog}
      />
    </div>
  );
}

function SubjectPicker({
  subjects,
  activeId,
  loading,
  onChange,
}: {
  subjects: SubjectDTO[];
  activeId: string | null;
  loading: boolean;
  onChange: (id: string) => void;
}) {
  const active = subjects.find((s) => s.id === activeId) ?? null;

  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        Subjek
      </p>
      {loading ? (
        <div className="h-11 w-45 animate-pulse rounded-xl bg-slate-100" />
      ) : (
        <Dropdown
          arrowIcon={false}
          dismissOnClick
          className="z-50 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/5"
          renderTrigger={() => (
            <button
              type="button"
              disabled={subjects.length === 0}
              className="flex w-45 items-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-3 text-sm font-semibold text-slate-900 outline-none transition hover:border-brand-primary/30 hover:bg-brand-soft focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Users className="h-4 w-4 shrink-0 text-brand-primary" />
              <span className="flex-1 truncate text-left">
                {active?.name ?? "Belum ada subjek"}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          )}
        >
          {subjects.length === 0 ? (
            <DropdownItem className="text-sm text-slate-400">
              Belum ada subjek
            </DropdownItem>
          ) : (
            subjects.map((s) => {
              const isActive = s.id === activeId;
              return (
                <DropdownItem
                  key={s.id}
                  onClick={() => onChange(s.id)}
                  className={`flex items-center justify-between gap-2 rounded-lg text-sm ${
                    isActive
                      ? "bg-brand-soft font-semibold text-brand-primary"
                      : "text-slate-600 hover:bg-brand-soft hover:text-brand-primary"
                  }`}
                >
                  <span className="flex min-w-0 flex-col text-left">
                    <span className="truncate">{s.name}</span>
                    <span className="text-[11px] font-normal text-slate-400">
                      {s.isPrimary ? "Subjek Utama" : "Anggota"}
                    </span>
                  </span>
                  {isActive && <Check className="h-4 w-4 shrink-0" />}
                </DropdownItem>
              );
            })
          )}
        </Dropdown>
      )}
    </div>
  );
}

function DatePicker({
  date,
  onChange,
  onShift,
}: {
  date: string;
  onChange: (d: string) => void;
  onShift: (delta: number) => void;
}) {
  const today = todayISO();
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        Tanggal
      </p>
      <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => onShift(-1)}
          aria-label="Hari sebelumnya"
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-brand-soft hover:text-brand-primary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="relative">
          <Calendar className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => onChange(e.target.value)}
            className="w-44 rounded-lg bg-transparent py-1.5 pl-7 pr-2 text-sm font-semibold text-slate-900 outline-none focus:bg-brand-soft/40"
          />
        </div>
        <button
          type="button"
          onClick={() => onShift(1)}
          disabled={date >= today}
          aria-label="Hari berikutnya"
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-brand-soft hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <p className="text-[11px] text-slate-400">{formatDayLabel(date)}</p>
    </div>
  );
}

function Progress({
  label,
  current,
  target,
  unit,
  tint,
  icon,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  tint: string;
  icon?: React.ReactNode;
}) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const over = current > target;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="flex items-center gap-1 font-medium text-slate-700">
          {icon}
          {label}
        </span>
        <span
          className={`tabular-nums ${
            over ? "font-semibold text-red-600" : "text-slate-500"
          }`}
        >
          {Math.round(current * 10) / 10} / {target} {unit}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${over ? "bg-red-500" : tint} transition-[width] duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MealSection({
  meal,
  entries,
  confirmDeleteId,
  deletingId,
  onConfirmDelete,
  onDelete,
  onAdd,
}: {
  meal: MealType;
  entries: NutritionLogDTO[];
  confirmDeleteId: string | null;
  deletingId: string | null;
  onConfirmDelete: (id: string | null) => void;
  onDelete: (id: string) => void;
  onAdd: (meal: MealType) => void;
}) {
  const subtotal = entries.reduce((acc, e) => acc + e.calories, 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ring-1 ${MEAL_COLOR[meal]}`}
          >
            {MEAL_LABEL[meal]}
          </span>
          <span className="text-xs text-slate-500">{entries.length} entri</span>
        </div>
        <span className="text-xs font-semibold tabular-nums text-slate-700">
          {Math.round(subtotal)} kcal
        </span>
      </header>

      {entries.length === 0 ? (
        <div className="flex items-center justify-between gap-2 px-5 py-4 text-xs text-slate-400">
          <span>Belum ada catatan {MEAL_LABEL[meal].toLowerCase()}.</span>
          <button
            type="button"
            onClick={() => onAdd(meal)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary"
          >
            <Plus className="h-3 w-3" /> Tambah
          </button>
        </div>
      ) : (
        <>
          {/* Desktop: tabel makro sejajar */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-2 text-left font-semibold">Makanan</th>
                  <th className="px-3 py-2 text-right font-semibold">Porsi</th>
                  <th className="px-3 py-2 text-right font-semibold">P</th>
                  <th className="px-3 py-2 text-right font-semibold">K</th>
                  <th className="px-3 py-2 text-right font-semibold">L</th>
                  <th className="px-3 py-2 text-right font-semibold">Kkal</th>
                  <th className="px-3 py-2 text-left font-semibold">Waktu</th>
                  <th className="px-5 py-2 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((e) => (
                  <NutritionTableRow
                    key={e.id}
                    entry={e}
                    confirmingDelete={confirmDeleteId === e.id}
                    deleting={deletingId === e.id}
                    onAskDelete={() => onConfirmDelete(e.id)}
                    onCancelDelete={() => onConfirmDelete(null)}
                    onConfirmDelete={() => onDelete(e.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: daftar kartu */}
          <ul className="divide-y divide-slate-100 lg:hidden">
            {entries.map((e) => (
              <li key={e.id}>
                <NutritionLogRow
                  entry={e}
                  confirmingDelete={confirmDeleteId === e.id}
                  deleting={deletingId === e.id}
                  onAskDelete={() => onConfirmDelete(e.id)}
                  onCancelDelete={() => onConfirmDelete(null)}
                  onConfirmDelete={() => onDelete(e.id)}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function NutritionTableRow({
  entry,
  confirmingDelete,
  deleting,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  entry: NutritionLogDTO;
  confirmingDelete: boolean;
  deleting: boolean;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  return (
    <tr className="transition hover:bg-slate-50/60">
      <td className="px-5 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-linear-to-br text-white shadow-sm ${MEAL_GRADIENT[entry.meal]}`}
          >
            <Salad className="h-4 w-4" />
          </span>
          <span className="truncate font-medium text-slate-900">
            {entry.foodName}
          </span>
        </div>
      </td>
      <td className="px-3 py-3 text-right whitespace-nowrap text-slate-600 tabular-nums">
        {entry.servingQuantity} {entry.servingUnit}
      </td>
      <td className="px-3 py-3 text-right text-slate-600 tabular-nums">
        {entry.protein}g
      </td>
      <td className="px-3 py-3 text-right text-slate-600 tabular-nums">
        {entry.carbs}g
      </td>
      <td className="px-3 py-3 text-right text-slate-600 tabular-nums">
        {entry.fat}g
      </td>
      <td className="px-3 py-3 text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap">
        <Flame className="mr-0.5 inline h-3.5 w-3.5 text-brand-warning" />
        {Math.round(entry.calories)}
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-slate-500 tabular-nums">
        {formatTime(entry.loggedAt)}
      </td>
      <td className="px-5 py-3 text-right">
        {confirmingDelete ? (
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={onConfirmDelete}
              disabled={deleting}
              className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? "..." : "Hapus"}
            </button>
            <button
              type="button"
              onClick={onCancelDelete}
              disabled={deleting}
              className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onAskDelete}
            aria-label="Hapus catatan"
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3 w-3" />
            Hapus
          </button>
        )}
      </td>
    </tr>
  );
}

function NutritionLogRow({
  entry,
  confirmingDelete,
  deleting,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  entry: NutritionLogDTO;
  confirmingDelete: boolean;
  deleting: boolean;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const time = formatTime(entry.loggedAt);
  return (
    <div className="flex items-start gap-3 px-5 py-3">
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-linear-to-br text-white shadow-sm ${MEAL_GRADIENT[entry.meal]}`}
      >
        <Salad className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {entry.foodName}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          {entry.servingQuantity} {entry.servingUnit} · P {entry.protein}g · K{" "}
          {entry.carbs}g · L {entry.fat}g · {time}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold tabular-nums text-slate-900">
          <Flame className="mr-0.5 inline h-3.5 w-3.5 text-brand-warning" />
          {Math.round(entry.calories)}
          <span className="ml-0.5 text-[10px] font-medium text-slate-400">
            kcal
          </span>
        </p>
        {confirmingDelete ? (
          <div className="mt-1 inline-flex items-center gap-1">
            <button
              type="button"
              onClick={onConfirmDelete}
              disabled={deleting}
              className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? "..." : "Hapus"}
            </button>
            <button
              type="button"
              onClick={onCancelDelete}
              disabled={deleting}
              className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onAskDelete}
            aria-label="Hapus catatan"
            className="mt-1 inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3 w-3" />
            Hapus
          </button>
        )}
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
