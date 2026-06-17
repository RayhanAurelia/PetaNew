export type AuditAction = "create" | "update" | "delete";
export type AuditTargetType = "profile" | "subject" | "food" | "article";
export type JsonRecord = Record<string, unknown>;

export interface AuditLogDTO {
  id: string;
  createdAt: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string | null;
  actorId: string | null;
  actorEmail: string | null;
  actorName: string | null;
  actorRole: string | null;
  oldData: JsonRecord | null;
  newData: JsonRecord | null;
  description: string | null;
}

export interface ListAuditLogsResult {
  items: AuditLogDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export const ACTION_LABEL: Record<AuditAction, string> = {
  create: "Tambah",
  update: "Ubah",
  delete: "Hapus",
};

export const ACTION_STYLE: Record<AuditAction, string> = {
  create: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  update: "bg-amber-50 text-amber-700 ring-amber-200",
  delete: "bg-red-50 text-red-700 ring-red-200",
};

export const TARGET_LABEL: Record<AuditTargetType, string> = {
  profile: "Pengguna",
  subject: "Subjek",
  food: "Makanan",
  article: "Artikel",
};

export const ACTION_FILTERS: { value: AuditAction | ""; label: string }[] = [
  { value: "", label: "Semua aksi" },
  { value: "create", label: "Tambah" },
  { value: "update", label: "Ubah" },
  { value: "delete", label: "Hapus" },
];

// Catatan: "Subjek" tidak disertakan karena dikelola oleh user, bukan admin —
// audit ini fokus pada objek yang dikelola admin (pengguna, makanan, artikel).
export const TARGET_FILTERS: { value: AuditTargetType | ""; label: string }[] = [
  { value: "", label: "Semua objek" },
  { value: "profile", label: "Pengguna" },
  { value: "food", label: "Makanan" },
  { value: "article", label: "Artikel" },
];

export interface ApiOk<T> {
  success: true;
  data: T;
}
export interface ApiErr {
  success: false;
  error: { code: string; message: string };
}
export type ApiResponse<T> = ApiOk<T> | ApiErr;

// ---------------------------------------------------------------------------
// Pelabelan & pemformatan field agar diff terbaca manusia.
// ---------------------------------------------------------------------------

/** Kolom teknis yang tidak informatif untuk diff. */
const IGNORED_KEYS = new Set([
  "id",
  "name_lower_case",
  "created_at",
  "updated_at",
  "verified_at",
  "verified_by",
  "published_at",
  "author_id",
  "created_by",
  "profile_id",
  "subject_id",
]);

/** Label berbahasa Indonesia per nama kolom (gabungan semua tabel ter-audit). */
const FIELD_LABEL: Record<string, string> = {
  // profiles
  full_name: "Nama Lengkap",
  email: "Email",
  role: "Role",
  is_active: "Status Akun",
  avatar_url: "Foto Profil",
  // subjects
  name: "Nama",
  gender: "Jenis Kelamin",
  birth_date: "Tanggal Lahir",
  relationship: "Hubungan",
  height_cm: "Tinggi (cm)",
  activity_level: "Level Aktivitas",
  is_primary: "Subjek Utama",
  // food
  brand: "Merek",
  category: "Kategori",
  description: "Deskripsi",
  image_url: "Gambar",
  calories_per_100g: "Kalori /100g",
  protein_per_100g: "Protein /100g",
  carbs_per_100g: "Karbohidrat /100g",
  fat_per_100g: "Lemak /100g",
  fiber_per_100g: "Serat /100g",
  source: "Sumber",
  is_verified: "Verifikasi",
  deleted_at: "Dihapus Pada",
  // articles
  title: "Judul",
  slug: "Slug",
  excerpt: "Ringkasan",
  content: "Konten",
  cover_image_url: "Gambar Sampul",
  target_life_stage: "Tahap Usia",
  is_published: "Status Terbit",
  view_count: "Jumlah Dilihat",
};

export function fieldLabel(key: string): string {
  return (
    FIELD_LABEL[key] ??
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

const ROLE_VALUE_LABEL: Record<string, string> = {
  user: "Pengguna",
  admin: "Admin",
};

const CATEGORY_VALUE_LABEL: Record<string, string> = {
  staple: "Makanan Pokok",
  protein_animal: "Protein Hewani",
  protein_plant: "Protein Nabati",
  vegetable: "Sayuran",
  fruit: "Buah",
  dairy: "Susu & Olahan",
  snack: "Camilan",
  beverage: "Minuman",
  other: "Lainnya",
};

const LIFE_STAGE_VALUE_LABEL: Record<string, string> = {
  balita: "Balita",
  anak: "Anak",
  remaja: "Remaja",
  dewasa: "Dewasa",
};

const DATE_KEYS = new Set([
  "birth_date",
  "deleted_at",
  "recorded_at",
  "log_date",
]);

function formatDateValue(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format nilai jadi string ramah-baca berdasarkan konteks kolomnya. */
export function formatValue(key: string, value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;

  // Boolean dengan label khusus per kolom.
  if (typeof value === "boolean") {
    if (key === "is_active") return value ? "Aktif" : "Nonaktif";
    if (key === "is_published") return value ? "Terbit" : "Draft";
    if (key === "is_verified") return value ? "Terverifikasi" : "Belum";
    return value ? "Ya" : "Tidak";
  }

  if (typeof value === "string") {
    if (key === "role") return ROLE_VALUE_LABEL[value] ?? value;
    if (key === "category") return CATEGORY_VALUE_LABEL[value] ?? value;
    if (key === "target_life_stage")
      return LIFE_STAGE_VALUE_LABEL[value] ?? value;
    if (DATE_KEYS.has(key)) return formatDateValue(value);
    if (key === "content" && value.length > 120)
      return `${value.slice(0, 120)}… (${value.length} karakter)`;
    return value;
  }

  if (typeof value === "number") {
    return value.toLocaleString("id-ID", { maximumFractionDigits: 2 });
  }

  return JSON.stringify(value);
}

export interface FieldChange {
  key: string;
  label: string;
  before: string | null;
  after: string | null;
}

/**
 * Hitung perubahan field. Untuk `update` hanya field yang berubah; untuk
 * `create` field yang terisi (data baru); untuk `delete` field data lama.
 */
export function computeChanges(entry: AuditLogDTO): FieldChange[] {
  const oldD = entry.oldData ?? {};
  const newD = entry.newData ?? {};
  const keys = [...new Set([...Object.keys(oldD), ...Object.keys(newD)])];

  const changes: FieldChange[] = [];
  for (const key of keys) {
    if (IGNORED_KEYS.has(key)) continue;
    const before = formatValue(key, oldD[key]);
    const after = formatValue(key, newD[key]);

    if (entry.action === "update" && before === after) continue;
    if (entry.action === "create" && after === null) continue;
    if (entry.action === "delete" && before === null) continue;

    changes.push({ key, label: fieldLabel(key), before, after });
  }
  // Urutkan berdasarkan label agar konsisten.
  changes.sort((a, b) => a.label.localeCompare(b.label, "id"));
  return changes;
}

/** Ringkasan singkat satu baris tentang apa yang terjadi. */
export function changeSummary(entry: AuditLogDTO): string {
  const target = TARGET_LABEL[entry.targetType].toLowerCase();
  if (entry.action === "create") return `Menambahkan ${target} baru`;
  if (entry.action === "delete") return `Menghapus ${target}`;

  const changes = computeChanges(entry);
  if (changes.length === 0) return `Memperbarui ${target}`;

  // Sorot perubahan penting yang umum (role / status).
  const role = changes.find((c) => c.key === "role");
  if (role) return `Mengubah role: ${role.before ?? "—"} → ${role.after ?? "—"}`;
  const active = changes.find((c) => c.key === "is_active");
  if (active) return `Mengubah status akun → ${active.after ?? "—"}`;
  const verified = changes.find((c) => c.key === "is_verified");
  if (verified) return `Verifikasi makanan → ${verified.after ?? "—"}`;
  const published = changes.find((c) => c.key === "is_published");
  if (published) return `Status terbit → ${published.after ?? "—"}`;

  const names = changes.slice(0, 3).map((c) => c.label);
  const extra = changes.length > 3 ? ` +${changes.length - 3} lainnya` : "";
  return `Mengubah ${names.join(", ")}${extra}`;
}

/** Label objek yang terbaca manusia (nama/judul) bila ada. */
export function entryTitle(entry: AuditLogDTO): string {
  const d = entry.newData ?? entry.oldData ?? {};
  const candidate =
    (d.full_name as string) ||
    (d.name as string) ||
    (d.title as string) ||
    (d.email as string);
  if (candidate) return candidate;
  return entry.targetId ? `${entry.targetId.slice(0, 8)}…` : "—";
}

export function formatDateTimeID(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
