import type { IFoodRepository } from "@/src/domain/repositories/IFoodRepository";
import { FoodNotFoundError } from "@/src/domain/errors/foodErrors";
import type { FoodDTO } from "../../dtos/foods/foodDTO";
import { toDTO } from "./searchFoodsUseCase";

export class GetFoodUseCase {
  constructor(private readonly repo: IFoodRepository) {}

  async execute(id: string): Promise<FoodDTO> {
    const food = await this.repo.findById(id);
    if (!food) throw new FoodNotFoundError();
    return toDTO(food);
  }
}
