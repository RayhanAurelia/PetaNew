"use client";

import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Info,
  KeyRound,
  Loader,
  Mail,
  Save,
  ShieldCheck,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { PageHeader } from "@/components/dashboard/pageHeader";
import { AvatarUploadError, uploadAvatar } from "@/lib/supabase/uploadAvatar";
import { getInitials, type ProfileUser } from "./profileTypes";

interface ProfileViewProps {
  initialUser: ProfileUser;
}

interface ApiOk<T> {
  success: true;
  data: T;
}
interface ApiErr {
  success: false;
  error: { code: string; message: string };
}
type ApiResponse<T> = ApiOk<T> | ApiErr;

type Banner = { tone: "success" | "error"; text: string };

export function ProfileView({ initialUser }: ProfileViewProps) {
  const [user, setUser] = useState<ProfileUser>(initialUser);

  // Form: nama
  const [fullName, setFullName] = useState(initialUser.fullName);
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState<Banner | null>(null);

  // Form: avatar
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState<Banner | null>(null);

  // Form: password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<Banner | null>(null);
  // Gerbang: field password baru baru terbuka setelah password lama benar.
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  // Ubah password lama → reset status verifikasi & kosongkan password baru.
  function handleCurrentPasswordChange(value: string) {
    setCurrentPassword(value);
    if (passwordVerified) {
      setPasswordVerified(false);
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  async function handleVerifyCurrentPassword() {
    setPasswordMsg(null);
    if (!currentPassword) {
      setPasswordMsg({ tone: "error", text: "Masukkan password lama dulu." });
      return;
    }
    setVerifyingPassword(true);
    try {
      const res = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword }),
      });
      const json: ApiResponse<unknown> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setPasswordVerified(true);
      setPasswordMsg({
        tone: "success",
        text: "Password lama terverifikasi. Silakan isi password baru.",
      });
    } catch (err) {
      setPasswordVerified(false);
      setPasswordMsg({
        tone: "error",
        text: err instanceof Error ? err.message : "Verifikasi gagal",
      });
    } finally {
      setVerifyingPassword(false);
    }
  }

  const initials = getInitials(user.fullName);
  const nameDirty = fullName.trim() !== user.fullName;

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setNameMsg(null);
    const trimmed = fullName.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
      setNameMsg({
        tone: "error",
        text: "Nama harus antara 2 dan 100 karakter.",
      });
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: trimmed }),
      });
      const json: ApiResponse<ProfileUser> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setUser(json.data);
      setFullName(json.data.fullName);
      setNameMsg({ tone: "success", text: "Nama berhasil diperbarui." });
    } catch (err) {
      setNameMsg({
        tone: "error",
        text: err instanceof Error ? err.message : "Gagal menyimpan nama",
      });
    } finally {
      setSavingName(false);
    }
  }

  function pickAvatar() {
    fileInputRef.current?.click();
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset agar bisa pilih file yang sama lagi
    if (!file) return;

    setAvatarMsg(null);
    setUploadingAvatar(true);
    try {
      const { publicUrl } = await uploadAvatar(file);
      // Persist URL ke profile via API
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: publicUrl }),
      });
      const json: ApiResponse<ProfileUser> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setUser(json.data);
      setAvatarMsg({ tone: "success", text: "Avatar berhasil diperbarui." });
    } catch (err) {
      if (err instanceof AvatarUploadError) {
        setAvatarMsg({ tone: "error", text: err.message });
      } else {
        setAvatarMsg({
          tone: "error",
          text: err instanceof Error ? err.message : "Gagal mengunggah avatar",
        });
      }
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleRemoveAvatar() {
    setAvatarMsg(null);
    setUploadingAvatar(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: null }),
      });
      const json: ApiResponse<ProfileUser> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setUser(json.data);
      setAvatarMsg({ tone: "success", text: "Avatar dihapus." });
    } catch (err) {
      setAvatarMsg({
        tone: "error",
        text: err instanceof Error ? err.message : "Gagal menghapus avatar",
      });
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);
    if (!currentPassword) {
      setPasswordMsg({
        tone: "error",
        text: "Masukkan password lama terlebih dahulu.",
      });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({
        tone: "error",
        text: "Password baru minimal 8 karakter.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({
        tone: "error",
        text: "Konfirmasi password tidak cocok.",
      });
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordMsg({
        tone: "error",
        text: "Password baru harus berbeda dari password lama.",
      });
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json: ApiResponse<unknown> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordVerified(false);
      setPasswordMsg({
        tone: "success",
        text: "Password berhasil diubah.",
      });
    } catch (err) {
      setPasswordMsg({
        tone: "error",
        text: err instanceof Error ? err.message : "Gagal mengubah password",
      });
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        kicker="Akun"
        title="Profil Saya"
        description="Kelola identitas, avatar, dan keamanan akun PETA Anda"
      />

      {/* Identity card */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="relative h-28 bg-linear-to-r from-brand-primary via-brand-primary-soft to-brand-accent" />

        <div className="-mt-12 px-6 pb-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="relative">
                <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-brand-primary ring-4 ring-white">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-2xl font-bold text-white">
                      {initials || "U"}
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 grid place-items-center bg-slate-900/40 text-white">
                      <Loader className="h-6 w-6 animate-spin" />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={pickAvatar}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-full bg-white text-brand-primary shadow-md ring-1 ring-slate-200 transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Ganti avatar"
                  title="Ganti avatar"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="pb-1">
                <h2 className="text-xl font-bold text-slate-900">
                  {user.fullName}
                </h2>
                <p className="mt-8 text-sm text-slate-500">{user.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <RoleBadge role={user.role} />
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-primary ring-1 ring-brand-primary/20">
                    Aktif
                  </span>
                </div>
              </div>
            </div>

            {user.avatarUrl && !uploadingAvatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Hapus Avatar
              </button>
            )}
          </div>

          {avatarMsg && <Banner banner={avatarMsg} className="mt-4" />}

          <p className="mt-3 text-[11px] text-slate-400">
            Format: JPG, PNG, atau WebP (Maks 2 MB)
          </p>
        </div>
      </section>

      {/* Forms */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <FormCard
          title="Informasi Pribadi"
          description="Perbarui nama yang ditampilkan di seluruh aplikasi"
          icon={<UserIcon className="h-5 w-5" />}
        >
          <form onSubmit={handleSaveName} className="flex flex-col gap-4">
            <Field
              label="Nama Lengkap"
              icon={<UserIcon className="h-4 w-4" />}
              required
            >
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap"
                maxLength={100}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </Field>
            <Field label="Email" icon={<Mail className="h-4 w-4" />}>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-sm text-slate-500"
              />
            </Field>
            <div className="flex items-start gap-2.5 rounded-xl bg-brand-soft/60 p-3 text-xs text-slate-600 ring-1 ring-brand-primary/10">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
              <p>
                Nama dan foto profil Anda tampil di sidebar serta di seluruh
                aplikasi PETA. Email tidak dapat diubah demi keamanan akun.
              </p>
            </div>
            {nameMsg && <Banner banner={nameMsg} />}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingName || !nameDirty}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {savingName ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </div>
          </form>
        </FormCard>

        <FormCard
          title="Keamanan Akun"
          description="Silahkan ubah password jika Anda ingin"
          icon={<ShieldCheck className="h-5 w-5" />}
        >
          <form
            onSubmit={handleChangePassword}
            className="flex flex-col gap-4"
          >
            <Field
              label="Password Lama"
              icon={<KeyRound className="h-4 w-4" />}
              required
              hint="Verifikasi dulu untuk membuka kolom password baru."
            >
              <div className="flex gap-2">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => handleCurrentPasswordChange(e.target.value)}
                  placeholder="Password saat ini"
                  autoComplete="current-password"
                  maxLength={50}
                  readOnly={passwordVerified}
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                    passwordVerified
                      ? "border-emerald-300 bg-emerald-50/50 focus:border-emerald-400 focus:ring-emerald-100"
                      : "border-slate-200 bg-white focus:border-brand-primary focus:ring-brand-primary/20"
                  }`}
                />
                {passwordVerified ? (
                  <button
                    type="button"
                    onClick={() => setPasswordVerified(false)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Ubah
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleVerifyCurrentPassword}
                    disabled={!currentPassword || verifyingPassword}
                    className="shrink-0 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {verifyingPassword ? "Cek..." : "Verifikasi"}
                  </button>
                )}
              </div>
            </Field>
            <Field
              label="Password Baru"
              icon={<KeyRound className="h-4 w-4" />}
              required
              hint="Minimal 8 karakter."
            >
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={
                  passwordVerified
                    ? "Password baru"
                    : "Verifikasi password lama dulu"
                }
                minLength={8}
                maxLength={50}
                disabled={!passwordVerified}
                autoComplete="new-password"
                className={`w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 ${
                  passwordVerified
                    ? "bg-white text-slate-900"
                    : "cursor-not-allowed bg-slate-50 text-slate-400"
                }`}
              />
            </Field>
            <Field
              label="Konfirmasi Password Baru"
              icon={<KeyRound className="h-4 w-4" />}
              required
            >
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={
                  passwordVerified ? "Ulangi password baru" : "Terkunci"
                }
                minLength={8}
                maxLength={50}
                disabled={!passwordVerified}
                autoComplete="new-password"
                className={`w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 ${
                  passwordVerified
                    ? "bg-white text-slate-900"
                    : "cursor-not-allowed bg-slate-50 text-slate-400"
                }`}
              />
            </Field>
            {passwordMsg && <Banner banner={passwordMsg} />}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={
                  changingPassword ||
                  !passwordVerified ||
                  !newPassword ||
                  !confirmPassword
                }
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <KeyRound className="h-4 w-4" />
                {changingPassword ? "Mengubah..." : "Ubah Password"}
              </button>
            </div>
          </form>
        </FormCard>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: "user" | "admin" }) {
  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200">
        <ShieldCheck className="h-3 w-3" /> Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700 ring-1 ring-blue-200">
      User
    </span>
  );
}

function FormCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5 transition hover:shadow-md hover:shadow-slate-900/5">
      <header className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
        {icon && (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-primary ring-1 ring-brand-primary/10">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function Field({
  label,
  icon,
  hint,
  required = false,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        {children}
      </div>
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function Banner({
  banner,
  className = "",
}: {
  banner: Banner;
  className?: string;
}) {
  const isSuccess = banner.tone === "success";
  return (
    <div
      className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs ${
        isSuccess
          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border border-red-200 bg-red-50 text-red-700"
      } ${className}`}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{banner.text}</span>
    </div>
  );
}
