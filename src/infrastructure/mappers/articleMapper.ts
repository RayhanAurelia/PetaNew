import { Article } from "@/src/domain/entities/article";
import type { LifeStage } from "@/src/domain/entities/subject";

export interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  target_life_stage: LifeStage | null;
  author_id: string | null;
  /** Optional join dari `profiles` lewat select nested. */
  author?: { full_name?: string | null } | null;
  is_published: boolean;
  published_at: string | null;
  view_count: number | string;
  created_at: string;
  updated_at: string;
}

export class ArticleMapper {
  static toDomain(row: ArticleRow): Article {
    return new Article(
      row.id,
      row.title,
      row.slug,
      row.excerpt,
      row.content,
      row.cover_image_url,
      row.target_life_stage,
      row.author_id,
      row.author?.full_name ?? null,
      row.is_published,
      row.published_at ? new Date(row.published_at) : null,
      Number(row.view_count),
      new Date(row.created_at),
      new Date(row.updated_at),
    );
  }
}
