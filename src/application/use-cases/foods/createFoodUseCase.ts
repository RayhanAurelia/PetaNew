import type { IFoodAdminRepository } from "@/src/domain/repositories/IFoodAdminRepository";
import type { FoodAdminDTO } from "../../dtos/foods/foodAdminDTO";
import type { CreateFoodInputDTO } from "../../validators/foods/adminFoodSchema";
import { toAdminDTO } from "./foodAdminMapper";

export class CreateFoodUseCase {
  constructor(private readonly repo: IFoodAdminRepository) {}

  /** @param adminId id profil admin pembuat (dipakai untuk created_by & verified_by). */
  async execute(
    input: CreateFoodInputDTO,
    adminId: string,
  ): Promise<FoodAdminDTO> {
    const isVerified = input.isVerified ?? false;
    const created = await this.repo.create({
      name: input.name,
      brand: input.brand ?? null,
      category: input.category ?? "other",
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      caloriesPer100g: input.caloriesPer100g,
      proteinPer100g: input.proteinPer100g ?? 0,
      carbsPer100g: input.carbsPer100g ?? 0,
      fatPer100g: input.fatPer100g ?? 0,
      fiberPer100g: input.fiberPer100g ?? null,
      isVerified,
      // Constraint DB: verified=true wajib verified_by & verified_at; false → null.
      verifiedBy: isVerified ? adminId : null,
      verifiedAt: isVerified ? new Date() : null,
      createdBy: adminId,
    });
    return toAdminDTO(created);
  }
}
