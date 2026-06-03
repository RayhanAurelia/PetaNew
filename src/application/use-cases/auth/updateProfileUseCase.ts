import type { IAuthRepository } from "@/src/domain/repositories/IAuthRepository";

export interface UpdateProfileInputDTO {
  fullName?: string;
  avatarUrl?: string | null;
}

export interface UpdateProfileOutputDTO {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: "user" | "admin";
}

export class UpdateProfileUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(input: UpdateProfileInputDTO): Promise<UpdateProfileOutputDTO> {
    const user = await this.authRepo.updateProfile({
      fullName: input.fullName,
      avatarUrl: input.avatarUrl,
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: user.role,
    };
  }
}
