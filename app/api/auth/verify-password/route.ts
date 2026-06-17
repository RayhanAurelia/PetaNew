import { NextRequest, NextResponse } from "next/server";
import { getAuthUseCases } from "@/src/infrastructure/di/container";
import { verifyPasswordSchema } from "@/src/application/validators/auth/authSchema";
import { handleApiError } from "../../_utils/errorHandler";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = verifyPasswordSchema.parse(body);

    const { verifyPassword } = await getAuthUseCases();
    const result = await verifyPassword.execute(input.currentPassword);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
