import type { LifeStage } from "@/components/dashboard/subjects/subjectTypes";

export interface ArticleAdminDTO {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  targetLifeStage: LifeStage | null;
  authorId: string | null;
  authorName: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListAdminArticlesResult {
  items: ArticleAdminDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export type StatusFilter = "all" | "published" | "draft";

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "published", label: "Terbit" },
  { value: "draft", label: "Draft" },
];

export interface ApiOk<T> {
  success: true;
  data: T;
}
export interface ApiErr {
  success: false;
  error: { code: string; message: string; details?: Record<string, string[]> };
}
export type ApiResponse<T> = ApiOk<T> | ApiErr;

export function formatDateID(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
