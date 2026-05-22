import type { IAuthRepository } from "@/src/domain/repositories/IAuthRepository";
import type {
  ResetPasswordInputDTO,
  ResetPasswordOutputDTO,
} from "@/src/application/dtos/auth/resetPasswordDTO";

export class UpdatePasswordUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(
    input: ResetPasswordInputDTO,
  ): Promise<ResetPasswordOutputDTO> {
    await this.authRepo.updatePassword(input.password);
    return { message: "Password berhasil diubah." };
  }
}