import type { AdminFood } from "../entities/adminFood";
import type { FoodCategory } from "../entities/food";

export type FoodVerifiedFilter = "all" | "verified" | "unverified";

export interface AdminListFoodsOptions {
  search?: string;
  category?: FoodCategory;
  verified?: FoodVerifiedFilter;
  page?: number;
  pageSize?: number;
}

export interface AdminListFoodsResult {
  items: AdminFood[];
  total: number;
  page: number;
  pageSize: number;
}

/** Field yang ditulis saat membuat makanan baru (oleh admin, source = manual). */
export interface CreateFoodInput {
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
  isVerified: boolean;
  verifiedBy: string | null;
  verifiedAt: Date | null;
  createdBy: string | null;
}

/** Field yang dapat diperbarui (partial dari CreateFoodInput). */
export type UpdateFoodInput = Partial<CreateFoodInput>;

export interface IFoodAdminRepository {
  listAll(options: AdminListFoodsOptions): Promise<AdminListFoodsResult>;
  findById(id: string): Promise<AdminFood | null>;
  create(input: CreateFoodInput): Promise<AdminFood>;
  update(id: string, input: UpdateFoodInput): Promise<AdminFood>;
  /** Soft delete — set `deleted_at`. */
  softDelete(id: string): Promise<void>;
}
