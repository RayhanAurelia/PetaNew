import type { FoodCategory, FoodSource } from "@/src/domain/entities/food";

export interface FoodDTO {
  id: string;
  name: string;
  brand: string | null;
  category: FoodCategory;
  description: string | null;
  imageUrl: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number | null;
  source: FoodSource;
  externalId: string | null;
  isVerified: boolean;
}

export interface SearchFoodsOutputDTO {
  items: FoodDTO[];
  total: number;
  page: number;
  pageSize: number;
}
