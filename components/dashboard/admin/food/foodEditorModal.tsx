"use client";

import { AlertTriangle, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import type { FoodCategory } from "@/components/dashboard/foods/foodTypes";
import {
  type ApiResponse,
  CATEGORY_OPTIONS,
  type FoodAdminDTO,
} from "./adminFoodTypes";

type Mode = "create" | "edit";

interface FoodEditorModalProps {
  open: boolean;
  mode: Mode;
  food?: FoodAdminDTO | null;
  onClose: () => void;
  onSaved: (food: FoodAdminDTO) => void;
}

/** Helper: number → string untuk input, dengan "" untuk nilai kosong. */
function numStr(n: number | null | undefined): string {
  return n == null ? "" : String(n);
}

export function FoodEditorModal({
  open,
  mode,
  food,
  onClose,
  onSaved,
}: FoodEditorModalProps) {
  const isEdit = mode === "edit";

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<FoodCategory>("other");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [fiber, setFiber] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!open) return;
    if (isEdit && food) {
      setName(food.name);
      setBrand(food.brand ?? "");
      setCategory(food.category);
      setDescription(food.description ?? "");
      setImageUrl(food.imageUrl ?? "");
      setCalories(numStr(food.caloriesPer100g));
      setProtein(numStr(food.proteinPer100g));
      setCarbs(numStr(food.carbsPer100g));
      setFat(numStr(food.fatPer100g));
      setFiber(numStr(food.fiberPer100g));
      setIsVerified(food.isVerified);
    } else {
      setName("");
      setBrand("");
      setCategory("other");
      setDescription("");
      setImageUrl("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setFiber("");
      setIsVerified(false);
    }
    setServerError(null);
    setFieldErrors({});
    setSubmitting(false);
  }, [open, isEdit, food]);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setFieldErrors({});

    const payload: Record<string, unknown> = {
      name: name.trim(),
      brand: brand.trim() || null,
      category,
      description: description.trim() || null,
      imageUrl: imageUrl.trim() || null,
      caloriesPer100g: Number(calories),
      proteinPer100g: protein === "" ? 0 : Number(protein),
      carbsPer100g: carbs === "" ? 0 : Number(carbs),
      fatPer100g: fat === "" ? 0 : Number(fat),
      fiberPer100g: fiber === "" ? null : Number(fiber),
      isVerified,
    };

    try {
      const url = isEdit ? `/api/admin/foods/${food!.id}` : "/api/admin/foods";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json: ApiResponse<FoodAdminDTO> = await res.json();
      if (!json.success) {
        if (json.error.details) setFieldErrors(json.error.details);
        throw new Error(json.error.message);
      }
      onSaved(json.data);
      onClose();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Gagal menyimpan makanan");
    } finally {
      setSubmitting(false);
    }
  }

  const err = (field: string) => fieldErrors[field]?.[0];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? "Edit Makanan" : "Tambah Makanan"}
      description="Semua nilai gizi dihitung per 100 gram bahan."
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            type="submit"
            form="food-editor-form"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan"}
          </button>
        </>
      }
    >
      <form id="food-editor-form" onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{serverError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nama Makanan" error={err("name")} required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nasi Putih"
              className={inputClass(err("name"))}
              required
            />
          </Field>
          <Field label="Merek" error={err("brand")} hint="Opsional">
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="cth. Indofood"
              className={inputClass(err("brand"))}
            />
          </Field>
        </div>

        <Field label="Kategori" error={err("category")}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as FoodCategory)}
            className={inputClass(undefined)}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Kalori (kkal)" error={err("caloriesPer100g")} required>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="130"
              className={inputClass(err("caloriesPer100g"))}
              required
            />
          </Field>
          <Field label="Protein (g)" error={err("proteinPer100g")}>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="2.7"
              className={inputClass(err("proteinPer100g"))}
            />
          </Field>
          <Field label="Karbohidrat (g)" error={err("carbsPer100g")}>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              placeholder="28"
              className={inputClass(err("carbsPer100g"))}
            />
          </Field>
          <Field label="Lemak (g)" error={err("fatPer100g")}>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              placeholder="0.3"
              className={inputClass(err("fatPer100g"))}
            />
          </Field>
          <Field label="Serat (g)" error={err("fiberPer100g")} hint="Opsional">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              value={fiber}
              onChange={(e) => setFiber(e.target.value)}
              placeholder="0.4"
              className={inputClass(err("fiberPer100g"))}
            />
          </Field>
        </div>

        <Field
          label="URL Gambar"
          error={err("imageUrl")}
          hint="Tautan gambar makanan (opsional)."
        >
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass(err("imageUrl"))}
          />
        </Field>

        <Field label="Deskripsi" error={err("description")}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Catatan singkat tentang makanan ini..."
            className={inputClass(err("description"))}
          />
        </Field>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <input
            type="checkbox"
            checked={isVerified}
            onChange={(e) => setIsVerified(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
          />
          <span className="text-sm">
            <span className="font-semibold text-slate-900">
              Tandai terverifikasi
            </span>
            <span className="block text-xs text-slate-500">
              Data gizi sudah ditinjau dan akurat.
            </span>
          </span>
        </label>
      </form>
    </Modal>
  );
}

function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputClass(error?: string): string {
  return `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-slate-200 focus:border-brand-primary/40 focus:ring-brand-primary/15"
  }`;
}
