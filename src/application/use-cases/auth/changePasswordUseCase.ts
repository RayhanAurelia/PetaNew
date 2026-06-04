import type { IAuthRepository } from "@/src/domain/repositories/IAuthRepository";
import {
  InvalidCurrentPasswordError,
  UserNotFoundError,
} from "@/src/domain/errors/authErrors";

export interface ChangePasswordInputDTO {
  currentPassword: string;
  newPassword: string;
}

/**
 * Ganti password user yang sedang login. Wajib memverifikasi password lama
 * terlebih dahulu (re-autentikasi) sebelum menetapkan password baru.
 */
export class ChangePasswordUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(input: ChangePasswordInputDTO): Promise<{ message: string }> {
    const user = await this.authRepo.getCurrentUser();
    if (!user) throw new UserNotFoundError();

    const valid = await this.authRepo.verifyPassword(
      user.email,
      input.currentPassword,
    );
    if (!valid) throw new InvalidCurrentPasswordError();

    await this.authRepo.updatePassword(input.newPassword);
    return { message: "Password berhasil diubah." };
  }
}
