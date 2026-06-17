"use client";

import { Dropdown, DropdownItem } from "flowbite-react";
import { Check, ChevronDown } from "lucide-react";

/** Opsi jumlah baris per halaman untuk semua list. */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/** Dropdown pemilih jumlah baris per halaman (default 10) — gaya flowbite. */
export function PageSizeSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 text-xs text-slate-500">
      <span>Tampilkan</span>
      <Dropdown
        arrowIcon={false}
        dismissOnClick
        className="z-30 w-24 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/5"
        renderTrigger={() => (
          <button
            type="button"
            aria-label="Jumlah baris per halaman"
            className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/15"
          >
            <span className="tabular-nums">{value}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
          </button>
        )}
      >
        {PAGE_SIZE_OPTIONS.map((o) => {
          const active = o === value;
          return (
            <DropdownItem
              key={o}
              onClick={() => onChange(o)}
              className={`flex items-center justify-between gap-2 rounded-lg text-sm ${
                active
                  ? "bg-brand-soft font-semibold text-brand-primary"
                  : "text-slate-600 hover:bg-brand-soft hover:text-brand-primary"
              }`}
            >
              <span className="tabular-nums">{o}</span>
              {active && <Check className="h-4 w-4 shrink-0" />}
            </DropdownItem>
          );
        })}
      </Dropdown>
    </div>
  );
}
