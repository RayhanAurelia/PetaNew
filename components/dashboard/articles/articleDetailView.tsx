"use client";

import { ArrowLeft, BookOpen, Clock, Eye, User } from "lucide-react";
import Link from "next/link";
import {
  formatPublishedAt,
  STAGE_LABEL,
  STAGE_STYLE,
  type ArticleDetailDTO,
} from "./articleTypes";

interface ArticleDetailViewProps {
  article: ArticleDetailDTO;
}

export function ArticleDetailView({ article }: ArticleDetailViewProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/articles"
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke daftar artikel
      </Link>

      {/* Cover */}
      <div className="relative mb-6 aspect-[16/8] w-full overflow-hidden rounded-2xl bg-linear-to-br from-brand-soft via-slate-50 to-brand-primary/10 ring-1 ring-slate-200">
        {article.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-brand-primary/40">
            <BookOpen className="h-16 w-16" />
          </div>
        )}
      </div>

      {/* Header */}
      <header className="mb-6 border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          {article.targetLifeStage && (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${STAGE_STYLE[article.targetLifeStage]}`}
            >
              Untuk {STAGE_LABEL[article.targetLifeStage]}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="mt-3 text-base text-slate-600">{article.excerpt}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          {article.authorName && (
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {article.authorName}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {formatPublishedAt(article.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            {article.viewCount.toLocaleString("id-ID")} pembaca
          </span>
        </div>
      </header>

      {/* Body — render konten markdown sederhana sebagai paragraf.
           Untuk MVP, kita pakai whitespace-pre-wrap supaya struktur paragraf
           dari editor tetap kelihatan tanpa parser markdown tambahan. */}
      <article className="prose-article whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
        {article.content}
      </article>
    </div>
  );
}
