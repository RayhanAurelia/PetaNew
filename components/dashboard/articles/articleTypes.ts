import type { LifeStage } from "@/components/dashboard/subjects/subjectTypes";

export interface ArticleListItemDTO {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  targetLifeStage: LifeStage | null;
  authorName: string | null;
  publishedAt: string | null;
  viewCount: number;
}

export interface ArticleDetailDTO extends ArticleListItemDTO {
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListArticlesResult {
  items: ArticleListItemDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export const STAGE_LABEL: Record<LifeStage, string> = {
  balita: "Balita",
  anak: "Anak",
  remaja: "Remaja",
  dewasa: "Dewasa",
};

export const STAGE_STYLE: Record<LifeStage, string> = {
  balita: "bg-pink-50 text-pink-700 ring-pink-200",
  anak: "bg-blue-50 text-blue-700 ring-blue-200",
  remaja: "bg-purple-50 text-purple-700 ring-purple-200",
  dewasa: "bg-brand-soft text-brand-primary ring-brand-primary/20",
};

export const STAGE_ORDER: LifeStage[] = ["balita", "anak", "remaja", "dewasa"];

export function formatPublishedAt(iso: string | null): string {
  if (!iso) return "Belum dipublikasi";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
