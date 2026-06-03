import { NextRequest, NextResponse } from "next/server";
import { getNutritionLogUseCases } from "@/src/infrastructure/di/container";
import { listNutritionLogsQuerySchema } from "@/src/application/validators/nutrition/nutritionLogSchema";
import { handleApiError } from "../../../../_utils/errorHandler";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const query = listNutritionLogsQuerySchema.parse({
      date: url.searchParams.get("date") ?? todayISO(),
    });

    const { getCurrentUser, getDailySummary } = await getNutritionLogUseCases();
    const user = await getCurrentUser.execute();
    const summary = await getDailySummary.execute(user.id, id, query.date);
    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    return handleApiError(error);
  }
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
