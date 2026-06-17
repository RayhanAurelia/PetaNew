"use client";

import {
  AlertTriangle,
  Bell,
  BookOpen,
  CheckCheck,
  Loader,
  Ruler,
  Utensils,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type NotificationType =
  | "growth_reminder"
  | "nutrition_reminder"
  | "bmi_alert"
  | "new_articles";
type NotificationSeverity = "info" | "warning" | "danger";

interface NotificationDTO {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  description: string;
  href: string;
  createdAt: string;
}

/** Item ternormalisasi: label waktu dihitung di sisi data (bukan saat render). */
interface NotificationItem extends NotificationDTO {
  timeLabel: string;
}

const DISMISS_KEY = "peta:dismissed-notifications";

const TYPE_ICON: Record<NotificationType, LucideIcon> = {
  growth_reminder: Ruler,
  bmi_alert: AlertTriangle,
  nutrition_reminder: Utensils,
  new_articles: BookOpen,
};

const SEVERITY_STYLE: Record<NotificationSeverity, string> = {
  danger: "bg-red-50 text-red-600 ring-red-100",
  warning: "bg-amber-50 text-amber-600 ring-amber-100",
  info: "bg-brand-soft text-brand-primary ring-brand-primary/10",
};

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const min = Math.floor(Math.max(0, Date.now() - t) / 60000);
  if (min < 1) return "Baru saja";
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "Kemarin";
  if (day < 7) return `${day} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Lonceng notifikasi di topbar. Mengambil pengingat dari `/api/notifications`
 * (dihitung on-the-fly di server) dan menyimpan flag "sudah dibaca" di
 * localStorage berbasis id yang stabil.
 */
export function TopbarNotifications() {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  // Inisialisasi dari localStorage (lazy, aman SSR). Saat render pertama
  // `items` masih kosong sehingga tak ada perbedaan hidrasi.
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  // Ambil notifikasi sekali saat mount. Label waktu dihitung di sini agar
  // perhitungan saat render tetap murni.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        if (json.success) {
          setItems(
            (json.data as NotificationDTO[]).map((n) => ({
              ...n,
              timeLabel: timeAgo(n.createdAt),
            })),
          );
        } else {
          setErrored(true);
        }
      } catch {
        if (!cancelled) setErrored(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Tutup saat klik di luar atau Escape.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const visible = items.filter((n) => !dismissed.has(n.id));
  const count = visible.length;

  function persist(next: Set<string>) {
    setDismissed(next);
    try {
      localStorage.setItem(DISMISS_KEY, JSON.stringify([...next]));
    } catch {
      /* abaikan kuota localStorage */
    }
  }

  function dismiss(id: string) {
    const next = new Set(dismissed);
    next.add(id);
    persist(next);
  }

  function dismissAll() {
    const next = new Set(dismissed);
    visible.forEach((n) => next.add(n.id));
    persist(next);
  }

  function openItem(n: NotificationItem) {
    dismiss(n.id);
    setOpen(false);
    router.push(n.href);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifikasi"
        aria-expanded={open}
        className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:border-brand-primary/20 hover:bg-brand-soft hover:text-brand-primary"
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-accent px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl ring-1 ring-black/5 sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Notifikasi
              </h3>
              {count > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-soft px-1.5 text-[11px] font-bold text-brand-primary">
                  {count}
                </span>
              )}
            </div>
            {count > 0 && (
              <button
                type="button"
                onClick={dismissAll}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-brand-primary"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tandai dibaca
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-400">
                <Loader className="h-4 w-4 animate-spin" />
                Memuat notifikasi...
              </div>
            ) : errored ? (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                Gagal memuat notifikasi.
              </div>
            ) : count === 0 ? (
              <EmptyState />
            ) : (
              <ul className="p-1.5">
                {visible.map((n) => {
                  const Icon = TYPE_ICON[n.type];
                  return (
                    <li key={n.id} className="group relative">
                      <button
                        type="button"
                        onClick={() => openItem(n)}
                        className="flex w-full items-start gap-3 rounded-xl p-2.5 pr-9 text-left transition hover:bg-slate-50"
                      >
                        <span
                          className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ${SEVERITY_STYLE[n.severity]}`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-slate-800">
                            {n.title}
                          </span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                            {n.description}
                          </span>
                          <span className="mt-1 block text-[11px] font-medium text-slate-400">
                            {n.timeLabel}
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => dismiss(n.id)}
                        aria-label="Tandai dibaca"
                        className="absolute right-2 top-2.5 grid h-6 w-6 place-items-center rounded-lg text-slate-300 opacity-0 transition hover:bg-slate-200/70 hover:text-slate-600 focus:opacity-100 group-hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand-primary">
        <CheckCheck className="h-6 w-6" />
      </span>
      <p className="text-sm font-semibold text-slate-700">Semua sudah dibaca</p>
      <p className="max-w-56 text-xs text-slate-400">
        Tidak ada pengingat baru. Kami akan memberi tahu saat ada yang perlu
        ditindaklanjuti.
      </p>
    </div>
  );
}
