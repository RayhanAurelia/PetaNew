export type StuntingStatus = "normal" | "stunted" | "severely_stunted";
export type WastingStatus =
  | "normal"
  | "wasted"
  | "severely_wasted"
  | "overweight"
  | "obese";

export class GrowthLog {
  constructor(
    public readonly id: string,
    public readonly subjectId: string,
    public readonly weightKg: number,
    public readonly heightCm: number,
    public readonly bmi: number | null,
    public readonly heightForAge: number | null,
    public readonly weightForAge: number | null,
    public readonly weightForHeight: number | null,
    public readonly stuntingStatus: StuntingStatus | null,
    public readonly wastingStatus: WastingStatus | null,
    public readonly description: string | null,
    public readonly recordedAt: string, // YYYY-MM-DD
    public readonly createdAt: Date,
  ) {}
}
