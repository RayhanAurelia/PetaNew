import { Camera, KeyRound, Mail, Save, ShieldCheck, User } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/pageHeader";
import { getAuthUseCases } from "@/src/infrastructure/di/container";

export default async function ProfilePage() {
  const { getCurrentUser } = await getAuthUseCases();

  let user;
  try {
    user = await getCurrentUser.execute();
  } catch {
    redirect("/login");
  }

  const initials = user.fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        kicker="Akun"
        title="Profil Saya"
        description="Kelola identitas, avatar, dan keamanan akun PETA Anda."
      />

      {/* Identity card */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="relative h-28 bg-linear-to-r from-brand-primary via-brand-primary-soft to-brand-accent" />

        <div className="-mt-12 px-6 pb-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="relative">
                <div className="grid h-24 w-24 place-items-center rounded-2xl bg-brand-primary text-2xl font-bold text-white ring-4 ring-white">
                  {initials || "U"}
                </div>
                <button
                  type="button"
                  className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-full bg-white text-brand-primary shadow-md ring-1 ring-slate-200 transition hover:bg-brand-soft"
                  aria-label="Ganti avatar"
                  title="Ganti avatar"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="pb-1">
                <h2 className="text-xl font-bold text-slate-900">
                  {user.fullName}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">{user.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <RoleBadge role={user.role} />
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-primary ring-1 ring-brand-primary/20">
                    Aktif
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form sections */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FormCard
          title="Informasi Pribadi"
          description="Perbarui nama yang ditampilkan di seluruh aplikasi."
        >
          <Field
            label="Nama Lengkap"
            icon={<User className="h-4 w-4" />}
            defaultValue={user.fullName}
            name="fullName"
          />
          <Field
            label="Email"
            icon={<Mail className="h-4 w-4" />}
            defaultValue={user.email}
            disabled
            hint="Email tidak dapat diubah."
            name="email"
            type="email"
          />
          <SubmitRow label="Simpan Profil" />
        </FormCard>

        <FormCard
          title="Keamanan Akun"
          description="Ubah password secara berkala untuk menjaga keamanan data."
        >
          <Field
            label="Password Saat Ini"
            icon={<KeyRound className="h-4 w-4" />}
            type="password"
            placeholder="••••••••"
            name="currentPassword"
          />
          <Field
            label="Password Baru"
            icon={<KeyRound className="h-4 w-4" />}
            type="password"
            placeholder="Minimal 8 karakter"
            name="newPassword"
          />
          <Field
            label="Konfirmasi Password Baru"
            icon={<KeyRound className="h-4 w-4" />}
            type="password"
            placeholder="Ulangi password baru"
            name="confirmPassword"
          />
          <SubmitRow label="Ubah Password" />
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
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <header className="mb-5 border-b border-slate-100 pb-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  icon,
  hint,
  disabled = false,
  defaultValue,
  placeholder,
  type = "text",
  name,
}: {
  label: string;
  icon?: React.ReactNode;
  hint?: string;
  disabled?: boolean;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  name: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-xs font-semibold uppercase tracking-wider text-slate-600"
      >
        {label}
      </label>
      <div className="relative mt-1.5">
        {icon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          disabled={disabled}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 ${
            icon ? "pl-10" : "pl-3.5"
          } pr-3.5 ${disabled ? "cursor-not-allowed bg-slate-50 text-slate-500" : ""}`}
        />
      </div>
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function SubmitRow({ label }: { label: string }) {
  return (
    <div className="flex justify-end pt-2">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition hover:bg-brand-primary-dark hover:shadow-md"
      >
        <Save className="h-4 w-4" />
        {label}
      </button>
    </div>
  );
}
