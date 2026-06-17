"use client";

import { Button, ButtonGroup, Dropdown, DropdownItem } from "flowbite-react";
import {
  AlertTriangle,
  Apple,
  BadgeCheck,
  BadgeX,
  Check,
  ChevronDown,
  Pencil,
  Plus,
  Search,
  ShieldX,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/pageHeader";
import {
  AdminTableShell,
  Pagination,
  StatusPill,
} from "@/components/dashboard/admin/adminTable";
import { PageSizeSelect } from "@/components/dashboard/admin/pageSizeSelect";
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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

  // Reset ke halaman 1 saat filter/pencarian berubah.
  useEffect(() => {
    setPage(1);
  }, [verified, debouncedSearch, category]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        verified,
        page: String(page),
        pageSize: String(pageSize),
      });
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
  }, [verified, debouncedSearch, category, page, pageSize]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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

  const hasFilter =
    Boolean(debouncedSearch) || category !== "" || verified !== "all";

  const currentCategoryLabel = category
    ? (CATEGORY_OPTIONS.find((c) => c.value === category)?.label ??
      "Semua kategori")
    : "Semua kategori";

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Master Makanan"
        title="Basis Data Makanan"
        description="Kelola dan verifikasi data gizi makanan (per 100 g) yang menjadi rujukan platform"
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
        <ButtonGroup className="shadow-sm">
          {VERIFIED_FILTERS.map((f) => {
            const active = verified === f.value;
            return (
              <Button
                key={f.value}
                size="sm"
                color={active ? "blue" : "light"}
                onClick={() => setVerified(f.value)}
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
        <div className="flex flex-1 flex-col gap-2 sm:flex-row lg:justify-end">
          <Dropdown
            arrowIcon={false}
            dismissOnClick
            className="z-30 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/5"
            renderTrigger={() => (
              <button
                type="button"
                className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/15 sm:w-48"
              >
                <span className="truncate">{currentCategoryLabel}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
              </button>
            )}
          >
            <CategoryItem
              label="Semua kategori"
              active={category === ""}
              onClick={() => setCategory("")}
            />
            {CATEGORY_OPTIONS.map((c) => (
              <CategoryItem
                key={c.value}
                label={c.label}
                active={category === c.value}
                onClick={() => setCategory(c.value as FoodCategory)}
              />
            ))}
          </Dropdown>
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
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">{total} makanan</p>
            <PageSizeSelect
              value={pageSize}
              onChange={(n) => {
                setPageSize(n);
                setPage(1);
              }}
            />
          </div>

          {/* Desktop: tabel */}
          <AdminTableShell
            headers={[
              { label: "Makanan" },
              { label: "Kategori" },
              { label: "Kkal", align: "right" },
              { label: "Prot", align: "right" },
              { label: "Karb", align: "right" },
              { label: "Lemak", align: "right" },
              { label: "Status" },
              { label: "Aksi", align: "right" },
            ]}
          >
            {items.map((f) => (
              <tr key={f.id} className="transition hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {f.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {f.brand ? `${f.brand} · ` : ""}
                        {formatDateID(f.createdAt)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${CATEGORY_COLOR[f.category]}`}
                  >
                    {CATEGORY_LABEL[f.category]}
                  </span>
                </td>
                <Macro value={f.caloriesPer100g} />
                <Macro value={f.proteinPer100g} suffix="g" />
                <Macro value={f.carbsPer100g} suffix="g" />
                <Macro value={f.fatPer100g} suffix="g" />
                <td className="px-4 py-3">
                  <StatusPill tone={f.isVerified ? "emerald" : "red"}>
                    {f.isVerified ? "Terverifikasi" : "Belum"}
                  </StatusPill>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <FoodActions
                      food={f}
                      busy={busyId === f.id}
                      onToggleVerify={() => toggleVerify(f)}
                      onEdit={() => setEditing(f)}
                      onDelete={() => setConfirmDelete(f)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </AdminTableShell>

          {/* Mobile: kartu */}
          <ul className="space-y-2.5 lg:hidden">
            {items.map((f) => (
              <li
                key={f.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FoodThumb food={f} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-semibold text-slate-900">
                        {f.name}
                      </p>
                      {f.isVerified ? (
                        <BadgeCheck
                          className="h-4 w-4 shrink-0 text-emerald-500"
                          aria-label="Terverifikasi"
                        />
                      ) : (
                        <BadgeX
                          className="h-4 w-4 shrink-0 text-red-500"
                          aria-label="Belum diverifikasi"
                        />
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ring-1 ${CATEGORY_COLOR[f.category]}`}
                      >
                        {CATEGORY_LABEL[f.category]}
                      </span>
                      {f.brand && <span className="truncate">{f.brand}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>Kkal {f.caloriesPer100g.toLocaleString("id-ID")}</span>
                  <span>Prot {f.proteinPer100g}g</span>
                  <span>Karb {f.carbsPer100g}g</span>
                  <span>Lemak {f.fatPer100g}g</span>
                </div>

                <div className="flex items-center justify-end gap-1.5">
                  <FoodActions
                    food={f}
                    busy={busyId === f.id}
                    onToggleVerify={() => toggleVerify(f)}
                    onEdit={() => setEditing(f)}
                    onDelete={() => setConfirmDelete(f)}
                  />
                </div>
              </li>
            ))}
          </ul>

          <Pagination
            page={page}
            totalPages={totalPages}
            loading={loading}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
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

function CategoryItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <DropdownItem
      onClick={onClick}
      className={`flex items-center justify-between gap-2 rounded-lg text-sm ${
        active
          ? "bg-brand-soft font-semibold text-brand-primary"
          : "text-slate-600 hover:bg-brand-soft hover:text-brand-primary"
      }`}
    >
      <span className="truncate">{label}</span>
      {active && <Check className="h-4 w-4 shrink-0" />}
    </DropdownItem>
  );
}

function FoodThumb({ food }: { food: FoodAdminDTO }) {
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-soft text-brand-primary">
      {food.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={food.imageUrl}
          alt={food.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <Apple className="h-5 w-5" />
      )}
    </div>
  );
}

function FoodActions({
  food,
  busy,
  onToggleVerify,
  onEdit,
  onDelete,
}: {
  food: FoodAdminDTO;
  busy: boolean;
  onToggleVerify: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onToggleVerify}
        disabled={busy}
        title={food.isVerified ? "Batalkan verifikasi" : "Verifikasi"}
        className={`rounded-lg border p-2 transition disabled:opacity-50 ${
          food.isVerified
            ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            : "border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
        }`}
      >
        {food.isVerified ? (
          <ShieldX className="h-3.5 w-3.5" />
        ) : (
          <BadgeCheck className="h-3.5 w-3.5" />
        )}
      </button>
      <button
        type="button"
        onClick={onEdit}
        title="Edit"
        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        title="Hapus"
        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </>
  );
}

function Macro({ value, suffix }: { value: number; suffix?: string }) {
  return (
    <td className="px-4 py-3 text-right text-sm tabular-nums text-slate-700">
      {value.toLocaleString("id-ID", { maximumFractionDigits: 1 })}
      {suffix ? ` ${suffix}` : ""}
    </td>
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
