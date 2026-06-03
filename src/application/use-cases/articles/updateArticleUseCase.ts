import type {
  IArticleRepository,
  UpdateArticleInput,
} from "@/src/domain/repositories/IArticleRepository";
import {
  ArticleNotFoundError,
  InvalidArticleDataError,
} from "@/src/domain/errors/articleErrors";
import type { ArticleAdminDTO } from "../../dtos/articles/articleDTO";
import type { UpdateArticleInputDTO } from "../../validators/articles/articleSchema";
import { toAdminDTO } from "./articleAdminMapper";

export class UpdateArticleUseCase {
  constructor(private readonly repo: IArticleRepository) {}

  /** @param adminId dipakai sebagai author bila artikel baru pertama kali dipublikasi. */
  async execute(
    id: string,
    input: UpdateArticleInputDTO,
    adminId: string,
  ): Promise<ArticleAdminDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new ArticleNotFoundError();

    const patch: UpdateArticleInput = {};
    if (input.title !== undefined) patch.title = input.title;
    if (input.slug !== undefined) {
      const slug = input.slug.trim();
      if (slug.length < 3) {
        throw new InvalidArticleDataError("Slug minimal 3 karakter.");
      }
      patch.slug = slug;
    }
    if (input.excerpt !== undefined) patch.excerpt = input.excerpt;
    if (input.content !== undefined) patch.content = input.content;
    if (input.coverImageUrl !== undefined)
      patch.coverImageUrl = input.coverImageUrl;
    if (input.targetLifeStage !== undefined)
      patch.targetLifeStage = input.targetLifeStage;

    // Transisi status publish: penuhi constraint (published_at & author_id wajib).
    if (input.isPublished !== undefined) {
      patch.isPublished = input.isPublished;
      if (input.isPublished) {
        patch.publishedAt = existing.publishedAt ?? new Date();
        patch.authorId = existing.authorId ?? adminId;
      } else {
        patch.publishedAt = null;
      }
    }

    const updated = await this.repo.update(id, patch);
    return toAdminDTO(updated);
  }
}
