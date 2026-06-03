"use client";

import {
  AlertTriangle,
  BookOpen,
  Clock,
  Eye,
  Loader,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/pageHeader";
import type { LifeStage } from "@/components/dashboard/subjects/subjectTypes";
import {
  formatPublishedAt,
  STAGE_LABEL,
  STAGE_ORDER,
  STAGE_STYLE,
  type ArticleListItemDTO,
  type ListArticlesResult,
} from "./articleTypes";

interface ApiOk<T> {
  success: true;
  data: T;
}
interface ApiErr {
  success: false;
  error: { code: string; message: string };
}
type ApiResponse<T> = ApiOk<T> | ApiErr;

export function ArticlesView() {
  const [items, setItems] = useState<ArticleListItemDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<LifeStage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ pageSize: "24" });
      if (filter) params.set("lifeStage", filter);
      const res = await fetch(`/api/articles?${params.toString()}`, {
        cache: "no-store",
      });
      const json: ApiResponse<ListArticlesResult> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setItems(json.data.items);
      setTotal(json.data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat artikel");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Artikel Edukasi"
        title="Belajar Gizi & Pencegahan Stunting"
        description="Kumpulan artikel terkurasi oleh tim PETA & konsultan ahli gizi. Filter berdasarkan tahap usia subjek."
      />

      {/* Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip
          label="Semua"
          active={filter === null}
          onClick={() => setFilter(null)}
        />
        {STAGE_ORDER.map((s) => (
          <FilterChip
            key={s}
            label={STAGE_LABEL[s]}
            active={filter === s}
            onClick={() => setFilter(s)}
          />
        ))}
        {!loading && !error && (
          <span className="ml-auto self-center text-xs text-slate-500">
            {total} artikel
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Gagal memuat artikel</p>
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

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand-primary">
            <BookOpen className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">
            {filter ? "Tidak ada artikel" : "Belum ada artikel terbit"}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            {filter
              ? `Belum ada artikel untuk tahap usia ${STAGE_LABEL[filter]}. Coba filter lain atau pilih 'Semua'.`
              : "Tim PETA sedang mengkurasi artikel edukasi gizi. Cek kembali nanti."}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/20"
          : "border border-slate-200 bg-white text-slate-600 hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary"
      }`}
    >
      {label}
    </button>
  );
}

function ArticleCard({ article }: { article: ArticleListItemDTO }) {
  return (
    <Link
      href={`/articles/${encodeURIComponent(article.slug)}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-linear-to-br from-brand-soft via-slate-50 to-brand-primary/10">
        {article.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImageUrl}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-brand-primary/40">
            <BookOpen className="h-12 w-12" />
          </div>
        )}
        {article.targetLifeStage && (
          <span
            className={`absolute left-3 top-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider shadow-sm ring-1 ${STAGE_STYLE[article.targetLifeStage]}`}
          >
            {STAGE_LABEL[article.targetLifeStage]}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-brand-primary">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="line-clamp-2 text-sm text-slate-600">
            {article.excerpt}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {formatPublishedAt(article.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-3 w-3" />
            {article.viewCount.toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-[16/9] w-full animate-pulse bg-slate-200" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-3 w-4/5 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-3/5 animate-pulse rounded bg-slate-100" />
        <div className="mt-1 h-2 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-2 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="h-2 w-20 animate-pulse rounded bg-slate-100" />
          <div className="h-2 w-12 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

// Loader icon dipakai bila view perlu loading inline di tempat lain.
export { Loader as _ArticlesLoader };
