"use client";

import {
  AlertTriangle,
  Baby,
  Calendar,
  ChevronRight,
  Heart,
  LineChart,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/pageHeader";
import {
  formatAge,
  LIFE_STAGE_LABEL,
  RELATIONSHIP_LABEL,
  type SubjectDTO,
} from "@/components/dashboard/subjects/subjectTypes";
import { formatDateShortID } from "./growthTypes";
import { GrowthHistoryView } from "./growthHistoryView";

interface ApiOk<T> {
  success: true;
  data: T;
}
interface ApiErr {
  success: false;
  error: { code: string; message: string };
}
type ApiResponse<T> = ApiOk<T> | ApiErr;

/**
 * Halaman "Riwayat Pengukuran" tingkat atas: user memilih salah satu subjek,
 * lalu riwayat pengukuran subjek tersebut ditampilkan inline.
 */
export function MeasurementHistoryView() {
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SubjectDTO | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/subjects", { cache: "no-store" });
      const json: ApiResponse<SubjectDTO[]> = await res.json();
      if (!json.success) throw new Error(json.error.message);
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

  // Saat sebuah subjek dipilih, render view riwayat-nya dengan tombol "kembali"
  // yang mengembalikan ke pemilih subjek.
  if (selected) {
    return (
      <GrowthHistoryView
        subject={selected}
        backLabel="Kembali ke Pilih Subjek"
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Riwayat Pengukuran"
        title="Pilih Subjek"
        description="Pilih anggota yang ingin Anda lihat riwayat pengukuran tinggi, berat, dan BMI-nya"
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
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((s) => (
            <SubjectPickCard
              key={s.id}
              subject={s}
              onClick={() => setSelected(s)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubjectPickCard({
  subject,
  onClick,
}: {
  subject: SubjectDTO;
  onClick: () => void;
}) {
  const isChild =
    subject.lifeStage === "balita" || subject.lifeStage === "anak";
  const latest = subject.latestGrowth;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-primary">
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
        <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5 font-medium text-brand-primary">
            <LineChart className="h-3.5 w-3.5" />
            Lihat riwayat
          </span>
          <span className="tabular-nums text-slate-400">
            Terakhir: {formatDateShortID(latest.recordedAt)}
          </span>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-center text-[11px] text-slate-400">
          Belum ada pengukuran — klik untuk mulai mencatat
        </div>
      )}
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
      <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand-primary">
        <Users className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">
        Belum ada subjek
      </h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        Tambahkan subjek terlebih dahulu untuk mulai mencatat dan melihat
        riwayat pengukurannya.
      </p>
      <Link
        href="/subjects"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark"
      >
        <Plus className="h-4 w-4" />
        Kelola Subjek
      </Link>
    </div>
  );
}
