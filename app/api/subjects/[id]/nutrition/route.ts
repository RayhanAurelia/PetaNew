import { NextRequest, NextResponse } from "next/server";
import { getNutritionLogUseCases } from "@/src/infrastructure/di/container";
import {
  createNutritionLogSchema,
  listNutritionLogsQuerySchema,
} from "@/src/application/validators/nutrition/nutritionLogSchema";
import { handleApiError } from "../../../_utils/errorHandler";

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

    const { getCurrentUser, listNutritionLogs } =
      await getNutritionLogUseCases();
    const user = await getCurrentUser.execute();
    const logs = await listNutritionLogs.execute(user.id, id, query.date);
    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const input = createNutritionLogSchema.parse(body);

    const { getCurrentUser, createNutritionLog } =
      await getNutritionLogUseCases();
    const user = await getCurrentUser.execute();
    const log = await createNutritionLog.execute(user.id, id, input);
    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
