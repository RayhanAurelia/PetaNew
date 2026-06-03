import type { IUserAdminRepository } from "@/src/domain/repositories/IUserAdminRepository";
import {
  AdminUserNotFoundError,
  CannotModifySelfError,
} from "@/src/domain/errors/userAdminErrors";
import type { AdminUserDTO } from "../../dtos/users/adminUserDTO";
import type { UpdateUserInputDTO } from "../../validators/users/adminUserSchema";
import { toAdminUserDTO } from "./userAdminMapper";

export class UpdateUserUseCase {
  constructor(private readonly repo: IUserAdminRepository) {}

  /**
   * @param adminId id admin yang sedang login — dipakai untuk mencegah admin
   *   menurunkan role / menonaktifkan akunnya sendiri (anti foot-gun).
   */
  async execute(
    id: string,
    input: UpdateUserInputDTO,
    adminId: string,
  ): Promise<AdminUserDTO> {
    const existing = await this.repo.getById(id);
    if (!existing) throw new AdminUserNotFoundError();

    const isSelf = id === adminId;

    if (input.role !== undefined && input.role !== existing.role) {
      if (isSelf) {
        throw new CannotModifySelfError(
          "Anda tidak dapat mengubah role akun sendiri",
        );
      }
      await this.repo.updateRole(id, input.role);
    }

    if (input.isActive !== undefined && input.isActive !== existing.isActive) {
      if (isSelf && input.isActive === false) {
        throw new CannotModifySelfError(
          "Anda tidak dapat menonaktifkan akun sendiri",
        );
      }
      await this.repo.setActive(id, input.isActive);
    }

    const updated = await this.repo.getById(id);
    return toAdminUserDTO(updated ?? existing);
  }
}
