import {
  CATEGORY_LABEL,
  type FoodCategory,
} from "@/components/dashboard/foods/foodTypes";

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

export interface ListAdminFoodsResult {
  items: FoodAdminDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export type VerifiedFilter = "all" | "verified" | "unverified";

export const VERIFIED_FILTERS: { value: VerifiedFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "verified", label: "Terverifikasi" },
  { value: "unverified", label: "Belum" },
];

/** Opsi kategori untuk dropdown form & filter (urut sesuai label). */
export const CATEGORY_OPTIONS = (
  Object.keys(CATEGORY_LABEL) as FoodCategory[]
).map((value) => ({ value, label: CATEGORY_LABEL[value] }));

export interface ApiOk<T> {
  success: true;
  data: T;
}
export interface ApiErr {
  success: false;
  error: { code: string; message: string; details?: Record<string, string[]> };
}
export type ApiResponse<T> = ApiOk<T> | ApiErr;

export function formatDateID(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
