import type { IFoodAdminRepository } from "@/src/domain/repositories/IFoodAdminRepository";
import { FoodNotFoundError } from "@/src/domain/errors/foodErrors";

export class DeleteFoodUseCase {
  constructor(private readonly repo: IFoodAdminRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new FoodNotFoundError();
    await this.repo.softDelete(id);
  }
}
