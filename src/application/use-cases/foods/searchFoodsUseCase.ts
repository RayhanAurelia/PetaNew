import type { Food } from "@/src/domain/entities/food";
import type { IFoodRepository } from "@/src/domain/repositories/IFoodRepository";
import type {
  FoodDTO,
  SearchFoodsOutputDTO,
} from "../../dtos/foods/foodDTO";

export class SearchFoodsUseCase {
  constructor(private readonly repo: IFoodRepository) {}

  async execute(
    query: string,
    page: number,
    pageSize: number,
  ): Promise<SearchFoodsOutputDTO> {
    const result = await this.repo.search({ query, page, pageSize });
    return {
      items: result.items.map(toDTO),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }
}

export function toDTO(f: Food): FoodDTO {
  return {
    id: f.id,
    name: f.name,
    brand: f.brand,
    category: f.category,
    description: f.description,
    imageUrl: f.imageUrl,
    caloriesPer100g: f.caloriesPer100g,
    proteinPer100g: f.proteinPer100g,
    carbsPer100g: f.carbsPer100g,
    fatPer100g: f.fatPer100g,
    fiberPer100g: f.fiberPer100g,
    source: f.source,
    externalId: f.externalId,
    isVerified: f.isVerified,
  };
}
