"use client";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Baby,
  Calendar,
  Heart,
  Info,
  Loader,
  Pencil,
  Plus,
  Ruler,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { AddGrowthLogModal } from "@/components/dashboard/growth/addGrowthLogModal";
import {
  BMI_TONE_STYLE,
  classifyBmi,
} from "@/components/dashboard/growth/bmiClassification";
import {
  formatDateShortID,
  type GrowthLogDTO,
} from "@/components/dashboard/growth/growthTypes";
import {
  formatAge,
  GENDER_LABEL,
  LIFE_STAGE_LABEL,
  RELATIONSHIP_LABEL,
  type SubjectDTO,
} from "./subjectTypes";

interface SubjectDetailModalProps {
  open: boolean;
  subject: SubjectDTO | null;
  onClose: () => void;
  onEdit: (subject: SubjectDTO) => void;
  onDelete: (id: string) => Promise<void>;
  /** Dipanggil setelah ada perubahan growth log (tambah/hapus) supaya parent bisa refresh card. */
  onGrowthChanged?: () => void;
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

const RECENT_LIMIT = 5;

export function SubjectDetailModal({
  open,
  subject,
  onClose,
  onEdit,
  onDelete,
  onGrowthChanged,
}: SubjectDetailModalProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [growthLogs, setGrowthLogs] = useState<GrowthLogDTO[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [showAddGrowth, setShowAddGrowth] = useState(false);

  const subjectId = subject?.id ?? null;

  const fetchLogs = useCallback(async () => {
    if (!subjectId) return;
    setLoadingLogs(true);
    setLogsError(null);
    try {
      const res = await fetch(`/api/subjects/${subjectId}/growth`, {
        cache: "no-store",
      });
      const json: ApiResponse<GrowthLogDTO[]> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setGrowthLogs(json.data);
    } catch (e) {
      setLogsError(
        e instanceof Error ? e.message : "Gagal memuat riwayat pengukuran",
      );
    } finally {
      setLoadingLogs(false);
    }
  }, [subjectId]);

  // Reset & fetch saat modal dibuka.
  useEffect(() => {
    if (!open) {
      setConfirmingDelete(false);
      setDeleting(false);
      setDeleteError(null);
      setShowAddGrowth(false);
      return;
    }
    fetchLogs();
  }, [open, subjectId, fetchLogs]);

  if (!subject) return null;

  const isChild =
    subject.lifeStage === "balita" || subject.lifeStage === "anak";
  const recent = growthLogs.slice(0, RECENT_LIMIT);
  const latest = growthLogs[0];
  const previous = growthLogs[1];

  const heightTrend =
    latest && previous ? latest.heightCm - previous.heightCm : null;
  const weightTrend =
    latest && previous ? latest.weightKg - previous.weightKg : null;

  async function handleConfirmDelete() {
    if (!subject) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await onDelete(subject.id);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Gagal menghapus subjek",
      );
      setDeleting(false);
    }
  }

  function handleNewLog(log: GrowthLogDTO) {
    setGrowthLogs((prev) => [log, ...prev]);
    onGrowthChanged?.();
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={subject.name}
        description={`${RELATIONSHIP_LABEL[subject.relationship]} (${formatAge(subject.ageYears, subject.ageMonths)})`}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              disabled={deleting || confirmingDelete}
              className="mr-auto inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Hapus
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => onEdit(subject)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          </>
        }
      >
        {/* Delete confirmation */}
        {confirmingDelete && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">
                  Hapus subjek &quot;{subject.name}&quot;?
                </p>
                <p className="mt-0.5 text-xs text-red-700">
                  Tindakan ini permanen. Semua riwayat pengukuran & catatan
                  konsumsi yang terhubung dengan subjek ini akan ikut terhapus.
                </p>
                {deleteError && (
                  <p className="mt-2 text-xs font-medium text-red-700">
                    {deleteError}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deleting ? "Menghapus..." : "Ya, Hapus Permanen"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    disabled={deleting}
                    className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Identity */}
        <section className="flex items-start gap-4 rounded-2xl bg-linear-to-br from-brand-soft to-white p-4 ring-1 ring-brand-primary/10">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-primary text-white">
            {isChild ? (
              <Baby className="h-7 w-7" />
            ) : (
              <Users className="h-7 w-7" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600 ring-1 ring-slate-200">
                {LIFE_STAGE_LABEL[subject.lifeStage]}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600 ring-1 ring-slate-200">
                <Calendar className="h-3 w-3" />
                {formatAge(subject.ageYears, subject.ageMonths)}
              </span>
              {subject.isPrimary && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
                  <Heart className="h-3 w-3" /> Primary Self
                </span>
              )}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <InfoRow
                label="Hubungan"
                value={RELATIONSHIP_LABEL[subject.relationship]}
              />
              <InfoRow
                label="Jenis Kelamin"
                value={GENDER_LABEL[subject.gender]}
              />
              <InfoRow
                label="Tanggal Lahir"
                value={formatDateShortID(subject.birthDate)}
              />
              <InfoRow
                label="Level Aktivitas"
                value={subject.activityLevel.toFixed(2)}
              />
            </dl>
          </div>
        </section>

        {/* Latest metrics from growth log */}
        {latest && (
          <>
            <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
              <MetricCard
                icon={<Ruler className="h-4 w-4" />}
                label="Tinggi Terakhir"
                value={`${latest.heightCm}`}
                unit="cm"
                trend={heightTrend}
                trendUnit="cm"
              />
              <MetricCard
                icon={<Activity className="h-4 w-4" />}
                label="Berat Terakhir"
                value={`${latest.weightKg}`}
                unit="kg"
                trend={weightTrend}
                trendUnit="kg"
              />
              <MetricCard
                icon={<Activity className="h-4 w-4" />}
                label="BMI"
                value={latest.bmi == null ? "—" : latest.bmi.toFixed(1)}
                unit=""
                badge={(() => {
                  const c = classifyBmi(latest.bmi, subject.ageYears);
                  if (c.category === "unknown") return null;
                  return (
                    <span
                      title={c.description}
                      className={`mt-2 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${BMI_TONE_STYLE[c.tone]}`}
                    >
                      {c.label}
                      {c.approximate && <span className="opacity-60">~</span>}
                    </span>
                  );
                })()}
              />
            </section>
          </>
        )}

        {/* Growth log section */}
        <section className="mt-6">
          <header className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Riwayat Pengukuran
              </h3>
              <p className="text-xs text-slate-500">
                {loadingLogs
                  ? "Memuat..."
                  : `${growthLogs.length} catatan tersimpan`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddGrowth(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark"
            >
              <Plus className="h-3.5 w-3.5" />
              Catat Pengukuran
            </button>
          </header>

          {logsError && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div className="flex-1">{logsError}</div>
              <button
                type="button"
                onClick={fetchLogs}
                className="rounded-md border border-red-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-red-700 hover:bg-red-100"
              >
                Coba lagi
              </button>
            </div>
          )}

          {loadingLogs ? (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-xs text-slate-500">
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Memuat riwayat pengukuran...
            </div>
          ) : recent.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <p className="text-sm font-semibold text-slate-900">
                Belum ada riwayat pengukuran
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Catat pengukuran pertama untuk mulai memantau pertumbuhan.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Tanggal</th>
                    <th className="px-3 py-2 text-right">TB (cm)</th>
                    <th className="px-3 py-2 text-right">BB (kg)</th>
                    <th className="px-3 py-2 text-right">BMI</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {recent.map((g) => {
                    const c = classifyBmi(g.bmi, subject.ageYears);
                    return (
                      <tr
                        key={g.id}
                        className="transition hover:bg-brand-soft/40"
                      >
                        <td className="px-3 py-2 text-slate-700">
                          {formatDateShortID(g.recordedAt)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-slate-900">
                          {g.heightCm}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-slate-900">
                          {g.weightKg}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-brand-primary">
                          {g.bmi == null ? "—" : g.bmi.toFixed(1)}
                        </td>
                        <td className="px-3 py-2">
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {growthLogs.length > 0 && (
            <Link
              href={`/subjects/${subject.id}/growth`}
              onClick={onClose}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary transition hover:text-brand-primary-dark hover:underline"
            >
              Lihat Riwayat Lengkap & Chart
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </section>

        {isChild && (
          <p className="mt-5 inline-flex items-start gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-xs text-blue-700 ring-1 ring-blue-100">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Untuk balita/anak, status stunting dihitung dari{" "}
              <strong>WHO Growth Standards</strong> (HAZ). Z-score &lt; -2 =
              stunted, &lt; -3 = severely stunted. Modul kalkulator HAZ akan
              diaktifkan setelah tabel referensi WHO diunggah.
            </span>
          </p>
        )}
      </Modal>

      <AddGrowthLogModal
        open={showAddGrowth}
        subjectId={subjectId}
        subjectName={subject.name}
        onClose={() => setShowAddGrowth(false)}
        onSaved={handleNewLog}
      />
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900">{value}</dd>
    </>
  );
}

function MetricCard({
  icon,
  label,
  value,
  unit,
  trend,
  trendUnit,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  trend?: number | null;
  trendUnit?: string;
  badge?: React.ReactNode;
}) {
  const trendUp = trend != null && trend > 0;
  const trendDown = trend != null && trend < 0;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        <span className="text-brand-primary">{icon}</span>
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="text-xl font-bold tabular-nums text-slate-900">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-medium text-slate-400">{unit}</span>
        )}
      </div>
      {trend != null && (
        <p
          className={`mt-1 text-[11px] font-medium tabular-nums ${
            trendUp
              ? "text-emerald-600"
              : trendDown
                ? "text-red-600"
                : "text-slate-400"
          }`}
        >
          {trendUp ? "▲" : trendDown ? "▼" : "-"} {Math.abs(trend).toFixed(1)}{" "}
          {trendUnit} sejak sebelumnya
        </p>
      )}
      {badge}
    </div>
  );
}
