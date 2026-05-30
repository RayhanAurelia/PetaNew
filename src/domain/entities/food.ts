export type FoodCategory =
  | "staple"
  | "protein_animal"
  | "protein_plant"
  | "vegetable"
  | "fruit"
  | "dairy"
  | "snack"
  | "beverage"
  | "other";

export type FoodSource = "manual" | "openfoodfacts" | "usda";

export class Food {
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
    public readonly source: FoodSource,
    public readonly externalId: string | null,
    public readonly isVerified: boolean,
  ) {}
}
