import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";

type Align = "left" | "right" | "center";

export interface TableHeader {
  label: string;
  align?: Align;
  className?: string;
}

const ALIGN_CLASS: Record<Align, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

/**
 * Pembungkus tabel admin khusus desktop (mobile memakai fallback kartu).
 * Merender header berstandar + slot `<tbody>` lewat children.
 */
export function AdminTableShell({
  headers,
  children,
}: {
  headers: TableHeader[];
  children: React.ReactNode;
}) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              {headers.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`px-4 py-3 font-semibold ${ALIGN_CLASS[h.align ?? "left"]} ${h.className ?? ""}`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

type Tone = "emerald" | "slate" | "red" | "amber";

const TONE_CLASS: Record<Tone, string> = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  slate: "bg-slate-100 text-slate-500 ring-slate-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
};

/** Pill status seragam (Aktif/Nonaktif, Terverifikasi/Belum, Terbit/Draft). */
export function StatusPill({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  );
}

/** Kontrol pagination prev/next + indikator halaman. Null bila hanya 1 halaman. */
export function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
  loading,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  loading?: boolean;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        type="button"
        disabled={page <= 1 || loading}
        onClick={onPrev}
        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-brand-primary/30 hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
        Sebelumnya
      </button>
      <span className="text-sm text-slate-500">
        Hal {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages || loading}
        onClick={onNext}
        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-brand-primary/30 hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        Berikutnya
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Cincin progres melingkar untuk KPI (menunjukkan rasio, mis. % aktif). */
function ProgressRing({ percent, accent }: { percent: number; accent: string }) {
  const size = 46;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = c - (clamped / 100) * c;
  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-slate-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-slate-600">
        {clamped}%
      </span>
    </div>
  );
}

/**
 * Kartu KPI ala dashboard SaaS: ikon gradien, angka besar, label, caption,
 * dan cincin progres rasio (opsional). Bisa diklik bila `href` diisi.
 */
export function KpiCard({
  icon: Icon,
  label,
  value,
  caption,
  percent,
  gradient,
  accent,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  caption: string;
  /** Rasio 0-100; bila kosong, cincin tidak ditampilkan. */
  percent?: number;
  /** Kelas gradien ikon (mis. "from-amber-500 to-orange-600"). */
  gradient: string;
  /** Warna cincin progres (hex). */
  accent: string;
  href?: string;
}) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-linear-to-br text-white shadow-sm transition group-hover:scale-105 ${gradient}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        {percent !== undefined && (
          <ProgressRing percent={percent} accent={accent} />
        )}
      </div>
      <p className="mt-4 text-3xl font-bold tabular-nums text-slate-900">
        {value}
      </p>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-0.5 text-xs text-slate-400">{caption}</p>
    </>
  );

  const className =
    "group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5";

  return href ? (
    <Link href={href} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}
