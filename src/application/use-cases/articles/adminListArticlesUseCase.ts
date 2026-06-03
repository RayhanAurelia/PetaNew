import type {
  AdminListArticlesOptions,
  IArticleRepository,
} from "@/src/domain/repositories/IArticleRepository";
import type { ListAdminArticlesOutputDTO } from "../../dtos/articles/articleDTO";
import { toAdminDTO } from "./articleAdminMapper";

export class AdminListArticlesUseCase {
  constructor(private readonly repo: IArticleRepository) {}

  async execute(
    options: AdminListArticlesOptions,
  ): Promise<ListAdminArticlesOutputDTO> {
    const result = await this.repo.listAll(options);
    return {
      items: result.items.map(toAdminDTO),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }
}
