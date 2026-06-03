import type { Article } from "@/src/domain/entities/article";
import type { LifeStage } from "@/src/domain/entities/subject";
import type { IArticleRepository } from "@/src/domain/repositories/IArticleRepository";
import type {
  ArticleListItemDTO,
  ListArticlesOutputDTO,
} from "../../dtos/articles/articleDTO";

export class ListArticlesUseCase {
  constructor(private readonly repo: IArticleRepository) {}

  async execute(
    lifeStage: LifeStage | undefined,
    page: number,
    pageSize: number,
  ): Promise<ListArticlesOutputDTO> {
    const result = await this.repo.listPublished({ lifeStage, page, pageSize });
    return {
      items: result.items.map(toListItemDTO),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }
}

export function toListItemDTO(a: Article): ArticleListItemDTO {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    coverImageUrl: a.coverImageUrl,
    targetLifeStage: a.targetLifeStage,
    authorName: a.authorName,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    viewCount: a.viewCount,
  };
}
