import type { IFoodAdminRepository } from "@/src/domain/repositories/IFoodAdminRepository";
import { FoodNotFoundError } from "@/src/domain/errors/foodErrors";
import type { FoodAdminDTO } from "../../dtos/foods/foodAdminDTO";
import { toAdminDTO } from "./foodAdminMapper";

export class GetFoodByIdAdminUseCase {
  constructor(private readonly repo: IFoodAdminRepository) {}

  async execute(id: string): Promise<FoodAdminDTO> {
    const food = await this.repo.findById(id);
    if (!food) throw new FoodNotFoundError();
    return toAdminDTO(food);
  }
}
