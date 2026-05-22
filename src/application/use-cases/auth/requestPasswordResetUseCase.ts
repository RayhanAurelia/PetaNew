import type { IAuthRepository } from "@/src/domain/repositories/IAuthRepository";
import type {
  ForgotPasswordInputDTO,
  ForgotPasswordOutputDTO,
} from "@/src/application/dtos/auth/forgotPasswordDTO";

export class RequestPasswordResetUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(
    input: ForgotPasswordInputDTO,
  ): Promise<ForgotPasswordOutputDTO> {
    await this.authRepo.requestPasswordReset(input.email, input.redirectUrl);
    return {
      message:
        "Jika email terdaftar, link reset password telah dikirim ke inbox kamu.",
    };
  }
}