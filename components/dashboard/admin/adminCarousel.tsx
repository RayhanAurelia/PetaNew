"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export interface CarouselItem {
  id: string;
  primary: string;
  secondary?: string;
  /** Pill kecil di kiri item; `className` mengatur warna ring/teks. */
  badge?: { label: string; className: string };
}

export interface CarouselSlide {
  key: string;
  title: string;
  href: string;
  emptyText: string;
  items: CarouselItem[];
}

/**
 * Panel pratinjau yang bisa digeser kiri/kanan (panah + titik) antar slide,
 * mis. Aktivitas Terbaru → Artikel Terbaru → Makanan Terbaru. Auto-geser tiap
 * 7 detik, dijeda saat kursor di atas panel.
 */
export function AdminCarousel({ slides }: { slides: CarouselSlide[] }) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = (i: number) => setIndex(((i % count) + count) % count);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), 7000);
    return () => clearTimeout(t);
  }, [index, count, paused]);

  if (count === 0) return null;

  const current = slides[index];

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header: judul slide aktif + lihat semua */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="truncate text-base font-semibold text-slate-900">
          {current.title}
        </h3>
        <Link
          href={current.href}
          className="shrink-0 text-xs font-semibold text-brand-primary hover:underline"
        >
          Lihat semua
        </Link>
      </div>

      {/* Track yang bergeser */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.key} className="w-full shrink-0 px-1">
              {slide.items.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  {slide.emptyText}
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {slide.items.map((it) => (
                    <li key={it.id} className="flex items-start gap-3 py-2.5">
                      {it.badge && (
                        <span
                          className={`mt-0.5 inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${it.badge.className}`}
                        >
                          {it.badge.label}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {it.primary}
                        </p>
                        {it.secondary && (
                          <p className="truncate text-xs text-slate-500">
                            {it.secondary}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Kontrol bawah: panah + titik indikator */}
      {count > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Sebelumnya"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ke ${s.title}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? "w-5 bg-brand-primary"
                    : "w-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Berikutnya"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
