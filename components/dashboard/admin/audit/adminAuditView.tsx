"use client";

import { Dropdown, DropdownItem } from "flowbite-react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ClipboardList,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/pageHeader";
import { AdminTableShell, Pagination } from "@/components/dashboard/admin/adminTable";
import { PageSizeSelect } from "@/components/dashboard/admin/pageSizeSelect";
import {
  ACTION_FILTERS,
  ACTION_LABEL,
  ACTION_STYLE,
  type ApiResponse,
  type AuditAction,
  type AuditLogDTO,
  type AuditTargetType,
  changeSummary,
  computeChanges,
  entryTitle,
  type FieldChange,
  formatDateTimeID,
  type ListAuditLogsResult,
  TARGET_FILTERS,
  TARGET_LABEL,
} from "./adminAuditTypes";

export function AdminAuditView() {
  const [items, setItems] = useState<AuditLogDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [action, setAction] = useState<AuditAction | "">("");
  const [targetType, setTargetType] = useState<AuditTargetType | "">("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset ke halaman 1 saat filter berubah.
  useEffect(() => {
    setPage(1);
  }, [action, targetType, debouncedSearch]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (action) params.set("action", action);
      if (targetType) params.set("targetType", targetType);
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/admin/audit?${params.toString()}`, {
        cache: "no-store",
      });
      const json: ApiResponse<ListAuditLogsResult> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setItems(json.data.items);
      setTotal(json.data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat log audit");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, action, targetType, debouncedSearch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasFilter =
    Boolean(debouncedSearch) || action !== "" || targetType !== "";

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Audit Log"
        title="Riwayat Aktivitas Admin"
        description="Mencatat perubahan yang dilakukan oleh admin"
      />

      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Dropdown
          arrowIcon={false}
          dismissOnClick
          className="z-30 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/5"
          renderTrigger={() => (
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/15 sm:w-40"
            >
              <span className="truncate">
                {ACTION_FILTERS.find((f) => f.value === action)?.label ??
                  "Semua aksi"}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          )}
        >
          {ACTION_FILTERS.map((f) => (
            <FilterItem
              key={f.value}
              label={f.label}
              active={action === f.value}
              onClick={() => setAction(f.value)}
            />
          ))}
        </Dropdown>
        <Dropdown
          arrowIcon={false}
          dismissOnClick
          className="z-30 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/5"
          renderTrigger={() => (
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/15 sm:w-44"
            >
              <span className="truncate">
                {TARGET_FILTERS.find((f) => f.value === targetType)?.label ??
                  "Semua objek"}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          )}
        >
          {TARGET_FILTERS.map((f) => (
            <FilterItem
              key={f.value}
              label={f.label}
              active={targetType === f.value}
              onClick={() => setTargetType(f.value)}
            />
          ))}
        </Dropdown>
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari email aktor..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/15"
          />
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Gagal memuat log audit</p>
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
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-brand-primary">
            <ClipboardList className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">
            {hasFilter ? "Tidak ada catatan cocok" : "Belum ada aktivitas"}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            {hasFilter
              ? "Coba ubah filter atau kata kunci pencarian."
              : "Setiap perubahan data oleh admin akan tercatat di sini."}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">{total} catatan</p>
            <PageSizeSelect
              value={pageSize}
              onChange={(n) => {
                setPageSize(n);
                setPage(1);
              }}
            />
          </div>

          {/* Desktop: tabel (baris bisa diklik untuk lihat detail) */}
          <AdminTableShell
            headers={[
              { label: "Aksi" },
              { label: "Objek" },
              { label: "Ringkasan" },
              { label: "Aktor" },
              { label: "Waktu" },
              { label: "", className: "w-10" },
            ]}
          >
            {items.map((e) => (
              <AuditTableRow
                key={e.id}
                entry={e}
                open={expanded.has(e.id)}
                onToggle={() => toggle(e.id)}
              />
            ))}
          </AdminTableShell>

          {/* Mobile: kartu expandable */}
          <ul className="space-y-2.5 lg:hidden">
            {items.map((e) => (
              <AuditRow
                key={e.id}
                entry={e}
                open={expanded.has(e.id)}
                onToggle={() => toggle(e.id)}
              />
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
    </div>
  );
}

function FilterItem({
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

function AuditRow({
  entry,
  open,
  onToggle,
}: {
  entry: AuditLogDTO;
  open: boolean;
  onToggle: () => void;
}) {
  const changes = computeChanges(entry);
  const actor =
    entry.actorName || entry.actorEmail || "Sistem / tidak diketahui";

  return (
    <li className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50"
      >
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${ACTION_STYLE[entry.action]}`}
        >
          {ACTION_LABEL[entry.action]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">
            {TARGET_LABEL[entry.targetType]} - {entryTitle(entry)}
          </p>
          <p className="truncate text-xs text-slate-600">
            {changeSummary(entry)}
          </p>
          <p className="truncate text-[11px] text-slate-400">
            oleh {actor}
            {entry.actorRole ? ` (${entry.actorRole})` : ""} - {""}
            {formatDateTimeID(entry.createdAt)}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3">
          {changes.length === 0 ? (
            <p className="text-xs text-slate-400">
              Tidak ada detail field yang dapat ditampilkan.
            </p>
          ) : entry.action === "update" ? (
            <DiffTable changes={changes} />
          ) : (
            <SnapshotTable changes={changes} action={entry.action} />
          )}
          {entry.targetId && (
            <p className="mt-3 font-mono text-[10px] text-slate-400">
              ID objek: {entry.targetId}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

function AuditDetail({ entry }: { entry: AuditLogDTO }) {
  const changes = computeChanges(entry);
  return (
    <>
      {changes.length === 0 ? (
        <p className="text-xs text-slate-400">
          Tidak ada detail field yang dapat ditampilkan.
        </p>
      ) : entry.action === "update" ? (
        <DiffTable changes={changes} />
      ) : (
        <SnapshotTable changes={changes} action={entry.action} />
      )}
      {entry.targetId && (
        <p className="mt-3 font-mono text-[10px] text-slate-400">
          ID objek: {entry.targetId}
        </p>
      )}
    </>
  );
}

function AuditTableRow({
  entry,
  open,
  onToggle,
}: {
  entry: AuditLogDTO;
  open: boolean;
  onToggle: () => void;
}) {
  const actor =
    entry.actorName || entry.actorEmail || "Sistem / tidak diketahui";
  return (
    <>
      <tr
        onClick={onToggle}
        className="cursor-pointer transition hover:bg-slate-50/60"
      >
        <td className="px-4 py-3 align-top">
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${ACTION_STYLE[entry.action]}`}
          >
            {ACTION_LABEL[entry.action]}
          </span>
        </td>
        <td className="px-4 py-3 align-top font-semibold text-slate-900">
          <span className="block max-w-[18rem] truncate">
            {TARGET_LABEL[entry.targetType]} - {entryTitle(entry)}
          </span>
        </td>
        <td className="px-4 py-3 align-top text-slate-600">
          <span className="block max-w-[20rem] truncate">
            {changeSummary(entry)}
          </span>
        </td>
        <td className="px-4 py-3 align-top text-slate-500">
          {actor}
          {entry.actorRole ? ` (${entry.actorRole})` : ""}
        </td>
        <td className="px-4 py-3 align-top whitespace-nowrap text-slate-500">
          {formatDateTimeID(entry.createdAt)}
        </td>
        <td className="px-4 py-3 align-top text-right">
          <ChevronDown
            className={`inline h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={6} className="bg-slate-50/60 px-4 py-3">
            <AuditDetail entry={entry} />
          </td>
        </tr>
      )}
    </>
  );
}

/** Tabel perubahan untuk aksi UPDATE: Field · Data Lama · Data Baru. */
function DiffTable({ changes }: { changes: FieldChange[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full table-fixed text-xs">
        <thead>
          <tr className="bg-slate-100/70 text-left text-[10px] uppercase tracking-wider text-slate-500">
            <th className="w-1/4 px-3 py-2 font-semibold">Field</th>
            <th className="w-[37.5%] px-3 py-2 font-semibold">Data Lama</th>
            <th className="w-[37.5%] px-3 py-2 font-semibold">Data Baru</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {changes.map((c) => (
            <tr key={c.key} className="align-top">
              <td className="px-3 py-2 font-semibold text-slate-700">
                {c.label}
              </td>
              <td className="px-3 py-2">
                <Value value={c.before} tone="old" />
              </td>
              <td className="px-3 py-2">
                <Value value={c.after} tone="new" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Tabel snapshot untuk aksi CREATE / DELETE: Field · Nilai. */
function SnapshotTable({
  changes,
  action,
}: {
  changes: FieldChange[];
  action: "create" | "delete";
}) {
  const tone = action === "delete" ? "old" : "new";
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full table-fixed text-xs">
        <thead>
          <tr className="bg-slate-100/70 text-left text-[10px] uppercase tracking-wider text-slate-500">
            <th className="w-1/3 px-3 py-2 font-semibold">Field</th>
            <th className="px-3 py-2 font-semibold">
              {action === "delete" ? "Data yang Dihapus" : "Data Baru"}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {changes.map((c) => (
            <tr key={c.key} className="align-top">
              <td className="px-3 py-2 font-semibold text-slate-700">
                {c.label}
              </td>
              <td className="px-3 py-2">
                <Value
                  value={action === "delete" ? c.before : c.after}
                  tone={tone}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Value({ value, tone }: { value: string | null; tone: "old" | "new" }) {
  if (value === null) {
    return <span className="italic text-slate-400">— kosong —</span>;
  }
  const cls =
    tone === "old"
      ? "bg-red-50 text-red-700"
      : "bg-emerald-50 text-emerald-700";
  return (
    <span
      className={`inline-block max-w-full wrap-break-word rounded px-1.5 py-0.5 ${cls}`}
    >
      {value}
    </span>
  );
}
