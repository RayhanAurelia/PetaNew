import type { IAuthRepository } from "@/src/domain/repositories/IAuthRepository";

export class ExchangeAuthCodeUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(code: string): Promise<void> {
    await this.authRepo.exchangeCodeForSession(code);
  }
}