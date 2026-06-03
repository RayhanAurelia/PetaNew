import type { FoodCategory } from "@/src/domain/entities/food";

/** DTO lengkap makanan untuk panel admin (termasuk metadata verifikasi). */
export interface FoodAdminDTO {
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
  source: string;
  externalId: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListAdminFoodsOutputDTO {
  items: FoodAdminDTO[];
  total: number;
  page: number;
  pageSize: number;
}
