import type { Article } from "@/src/domain/entities/article";
import type { ArticleAdminDTO } from "../../dtos/articles/articleDTO";

/** Map entity domain → DTO admin (lengkap, termasuk draft & metadata). */
export function toAdminDTO(a: Article): ArticleAdminDTO {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    content: a.content,
    coverImageUrl: a.coverImageUrl,
    targetLifeStage: a.targetLifeStage,
    authorId: a.authorId,
    authorName: a.authorName,
    isPublished: a.isPublished,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    viewCount: a.viewCount,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}
