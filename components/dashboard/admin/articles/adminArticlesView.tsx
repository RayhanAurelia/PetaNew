"use client";

import { Button, ButtonGroup } from "flowbite-react";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  FileText,
  Pencil,
  Plus,
  ScanEye,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/pageHeader";
import {
  STAGE_LABEL,
  STAGE_STYLE,
} from "@/components/dashboard/articles/articleTypes";
import { ArticleEditorModal } from "./articleEditorModal";
import { ArticlePreviewModal } from "./articlePreviewModal";
import {
  type ApiResponse,
  type ArticleAdminDTO,
  type ListAdminArticlesResult,
  type StatusFilter,
  STATUS_FILTERS,
  formatDateID,
} from "./adminArticleTypes";

export function AdminArticlesView() {
  const [items, setItems] = useState<ArticleAdminDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<ArticleAdminDTO | null>(null);
  const [previewing, setPreviewing] = useState<ArticleAdminDTO | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ArticleAdminDTO | null>(
    null,
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  // Debounce kotak pencarian.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ status, pageSize: "50" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/admin/articles?${params.toString()}`, {
        cache: "no-store",
      });
      const json: ApiResponse<ListAdminArticlesResult> = await res.json();
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
  }, [status, debouncedSearch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function upsertItem(saved: ArticleAdminDTO) {
    setItems((prev) => {
      const exists = prev.some((a) => a.id === saved.id);
      return exists
        ? prev.map((a) => (a.id === saved.id ? saved : a))
        : [saved, ...prev];
    });
  }

  async function togglePublish(article: ArticleAdminDTO) {
    setBusyId(article.id);
    setRowError(null);
    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !article.isPublished }),
      });
      const json: ApiResponse<ArticleAdminDTO> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      upsertItem(json.data);
    } catch (e) {
      setRowError(
        e instanceof Error ? e.message : "Gagal mengubah status publikasi",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(article: ArticleAdminDTO) {
    setBusyId(article.id);
    setRowError(null);
    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: "DELETE",
      });
      const json: ApiResponse<unknown> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setItems((prev) => prev.filter((a) => a.id !== article.id));
      setTotal((t) => Math.max(0, t - 1));
      setConfirmDelete(null);
    } catch (e) {
      setRowError(e instanceof Error ? e.message : "Gagal menghapus artikel");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Kelola Artikel"
        title="Editor & Publikasi"
        description="Buat, sunting, dan terbitkan artikel edukasi gizi"
        actions={
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Tulis Artikel
          </button>
        }
      />

      {/* Toolbar: filter status + search */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <ButtonGroup className="shadow-sm">
          {STATUS_FILTERS.map((f) => {
            const active = status === f.value;
            return (
              <Button
                key={f.value}
                size="sm"
                color={active ? "blue" : "light"}
                onClick={() => setStatus(f.value)}
                className={
                  active
                    ? "border-brand-primary bg-brand-primary font-medium text-white hover:bg-brand-primary-dark focus:ring-2 focus:ring-brand-primary/30"
                    : "border-slate-200 bg-white font-medium text-slate-600 hover:bg-brand-soft hover:text-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                }
              >
                {f.label}
              </Button>
            );
          })}
        </ButtonGroup>
        <div className="relative sm:ml-auto sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul artikel..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/15"
          />
        </div>
      </div>

      {rowError && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="flex-1">{rowError}</p>
          <button
            type="button"
            onClick={() => setRowError(null)}
            className="text-xs font-semibold underline"
          >
            Tutup
          </button>
        </div>
      )}

      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
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
      ) : loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand-primary">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">
            {debouncedSearch || status !== "all"
              ? "Tidak ada artikel cocok"
              : "Belum ada artikel"}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            {debouncedSearch || status !== "all"
              ? "Coba ubah filter atau kata kunci pencarian."
              : "Mulai tulis artikel edukasi pertama untuk pengguna PETA."}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-slate-500">{total} artikel</p>
          <ul className="space-y-3">
            {items.map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-primary/20 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge published={a.isPublished} />
                    {a.targetLifeStage && (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${STAGE_STYLE[a.targetLifeStage]}`}
                      >
                        {STAGE_LABEL[a.targetLifeStage]}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 truncate font-semibold text-slate-900">
                    {a.title}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    <span className="truncate font-mono">/{a.slug}</span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {a.viewCount.toLocaleString("id-ID")}
                    </span>
                    <span>
                      {a.isPublished
                        ? `Terbit ${formatDateID(a.publishedAt)}`
                        : `Dibuat ${formatDateID(a.createdAt)}`}
                    </span>
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewing(a)}
                    title="Pratinjau"
                    className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary"
                  >
                    <ScanEye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePublish(a)}
                    disabled={busyId === a.id}
                    title={a.isPublished ? "Jadikan draft" : "Terbitkan"}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary disabled:opacity-50"
                  >
                    {a.isPublished ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                    <span className="hidden lg:inline">
                      {a.isPublished ? "Draft" : "Terbit"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(a)}
                    title="Edit"
                    className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(a)}
                    title="Hapus"
                    className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Create */}
      <ArticleEditorModal
        open={showCreate}
        mode="create"
        onClose={() => setShowCreate(false)}
        onSaved={upsertItem}
      />

      {/* Edit */}
      <ArticleEditorModal
        open={editing !== null}
        mode="edit"
        article={editing}
        onClose={() => setEditing(null)}
        onSaved={upsertItem}
      />

      {/* Pratinjau */}
      <ArticlePreviewModal
        open={previewing !== null}
        article={previewing}
        onClose={() => setPreviewing(null)}
      />

      {/* Konfirmasi hapus */}
      {confirmDelete && (
        <DeleteConfirm
          article={confirmDelete}
          busy={busyId === confirmDelete.id}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete)}
        />
      )}
    </div>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  return published ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
      Terbit
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200">
      Draft
    </span>
  );
}

function DeleteConfirm({
  article,
  busy,
  onCancel,
  onConfirm,
}: {
  article: ArticleAdminDTO;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onCancel}
        className="fixed inset-0 cursor-default bg-slate-900/50 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600">
          <Trash2 className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-center text-base font-semibold text-slate-900">
          Hapus artikel ini?
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-center text-sm text-slate-500">
          “{article.title}” akan dihapus permanen. Tindakan ini tidak dapat
          dibatalkan.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {busy ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
