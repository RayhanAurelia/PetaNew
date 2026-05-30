import {
  Apple,
  BookOpen,
  ClipboardList,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  Salad,
  User,
  UserCog,
  Users,
} from "lucide-react";

export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

export const userSidebarSections: SidebarSection[] = [
  {
    title: "Pemantauan",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Ringkasan harian",
      },
      {
        label: "Subjek",
        href: "/subjects",
        icon: Users,
        description: "Anak & anggota keluarga",
      },
    ],
  },
  {
    title: "Gizi",
    items: [
      {
        label: "Catat Makanan",
        href: "/log",
        icon: Salad,
        description: "Quick log konsumsi",
      },
      {
        label: "Database Makanan",
        href: "/foods",
        icon: Apple,
        description: "Jelajah & detail nutrisi",
      },
    ],
  },
  {
    title: "Edukasi & Akun",
    items: [
      {
        label: "Artikel",
        href: "/articles",
        icon: BookOpen,
        description: "Edukasi gizi terkurasi",
      },
      {
        label: "Profil",
        href: "/profile",
        icon: User,
        description: "Atur akun & avatar",
      },
    ],
  },
];

export const adminSidebarSections: SidebarSection[] = [
  {
    title: "Operasional",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        description: "Statistik platform",
      },
      {
        label: "Master Makanan",
        href: "/admin/food",
        icon: Apple,
        description: "CRUD & verifikasi food",
      },
      {
        label: "Artikel",
        href: "/admin/articles",
        icon: FileText,
        description: "Editor draft & publish",
      },
    ],
  },
  {
    title: "Pengawasan",
    items: [
      {
        label: "Pengguna",
        href: "/admin/users",
        icon: UserCog,
        description: "Kelola akun",
      },
      {
        label: "Audit Log",
        href: "/admin/audit",
        icon: ClipboardList,
        description: "Riwayat aktivitas",
      },
      {
        label: "Profil",
        href: "/profile",
        icon: User,
        description: "Akun admin",
      },
    ],
  },
];
