import {
  Apple,
  BookOpen,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LineChart,
  type LucideIcon,
  Salad,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  /** Kelas gradien ikon (mis. "from-emerald-500 to-teal-600"). */
  gradient: string;
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
        gradient: "from-emerald-500 to-teal-600",
      },
      {
        label: "Subjek",
        href: "/subjects",
        icon: Users,
        description: "Anak & anggota keluarga",
        gradient: "from-sky-500 to-blue-600",
      },
      {
        label: "Riwayat Pengukuran",
        href: "/growth",
        icon: LineChart,
        description: "Tinggi, berat & BMI per subjek",
        gradient: "from-cyan-500 to-sky-600",
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
        gradient: "from-amber-500 to-orange-600",
      },
      {
        label: "Database Makanan",
        href: "/foods",
        icon: Apple,
        description: "Jelajah & detail nutrisi",
        gradient: "from-lime-500 to-green-600",
      },
    ],
  },
  {
    title: "Edukasi",
    items: [
      {
        label: "Artikel",
        href: "/articles",
        icon: BookOpen,
        description: "Edukasi gizi terkurasi",
        gradient: "from-violet-500 to-purple-600",
      },
    ],
  },
];

/**
 * Seksi khusus admin. Di shell digabung SETELAH menu user, sehingga admin
 * mendapat pengalaman user penuh + akses panel admin (hanya admin).
 */
export const adminSidebarSections: SidebarSection[] = [
  {
    title: "Administrasi",
    items: [
      {
        label: "Panel Admin",
        href: "/admin",
        icon: ShieldCheck,
        description: "Statistik platform",
        gradient: "from-fuchsia-500 to-purple-600",
      },
      {
        label: "Master Makanan",
        href: "/admin/food",
        icon: Apple,
        description: "CRUD & verifikasi food",
        gradient: "from-emerald-500 to-teal-600",
      },
      {
        label: "Kelola Artikel",
        href: "/admin/articles",
        icon: FileText,
        description: "Editor draft & publish",
        gradient: "from-blue-500 to-indigo-600",
      },
      {
        label: "Pengguna",
        href: "/admin/users",
        icon: UserCog,
        description: "Kelola akun",
        gradient: "from-amber-500 to-orange-600",
      },
      {
        label: "Audit Log",
        href: "/admin/audit",
        icon: ClipboardList,
        description: "Riwayat aktivitas",
        gradient: "from-rose-500 to-pink-600",
      },
    ],
  },
];
