import type { ISubjectRepository } from "@/src/domain/repositories/ISubjectRepository";
import {
  SubjectNotFoundError,
  SubjectPermissionDeniedError,
} from "@/src/domain/errors/subjectErrors";

export class DeleteSubjectUseCase {
  constructor(private readonly repo: ISubjectRepository) {}

  async execute(profileId: string, id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new SubjectNotFoundError();
    if (existing.profileId !== profileId) {
      throw new SubjectPermissionDeniedError();
    }
    await this.repo.delete(id);
  }
}
