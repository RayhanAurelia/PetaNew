import type {
  AdminListFoodsOptions,
  IFoodAdminRepository,
} from "@/src/domain/repositories/IFoodAdminRepository";
import type { ListAdminFoodsOutputDTO } from "../../dtos/foods/foodAdminDTO";
import { toAdminDTO } from "./foodAdminMapper";

export class AdminListFoodsUseCase {
  constructor(private readonly repo: IFoodAdminRepository) {}

  async execute(
    options: AdminListFoodsOptions,
  ): Promise<ListAdminFoodsOutputDTO> {
    const result = await this.repo.listAll(options);
    return {
      items: result.items.map(toAdminDTO),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }
}
