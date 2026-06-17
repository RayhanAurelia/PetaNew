"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { SidebarSection } from "./sidebarConfig";

interface SidebarProps {
  sections: SidebarSection[];
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ sections, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  // Tutup drawer mobile saat pindah halaman.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Desktop: sidebar mini secara default, mengembang saat hover.
  // Mobile: drawer selalu tampil penuh saat dibuka.
  const isExpanded = open || isHovered;

  return (
    <>
      {/* Backdrop mobile */}
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
      />

      {/* Spacer desktop selebar sidebar mini; saat hover sidebar mengembang sebagai overlay di atas konten */}
      <div aria-hidden className="hidden w-20 shrink-0 lg:block" />

      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-0 z-[60] flex h-screen flex-col border-r border-slate-200 bg-white shadow-xl shadow-slate-900/5 transition-[width,transform] duration-300 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:top-16 lg:z-40 lg:h-[calc(100vh-4rem)] lg:translate-x-0
          w-72 ${isExpanded ? "lg:w-72" : "lg:w-20"}`}
      >
        <div className="flex items-center justify-end border-b border-slate-100 px-4 py-3 lg:hidden">
          {/* Tombol close (mobile) */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
          <ul className="flex flex-col gap-5">
            {sections.map((section) => (
              <li key={section.title}>
                {isExpanded && (
                  <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {section.title}
                  </p>
                )}
                {!isExpanded && (
                  <div
                    aria-hidden
                    className="mx-auto mb-2 hidden h-px w-8 bg-slate-200 lg:block"
                  />
                )}
                <ul className="flex flex-col gap-1">
                  {section.items.map((item) => {
                    const active = isActive(pathname, item.href);
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          title={!isExpanded ? item.label : undefined}
                          className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                            ${active
                              ? "bg-brand-soft text-brand-primary shadow-sm"
                              : "text-slate-600 hover:translate-x-0.5 hover:bg-slate-50 hover:text-slate-900"
                            }
                            ${!isExpanded ? "lg:justify-center lg:px-2" : ""}`}
                        >
                          {active && (
                            <span
                              aria-hidden
                              className="absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-brand-accent"
                            />
                          )}
                          <span
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-linear-to-br text-white shadow-sm transition group-hover:scale-105 ${item.gradient}`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          {isExpanded && (
                            <div className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate">{item.label}</span>
                              {item.description && (
                                <span
                                  className={`truncate text-[11px] font-normal ${active
                                      ? "text-brand-primary/70"
                                      : "text-slate-400 group-hover:text-slate-500"
                                    }`}
                                >
                                  {item.description}
                                </span>
                              )}
                            </div>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/dashboard" || href === "/admin") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

