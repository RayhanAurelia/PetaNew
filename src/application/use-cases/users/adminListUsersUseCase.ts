import type {
  AdminListUsersOptions,
  IUserAdminRepository,
} from "@/src/domain/repositories/IUserAdminRepository";
import type { ListAdminUsersOutputDTO } from "../../dtos/users/adminUserDTO";
import { toAdminUserDTO } from "./userAdminMapper";

export class AdminListUsersUseCase {
  constructor(private readonly repo: IUserAdminRepository) {}

  async execute(
    options: AdminListUsersOptions,
  ): Promise<ListAdminUsersOutputDTO> {
    const items = await this.repo.list(options);
    return { items: items.map(toAdminUserDTO), total: items.length };
  }
}
