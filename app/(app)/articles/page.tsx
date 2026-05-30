import { BookOpen, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/pageHeader";

type LifeStage = "balita" | "anak" | "remaja" | "dewasa" | "umum";

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  targetLifeStage: LifeStage;
  readMinutes: number;
  views: number;
  publishedAt: string;
}

const SAMPLE_ARTICLES: Article[] = [
  {
    slug: "tanda-stunting-yang-sering-terlewat",
    title: "Tanda Stunting yang Sering Terlewat Oleh Orang Tua",
    excerpt:
      "Lima sinyal awal di balita yang sering dianggap normal, padahal indikator stunting dini menurut standar WHO.",
    category: "Pencegahan",
    targetLifeStage: "balita",
    readMinutes: 5,
    views: 1240,
    publishedAt: "20 Mei 2026",
  },
  {
    slug: "resep-mpasi-tinggi-zat-besi",
    title: "Resep MPASI Tinggi Zat Besi untuk Bayi 6–12 Bulan",
    excerpt:
      "Tiga resep MPASI praktis menggunakan bahan lokal yang membantu memenuhi kebutuhan zat besi harian bayi.",
    category: "MPASI",
    targetLifeStage: "balita",
    readMinutes: 7,
    views: 980,
    publishedAt: "18 Mei 2026",
  },
  {
    slug: "kebutuhan-protein-anak-sekolah",
    title: "Berapa Kebutuhan Protein Harian Anak Usia Sekolah?",
    excerpt:
      "Panduan singkat AKG protein untuk anak 6–12 tahun beserta contoh menu sehari yang mudah disiapkan.",
    category: "AKG",
    targetLifeStage: "anak",
    readMinutes: 4,
    views: 712,
    publishedAt: "15 Mei 2026",
  },
  {
    slug: "tdee-untuk-dewasa-aktif",
    title: "Hitung TDEE untuk Dewasa Aktif dengan Metode Mifflin-St Jeor",
    excerpt:
      "Cara menghitung kebutuhan energi harian agar berat badan dan asupan tetap seimbang.",
    category: "Gizi Dewasa",
    targetLifeStage: "dewasa",
    readMinutes: 6,
    views: 654,
    publishedAt: "12 Mei 2026",
  },
];

const STAGE_LABEL: Record<LifeStage, string> = {
  balita: "Balita",
  anak: "Anak",
  remaja: "Remaja",
  dewasa: "Dewasa",
  umum: "Umum",
};

const STAGE_STYLE: Record<LifeStage, string> = {
  balita: "bg-pink-50 text-pink-700 ring-pink-200",
  anak: "bg-blue-50 text-blue-700 ring-blue-200",
  remaja: "bg-purple-50 text-purple-700 ring-purple-200",
  dewasa: "bg-brand-soft text-brand-primary ring-brand-primary/20",
  umum: "bg-slate-100 text-slate-700 ring-slate-200",
};

export default function ArticlesPage() {
  const stages: LifeStage[] = ["balita", "anak", "remaja", "dewasa"];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Artikel Edukasi"
        title="Belajar Gizi & Pencegahan Stunting"
        description="Kumpulan artikel terkurasi oleh tim PETA & konsultan ahli gizi. Filter berdasarkan tahap usia subjek."
      />

      {/* Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip active label="Semua" />
        {stages.map((s) => (
          <FilterChip key={s} label={STAGE_LABEL[s]} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {SAMPLE_ARTICLES.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </div>
  );
}

function FilterChip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/20"
          : "border border-slate-200 bg-white text-slate-600 hover:border-brand-primary/30 hover:bg-brand-soft hover:text-brand-primary"
      }`}
    >
      {label}
    </button>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5"
    >
      <div className="relative aspect-[16/9] w-full bg-linear-to-br from-brand-soft via-brand-soft to-brand-primary/10">
        <div className="absolute inset-0 grid place-items-center text-brand-primary/40">
          <BookOpen className="h-12 w-12" />
        </div>
        <span
          className={`absolute left-3 top-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${STAGE_STYLE[article.targetLifeStage]}`}
        >
          {STAGE_LABEL[article.targetLifeStage]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-primary">
          {article.category}
        </p>
        <h3 className="line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-brand-primary">
          {article.title}
        </h3>
        <p className="line-clamp-2 text-sm text-slate-600">{article.excerpt}</p>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {article.readMinutes} menit baca
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-3 w-3" />
            {article.views.toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </Link>
  );
}
