import type {
  IFoodAdminRepository,
  UpdateFoodInput,
} from "@/src/domain/repositories/IFoodAdminRepository";
import { FoodNotFoundError } from "@/src/domain/errors/foodErrors";
import type { FoodAdminDTO } from "../../dtos/foods/foodAdminDTO";
import type { UpdateFoodInputDTO } from "../../validators/foods/adminFoodSchema";
import { toAdminDTO } from "./foodAdminMapper";

export class UpdateFoodUseCase {
  constructor(private readonly repo: IFoodAdminRepository) {}

  async execute(
    id: string,
    input: UpdateFoodInputDTO,
    adminId: string,
  ): Promise<FoodAdminDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new FoodNotFoundError();

    const patch: UpdateFoodInput = {};
    if (input.name !== undefined) patch.name = input.name;
    if (input.brand !== undefined) patch.brand = input.brand;
    if (input.category !== undefined) patch.category = input.category;
    if (input.description !== undefined) patch.description = input.description;
    if (input.imageUrl !== undefined) patch.imageUrl = input.imageUrl;
    if (input.caloriesPer100g !== undefined)
      patch.caloriesPer100g = input.caloriesPer100g;
    if (input.proteinPer100g !== undefined)
      patch.proteinPer100g = input.proteinPer100g;
    if (input.carbsPer100g !== undefined)
      patch.carbsPer100g = input.carbsPer100g;
    if (input.fatPer100g !== undefined) patch.fatPer100g = input.fatPer100g;
    if (input.fiberPer100g !== undefined)
      patch.fiberPer100g = input.fiberPer100g;

    // Hanya sentuh field verifikasi bila statusnya benar-benar berubah, supaya
    // verified_at tidak ter-reset setiap kali edit biasa. Penuhi constraint DB.
    if (input.isVerified !== undefined && input.isVerified !== existing.isVerified) {
      patch.isVerified = input.isVerified;
      patch.verifiedBy = input.isVerified ? adminId : null;
      patch.verifiedAt = input.isVerified ? new Date() : null;
    }

    const updated = await this.repo.update(id, patch);
    return toAdminDTO(updated);
  }
}
