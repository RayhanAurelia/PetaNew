export type BmiCategory =
  | "underweight"
  | "normal"
  | "overweight"
  | "obese_1"
  | "obese_2"
  | "unknown";

export type BmiTone = "normal" | "warning" | "danger" | "neutral";

export interface BmiClassification {
  category: BmiCategory;
  label: string;
  description: string;
  tone: BmiTone;
  approximate: boolean; // true untuk balita/anak — butuh Z-score WHO untuk akurat
}

const UNKNOWN: BmiClassification = {
  category: "unknown",
  label: "—",
  description: "BMI belum tersedia",
  tone: "neutral",
  approximate: false,
};

/**
 * Klasifikasi BMI berdasarkan umur:
 * - Dewasa (≥19 tahun): standar WHO Asia (definitif).
 * - Balita & anak/remaja (<19): perkiraan; idealnya pakai WHO BMI-for-age Z-score
 *   yang membutuhkan tabel LMS referensi (out-of-scope MVP saat ini).
 */
export function classifyBmi(
  bmi: number | null | undefined,
  ageYears: number,
): BmiClassification {
  if (bmi == null || Number.isNaN(bmi)) return UNKNOWN;

  // Dewasa: cutoff WHO Asia-Pacific
  if (ageYears >= 19) {
    if (bmi < 18.5)
      return {
        category: "underweight",
        label: "Kekurangan Berat",
        description: "Underweight (BMI < 18.5)",
        tone: "warning",
        approximate: false,
      };
    if (bmi < 23)
      return {
        category: "normal",
        label: "Normal",
        description: "Berat ideal (BMI 18.5–22.9)",
        tone: "normal",
        approximate: false,
      };
    if (bmi < 25)
      return {
        category: "overweight",
        label: "Kelebihan Berat",
        description: "Overweight (BMI 23–24.9)",
        tone: "warning",
        approximate: false,
      };
    if (bmi < 30)
      return {
        category: "obese_1",
        label: "Obesitas I",
        description: "Obesitas tingkat 1 (BMI 25–29.9)",
        tone: "danger",
        approximate: false,
      };
    return {
      category: "obese_2",
      label: "Obesitas II",
      description: "Obesitas tingkat 2 (BMI ≥ 30)",
      tone: "danger",
      approximate: false,
    };
  }

  // Anak/Remaja (5–18): perkiraan kasar dari BMI median by-age WHO
  if (ageYears >= 5) {
    if (bmi < 14)
      return {
        category: "underweight",
        label: "Kurus (perkiraan)",
        description: "Perkiraan kurus. Perlu Z-score WHO BMI-for-age untuk akurat.",
        tone: "warning",
        approximate: true,
      };
    if (bmi < 20)
      return {
        category: "normal",
        label: "Normal (perkiraan)",
        description:
          "Perkiraan normal. Perlu HAZ/WAZ Z-score WHO untuk diagnostik.",
        tone: "normal",
        approximate: true,
      };
    if (bmi < 25)
      return {
        category: "overweight",
        label: "Kelebihan (perkiraan)",
        description: "Perlu Z-score WHO untuk konfirmasi.",
        tone: "warning",
        approximate: true,
      };
    return {
      category: "obese_1",
      label: "Obesitas (perkiraan)",
      description: "Perlu Z-score WHO untuk konfirmasi.",
      tone: "danger",
      approximate: true,
    };
  }

  // Balita (<5): BMI kurang reliable, butuh WHO BMI-for-age
  if (bmi < 14)
    return {
      category: "underweight",
      label: "Perlu Perhatian",
      description: "BMI rendah. Perlu HAZ/WAZ untuk indikasi stunting/wasting.",
      tone: "warning",
      approximate: true,
    };
  if (bmi < 18)
    return {
      category: "normal",
      label: "Normal (perkiraan)",
      description: "Perlu Z-score WHO untuk akurat.",
      tone: "normal",
      approximate: true,
    };
  return {
    category: "overweight",
    label: "BMI Tinggi",
    description: "BMI tinggi untuk balita. Perlu HAZ/WAZ untuk konfirmasi.",
    tone: "warning",
    approximate: true,
  };
}

export const BMI_TONE_STYLE: Record<BmiTone, string> = {
  normal: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  neutral: "bg-slate-100 text-slate-600 ring-slate-200",
};
