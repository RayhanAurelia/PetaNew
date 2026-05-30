"use client";

import { Activity, AlertTriangle, Ruler, Save, Scale } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import type { GrowthLogDTO } from "./growthTypes";

interface AddGrowthLogModalProps {
  open: boolean;
  subjectId: string | null;
  subjectName?: string;
  onClose: () => void;
  onSaved: (log: GrowthLogDTO) => void;
}

interface ApiOk<T> {
  success: true;
  data: T;
}
interface ApiErr {
  success: false;
  error: { code: string; message: string; details?: Record<string, string[]> };
}
type ApiResponse<T> = ApiOk<T> | ApiErr;

export function AddGrowthLogModal({
  open,
  subjectId,
  subjectName,
  onClose,
  onSaved,
}: AddGrowthLogModalProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [recordedAt, setRecordedAt] = useState(today);
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setWeight("");
    setHeight("");
    setRecordedAt(today);
    setDescription("");
    setErrors({});
    setServerError(null);
    setSubmitting(false);
  }, [open, today]);

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    const w = parseFloat(weight);
    const h = parseFloat(height);

    if (!weight || Number.isNaN(w) || w <= 0 || w >= 500) {
      e.weightKg = "Berat harus antara 0–500 kg.";
    }
    if (!height || Number.isNaN(h) || h <= 0 || h >= 300) {
      e.heightCm = "Tinggi harus antara 0–300 cm.";
    }
    if (!recordedAt) {
      e.recordedAt = "Tanggal wajib diisi.";
    } else {
      const r = new Date(recordedAt);
      if (Number.isNaN(r.getTime())) {
        e.recordedAt = "Tanggal tidak valid.";
      } else if (r > new Date()) {
        e.recordedAt = "Tanggal tidak boleh di masa depan.";
      }
    }
    if (description.length > 500) {
      e.description = "Catatan maksimal 500 karakter.";
    }
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!subjectId) return;

    const e = validate();
    setErrors(e);
    setServerError(null);
    if (Object.keys(e).length > 0) return;

    const payload = {
      weightKg: parseFloat(weight),
      heightCm: parseFloat(height),
      recordedAt,
      description: description.trim() || null,
    };

    setSubmitting(true);
    try {
      const res = await fetch(`/api/subjects/${subjectId}/growth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json: ApiResponse<GrowthLogDTO> = await res.json();

      if (!json.success) {
        if (json.error.details) {
          const fe: Record<string, string> = {};
          for (const [k, v] of Object.entries(json.error.details)) {
            if (v && v[0]) fe[k] = v[0];
          }
          setErrors(fe);
        }
        setServerError(json.error.message);
        return;
      }

      onSaved(json.data);
      onClose();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Gagal menyimpan pengukuran",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Live BMI preview
  const wNum = parseFloat(weight);
  const hNum = parseFloat(height);
  const previewBmi =
    !Number.isNaN(wNum) && !Number.isNaN(hNum) && hNum > 0
      ? wNum / ((hNum / 100) * (hNum / 100))
      : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Catat Pengukuran"
      description={
        subjectName
          ? `Catat berat & tinggi untuk ${subjectName}`
          : "Catat berat & tinggi terbaru subjek"
      }
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="submit"
            form="growth-form"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {submitting ? "Menyimpan..." : "Simpan Pengukuran"}
          </button>
        </>
      }
    >
      <form
        id="growth-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-5"
        noValidate
      >
        {serverError && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <Field
          label="Tanggal Pengukuran"
          required
          error={errors.recordedAt}
        >
          <input
            type="date"
            value={recordedAt}
            onChange={(e) => setRecordedAt(e.target.value)}
            max={today}
            className={inputClass(errors.recordedAt)}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Berat (kg)"
            required
            error={errors.weightKg}
            icon={<Scale className="h-4 w-4" />}
          >
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              max="499"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="11.2"
              className={inputClass(errors.weightKg, true)}
              autoFocus
            />
          </Field>

          <Field
            label="Tinggi (cm)"
            required
            error={errors.heightCm}
            icon={<Ruler className="h-4 w-4" />}
          >
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              max="299"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="82.0"
              className={inputClass(errors.heightCm, true)}
            />
          </Field>
        </div>

        {/* BMI preview */}
        <div className="flex items-center justify-between rounded-2xl border border-brand-primary/20 bg-brand-soft px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-primary">
            <Activity className="h-4 w-4" />
            Estimasi BMI
          </div>
          <span className="text-lg font-bold tabular-nums text-brand-primary">
            {previewBmi == null ? "—" : previewBmi.toFixed(1)}
          </span>
        </div>

        <Field
          label="Catatan (opsional)"
          error={errors.description}
          hint="Contoh: setelah Posyandu, alat baru, dll."
        >
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            placeholder="Catatan tambahan..."
            className={inputClass(errors.description)}
          />
        </Field>
      </form>
    </Modal>
  );
}

function Field({
  label,
  children,
  required = false,
  hint,
  error,
  icon,
}: {
  label?: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
          {icon && <span className="text-brand-primary">{icon}</span>}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1 inline-flex items-start gap-1 text-xs font-medium text-red-600">
          <AlertTriangle className="mt-0.5 h-3 w-3" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

function inputClass(error?: string, tabular = false): string {
  return `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
    tabular ? "tabular-nums" : ""
  } ${
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-200"
      : "border-slate-200 focus:border-brand-primary focus:ring-brand-primary/20"
  }`;
}
