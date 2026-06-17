import type { IAuthRepository } from "@/src/domain/repositories/IAuthRepository";
import {
  InvalidCurrentPasswordError,
  UserNotFoundError,
} from "@/src/domain/errors/authErrors";

/**
 * Verifikasi password user yang sedang login — dipakai sebagai "gerbang" di
 * halaman profil sebelum field password baru dibuka. Melempar
 * `InvalidCurrentPasswordError` bila salah. Tidak mengubah apa pun.
 */
export class VerifyPasswordUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(currentPassword: string): Promise<{ valid: true }> {
    const user = await this.authRepo.getCurrentUser();
    if (!user) throw new UserNotFoundError();

    const valid = await this.authRepo.verifyPassword(
      user.email,
      currentPassword,
    );
    if (!valid) throw new InvalidCurrentPasswordError();

    return { valid: true };
  }
}
