import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthUseCases } from "@/src/infrastructure/di/container";
import { loginSchema } from "@/src/application/validators/auth/authSchema";
import { handleApiError } from "../../_utils/errorHandler";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = loginSchema.parse(body);

    const { login } = await getAuthUseCases();
    const result = await login.execute({
      email: input.email,
      password: input.password,
    });

    if (!input.rememberMe) {
      const cookieStore = await cookies();
      const isProduction = process.env.NODE_ENV === "production";

      for (const cookie of cookieStore.getAll()) {
        if (cookie.name.startsWith("sb-")) {
          cookieStore.set(cookie.name, cookie.value, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            path: "/",
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
