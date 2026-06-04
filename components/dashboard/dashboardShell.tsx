"use client";

import { Bell, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Sidebar } from "./sidebar";
import { adminSidebarSections, userSidebarSections } from "./sidebarConfig";
import { TopbarSearch } from "./topbar/topbarSearch";

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
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Topbar (Full width) */}
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur-md lg:px-8">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="flex items-center lg:w-[calc(18rem-3rem)]">
          <Link
            href={isAdmin ? "/admin" : "/dashboard"}
            className="group flex items-center"
            aria-label="Beranda PETA"
          >
            <div className="relative h-10 w-28 shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/logo-PETA-transparent.png"
                alt="Logo PETA"
                fill
                sizes="112px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>
        </div>



        <div className="ml-auto flex items-center gap-2">
          <TopbarSearch role={user.role} />
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

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1">
        <Sidebar
          sections={sections}
          user={user}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
