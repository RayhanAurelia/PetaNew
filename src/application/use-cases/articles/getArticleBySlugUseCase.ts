import type { IArticleRepository } from "@/src/domain/repositories/IArticleRepository";
import { ArticleNotFoundError } from "@/src/domain/errors/articleErrors";
import type { ArticleDetailDTO } from "../../dtos/articles/articleDTO";
import { toListItemDTO } from "./listArticlesUseCase";

export class GetArticleBySlugUseCase {
  constructor(private readonly repo: IArticleRepository) {}

  async execute(slug: string): Promise<ArticleDetailDTO> {
    const article = await this.repo.findBySlug(slug);
    if (!article || !article.isPublished) {
      throw new ArticleNotFoundError();
    }

    // Fire-and-forget view increment. PRD §10.5 FR-25 minta idempotent per
    // session — untuk MVP increment selalu, optimisasi nanti via cookie/log.
    this.repo.incrementViewCount(article.id).catch((err) => {
      console.warn(`[Articles] failed to increment view_count: ${err}`);
    });

    return {
      ...toListItemDTO(article),
      content: article.content,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    };
  }
}
