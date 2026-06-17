"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sidebar } from "./sidebar";
import { adminSidebarSections, userSidebarSections } from "./sidebarConfig";
import { TopbarNotifications } from "./topbar/topbarNotifications";
import { TopbarProfile } from "./topbar/topbarProfile";
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
  const pathname = usePathname();
  // Sidebar dipilih berdasarkan konteks halaman, bukan digabung: di area /admin
  // tampil sidebar admin, selain itu sidebar pengguna. (Akses /admin sudah
  // dijaga hanya untuk admin di server.)
  const inAdmin = pathname?.startsWith("/admin") ?? false;
  const sections = inAdmin ? adminSidebarSections : userSidebarSections;

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
            href={inAdmin ? "/admin" : "/dashboard"}
            className="group flex items-center"
            aria-label="Beranda PETA"
          >
            <span className="font-bungee text-2xl leading-none transition-transform group-hover:scale-105">
              <span className="text-brand-primary">Pe</span>
              <span className="text-brand-accent">Ta</span>
            </span>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <TopbarSearch role={user.role} />
          <TopbarNotifications />
          <TopbarProfile user={user} />
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1">
        <Sidebar
          sections={sections}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
