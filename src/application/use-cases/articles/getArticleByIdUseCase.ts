import type { IArticleRepository } from "@/src/domain/repositories/IArticleRepository";
import { ArticleNotFoundError } from "@/src/domain/errors/articleErrors";
import type { ArticleAdminDTO } from "../../dtos/articles/articleDTO";
import { toAdminDTO } from "./articleAdminMapper";

export class GetArticleByIdUseCase {
  constructor(private readonly repo: IArticleRepository) {}

  async execute(id: string): Promise<ArticleAdminDTO> {
    const article = await this.repo.findById(id);
    if (!article) throw new ArticleNotFoundError();
    return toAdminDTO(article);
  }
}
