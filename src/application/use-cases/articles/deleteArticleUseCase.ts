import type { IArticleRepository } from "@/src/domain/repositories/IArticleRepository";
import { ArticleNotFoundError } from "@/src/domain/errors/articleErrors";

export class DeleteArticleUseCase {
  constructor(private readonly repo: IArticleRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new ArticleNotFoundError();
    await this.repo.delete(id);
  }
}
