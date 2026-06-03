"use client";

import {
  AlertTriangle,
  Apple,
  BadgeCheck,
  Pencil,
  Plus,
  Search,
  ShieldX,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/pageHeader";
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  type FoodCategory,
} from "@/components/dashboard/foods/foodTypes";
import { FoodEditorModal } from "./foodEditorModal";
import {
  type ApiResponse,
  CATEGORY_OPTIONS,
  type FoodAdminDTO,
  formatDateID,
  type ListAdminFoodsResult,
  type VerifiedFilter,
  VERIFIED_FILTERS,
} from "./adminFoodTypes";

export function AdminFoodView() {
  const [items, setItems] = useState<FoodAdminDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<FoodCategory | "">("");
  const [verified, setVerified] = useState<VerifiedFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<FoodAdminDTO | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<FoodAdminDTO | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ verified, pageSize: "50" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (category) params.set("category", category);
      const res = await fetch(`/api/admin/foods?${params.toString()}`, {
        cache: "no-store",
      });
      const json: ApiResponse<ListAdminFoodsResult> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setItems(json.data.items);
      setTotal(json.data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data makanan");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [verified, debouncedSearch, category]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function upsertItem(saved: FoodAdminDTO) {
    setItems((prev) => {
      const exists = prev.some((f) => f.id === saved.id);
      return exists
        ? prev.map((f) => (f.id === saved.id ? saved : f))
        : [saved, ...prev];
    });
  }

  async function toggleVerify(food: FoodAdminDTO) {
    setBusyId(food.id);
    setRowError(null);
    try {
      const res = await fetch(`/api/admin/foods/${food.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !food.isVerified }),
      });
      const json: ApiResponse<FoodAdminDTO> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      upsertItem(json.data);
    } catch (e) {
      setRowError(
        e instanceof Error ? e.message : "Gagal mengubah status verifikasi",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(food: FoodAdminDTO) {
    setBusyId(food.id);
    setRowError(null);
    try {
      const res = await fetch(`/api/admin/foods/${food.id}`, {
        method: "DELETE",
      });
      const json: ApiResponse<unknown> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setItems((prev) => prev.filter((f) => f.id !== food.id));
      setTotal((t) => Math.max(0, t - 1));
      setConfirmDelete(null);
    } catch (e) {
      setRowError(e instanceof Error ? e.message : "Gagal menghapus makanan");
    } finally {
      setBusyId(null);
    }
  }

  const hasFilter = Boolean(debouncedSearch) || category !== "" || verified !== "all";

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Master Makanan"
        title="Basis Data Makanan"
        description="Kelola dan verifikasi data gizi makanan (per 100 g) yang menjadi rujukan platform."
        actions={
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Tambah Makanan
          </button>
        }
      />

      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2">
          {VERIFIED_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setVerified(f.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                verified === f.value
                  ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/20"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row lg:justify-end">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as FoodCategory | "")}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/15 sm:w-48"
          >
            <option value="">Semua kategori</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama makanan..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/15"
            />
          </div>
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
            <p className="font-semibold">Gagal memuat data makanan</p>
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
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand-primary">
            <Apple className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">
            {hasFilter ? "Tidak ada makanan cocok" : "Belum ada makanan"}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            {hasFilter
              ? "Coba ubah filter atau kata kunci pencarian."
              : "Mulai bangun basis data dengan menambahkan makanan pertama."}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-slate-500">{total} makanan</p>

          {/* Header tabel (desktop) */}
          <div className="hidden grid-cols-[1fr_repeat(4,4.5rem)_8rem] gap-3 px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 lg:grid">
            <span>Makanan</span>
            <span className="text-right">Kkal</span>
            <span className="text-right">Prot</span>
            <span className="text-right">Karb</span>
            <span className="text-right">Lemak</span>
            <span className="text-right">Aksi</span>
          </div>

          <ul className="space-y-2.5">
            {items.map((f) => (
              <li
                key={f.id}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-primary/20 lg:grid-cols-[1fr_repeat(4,4.5rem)_8rem] lg:items-center"
              >
                {/* Identitas */}
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-soft text-brand-primary">
                    {f.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={f.imageUrl}
                        alt={f.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Apple className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-semibold text-slate-900">
                        {f.name}
                      </p>
                      {f.isVerified && (
                        <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ring-1 ${CATEGORY_COLOR[f.category]}`}
                      >
                        {CATEGORY_LABEL[f.category]}
                      </span>
                      {f.brand && <span className="truncate">{f.brand}</span>}
                      <span className="text-slate-400">
                        · {formatDateID(f.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Makro (desktop) */}
                <Macro value={f.caloriesPer100g} />
                <Macro value={f.proteinPer100g} suffix="g" />
                <Macro value={f.carbsPer100g} suffix="g" />
                <Macro value={f.fatPer100g} suffix="g" />

                {/* Aksi */}
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleVerify(f)}
                    disabled={busyId === f.id}
                    title={f.isVerified ? "Batalkan verifikasi" : "Verifikasi"}
                    className={`rounded-lg border p-2 transition disabled:opacity-50 ${
                      f.isVerified
                        ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        : "border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
                    }`}
                  >
                    {f.isVerified ? (
                      <ShieldX className="h-3.5 w-3.5" />
                    ) : (
                      <BadgeCheck className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(f)}
                    title="Edit"
                    className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(f)}
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

      <FoodEditorModal
        open={showCreate}
        mode="create"
        onClose={() => setShowCreate(false)}
        onSaved={upsertItem}
      />
      <FoodEditorModal
        open={editing !== null}
        mode="edit"
        food={editing}
        onClose={() => setEditing(null)}
        onSaved={upsertItem}
      />

      {confirmDelete && (
        <DeleteConfirm
          food={confirmDelete}
          busy={busyId === confirmDelete.id}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete)}
        />
      )}
    </div>
  );
}

function Macro({ value, suffix }: { value: number; suffix?: string }) {
  return (
    <span className="text-right text-sm tabular-nums text-slate-700">
      <span className="text-[10px] uppercase text-slate-400 lg:hidden">
        {suffix ? "" : "Kkal "}
      </span>
      {value.toLocaleString("id-ID", { maximumFractionDigits: 1 })}
      {suffix ? ` ${suffix}` : ""}
    </span>
  );
}

function DeleteConfirm({
  food,
  busy,
  onCancel,
  onConfirm,
}: {
  food: FoodAdminDTO;
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
          Hapus makanan ini?
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-center text-sm text-slate-500">
          “{food.name}” akan dihapus dari basis data. Catatan gizi lama yang
          merujuk makanan ini tidak akan terhapus.
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
