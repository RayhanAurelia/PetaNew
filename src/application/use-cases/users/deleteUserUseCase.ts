import type { IUserAdminRepository } from "@/src/domain/repositories/IUserAdminRepository";
import {
  AdminUserNotFoundError,
  CannotModifySelfError,
} from "@/src/domain/errors/userAdminErrors";

export class DeleteUserUseCase {
  constructor(private readonly repo: IUserAdminRepository) {}

  async execute(id: string, adminId: string): Promise<void> {
    if (id === adminId) {
      throw new CannotModifySelfError(
        "Anda tidak dapat menghapus akun sendiri",
      );
    }
    const existing = await this.repo.getById(id);
    if (!existing) throw new AdminUserNotFoundError();
    await this.repo.delete(id);
  }
}
