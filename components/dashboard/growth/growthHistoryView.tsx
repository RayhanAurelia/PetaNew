"use client";

import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Loader,
  Plus,
  Ruler,
  Scale,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/pageHeader";
import { AddGrowthLogModal } from "./addGrowthLogModal";
import { BMI_TONE_STYLE, classifyBmi } from "./bmiClassification";
import {
  formatDateID,
  formatDateShortID,
  type GrowthLogDTO,
} from "./growthTypes";
import {
  formatAge,
  LIFE_STAGE_LABEL,
  RELATIONSHIP_LABEL,
  type SubjectDTO,
} from "@/components/dashboard/subjects/subjectTypes";

interface GrowthHistoryViewProps {
  subject: SubjectDTO;
  /** Target tautan "kembali". Diabaikan jika `onBack` diberikan. */
  backHref?: string;
  /** Label tautan "kembali". */
  backLabel?: string;
  /** Jika diberikan, render tombol (bukan Link) yang memanggil callback ini. */
  onBack?: () => void;
}

/**
 * Comparator stabil: DESC berdasarkan recordedAt. Untuk tanggal yang sama,
 * pakai createdAt sebagai tiebreaker (paling baru dibuat = paling atas).
 * Selalu return 0 untuk yang benar-benar sama supaya sort-nya stable.
 */
function byRecordedDesc(a: GrowthLogDTO, b: GrowthLogDTO): number {
  if (a.recordedAt > b.recordedAt) return -1;
  if (a.recordedAt < b.recordedAt) return 1;
  if (a.createdAt > b.createdAt) return -1;
  if (a.createdAt < b.createdAt) return 1;
  return 0;
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

export function GrowthHistoryView({
  subject,
  backHref = "/subjects",
  backLabel = "Kembali ke Daftar Subjek",
  onBack,
}: GrowthHistoryViewProps) {
  const [logs, setLogs] = useState<GrowthLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/subjects/${subject.id}/growth`, {
        cache: "no-store",
      });
      const json: ApiResponse<GrowthLogDTO[]> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setLogs(json.data);
    } catch (e) {
      setLoadError(
        e instanceof Error ? e.message : "Gagal memuat riwayat pengukuran",
      );
    } finally {
      setLoading(false);
    }
  }, [subject.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleDelete(logId: string) {
    setDeletingId(logId);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/subjects/${subject.id}/growth/${logId}`, {
        method: "DELETE",
      });
      const json: ApiResponse<unknown> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setLogs((prev) => prev.filter((l) => l.id !== logId));
      setConfirmDeleteId(null);
    } catch (e) {
      setDeleteError(
        e instanceof Error ? e.message : "Gagal menghapus catatan",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleNewLog(log: GrowthLogDTO) {
    // Sisipkan terurut: terbaru di atas. Tiebreaker pakai createdAt agar
    // beberapa catatan di hari yang sama tetap punya urutan deterministik.
    setLogs((prev) => [log, ...prev].sort(byRecordedDesc));
  }

  // Urutan kronologis (paling lama → paling baru) untuk chart & summary.
  // logs sudah DESC dari API → reverse hasilkan ASC dengan tiebreaker konsisten.
  const chronological = [...logs].reverse();

  const latest = logs[0];
  const oldest = chronological[0];
  const weightDelta =
    latest && oldest ? latest.weightKg - oldest.weightKg : null;
  const heightDelta =
    latest && oldest ? latest.heightCm - oldest.heightCm : null;

  return (
    <div className="mx-auto max-w-6xl">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-brand-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </button>
      ) : (
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-brand-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
      )}

      <PageHeader
        kicker="Riwayat Pengukuran"
        title={subject.name}
        description={`${RELATIONSHIP_LABEL[subject.relationship]} (${formatAge(subject.ageYears, subject.ageMonths)})`}
        actions={
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Catat Pengukuran
          </button>
        }
      />

      {/* Summary stats */}
      {!loading && logs.length > 0 && (
        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            icon={<Calendar className="h-4 w-4" />}
            label="Total Catatan"
            value={`${logs.length}`}
          />
          <SummaryCard
            icon={<Calendar className="h-4 w-4" />}
            label="Pengukuran Terakhir"
            value={formatDateShortID(latest!.recordedAt)}
          />
          <SummaryCard
            icon={<Scale className="h-4 w-4" />}
            label="Pertambahan Berat"
            value={
              weightDelta == null
                ? "—"
                : `${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1)} kg`
            }
            valueClass={
              weightDelta != null && weightDelta > 0
                ? "text-emerald-600"
                : weightDelta != null && weightDelta < 0
                  ? "text-red-600"
                  : ""
            }
          />
          <SummaryCard
            icon={<Ruler className="h-4 w-4" />}
            label="Pertambahan Tinggi"
            value={
              heightDelta == null
                ? "—"
                : `${heightDelta > 0 ? "+" : ""}${heightDelta.toFixed(1)} cm`
            }
            valueClass={
              heightDelta != null && heightDelta > 0
                ? "text-emerald-600"
                : heightDelta != null && heightDelta < 0
                  ? "text-red-600"
                  : ""
            }
          />
        </section>
      )}

      {/* Charts */}
      {!loading && chronological.length >= 2 && (
        <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard
            title="Tinggi (cm)"
            icon={<Ruler className="h-4 w-4" />}
            entries={chronological}
            field="heightCm"
            color="#2563eb"
            unit="cm"
          />
          <ChartCard
            title="Berat (kg)"
            icon={<Scale className="h-4 w-4" />}
            entries={chronological}
            field="weightKg"
            color="#06b6d4"
            unit="kg"
          />
          <ChartCard
            title="BMI"
            icon={<Activity className="h-4 w-4" />}
            entries={chronological.filter((e) => e.bmi != null)}
            field="bmi"
            color="#7c3aed"
            unit=""
          />
        </section>
      )}

      {/* Error banner */}
      {loadError && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Gagal memuat riwayat</p>
            <p className="mt-0.5 text-xs">{loadError}</p>
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

      {/* Main table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Seluruh Catatan Pengukuran
            </h2>
            <p className="text-xs text-slate-500">
              Diurutkan dari yang terbaru.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center p-10 text-sm text-slate-500">
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Memuat riwayat pengukuran...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand-primary">
              <Ruler className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              Belum ada catatan
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Mulai dengan mencatat pengukuran pertama TB & BB subjek ini.
            </p>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark"
            >
              <Plus className="h-4 w-4" />
              Catat Pengukuran Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 text-left">Tanggal</th>
                  <th className="px-4 py-2.5 text-right">Tinggi (cm)</th>
                  <th className="px-4 py-2.5 text-right">Berat (kg)</th>
                  <th className="px-4 py-2.5 text-right">BMI</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5 text-left">Catatan</th>
                  <th className="px-4 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {logs.map((g) => {
                  const c = classifyBmi(g.bmi, subject.ageYears);
                  return (
                    <tr
                      key={g.id}
                      className="transition hover:bg-brand-soft/40"
                    >
                      <td className="px-4 py-2.5 text-slate-700">
                        {formatDateID(g.recordedAt)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-900">
                        {g.heightCm}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-900">
                        {g.weightKg}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-brand-primary">
                        {g.bmi == null ? "—" : g.bmi.toFixed(1)}
                      </td>
                      <td className="px-4 py-2.5">
                        {c.category === "unknown" ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          <span
                            title={c.description}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${BMI_TONE_STYLE[c.tone]}`}
                          >
                            {c.label}
                            {c.approximate && (
                              <span className="opacity-60">~</span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">
                        {g.description ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {confirmDeleteId === g.id ? (
                          <span className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDelete(g.id)}
                              disabled={deletingId === g.id}
                              className="rounded-md bg-red-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                              {deletingId === g.id ? "..." : "Hapus"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              disabled={deletingId === g.id}
                              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Batal
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDeleteId(g.id);
                              setDeleteError(null);
                            }}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2 py-1 text-[10px] font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {deleteError && (
          <p className="border-t border-slate-100 px-5 py-2 text-xs text-red-600">
            {deleteError}
          </p>
        )}
      </section>

      <AddGrowthLogModal
        open={showAdd}
        subjectId={subject.id}
        subjectName={subject.name}
        onClose={() => setShowAdd(false)}
        onSaved={handleNewLog}
      />
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  valueClass = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        <span className="text-brand-primary">{icon}</span>
        {label}
      </div>
      <p
        className={`mt-1.5 text-lg font-bold tabular-nums text-slate-900 ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  icon: React.ReactNode;
  entries: GrowthLogDTO[];
  field: "heightCm" | "weightKg" | "bmi";
  color: string;
  unit: string;
}

function ChartCard({
  title,
  icon,
  entries,
  field,
  color,
  unit,
}: ChartCardProps) {
  const values = entries
    .map((e) => (field === "bmi" ? e.bmi : (e[field] as number)))
    .filter((v): v is number => v != null);

  if (values.length < 2) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
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

  // SVG layout
  const w = 300;
  const h = 90;
  const pad = 6;
  const xStep = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;

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
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
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
                ? "text-red-600"
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
