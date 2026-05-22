import type { UserRole } from "@/src/domain/entities/user";

export interface RegisterInputDTO {
  email: string;
  password: string;
  fullName: string;
}

export interface RegisterOutputDTO {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
  };
  session: {
    accessToken: string;
    expiresAt: Date;
  };
}
