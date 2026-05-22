import type { IAuthRepository } from "@/src/domain/repositories/IAuthRepository";
import { UserNotFoundError } from "@/src/domain/errors/authErrors";
import type { UserRole } from "@/src/domain/entities/user";

export interface CurrentUserOutputDTO {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
  isAdmin: Boolean;
}

export class GetCurrentUserUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(): Promise<CurrentUserOutputDTO> {
    const user = await this.authRepo.getCurrentUser();
    if (!user) {
      throw new UserNotFoundError();
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isAdmin: user.isAdmin(),
    };
  }
}
