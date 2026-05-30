import { NextRequest, NextResponse } from "next/server";
import { getGrowthLogUseCases } from "@/src/infrastructure/di/container";
import { createGrowthLogSchema } from "@/src/application/validators/growthLogs/growthLogSchema";
import { handleApiError } from "../../../_utils/errorHandler";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { getCurrentUser, listGrowthLogs } = await getGrowthLogUseCases();
    const user = await getCurrentUser.execute();
    const logs = await listGrowthLogs.execute(user.id, id);
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
    const input = createGrowthLogSchema.parse(body);

    const { getCurrentUser, createGrowthLog } = await getGrowthLogUseCases();
    const user = await getCurrentUser.execute();
    const log = await createGrowthLog.execute(user.id, id, {
      ...input,
      description: input.description ?? null,
    });
    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
