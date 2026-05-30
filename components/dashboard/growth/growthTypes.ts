export type StuntingStatus = "normal" | "stunted" | "severely_stunted";
export type WastingStatus =
  | "normal"
  | "wasted"
  | "severely_wasted"
  | "overweight"
  | "obese";

export interface GrowthLogDTO {
  id: string;
  subjectId: string;
  weightKg: number;
  heightCm: number;
  bmi: number | null;
  heightForAge: number | null;
  weightForAge: number | null;
  weightForHeight: number | null;
  stuntingStatus: StuntingStatus | null;
  wastingStatus: WastingStatus | null;
  description: string | null;
  recordedAt: string;
  createdAt: string;
}

export const STUNTING_STATUS_LABEL: Record<StuntingStatus, string> = {
  normal: "Normal",
  stunted: "Stunted",
  severely_stunted: "Severely Stunted",
};

export const STUNTING_STATUS_STYLE: Record<StuntingStatus, string> = {
  normal: "bg-brand-soft text-brand-primary ring-brand-primary/20",
  stunted: "bg-amber-50 text-amber-700 ring-amber-200",
  severely_stunted: "bg-red-50 text-red-700 ring-red-200",
};

export function formatDateID(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShortID(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
