import type { IArticleRepository } from "@/src/domain/repositories/IArticleRepository";
import { InvalidArticleDataError } from "@/src/domain/errors/articleErrors";
import type { ArticleAdminDTO } from "../../dtos/articles/articleDTO";
import {
  type CreateArticleInputDTO,
  slugify,
} from "../../validators/articles/articleSchema";
import { toAdminDTO } from "./articleAdminMapper";

export class CreateArticleUseCase {
  constructor(private readonly repo: IArticleRepository) {}

  /** @param authorId id profil admin yang membuat artikel. */
  async execute(
    input: CreateArticleInputDTO,
    authorId: string,
  ): Promise<ArticleAdminDTO> {
    const slug = (input.slug?.trim() || slugify(input.title)).trim();
    if (slug.length < 3) {
      throw new InvalidArticleDataError(
        "Judul tidak dapat dijadikan slug otomatis — isi slug secara manual.",
      );
    }

    const isPublished = input.isPublished ?? false;
    const created = await this.repo.create({
      title: input.title,
      slug,
      excerpt: input.excerpt ?? null,
      content: input.content,
      coverImageUrl: input.coverImageUrl ?? null,
      targetLifeStage: input.targetLifeStage ?? null,
      authorId,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    });
    return toAdminDTO(created);
  }
}
