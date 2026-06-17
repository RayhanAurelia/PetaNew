"use client";

import { Dropdown, DropdownItem } from "flowbite-react";
import {
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

interface TopbarProfileProps {
  user: {
    fullName: string;
    email: string;
    role: "user" | "admin";
    avatarUrl?: string | null;
  };
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

/**
 * Avatar profil di navbar dengan dropdown: Profil, (khusus admin) tombol
 * pindah mode Pengguna ⇄ Admin, dan Keluar.
 */
export function TopbarProfile({ user }: TopbarProfileProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = user.role === "admin";
  const inAdmin = pathname?.startsWith("/admin") ?? false;
  const initials = getInitials(user.fullName);

  return (
    <Dropdown
      arrowIcon={false}
      dismissOnClick
      placement="bottom-end"
      className="z-50 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/5"
      renderTrigger={() => (
        <button
          type="button"
          aria-label="Menu profil"
          className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-primary text-sm font-semibold text-white shadow-sm ring-2 ring-white transition hover:ring-brand-primary/30 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
        >
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
              title="Admin"
              className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-amber-500 text-white ring-2 ring-white"
            >
              <ShieldCheck className="h-2.5 w-2.5" />
            </span>
          )}
        </button>
      )}
    >
      <div className="px-2 py-2">
        <p className="truncate text-sm font-semibold text-slate-900">
          {user.fullName}
        </p>
        <p className="truncate text-xs text-slate-500">{user.email}</p>
      </div>
      <div className="my-1 h-px bg-slate-100" />

      <DropdownItem
        onClick={() => router.push("/profile")}
        className="flex items-center gap-2 rounded-lg text-sm text-slate-600 hover:bg-brand-soft hover:text-brand-primary"
      >
        <UserIcon className="h-4 w-4 shrink-0" />
        Profil
      </DropdownItem>

      {isAdmin && (
        <DropdownItem
          onClick={() => router.push(inAdmin ? "/dashboard" : "/admin")}
          className="flex items-center gap-2 rounded-lg text-sm text-slate-600 hover:bg-brand-soft hover:text-brand-primary"
        >
          {inAdmin ? (
            <>
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              Mode Pengguna
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Panel Admin
            </>
          )}
        </DropdownItem>
      )}

      <div className="my-1 h-px bg-slate-100" />

      <form action="/api/auth/logout" method="POST">
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Keluar
        </button>
      </form>
    </Dropdown>
  );
}
