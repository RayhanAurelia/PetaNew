import type { IAuthRepository } from "@/src/domain/repositories/IAuthRepository";
import type { LoginInputDTO } from "../../dtos/auth/loginDTO";
import type { RegisterOutputDTO } from "../../dtos/auth/registerDTO";

export class LoginUserUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(input: LoginInputDTO): Promise<RegisterOutputDTO> {
    const result = await this.authRepo.login(input.email, input.password);

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        role: result.user.role,
      },
      session: {
        accessToken: result.session.accessToken,
        expiresAt: result.session.expiresAt,
      },
    };
  }
}
