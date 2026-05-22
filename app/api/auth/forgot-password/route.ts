import { NextRequest, NextResponse } from "next/server";
import { getAuthUseCases } from "@/src/infrastructure/di/container";
import { forgotPasswordSchema } from "@/src/application/validators/auth/authSchema";
import { handleApiError } from "../../_utils/errorHandler";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = forgotPasswordSchema.parse(body);

    const origin = req.nextUrl.origin;
    // Email link akan ke /auth/callback yang exchange code & set cookies,
    // lalu redirect ke /reset-password dengan session aktif.
    const redirectUrl = `${origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`;

    const { requestPasswordReset } = await getAuthUseCases();
    const result = await requestPasswordReset.execute({
      email: input.email,
      redirectUrl,
    });

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}