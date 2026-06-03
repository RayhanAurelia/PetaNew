import { ForbiddenError } from "@/src/domain/errors/authErrors";
import type { GetCurrentUserUseCase } from "@/src/application/use-cases/auth/getCurrentUserUseCase";

/**
 * Pastikan request berasal dari user dengan role admin. Mengembalikan DTO user
 * bila valid; melempar `UserNotFoundError` (401) bila belum login atau
 * `ForbiddenError` (403) bila bukan admin. RLS Supabase tetap menjadi lapis
 * pertahanan terakhir di level database.
 */
export async function requireAdmin(getCurrentUser: GetCurrentUserUseCase) {
  const user = await getCurrentUser.execute();
  if (user.role !== "admin") {
    throw new ForbiddenError();
  }
  return user;
}
