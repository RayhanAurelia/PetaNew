import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DailyNutritionSummary,
  NutritionLog,
} from "@/src/domain/entities/nutritionLog";
import type {
  CreateNutritionLogInput,
  INutritionLogRepository,
} from "@/src/domain/repositories/INutritionLogRepository";
import {
  InvalidNutritionLogDataError,
  NutritionLogOperationFailedError,
} from "@/src/domain/errors/nutritionLogErrors";
import {
  NutritionLogMapper,
  type DailyNutritionSummaryRow,
  type NutritionLogRow,
} from "../../mappers/nutritionLogMapper";

const TABLE = "nutrition_log";
const SUMMARY_VIEW = "daily_nutrition_summary";

export class SupabaseNutritionLogRepository implements INutritionLogRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listBySubjectAndDate(
    subjectId: string,
    date: string,
  ): Promise<NutritionLog[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("subject_id", subjectId)
      .eq("log_date", date)
      .order("logged_at", { ascending: true });

    if (error) throw new NutritionLogOperationFailedError(error.message);
    return (data ?? []).map((r) =>
      NutritionLogMapper.toDomain(r as NutritionLogRow),
    );
  }

  async findById(id: string): Promise<NutritionLog | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new NutritionLogOperationFailedError(error.message);
    if (!data) return null;
    return NutritionLogMapper.toDomain(data as NutritionLogRow);
  }

  async create(
    subjectId: string,
    input: CreateNutritionLogInput,
  ): Promise<NutritionLog> {
    const insertPayload: Record<string, unknown> = {
      subject_id: subjectId,
      food_id: input.foodId,
      food_name: input.foodName,
      serving_quantity: input.servingQuantity,
      serving_unit: input.servingUnit,
      calories: round(input.calories),
      protein: round(input.protein),
      carbs: round(input.carbs),
      fat: round(input.fat),
      meal: input.meal,
    };
    if (input.loggedAt) insertPayload.logged_at = input.loggedAt;

    const { data, error } = await this.client
      .from(TABLE)
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) mapDbError(error);
    if (!data) {
      throw new NutritionLogOperationFailedError(
        "Gagal membuat catatan konsumsi",
      );
    }
    return NutritionLogMapper.toDomain(data as NutritionLogRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from(TABLE).delete().eq("id", id);
    if (error) throw new NutritionLogOperationFailedError(error.message);
  }

  async getDailySummary(
    subjectId: string,
    date: string,
  ): Promise<DailyNutritionSummary | null> {
    const { data, error } = await this.client
      .from(SUMMARY_VIEW)
      .select("*")
      .eq("subject_id", subjectId)
      .eq("log_date", date)
      .maybeSingle();

    if (error) {
      // Fail-soft: kalau view tidak bisa diakses, return null supaya frontend
      // bisa compute summary dari list logs sendiri.
      console.warn(
        `[NutritionLogRepository] daily summary lookup failed: ${error.message}`,
      );
      return null;
    }
    if (!data) return null;
    return NutritionLogMapper.summaryToDomain(data as DailyNutritionSummaryRow);
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function mapDbError(error: { code?: string; message: string }): never {
  const msg = error.message.toLowerCase();
  if (error.code === "23514" || msg.includes("check constraint")) {
    if (msg.includes("check_nutrition_log_calories"))
      throw new InvalidNutritionLogDataError("Kalori tidak boleh negatif");
    if (msg.includes("check_nutrition_log_protein"))
      throw new InvalidNutritionLogDataError("Protein tidak boleh negatif");
    if (msg.includes("check_nutrition_log_carbs"))
      throw new InvalidNutritionLogDataError("Karbo tidak boleh negatif");
    if (msg.includes("check_nutrition_log_fat"))
      throw new InvalidNutritionLogDataError("Lemak tidak boleh negatif");
    if (msg.includes("check_serving_quantity"))
      throw new InvalidNutritionLogDataError("Porsi harus lebih besar dari 0");
    throw new InvalidNutritionLogDataError(error.message);
  }
  throw new NutritionLogOperationFailedError(error.message);
}
