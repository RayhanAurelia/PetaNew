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

export interface SearchFoodsResult {
  items: FoodDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export const CATEGORY_LABEL: Record<FoodCategory, string> = {
  staple: "Makanan Pokok",
  protein_animal: "Protein Hewani",
  protein_plant: "Protein Nabati",
  vegetable: "Sayuran",
  fruit: "Buah",
  dairy: "Susu & Olahan",
  snack: "Camilan",
  beverage: "Minuman",
  other: "Lainnya",
};

export const CATEGORY_COLOR: Record<FoodCategory, string> = {
  staple: "bg-amber-50 text-amber-700 ring-amber-200",
  protein_animal: "bg-red-50 text-red-700 ring-red-200",
  protein_plant: "bg-orange-50 text-orange-700 ring-orange-200",
  vegetable: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  fruit: "bg-pink-50 text-pink-700 ring-pink-200",
  dairy: "bg-blue-50 text-blue-700 ring-blue-200",
  snack: "bg-purple-50 text-purple-700 ring-purple-200",
  beverage: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  other: "bg-slate-100 text-slate-600 ring-slate-200",
};
