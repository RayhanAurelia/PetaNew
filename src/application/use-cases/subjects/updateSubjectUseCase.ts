import type { ISubjectRepository } from "@/src/domain/repositories/ISubjectRepository";
import {
  SubjectNotFoundError,
  SubjectPermissionDeniedError,
} from "@/src/domain/errors/subjectErrors";
import type {
  SubjectDTO,
  UpdateSubjectInputDTO,
} from "../../dtos/subjects/subjectDTO";
import { toDTO } from "./listSubjectsUseCase";

export class UpdateSubjectUseCase {
  constructor(private readonly repo: ISubjectRepository) {}

  async execute(
    profileId: string,
    id: string,
    input: UpdateSubjectInputDTO,
  ): Promise<SubjectDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new SubjectNotFoundError();
    if (existing.profileId !== profileId) {
      throw new SubjectPermissionDeniedError();
    }

    const updated = await this.repo.update(id, input);
    return toDTO(updated);
  }
}
