"use client";

import { AlertTriangle, ChevronDown, Save, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import {
  GENDER_LABEL,
  previewAgeYears,
  previewLifeStage,
  RELATIONSHIP_LABEL,
  RELATIONSHIP_ORDER,
  type Gender,
  type Relationship,
  type SubjectDTO,
} from "./subjectTypes";

type Mode = "create" | "edit";

interface AddOrEditSubjectModalProps {
  open: boolean;
  mode: Mode;
  subject?: SubjectDTO | null;
  onClose: () => void;
  onSaved: (subject: SubjectDTO) => void;
  hasPrimarySelf: boolean;
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

export function AddOrEditSubjectModal({
  open,
  mode,
  subject,
  onClose,
  onSaved,
  hasPrimarySelf,
}: AddOrEditSubjectModalProps) {
  const isEdit = mode === "edit";

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState<Relationship>("child");
  const [gender, setGender] = useState<Gender>("female");
  const [birthDate, setBirthDate] = useState("");
  const [activityLevel, setActivityLevel] = useState(1.55);
  const [isPrimary, setIsPrimary] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Sync form ketika modal dibuka / subject berubah.
  useEffect(() => {
    if (!open) return;
    if (isEdit && subject) {
      setName(subject.name);
      setRelationship(subject.relationship);
      setGender(subject.gender);
      setBirthDate(subject.birthDate);
      setActivityLevel(subject.activityLevel);
      setIsPrimary(subject.isPrimary);
    } else {
      setName("");
      setRelationship("child");
      setGender("female");
      setBirthDate("");
      setActivityLevel(1.55);
      setIsPrimary(false);
    }
    setErrors({});
    setServerError(null);
    setSubmitting(false);
  }, [open, isEdit, subject]);

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    const trimmedName = name.trim();
    if (trimmedName.length < 2) e.name = "Nama minimal 2 karakter.";
    else if (trimmedName.length > 100) e.name = "Nama maksimal 100 karakter.";

    if (!birthDate) {
      e.birthDate = "Tanggal lahir wajib diisi.";
    } else {
      const birth = new Date(birthDate);
      const now = new Date();
      if (Number.isNaN(birth.getTime())) e.birthDate = "Tanggal tidak valid.";
      else if (birth > now)
        e.birthDate = "Tanggal lahir tidak boleh di masa depan.";
      else if (now.getFullYear() - birth.getFullYear() > 120)
        e.birthDate = "Usia melebihi batas wajar (max 120 tahun).";
    }

    if (activityLevel < 1 || activityLevel > 2.5)
      e.activityLevel = "Level aktivitas harus antara 1.0–2.5.";

    if (isPrimary && relationship !== "self")
      e.isPrimary = "Subjek utama hanya untuk hubungan 'Diri Sendiri'.";

    // Edit: kalau subjek ini SUDAH primary, jangan blokir (tidak duplikasi).
    const conflictWithExistingPrimary =
      isPrimary && hasPrimarySelf && !(isEdit && subject?.isPrimary);
    if (conflictWithExistingPrimary) {
      e.isPrimary = "Sudah ada subjek utama (1 akun = 1 self primary).";
    }

    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setServerError(null);
    if (Object.keys(e).length > 0) return;

    const payload = {
      name: name.trim(),
      gender,
      birthDate,
      relationship,
      heightCm: null,
      activityLevel,
      isPrimary,
    };

    setSubmitting(true);
    try {
      const url = isEdit ? `/api/subjects/${subject!.id}` : "/api/subjects";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json: ApiResponse<SubjectDTO> = await res.json();

      if (!json.success) {
        // Map field errors dari API kalau ada.
        if (json.error.details) {
          const fieldErrors: Record<string, string> = {};
          for (const [k, v] of Object.entries(json.error.details)) {
            if (v && v[0]) fieldErrors[k] = v[0];
          }
          setErrors(fieldErrors);
        }
        setServerError(json.error.message);
        return;
      }

      onSaved(json.data);
      onClose();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Gagal menyimpan subjek",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const previewStage = birthDate ? previewLifeStage(birthDate) : null;
  const previewYears = birthDate ? previewAgeYears(birthDate) : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Subjek" : "Tambah Subjek Baru"}
      description={
        isEdit
          ? "Perbarui identitas dan pengaturan subjek."
          : "Tambah anak, diri sendiri, atau anggota keluarga yang ingin dilacak status gizinya."
      }
      size="lg"
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
            form="subject-form"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {submitting
              ? "Menyimpan..."
              : isEdit
                ? "Simpan Perubahan"
                : "Simpan Subjek"}
          </button>
        </>
      }
    >
      <form
        id="subject-form"
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
          label="Nama Lengkap"
          required
          error={errors.name}
          hint="Minimal 2 karakter."
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama subjek"
            maxLength={100}
            className={inputClass(errors.name)}
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Hubungan" required>
            <div className="relative">
              <select
                value={relationship}
                onChange={(e) => {
                  const v = e.target.value as Relationship;
                  setRelationship(v);
                  if (v !== "self") setIsPrimary(false);
                }}
                className={`${inputClass()} cursor-pointer appearance-none pr-10`}
              >
                {RELATIONSHIP_ORDER.map((r) => (
                  <option key={r} value={r}>
                    {RELATIONSHIP_LABEL[r]}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
            </div>
          </Field>

          <Field label="Jenis Kelamin" required>
            <div className="grid grid-cols-3 gap-2">
              <GenderOption
                label={GENDER_LABEL.female}
                checked={gender === "female"}
                onChange={() => setGender("female")}
              />
              <GenderOption
                label={GENDER_LABEL.male}
                checked={gender === "male"}
                onChange={() => setGender("male")}
              />
              <GenderOption
                label={GENDER_LABEL.other}
                checked={gender === "other"}
                onChange={() => setGender("other")}
              />
            </div>
          </Field>
        </div>

        <Field
          label="Tanggal Lahir"
          required
          error={errors.birthDate}
          hint={
            previewStage && previewYears != null
              ? `Tahap usia: ${previewStage} (${previewYears} tahun)`
              : "Pengukuran TB/BB dicatat lewat 'Catat Pengukuran' setelah subjek dibuat."
          }
        >
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className={inputClass(errors.birthDate)}
          />
        </Field>

        <Field
          label="Level Aktivitas"
          error={errors.activityLevel}
          hint="1.0 = sangat ringan · 1.55 = sedang · 2.5 = sangat berat (atlet)."
        >
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-slate-500">1.0</span>
              <span className="rounded-full bg-brand-soft px-3 py-0.5 text-sm font-bold tabular-nums text-brand-primary">
                {activityLevel.toFixed(2)}
              </span>
              <span className="text-xs font-medium text-slate-500">2.5</span>
            </div>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.05"
              value={activityLevel}
              onChange={(e) => setActivityLevel(parseFloat(e.target.value))}
              className="block w-full accent-brand-primary"
            />
          </div>
        </Field>

        {relationship === "self" && (
          <Field>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                hasPrimarySelf && !(isEdit && subject?.isPrimary)
                  ? "border-slate-200 bg-slate-50 opacity-60"
                  : "border-brand-primary/20 bg-brand-soft/60 hover:bg-brand-soft"
              }`}
            >
              <input
                type="checkbox"
                checked={isPrimary}
                disabled={hasPrimarySelf && !(isEdit && subject?.isPrimary)}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-brand-primary"
              />
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <Sparkles className="h-4 w-4 text-brand-primary" />
                  Jadikan subjek utama (primary self)
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {hasPrimarySelf && !(isEdit && subject?.isPrimary)
                    ? "Sudah ada subjek utama. Hanya boleh 1 primary self per akun."
                    : "Subjek utama dipakai untuk target gizi default di dashboard."}
                </p>
              </div>
            </label>
            {errors.isPrimary && (
              <p className="mt-1 inline-flex items-start gap-1 text-xs font-medium text-red-600">
                <AlertTriangle className="mt-0.5 h-3 w-3" />
                {errors.isPrimary}
              </p>
            )}
          </Field>
        )}
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
}: {
  label?: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  error?: string;
}) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
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

function GenderOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-2 py-2.5 text-sm font-semibold transition ${
        checked
          ? "border-brand-primary bg-brand-primary text-white shadow-sm shadow-brand-primary/20"
          : "border-slate-200 bg-white text-slate-700 hover:border-brand-primary/30 hover:bg-brand-soft"
      }`}
    >
      <input
        type="radio"
        name="gender"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {label}
    </label>
  );
}

function inputClass(error?: string): string {
  return `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-200"
      : "border-slate-200 focus:border-brand-primary focus:ring-brand-primary/20"
  }`;
}
