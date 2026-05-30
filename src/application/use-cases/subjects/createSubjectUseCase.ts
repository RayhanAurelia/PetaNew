import type { ISubjectRepository } from "@/src/domain/repositories/ISubjectRepository";
import type {
  CreateSubjectInputDTO,
  SubjectDTO,
} from "../../dtos/subjects/subjectDTO";
import { toDTO } from "./listSubjectsUseCase";

export class CreateSubjectUseCase {
  constructor(private readonly repo: ISubjectRepository) {}

  async execute(
    profileId: string,
    input: CreateSubjectInputDTO,
  ): Promise<SubjectDTO> {
    const subject = await this.repo.create(profileId, {
      name: input.name,
      gender: input.gender,
      birthDate: input.birthDate,
      relationship: input.relationship,
      heightCm: input.heightCm ?? null,
      activityLevel: input.activityLevel,
      isPrimary: input.isPrimary,
      avatarUrl: input.avatarUrl ?? null,
    });
    return toDTO(subject);
  }
}
