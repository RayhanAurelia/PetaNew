import type { Article } from "../entities/article";
import type { LifeStage } from "../entities/subject";

export interface ListArticlesOptions {
  lifeStage?: LifeStage;
  page?: number;
  pageSize?: number;
}

export interface ListArticlesResult {
  items: Article[];
  total: number;
  page: number;
  pageSize: number;
}

/** Status filter untuk listing admin (mencakup draft). */
export type ArticleStatusFilter = "all" | "published" | "draft";

export interface AdminListArticlesOptions {
  status?: ArticleStatusFilter;
  lifeStage?: LifeStage;
  /** Pencarian judul (ILIKE). */
  search?: string;
  page?: number;
  pageSize?: number;
}

/** Field yang ditulis saat membuat artikel. */
export interface CreateArticleInput {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  targetLifeStage: LifeStage | null;
  authorId: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
}

/** Field yang dapat diperbarui (partial). */
export type UpdateArticleInput = Partial<CreateArticleInput>;

export interface IArticleRepository {
  listPublished(options: ListArticlesOptions): Promise<ListArticlesResult>;
  findBySlug(slug: string): Promise<Article | null>;
  incrementViewCount(id: string): Promise<void>;

  // --- Admin ---
  listAll(options: AdminListArticlesOptions): Promise<ListArticlesResult>;
  findById(id: string): Promise<Article | null>;
  create(input: CreateArticleInput): Promise<Article>;
  update(id: string, input: UpdateArticleInput): Promise<Article>;
  delete(id: string): Promise<void>;
}
