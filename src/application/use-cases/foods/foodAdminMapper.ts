import type { AdminFood } from "@/src/domain/entities/adminFood";
import type { FoodAdminDTO } from "../../dtos/foods/foodAdminDTO";

export function toAdminDTO(f: AdminFood): FoodAdminDTO {
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
    verifiedAt: f.verifiedAt ? f.verifiedAt.toISOString() : null,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  };
}
