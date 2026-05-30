import type {
  Gender,
  Relationship,
  Subject,
} from "../entities/subject";

export interface CreateSubjectInput {
  name: string;
  gender: Gender;
  birthDate: string; // ISO YYYY-MM-DD
  relationship: Relationship;
  heightCm: number | null;
  activityLevel: number;
  isPrimary: boolean;
  avatarUrl?: string | null;
}

export interface UpdateSubjectInput {
  name?: string;
  gender?: Gender;
  birthDate?: string;
  relationship?: Relationship;
  heightCm?: number | null;
  activityLevel?: number;
  isPrimary?: boolean;
  avatarUrl?: string | null;
}

export interface ISubjectRepository {
  listByProfile(profileId: string): Promise<Subject[]>;
  findById(id: string): Promise<Subject | null>;
  create(profileId: string, input: CreateSubjectInput): Promise<Subject>;
  update(id: string, input: UpdateSubjectInput): Promise<Subject>;
  delete(id: string): Promise<void>;
}
