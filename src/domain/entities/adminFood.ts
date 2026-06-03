import type { FoodCategory } from "./food";

/**
 * Representasi makanan untuk panel admin — mencakup metadata yang tidak
 * dibutuhkan tampilan publik (verifikasi, timestamp). `source` sengaja
 * dibiarkan string agar selaras dengan enum DB (manual/usda/fatsecret/...).
 */
export class AdminFood {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly brand: string | null,
    public readonly category: FoodCategory,
    public readonly description: string | null,
    public readonly imageUrl: string | null,
    public readonly caloriesPer100g: number,
    public readonly proteinPer100g: number,
    public readonly carbsPer100g: number,
    public readonly fatPer100g: number,
    public readonly fiberPer100g: number | null,
    public readonly source: string,
    public readonly externalId: string | null,
    public readonly isVerified: boolean,
    public readonly verifiedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
