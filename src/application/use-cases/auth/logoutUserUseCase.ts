import type { IAuthRepository } from "@/src/domain/repositories/IAuthRepository";

export class LogOutUserUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(): Promise<void> {
    await this.authRepo.logout();
  }
}
