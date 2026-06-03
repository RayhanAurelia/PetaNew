import { AdminFood } from "@/src/domain/entities/adminFood";
import type { FoodCategory } from "@/src/domain/entities/food";

export interface FoodAdminRow {
  id: string;
  name: string;
  brand: string | null;
  category: FoodCategory;
  description: string | null;
  image_url: string | null;
  calories_per_100g: number | string;
  protein_per_100g: number | string;
  carbs_per_100g: number | string;
  fat_per_100g: number | string;
  fiber_per_100g: number | string | null;
  source: string;
  external_id: string | null;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export class FoodAdminMapper {
  static toDomain(row: FoodAdminRow): AdminFood {
    return new AdminFood(
      row.id,
      row.name,
      row.brand,
      row.category,
      row.description,
      row.image_url,
      Number(row.calories_per_100g),
      Number(row.protein_per_100g),
      Number(row.carbs_per_100g),
      Number(row.fat_per_100g),
      row.fiber_per_100g == null ? null : Number(row.fiber_per_100g),
      row.source,
      row.external_id,
      row.is_verified,
      row.verified_at ? new Date(row.verified_at) : null,
      new Date(row.created_at),
      new Date(row.updated_at),
    );
  }
}
