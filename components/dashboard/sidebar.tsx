"use client";

import { ChevronRight, ChevronsLeft, LogOut, ShieldCheck, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { SidebarSection } from "./sidebarConfig";

const COLLAPSE_KEY = "peta:sidebar-collapsed";

interface SidebarProps {
  sections: SidebarSection[];
  user: {
    fullName: string;
    email: string;
    role: "user" | "admin";
    avatarUrl?: string | null;
  };
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ sections, user, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Restore collapse preference dari localStorage (sekali, setelah mount).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(COLLAPSE_KEY);
      if (saved === "1") setCollapsed(true);
    } catch {
      /* ignore storage errors */
    }
    setHydrated(true);
  }, []);

  // Persist setiap kali user toggle.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed, hydrated]);

  // Tutup drawer mobile saat pindah halaman.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isAdmin = user.role === "admin";
  const initials = getInitials(user.fullName);

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white shadow-xl shadow-slate-900/5 transition-[width,transform] duration-300 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:sticky lg:top-0 lg:translate-x-0 lg:shadow-none
          ${collapsed ? "lg:w-20" : "lg:w-72"}
          w-72`}
      >
        <div
          className={`flex items-center gap-2 border-b border-slate-100 px-4 py-5 ${
            collapsed ? "lg:flex-col lg:gap-3" : "justify-between"
          }`}
        >
          <Link
            href={isAdmin ? "/admin" : "/dashboard"}
            className="group flex min-w-0 items-center gap-3"
            aria-label="Beranda PETA"
          >
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-brand-soft ring-1 ring-brand-primary/10 transition-transform group-hover:scale-105">
              <Image
                src="/logo-PETA.png"
                alt="Logo PETA"
                fill
                sizes="44px"
                className="object-contain p-1"
                priority
              />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-brand-primary">
                  PETA
                </p>
                <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  {isAdmin ? "Admin Panel" : "Tracker Gizi"}
                </p>
              </div>
            )}
          </Link>

          {/* Tombol close (mobile) */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Tombol collapse (desktop) */}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary lg:inline-flex"
            aria-label={collapsed ? "Bentangkan sidebar" : "Kecilkan sidebar"}
            title={collapsed ? "Bentangkan sidebar" : "Kecilkan sidebar"}
          >
            <ChevronsLeft
              className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
          <ul className="flex flex-col gap-5">
            {sections.map((section) => (
              <li key={section.title}>
                {!collapsed && (
                  <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {section.title}
                  </p>
                )}
                {collapsed && (
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
                          title={collapsed ? item.label : undefined}
                          className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                            ${
                              active
                                ? "bg-brand-primary text-white shadow-md shadow-brand-primary/25"
                                : "text-slate-600 hover:translate-x-0.5 hover:bg-brand-soft hover:text-brand-primary hover:shadow-sm"
                            }
                            ${collapsed ? "lg:justify-center lg:px-2" : ""}`}
                        >
                          {active && (
                            <span
                              aria-hidden
                              className="absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-brand-accent"
                            />
                          )}
                          <Icon
                            className={`h-5 w-5 shrink-0 transition-colors ${
                              active
                                ? "text-white"
                                : "text-slate-400 group-hover:text-brand-primary"
                            }`}
                          />
                          {!collapsed && (
                            <div className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate">{item.label}</span>
                              {item.description && (
                                <span
                                  className={`truncate text-[11px] font-normal ${
                                    active
                                      ? "text-white/75"
                                      : "text-slate-400 group-hover:text-brand-primary/70"
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

        {/* User card + logout */}
        <div className="border-t border-slate-100 p-3">
          <Link
            href="/profile"
            title={collapsed ? user.fullName : `Buka profil ${user.fullName}`}
            aria-label={`Buka profil ${user.fullName}`}
            className={`group flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 ring-1 ring-transparent transition hover:bg-brand-soft hover:ring-brand-primary/20 ${
              collapsed
                ? "lg:justify-center lg:bg-transparent lg:p-1.5 lg:ring-0 lg:hover:bg-brand-soft"
                : ""
            }`}
          >
            <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-primary text-sm font-semibold text-white ring-2 ring-white transition group-hover:ring-brand-primary/30">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.fullName}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
              {isAdmin && (
                <span
                  aria-hidden
                  className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-amber-500 text-white ring-2 ring-white"
                  title="Admin"
                >
                  <ShieldCheck className="h-2.5 w-2.5" />
                </span>
              )}
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-semibold text-slate-900 group-hover:text-brand-primary"
                    title={user.fullName}
                  >
                    {user.fullName}
                  </p>
                  <p
                    className="truncate text-[11px] text-slate-500"
                    title={user.email}
                  >
                    {user.email}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-primary" />
              </>
            )}
          </Link>

          <form action="/api/auth/logout" method="POST" className="mt-2">
            <button
              type="submit"
              title={collapsed ? "Keluar" : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 ${
                collapsed ? "lg:justify-center lg:px-2" : ""
              }`}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Keluar</span>}
            </button>
          </form>
        </div>
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}
