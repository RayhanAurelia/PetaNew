"use client";

import {
  AlertTriangle,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCog,
  UserX,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/pageHeader";
import {
  type ApiResponse,
  type AdminUserDTO,
  formatDateID,
  getInitials,
  type ListAdminUsersResult,
  ROLE_LABEL,
  type StatusFilter,
  STATUS_FILTERS,
  type UserRole,
} from "./adminUserTypes";

interface AdminUsersViewProps {
  currentUserId: string;
}

export function AdminUsersView({ currentUserId }: AdminUsersViewProps) {
  const [items, setItems] = useState<AdminUserDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<AdminUserDTO | null>(null);
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
      const params = new URLSearchParams({ status });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (roleFilter) params.set("role", roleFilter);
      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        cache: "no-store",
      });
      const json: ApiResponse<ListAdminUsersResult> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setItems(json.data.items);
      setTotal(json.data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat pengguna");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [status, debouncedSearch, roleFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function replaceItem(updated: AdminUserDTO) {
    setItems((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  async function patchUser(user: AdminUserDTO, body: Record<string, unknown>) {
    setBusyId(user.id);
    setRowError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json: ApiResponse<AdminUserDTO> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      replaceItem(json.data);
    } catch (e) {
      setRowError(e instanceof Error ? e.message : "Gagal memperbarui pengguna");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(user: AdminUserDTO) {
    setBusyId(user.id);
    setRowError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const json: ApiResponse<unknown> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setItems((prev) => prev.filter((u) => u.id !== user.id));
      setTotal((t) => Math.max(0, t - 1));
      setConfirmDelete(null);
    } catch (e) {
      setRowError(e instanceof Error ? e.message : "Gagal menghapus pengguna");
    } finally {
      setBusyId(null);
    }
  }

  const hasFilter = Boolean(debouncedSearch) || roleFilter !== "" || status !== "all";

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Pengguna"
        title="Kelola Akun"
        description="Atur role, aktifkan/nonaktifkan, atau hapus akun pengguna platform."
      />

      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatus(f.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                status === f.value
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | "")}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/15 sm:w-44"
          >
            <option value="">Semua role</option>
            <option value="user">Pengguna</option>
            <option value="admin">Admin</option>
          </select>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau email..."
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
            <p className="font-semibold">Gagal memuat pengguna</p>
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
              className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand-primary">
            <UserCog className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">
            {hasFilter ? "Tidak ada pengguna cocok" : "Belum ada pengguna"}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            {hasFilter
              ? "Coba ubah filter atau kata kunci pencarian."
              : "Pengguna yang mendaftar akan muncul di sini."}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-slate-500">{total} pengguna</p>
          <ul className="space-y-2.5">
            {items.map((u) => {
              const isSelf = u.id === currentUserId;
              const busy = busyId === u.id;
              return (
                <li
                  key={u.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-primary/20 lg:flex-row lg:items-center"
                >
                  {/* Identitas */}
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-primary text-sm font-semibold text-white">
                      {u.avatarUrl ? (
                        <Image
                          src={u.avatarUrl}
                          alt={u.fullName}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <span>{getInitials(u.fullName)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-slate-900">
                          {u.fullName}
                        </p>
                        {isSelf && (
                          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Anda
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate-500">{u.email}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Bergabung {formatDateID(u.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2 lg:w-28">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200">
                        Nonaktif
                      </span>
                    )}
                  </div>

                  {/* Aksi */}
                  <div className="flex shrink-0 items-center gap-2">
                    {/* Ubah role */}
                    <label className="sr-only" htmlFor={`role-${u.id}`}>
                      Role {u.fullName}
                    </label>
                    <select
                      id={`role-${u.id}`}
                      value={u.role}
                      disabled={isSelf || busy}
                      onChange={(e) =>
                        patchUser(u, { role: e.target.value as UserRole })
                      }
                      title={
                        isSelf ? "Tidak bisa mengubah role sendiri" : "Ubah role"
                      }
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="user">{ROLE_LABEL.user}</option>
                      <option value="admin">{ROLE_LABEL.admin}</option>
                    </select>

                    {/* Aktif/nonaktif */}
                    <button
                      type="button"
                      onClick={() => patchUser(u, { isActive: !u.isActive })}
                      disabled={busy || (isSelf && u.isActive)}
                      title={
                        isSelf && u.isActive
                          ? "Tidak bisa menonaktifkan akun sendiri"
                          : u.isActive
                            ? "Nonaktifkan"
                            : "Aktifkan"
                      }
                      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {u.isActive ? (
                        <UserX className="h-3.5 w-3.5" />
                      ) : (
                        <UserCheck className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Hapus */}
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(u)}
                      disabled={busy || isSelf}
                      title={
                        isSelf ? "Tidak bisa menghapus akun sendiri" : "Hapus"
                      }
                      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {confirmDelete && (
        <DeleteConfirm
          user={confirmDelete}
          busy={busyId === confirmDelete.id}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete)}
        />
      )}
    </div>
  );
}

function DeleteConfirm({
  user,
  busy,
  onCancel,
  onConfirm,
}: {
  user: AdminUserDTO;
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
          Hapus pengguna ini?
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-center text-sm text-slate-500">
          “{user.fullName}” ({user.email}) akan dihapus permanen beserta seluruh
          data subjek & catatannya. Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Pertimbangkan menonaktifkan akun bila hanya ingin memblokir akses
            sementara — datanya tetap aman.
          </p>
        </div>
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
            {busy ? "Menghapus..." : "Hapus Permanen"}
          </button>
        </div>
      </div>
    </div>
  );
}
