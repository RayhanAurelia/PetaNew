import type { LifeStage } from "@/src/domain/entities/subject";

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

export interface ListArticlesOutputDTO {
  items: ArticleListItemDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/** DTO lengkap untuk panel admin (termasuk draft & metadata). */
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

export interface ListAdminArticlesOutputDTO {
  items: ArticleAdminDTO[];
  total: number;
  page: number;
  pageSize: number;
}
