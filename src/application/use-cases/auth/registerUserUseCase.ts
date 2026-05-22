import type { IAuthRepository } from "@/src/domain/repositories/IAuthRepository";
import type { RegisterInputDTO } from "../../dtos/auth/registerDTO";
import type { RegisterOutputDTO } from "../../dtos/auth/registerDTO";

export class RegisterUserUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(input: RegisterInputDTO): Promise<RegisterOutputDTO> {
    const result = await this.authRepo.register(
      input.email,
      input.password,
      input.fullName,
    );

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
