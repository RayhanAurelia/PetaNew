export type Gender = "male" | "female" | "other";

export type Relationship =
  | "self"
  | "child"
  | "wife"
  | "husband"
  | "parent"
  | "sibling"
  | "other";

export type LifeStage = "balita" | "anak" | "remaja" | "dewasa";

export type StuntingStatus = "normal" | "stunted" | "severely_stunted";

/** Snapshot pengukuran terakhir per subject (dari view `latest_growth`). */
export interface LatestGrowthSnapshotDTO {
  weightKg: number;
  heightCm: number;
  bmi: number | null;
  recordedAt: string;
  stuntingStatus: StuntingStatus | null;
}

/** Bentuk DTO yang dikirim API `/api/subjects`. */
export interface SubjectDTO {
  id: string;
  profileId: string;
  name: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  relationship: Relationship;
  heightCm: number | null;
  activityLevel: number;
  isPrimary: boolean;
  avatarUrl: string | null;
  lifeStage: LifeStage;
  ageYears: number;
  ageMonths: number;
  createdAt: string;
  updatedAt: string;
  latestGrowth: LatestGrowthSnapshotDTO | null;
}

export const RELATIONSHIP_LABEL: Record<Relationship, string> = {
  self: "Diri Sendiri",
  child: "Anak",
  wife: "Istri",
  husband: "Suami",
  parent: "Orang Tua",
  sibling: "Saudara",
  other: "Lainnya",
};

export const RELATIONSHIP_ORDER: Relationship[] = [
  "child",
  "self",
  "wife",
  "husband",
  "parent",
  "sibling",
  "other",
];

export const GENDER_LABEL: Record<Gender, string> = {
  male: "Laki-laki",
  female: "Perempuan",
  other: "Lainnya",
};

export const LIFE_STAGE_LABEL: Record<LifeStage, string> = {
  balita: "Balita",
  anak: "Anak",
  remaja: "Remaja",
  dewasa: "Dewasa",
};

/** Format umur menjadi "x tahun y bulan" untuk balita & anak, atau "x tahun". */
export function formatAge(ageYears: number, ageMonths: number): string {
  if (ageYears < 5) {
    const months = ageMonths - ageYears * 12;
    return `${ageYears} tahun ${Math.max(0, months)} bulan`;
  }
  return `${ageYears} tahun`;
}

/** Hitung tahap usia di sisi client (untuk preview form, tanpa server). */
export function previewLifeStage(birthDate: string): LifeStage | null {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--;
  if (years < 5) return "balita";
  if (years < 13) return "anak";
  if (years < 19) return "remaja";
  return "dewasa";
}

export function previewAgeYears(birthDate: string): number | null {
  const ls = previewLifeStage(birthDate);
  if (ls === null) return null;
  const birth = new Date(birthDate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--;
  return Math.max(0, years);
}
