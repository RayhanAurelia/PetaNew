"use client";

import { Bell, Menu, Search } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "./sidebar";
import { adminSidebarSections, userSidebarSections } from "./sidebarConfig";

interface DashboardShellProps {
  user: {
    fullName: string;
    email: string;
    role: "user" | "admin";
    avatarUrl?: string | null;
  };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = user.role === "admin";
  const sections = isAdmin ? adminSidebarSections : userSidebarSections;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar
          sections={sections}
          user={user}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur-md lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden flex-1 md:block">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                {isAdmin ? "Panel Administrator" : "Selamat Datang"}
              </p>
              <p className="text-sm font-semibold text-slate-900">
                Halo, {user.fullName.split(" ")[0]}
              </p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 md:flex md:w-72">
                <Search className="h-4 w-4" />
                <span className="truncate">
                  Cari menu, artikel, atau makanan...
                </span>
              </div>
              <button
                type="button"
                className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:border-brand-primary/20 hover:bg-brand-soft hover:text-brand-primary"
                aria-label="Notifikasi"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-accent ring-2 ring-white" />
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
