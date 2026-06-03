"use client";

import { AlertTriangle, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import {
  STAGE_LABEL,
  STAGE_ORDER,
} from "@/components/dashboard/articles/articleTypes";
import type { LifeStage } from "@/components/dashboard/subjects/subjectTypes";
import {
  type ApiResponse,
  type ArticleAdminDTO,
} from "./adminArticleTypes";

type Mode = "create" | "edit";

interface ArticleEditorModalProps {
  open: boolean;
  mode: Mode;
  article?: ArticleAdminDTO | null;
  onClose: () => void;
  onSaved: (article: ArticleAdminDTO) => void;
}

export function ArticleEditorModal({
  open,
  mode,
  article,
  onClose,
  onSaved,
}: ArticleEditorModalProps) {
  const isEdit = mode === "edit";

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [targetLifeStage, setTargetLifeStage] = useState<LifeStage | "">("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!open) return;
    if (isEdit && article) {
      setTitle(article.title);
      setSlug(article.slug);
      setTargetLifeStage(article.targetLifeStage ?? "");
      setCoverImageUrl(article.coverImageUrl ?? "");
      setExcerpt(article.excerpt ?? "");
      setContent(article.content);
      setIsPublished(article.isPublished);
    } else {
      setTitle("");
      setSlug("");
      setTargetLifeStage("");
      setCoverImageUrl("");
      setExcerpt("");
      setContent("");
      setIsPublished(false);
    }
    setServerError(null);
    setFieldErrors({});
    setSubmitting(false);
  }, [open, isEdit, article]);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setFieldErrors({});

    // Payload: kirim hanya field yang relevan; slug kosong → biarkan server
    // auto-generate dari judul (khusus create).
    const payload: Record<string, unknown> = {
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || null,
      coverImageUrl: coverImageUrl.trim() || null,
      targetLifeStage: targetLifeStage || null,
      isPublished,
    };
    if (slug.trim()) payload.slug = slug.trim();

    try {
      const url = isEdit ? `/api/admin/articles/${article!.id}` : "/api/admin/articles";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json: ApiResponse<ArticleAdminDTO> = await res.json();
      if (!json.success) {
        if (json.error.details) setFieldErrors(json.error.details);
        throw new Error(json.error.message);
      }
      onSaved(json.data);
      onClose();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Gagal menyimpan artikel");
    } finally {
      setSubmitting(false);
    }
  }

  const err = (field: string) => fieldErrors[field]?.[0];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? "Edit Artikel" : "Tulis Artikel Baru"}
      description={
        isEdit
          ? "Perbarui konten, status publikasi, atau metadata artikel."
          : "Slug akan dibuat otomatis dari judul bila dikosongkan."
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            type="submit"
            form="article-editor-form"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan"}
          </button>
        </>
      }
    >
      <form id="article-editor-form" onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{serverError}</p>
          </div>
        )}

        <Field label="Judul" error={err("title")} required>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Pentingnya ASI Eksklusif untuk Balita"
            className={inputClass(err("title"))}
            required
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Slug"
            error={err("slug")}
            hint="URL artikel. Kosongkan untuk auto."
          >
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="asi-eksklusif-balita"
              className={inputClass(err("slug"))}
            />
          </Field>

          <Field label="Tahap Usia Target" error={err("targetLifeStage")}>
            <select
              value={targetLifeStage}
              onChange={(e) =>
                setTargetLifeStage(e.target.value as LifeStage | "")
              }
              className={inputClass(undefined)}
            >
              <option value="">Semua / Umum</option>
              {STAGE_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="URL Gambar Sampul"
          error={err("coverImageUrl")}
          hint="Tautan gambar (opsional)."
        >
          <input
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass(err("coverImageUrl"))}
          />
        </Field>

        <Field label="Ringkasan" error={err("excerpt")}>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Ringkasan singkat yang tampil di kartu artikel..."
            className={inputClass(err("excerpt"))}
          />
        </Field>

        <Field label="Konten" error={err("content")} required>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder="Tulis isi artikel di sini..."
            className={`${inputClass(err("content"))} font-mono text-xs leading-relaxed`}
            required
          />
        </Field>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
          />
          <span className="text-sm">
            <span className="font-semibold text-slate-900">
              Terbitkan artikel
            </span>
            <span className="block text-xs text-slate-500">
              Jika dicentang, artikel langsung tampil untuk pengguna. Hilangkan
              centang untuk menyimpan sebagai draft.
            </span>
          </span>
        </label>
      </form>
    </Modal>
  );
}

function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputClass(error?: string): string {
  return `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-slate-200 focus:border-brand-primary/40 focus:ring-brand-primary/15"
  }`;
}
