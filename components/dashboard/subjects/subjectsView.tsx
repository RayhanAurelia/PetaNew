"use client";

import {
  AlertTriangle,
  Baby,
  Calendar,
  ChevronRight,
  Heart,
  Loader,
  Plus,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/pageHeader";
import {
  BMI_TONE_STYLE,
  classifyBmi,
} from "@/components/dashboard/growth/bmiClassification";
import { formatDateShortID } from "@/components/dashboard/growth/growthTypes";
import { AddOrEditSubjectModal } from "./addOrEditSubjectModal";
import { SubjectDetailModal } from "./subjectDetailModal";
import {
  formatAge,
  LIFE_STAGE_LABEL,
  RELATIONSHIP_GRADIENT,
  RELATIONSHIP_LABEL,
  type SubjectDTO,
} from "./subjectTypes";

interface ApiOk<T> {
  success: true;
  data: T;
}
interface ApiErr {
  success: false;
  error: { code: string; message: string; details?: Record<string, string[]> };
}
type ApiResponse<T> = ApiOk<T> | ApiErr;

export function SubjectsView() {
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeSubject, setActiveSubject] = useState<SubjectDTO | null>(null);
  const [editingSubject, setEditingSubject] = useState<SubjectDTO | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/subjects", { cache: "no-store" });
      const json: ApiResponse<SubjectDTO[]> = await res.json();
      if (!json.success) {
        throw new Error(json.error.message);
      }
      setSubjects(json.data);
    } catch (e) {
      setLoadError(
        e instanceof Error ? e.message : "Gagal memuat daftar subjek",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const hasPrimarySelf = subjects.some(
    (s) => s.isPrimary && s.relationship === "self",
  );

  function handleCreated(s: SubjectDTO) {
    setSubjects((prev) => [s, ...prev]);
  }

  function handleUpdated(s: SubjectDTO) {
    setSubjects((prev) => prev.map((x) => (x.id === s.id ? s : x)));
    if (activeSubject?.id === s.id) setActiveSubject(s);
  }

  async function handleDelete(id: string): Promise<void> {
    const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
    const json: ApiResponse<unknown> = await res.json();
    if (!json.success) {
      throw new Error(json.error.message);
    }
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setActiveSubject(null);
  }

  function startEdit(s: SubjectDTO) {
    setActiveSubject(null);
    setEditingSubject(s);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Subjek"
        title="Anggota yang Dilacak"
        description="Kelola data anak, diri sendiri, atau anggota keluarga yang ingin dipantau status gizinya"
        actions={
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Tambah Subjek
          </button>
        }
      />

      {loadError && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Gagal memuat data</p>
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

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : subjects.length === 0 && !loadError ? (
        <EmptyState onAdd={() => setShowAdd(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((s) => (
            <SubjectCard
              key={s.id}
              subject={s}
              onClick={() => setActiveSubject(s)}
            />
          ))}
          <AddSubjectCard onClick={() => setShowAdd(true)} />
        </div>
      )}

      <SubjectDetailModal
        open={activeSubject !== null}
        onClose={() => setActiveSubject(null)}
        subject={activeSubject}
        onEdit={startEdit}
        onDelete={handleDelete}
        onGrowthChanged={refresh}
      />

      <AddOrEditSubjectModal
        open={showAdd}
        mode="create"
        onClose={() => setShowAdd(false)}
        onSaved={handleCreated}
        hasPrimarySelf={hasPrimarySelf}
      />

      <AddOrEditSubjectModal
        open={editingSubject !== null}
        mode="edit"
        subject={editingSubject}
        onClose={() => setEditingSubject(null)}
        onSaved={handleUpdated}
        hasPrimarySelf={hasPrimarySelf}
      />
    </div>
  );
}

function SubjectCard({
  subject,
  onClick,
}: {
  subject: SubjectDTO;
  onClick: () => void;
}) {
  const isChild =
    subject.lifeStage === "balita" || subject.lifeStage === "anak";
  const latest = subject.latestGrowth;
  const bmiClass = latest ? classifyBmi(latest.bmi, subject.ageYears) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-linear-to-br text-white shadow-sm transition group-hover:scale-105 ${RELATIONSHIP_GRADIENT[subject.relationship]}`}
          >
            {isChild ? (
              <Baby className="h-6 w-6" />
            ) : (
              <Users className="h-6 w-6" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold text-slate-900">
                {subject.name}
              </p>
              {subject.isPrimary && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-primary ring-1 ring-brand-primary/20">
                  <Heart className="h-2.5 w-2.5" /> Self
                </span>
              )}
            </div>
            <p className="truncate text-xs text-slate-500">
              {RELATIONSHIP_LABEL[subject.relationship]}
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:text-brand-primary" />
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
          {LIFE_STAGE_LABEL[subject.lifeStage]}
        </span>
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatAge(subject.ageYears, subject.ageMonths)}
        </span>
      </div>

      {latest ? (
        <>
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3">
            <Metric label="Tinggi" value={`${latest.heightCm} cm`} />
            <Metric label="Berat" value={`${latest.weightKg} kg`} />
            <Metric
              label="BMI"
              value={latest.bmi == null ? "—" : latest.bmi.toFixed(1)}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            {bmiClass && bmiClass.category !== "unknown" ? (
              <span
                title={bmiClass.description}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ${BMI_TONE_STYLE[bmiClass.tone]}`}
              >
                {bmiClass.label}
                {bmiClass.approximate && (
                  <span className="opacity-60">~</span>
                )}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                Status belum tersedia
              </span>
            )}
            <span className="text-[11px] tabular-nums text-slate-400">
              {formatDateShortID(latest.recordedAt)}
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3">
            <Metric
              label="Aktivitas"
              value={subject.activityLevel.toFixed(2)}
            />
            <Metric label="Status" value="Belum diukur" small />
          </div>

          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-center text-[11px] text-slate-400">
            Klik untuk catat pengukuran pertama
          </div>
        </>
      )}
    </button>
  );
}

function Metric({
  label,
  value,
  small = false,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p
        className={`mt-0.5 font-semibold tabular-nums text-slate-900 ${small ? "text-xs" : "text-sm"}`}
      >
        {value}
      </p>
    </div>
  );
}

function AddSubjectCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-5 text-center transition hover:border-brand-primary/40 hover:bg-brand-soft/40"
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand-primary transition group-hover:scale-110">
        <Plus className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">
          Tambah Subjek Baru
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Lacak anak, pasangan, atau anggota lain
        </p>
      </div>
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
      <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
      <div className="h-10 animate-pulse rounded-xl bg-slate-50" />
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand-primary">
        <Users className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">
        Belum ada subjek
      </h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        Mulai dengan menambahkan diri sendiri atau anak yang ingin dipantau
        status gizinya.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark"
      >
        <Plus className="h-4 w-4" />
        Tambah Subjek Pertama
      </button>
    </div>
  );
}

/* Optional spinner alias (re-export Loader for caller convenience if needed). */
export { Loader as _LoaderIcon };
