import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/src/domain/errors/authErrors";

function flattenZodIssues(err: ZodError): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const path = issue.path.length > 0 ? issue.path.join(".") : "_root";
    if (!result[path]) result[path] = [];
    result[path].push(issue.message);
  }
  return result;
}

export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Input tidak valid",
          details: flattenZodIssues(err),
        },
      },
      { status: 400 },
    );
  }

  if (err instanceof AuthError) {
    const statusMap: Record<string, number> = {
      INVALID_CREDENTIALS: 401,
      USER_NOT_FOUND: 401,
      EMAIL_EXISTS: 409,
      EMAIL_ALREADY_IN_USE: 409,
      WEAK_PASSWORD: 400,
      PROFILE_NOT_FOUND: 500,
      EMAIL_VERIFICATION_REQUIRED: 202,
      INVALID_RESET_TOKEN: 400,
      PASSWORD_RESET_FAILED: 500,
      PASSWORD_UPDATE_FAILED: 500,
      RATE_LIMIT_EXCEEDED: 429,
    };
    const status = statusMap[err.code] ?? 400;

    return NextResponse.json(
      {
        success: false,
        error: { code: err.code, message: err.message },
      },
      { status },
    );
  }

  console.error("[API] Unexpected error:", err);
  return NextResponse.json(
    {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan" },
    },
    { status: 500 },
  );
}
