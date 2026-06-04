"use client";

import { BookOpen, Clock, Eye } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import {
  formatPublishedAt,
  STAGE_LABEL,
  STAGE_STYLE,
} from "@/components/dashboard/articles/articleTypes";
import type { ArticleAdminDTO } from "./adminArticleTypes";

interface ArticlePreviewModalProps {
  open: boolean;
  article: ArticleAdminDTO | null;
  onClose: () => void;
}

/**
 * Pratinjau bagaimana sebuah artikel tampil ke pengguna — baik sebagai kartu
 * di daftar artikel maupun sebagai halaman penuh.
 */
export function ArticlePreviewModal({
  open,
  article,
  onClose,
}: ArticlePreviewModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="Pratinjau Artikel"
      description="Beginilah tampilan artikel ini untuk pengguna."
    >
      {article && (
        <div className="space-y-6">
          {!article.isPublished && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              Status: Draft — belum terlihat oleh pengguna. Ini hanya pratinjau.
            </div>
          )}

          {/* Tampilan kartu */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Tampilan kartu
            </p>
            <div className="max-w-sm">
              <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="relative aspect-video w-full overflow-hidden bg-linear-to-br from-brand-soft via-slate-50 to-brand-primary/10">
                  {article.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.coverImageUrl}
                      alt={article.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-brand-primary/40">
                      <BookOpen className="h-10 w-10" />
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
                  <h3 className="line-clamp-2 text-base font-semibold text-slate-900">
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
              </div>
            </div>
          </div>

          {/* Tampilan halaman */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Tampilan halaman
            </p>
            <article className="overflow-hidden rounded-2xl border border-slate-200">
              {article.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.coverImageUrl}
                  alt={article.title}
                  className="aspect-video w-full object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {article.targetLifeStage && (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${STAGE_STYLE[article.targetLifeStage]}`}
                    >
                      {STAGE_LABEL[article.targetLifeStage]}
                    </span>
                  )}
                  <span>{formatPublishedAt(article.publishedAt)}</span>
                  {article.authorName && <span>· {article.authorName}</span>}
                </div>
                <h1 className="mt-3 text-2xl font-bold text-slate-900">
                  {article.title}
                </h1>
                {article.excerpt && (
                  <p className="mt-2 text-base text-slate-600">
                    {article.excerpt}
                  </p>
                )}
                <div className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {article.content}
                </div>
              </div>
            </article>
          </div>
        </div>
      )}
    </Modal>
  );
}
