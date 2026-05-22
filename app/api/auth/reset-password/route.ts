import { NextRequest, NextResponse } from "next/server";
import { getAuthUseCases } from "@/src/infrastructure/di/container";
import { resetPasswordSchema } from "@/src/application/validators/auth/authSchema";
import { handleApiError } from "../../_utils/errorHandler";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = resetPasswordSchema.parse(body);

    const { updatePassword } = await getAuthUseCases();
    const result = await updatePassword.execute({ password: input.password });

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}