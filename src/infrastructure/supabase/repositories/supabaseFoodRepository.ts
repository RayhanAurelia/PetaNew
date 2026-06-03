import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminFood } from "@/src/domain/entities/adminFood";
import type {
  AdminListFoodsOptions,
  AdminListFoodsResult,
  CreateFoodInput,
  IFoodAdminRepository,
  UpdateFoodInput,
} from "@/src/domain/repositories/IFoodAdminRepository";
import {
  FoodNotFoundError,
  FoodOperationFailedError,
} from "@/src/domain/errors/foodErrors";
import {
  FoodAdminMapper,
  type FoodAdminRow,
} from "../../mappers/foodAdminMapper";

const TABLE = "food";

const SELECT_COLUMNS =
  "id, name, brand, category, description, image_url, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source, external_id, is_verified, verified_at, created_at, updated_at";

/**
 * Repository admin untuk tabel lokal `public.food`. Hanya menampilkan baris
 * yang belum di-soft-delete (`deleted_at IS NULL`). RLS membatasi tulis ke
 * admin saja sebagai lapis pertahanan terakhir.
 */
export class SupabaseFoodRepository implements IFoodAdminRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listAll(options: AdminListFoodsOptions): Promise<AdminListFoodsResult> {
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.client
      .from(TABLE)
      .select(SELECT_COLUMNS, { count: "exact" })
      .is("deleted_at", null);

    if (options.category) {
      query = query.eq("category", options.category);
    }
    if (options.verified === "verified") {
      query = query.eq("is_verified", true);
    } else if (options.verified === "unverified") {
      query = query.eq("is_verified", false);
    }
    if (options.search) {
      query = query.ilike("name_lower_case", `%${options.search.toLowerCase()}%`);
    }

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw new FoodOperationFailedError(error.message);

    const items = (data ?? []).map((r) =>
      FoodAdminMapper.toDomain(r as unknown as FoodAdminRow),
    );
    return { items, total: count ?? items.length, page, pageSize };
  }

  async findById(id: string): Promise<AdminFood | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select(SELECT_COLUMNS)
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw new FoodOperationFailedError(error.message);
    if (!data) return null;
    return FoodAdminMapper.toDomain(data as unknown as FoodAdminRow);
  }

  async create(input: CreateFoodInput): Promise<AdminFood> {
    const { data, error } = await this.client
      .from(TABLE)
      .insert({ ...toRow(input), source: "manual" })
      .select(SELECT_COLUMNS)
      .single();

    if (error) throw new FoodOperationFailedError(error.message);
    return FoodAdminMapper.toDomain(data as unknown as FoodAdminRow);
  }

  async update(id: string, input: UpdateFoodInput): Promise<AdminFood> {
    const { data, error } = await this.client
      .from(TABLE)
      .update({ ...toRow(input), updated_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null)
      .select(SELECT_COLUMNS)
      .maybeSingle();

    if (error) throw new FoodOperationFailedError(error.message);
    if (!data) throw new FoodNotFoundError();
    return FoodAdminMapper.toDomain(data as unknown as FoodAdminRow);
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.client
      .from(TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null);
    if (error) throw new FoodOperationFailedError(error.message);
  }
}

/** Map field domain (camelCase) → kolom tabel (snake_case), hanya yang terdefinisi. */
function toRow(
  input: CreateFoodInput | UpdateFoodInput,
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.brand !== undefined) row.brand = input.brand;
  if (input.category !== undefined) row.category = input.category;
  if (input.description !== undefined) row.description = input.description;
  if (input.imageUrl !== undefined) row.image_url = input.imageUrl;
  if (input.caloriesPer100g !== undefined)
    row.calories_per_100g = input.caloriesPer100g;
  if (input.proteinPer100g !== undefined)
    row.protein_per_100g = input.proteinPer100g;
  if (input.carbsPer100g !== undefined) row.carbs_per_100g = input.carbsPer100g;
  if (input.fatPer100g !== undefined) row.fat_per_100g = input.fatPer100g;
  if (input.fiberPer100g !== undefined) row.fiber_per_100g = input.fiberPer100g;
  if (input.isVerified !== undefined) row.is_verified = input.isVerified;
  if (input.verifiedBy !== undefined) row.verified_by = input.verifiedBy;
  if (input.verifiedAt !== undefined)
    row.verified_at = input.verifiedAt ? input.verifiedAt.toISOString() : null;
  if (input.createdBy !== undefined) row.created_by = input.createdBy;
  return row;
}
