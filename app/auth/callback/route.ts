import { NextRequest, NextResponse } from "next/server";
import { getAuthUseCases } from "@/src/infrastructure/di/container";

/**
 * Callback handler untuk PKCE auth flow Supabase.
 *
 * Dipanggil setelah user klik link di email (reset password, signup
 * confirmation, magic link). Tukar `code` jadi session di cookie,
 * lalu redirect ke halaman tujuan (`next` parameter).
 *
 * Penting: HARUS di route handler (bukan server component) supaya
 * cookies bisa di-set. Di Next.js 16, Server Components TIDAK BISA
 * mutate cookies — hanya Route Handlers, Server Actions, & Middleware.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") ?? "/dashboard";

  // Validasi next URL → cuma terima path relatif (cegah open-redirect)
  const safeNext = next.startsWith("/") ? next : "/dashboard";

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", req.url),
    );
  }

  try {
    const { exchangeAuthCode } = await getAuthUseCases();
    await exchangeAuthCode.execute(code);
  } catch {
    return NextResponse.redirect(
      new URL("/login?error=invalid_or_expired", req.url),
    );
  }

  // Cookies sudah ke-set (route handler bisa mutate cookies).
  // Redirect ke tujuan dengan session aktif.
  return NextResponse.redirect(new URL(safeNext, req.url));
}