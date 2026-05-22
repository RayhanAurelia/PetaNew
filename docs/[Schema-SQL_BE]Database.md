# [Schema-SQL_BE] Database Documentation — PETA

> **Aplikasi**: PETA — Pencegahan Stunting & Tracker Gizi
> **Database**: PostgreSQL (Supabase)
> **File Schema**: `peta/supabase/schema.sql`
> **Versi**: v4 (Production-Ready)
> **Last Updated**: 2026-05-17

---

## Daftar Isi

1. [Overview](#1-overview)
2. [Arsitektur & Relasi Tabel](#2-arsitektur--relasi-tabel)
3. [Extensions](#3-extensions)
4. [Enum Types](#4-enum-types)
5. [Tables](#5-tables)
6. [Indexes](#6-indexes)
7. [Helper Functions](#7-helper-functions)
8. [Trigger Functions](#8-trigger-functions)
9. [Triggers](#9-triggers)
10. [Row Level Security (RLS)](#10-row-level-security-rls)
11. [Views](#11-views)
12. [Grants](#12-grants)
13. [Deployment Guide](#13-deployment-guide)
14. [Common Use Cases & Query Patterns](#14-common-use-cases--query-patterns)

---

## 1. Overview

PETA adalah aplikasi tracking gizi dengan fokus utama **pencegahan stunting pada anak Indonesia**. Database dirancang dengan pola **profiles + subjects**, yang memisahkan:

- **Profiles** — akun login (1-to-1 dengan `auth.users`)
- **Subjects** — orang yang dilacak (bisa diri sendiri, anak, pasangan, dll)

Satu profile bisa melacak beberapa subject. Setiap subject diklasifikasikan menjadi `balita / anak / remaja / dewasa` berdasarkan `birth_date`, dan kalkulator gizi akan menyesuaikan dengan tahap usianya.

### Fitur Utama Database

| Fitur | Implementasi |
|---|---|
| **Role-based access** | Enum `profile_type` (user/admin) + helper `is_admin()` |
| **Audit logging** | Tabel `audit_log` + trigger generic `log_audit_action()` |
| **Soft delete** | `deleted_at` di tabel food (preserve historical logs) |
| **Auto BMI** | GENERATED COLUMN di growth_log |
| **Auto life_stage** | Function `life_stage_of(birth_date)` — selalu fresh |
| **Food curation** | Admin-only CRUD + sistem `is_verified` |
| **Fuzzy food search** | GIN trigram index pada `name_lower_case` |
| **Row Level Security** | Aktif di semua 8 tabel |

---

## 2. Arsitektur & Relasi Tabel

```
auth.users (Supabase Auth)
    │
    │ 1:1
    ▼
┌─────────────┐
│  profiles   │ ─── role: 'user' | 'admin'
│  (akun)     │
└──────┬──────┘
       │
       │ 1:N
       ▼
┌─────────────┐         ┌──────────────────┐
│  subjects   │────────▶│  growth_log      │ ── BMI + Z-score
│ (dilacak)   │         └──────────────────┘
│             │
│ balita      │         ┌──────────────────┐
│ anak        │────────▶│  nutrition_log   │
│ remaja      │         └────────┬─────────┘
│ dewasa      │                  │
│             │                  │ N:1 (food_id, SET NULL on delete)
│             │                  ▼
│             │         ┌──────────────────┐
│             │         │  food (admin)    │ ── verified, soft delete
│             │         └──────────────────┘
│             │
│             │         ┌──────────────────┐
│             │────────▶│ nutrition_target │ ── TDEE/AKG hasil hitung
│             │         └──────────────────┘
└─────────────┘

┌─────────────┐         ┌──────────────────┐
│  articles   │         │   audit_log      │ ── immutable
│  (admin)    │         │   (semua CUD)    │
└─────────────┘         └──────────────────┘
```

### Total Aset

| Kategori | Jumlah |
|---|---|
| Tables | 8 |
| Enum types | 11 |
| Helper functions | 6 |
| Trigger functions | 5 |
| Triggers | 15 |
| Indexes | 16 (+1 unique partial) |
| RLS Policies | 28 |
| Views | 7 |

---

## 3. Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- gen_random_uuid() & hash
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- Trigram untuk fuzzy search
```

| Extension | Fungsi |
|---|---|
| `uuid-ossp` | Generate UUID v4 untuk primary key |
| `pgcrypto` | Fungsi kriptografi & UUID alternatif |
| `pg_trgm` | Trigram matching untuk pencarian teks fuzzy (autocomplete food) |

---

## 4. Enum Types

### 4.1 `gender_type`
```sql
ENUM('male', 'female', 'other')
```
Jenis kelamin subject. `other` untuk fleksibilitas.

### 4.2 `relationship_type`
```sql
ENUM('self', 'child', 'wife', 'husband', 'parent', 'sibling', 'other')
```
Hubungan subject dengan akun pemilik (profile).

### 4.3 `stunting_status_type`
```sql
ENUM('normal', 'stunted', 'severely_stunted')
```
Status stunting berdasarkan WHO HAZ (Height-for-Age Z-Score):
- `normal`: HAZ ≥ -2 SD
- `stunted`: -3 SD ≤ HAZ < -2 SD
- `severely_stunted`: HAZ < -3 SD

### 4.4 `wasting_status_type`
```sql
ENUM('normal', 'wasted', 'severely_wasted', 'overweight', 'obese')
```
Status wasting/obesitas berdasarkan WHO WHZ (Weight-for-Height Z-Score).

### 4.5 `food_source_type`
```sql
ENUM('manual', 'usda', 'fatsecret', 'nutritionix')
```
Sumber data nutrisi. `manual` = diisi admin, lainnya = di-import dari API eksternal.

### 4.6 `meal_type`
```sql
ENUM('breakfast', 'lunch', 'dinner', 'snack')
```
Jenis waktu makan untuk nutrition_log.

### 4.7 `profile_type`
```sql
ENUM('user', 'admin')
```
Role akun. **Admin** punya akses penuh ke food, articles, dan dapat melihat data semua user.

### 4.8 `life_stage_type`
```sql
ENUM('balita', 'anak', 'remaja', 'dewasa')
```
Tahap kehidupan berdasarkan umur (dihitung runtime via `life_stage_of()`):

| Stage | Umur | Kalkulator |
|---|---|---|
| `balita` | 0 – < 5 tahun | WHO Child Growth Standards (HAZ/WAZ/WHZ) |
| `anak` | 5 – < 13 tahun | WHO Growth Reference 5-19 |
| `remaja` | 13 – < 19 tahun | BMI-for-age + AKG Indonesia |
| `dewasa` | ≥ 19 tahun | Mifflin-St Jeor (BMR × activity = TDEE) |

### 4.9 `audit_target_type`
```sql
ENUM('profile', 'subject', 'food', 'article')
```
Jenis entitas yang dicatat di audit_log.

### 4.10 `action_type`
```sql
ENUM('create', 'update', 'delete')
```
Operasi CUD yang dicatat. SELECT tidak di-log.

### 4.11 `category_type`
```sql
ENUM('staple', 'protein_animal', 'protein_plant', 'vegetable',
     'fruit', 'dairy', 'snack', 'beverage', 'other')
```
Kategori makanan untuk filter di UI:
- `staple`: makanan pokok (nasi, kentang, gandum)
- `protein_animal`: protein hewani (daging, ikan, telur, ayam)
- `protein_plant`: protein nabati (tahu, tempe, kacang)
- `vegetable`: sayuran
- `fruit`: buah-buahan
- `dairy`: produk susu
- `snack`: cemilan
- `beverage`: minuman
- `other`: lainnya

---

## 5. Tables

### 5.1 `profiles`

Tabel akun pengguna, 1-to-1 dengan `auth.users` Supabase.

| Kolom | Tipe | Nullable | Default | Keterangan |
|---|---|---|---|---|
| `id` | uuid | NO | — | PK, FK ke `auth.users(id)` ON DELETE CASCADE |
| `full_name` | text | NO | — | Nama lengkap |
| `avatar_url` | text | YES | — | URL foto profil |
| `role` | profile_type | NO | `'user'` | Role: user/admin |
| `is_active` | boolean | NO | `true` | Admin bisa nonaktifkan user |
| `created_at` | timestamptz | NO | NOW() | — |
| `updated_at` | timestamptz | NO | NOW() | Auto-update via trigger |

**Relasi:**
- 1-to-1 dengan `auth.users` (jika user dihapus → profile ikut terhapus)
- 1-to-N dengan `subjects` (parent_id = profile.id)

---

### 5.2 `subjects`

Orang yang dilacak (diri sendiri, anak, pasangan, dll).

| Kolom | Tipe | Nullable | Default | Keterangan |
|---|---|---|---|---|
| `id` | uuid | NO | uuid_generate_v4() | PK |
| `profile_id` | uuid | NO | — | FK → profiles.id, CASCADE |
| `name` | text | NO | — | Nama subject |
| `gender` | gender_type | NO | — | Jenis kelamin |
| `birth_date` | date | NO | — | Tanggal lahir |
| `relationship` | relationship_type | NO | `'self'` | Hubungan dengan profile |
| `height_cm` | decimal(5,2) | YES | — | Tinggi baseline (latest di growth_log) |
| `activity_level` | decimal(3,2) | YES | 1.20 | Faktor aktivitas (relevan remaja+) |
| `is_primary` | boolean | NO | false | True = subjek "diri sendiri" |
| `avatar_url` | text | YES | — | URL foto |
| `created_at` | timestamptz | NO | NOW() | — |
| `updated_at` | timestamptz | NO | NOW() | Auto-update |

**Constraints:**
- `check_subject_birth_past`: birth_date ≤ hari ini
- `check_subject_height`: NULL atau 0 < height_cm < 300
- `check_subject_activity`: NULL atau 1.0 ≤ activity_level ≤ 2.5
- `check_self_relationship`: `is_primary = true` HANYA jika `relationship = 'self'`

**Unique Partial Index:**
```sql
CREATE UNIQUE INDEX unique_one_primary_subject_per_profile
    ON public.subjects(profile_id) WHERE is_primary = true;
```
Memastikan hanya boleh ada **1 subject primary** per profile.

---

### 5.3 `growth_log`

Riwayat pengukuran TB/BB + Z-score WHO + BMI.

| Kolom | Tipe | Nullable | Default | Keterangan |
|---|---|---|---|---|
| `id` | uuid | NO | uuid_generate_v4() | PK |
| `subject_id` | uuid | NO | — | FK → subjects.id, CASCADE |
| `weight_kg` | decimal(5,2) | NO | — | Berat badan |
| `height_cm` | decimal(5,2) | NO | — | Tinggi badan |
| `height_for_age` | decimal(4,2) | YES | — | **HAZ** → indikator stunting |
| `weight_for_age` | decimal(4,2) | YES | — | **WAZ** → indikator underweight |
| `weight_for_height` | decimal(4,2) | YES | — | **WHZ** → indikator wasting/obesitas |
| `stunting_status` | stunting_status_type | YES | — | Hasil interpretasi HAZ |
| `wasting_status` | wasting_status_type | YES | — | Hasil interpretasi WHZ |
| `bmi` | decimal(4,2) | YES | **AUTO** | GENERATED dari weight_kg & height_cm |
| `description` | text | YES | — | Catatan tambahan |
| `recorded_at` | date | NO | CURRENT_DATE | Tanggal pengukuran |
| `created_at` | timestamptz | NO | NOW() | — |

**BMI Auto-Calculate** (GENERATED COLUMN):
```sql
bmi = CASE WHEN height_cm > 0
      THEN weight_kg / ((height_cm / 100) * (height_cm / 100))
      END
```

**Constraints:**
- `check_growth_log_weight`: 0 < weight_kg < 500
- `check_growth_log_height`: 0 < height_cm < 300

**Catatan:** Kolom `height_for_age`/`weight_for_age`/`weight_for_height` diisi oleh aplikasi/Edge Function berdasarkan tabel referensi WHO Growth Standards (LMS values). Tidak dihitung otomatis di database.

---

### 5.4 `food`

Master database makanan — **dikelola admin only**.

| Kolom | Tipe | Nullable | Default | Keterangan |
|---|---|---|---|---|
| `id` | uuid | NO | uuid_generate_v4() | PK |
| `name` | text | NO | — | Nama makanan |
| `name_lower_case` | text | NO | **AUTO** | GENERATED `lower(name)` untuk search |
| `brand` | text | YES | — | Merek produk |
| `category` | category_type | NO | `'other'` | Kategori (staple/protein/dll) |
| `description` | text | YES | — | Deskripsi |
| `image_url` | text | YES | — | URL gambar |
| `calories_per_100g` | decimal(7,2) | NO | — | Kalori per 100g |
| `protein_per_100g` | decimal(6,2) | NO | 0 | Protein per 100g (gram) |
| `carbs_per_100g` | decimal(6,2) | NO | 0 | Karbohidrat per 100g |
| `fat_per_100g` | decimal(6,2) | NO | 0 | Lemak per 100g |
| `fiber_per_100g` | decimal(6,2) | YES | 0 | Serat per 100g |
| `source` | food_source_type | NO | `'manual'` | Sumber data |
| `external_id` | text | YES | — | ID dari API eksternal |
| `is_verified` | boolean | NO | false | Admin menandai data sudah valid |
| `verified_by` | uuid | YES | — | FK → profiles.id (admin yang verifikasi) |
| `verified_at` | timestamptz | YES | — | Kapan diverifikasi |
| `created_by` | uuid | YES | — | FK → profiles.id (admin yang input) |
| `created_at` | timestamptz | NO | NOW() | — |
| `updated_at` | timestamptz | NO | NOW() | Auto-update |
| `deleted_at` | timestamptz | YES | — | **Soft delete** (NULL = aktif) |

**Constraints:**
- `unique_food_external_id`: UNIQUE (external_id, source) — cegah duplikat dari API
- `check_food_calories`: ≥ 0
- `check_food_protein`, `check_food_carbs`, `check_food_fat`: ≥ 0
- `check_food_fiber`: NULL atau ≥ 0
- `check_food_verified`: konsisten — kalau `is_verified=true`, maka `verified_by` & `verified_at` HARUS NOT NULL

**Catatan Penting:**
- **Soft delete** dipakai supaya `nutrition_log` historis tidak hilang/orphan
- Kolom `name_lower_case` dipakai untuk fuzzy search (case-insensitive)
- Hanya admin yang bisa CUD (lihat RLS section)

---

### 5.5 `nutrition_log`

Catatan makan harian user (per subject).

| Kolom | Tipe | Nullable | Default | Keterangan |
|---|---|---|---|---|
| `id` | uuid | NO | uuid_generate_v4() | PK |
| `subject_id` | uuid | NO | — | FK → subjects.id, CASCADE |
| `food_id` | uuid | YES | — | FK → food.id, **SET NULL** on delete |
| `food_name` | text | NO | — | **Snapshot** nama (tetap valid meski food dihapus) |
| `serving_quantity` | decimal(6,2) | NO | 1 | Berapa porsi |
| `serving_unit` | text | NO | `'porsi'` | Satuan (porsi/gram/ml) |
| `calories` | decimal(7,2) | NO | — | **Snapshot** total kalori (sudah dikali porsi) |
| `protein` | decimal(6,2) | NO | 0 | Snapshot protein |
| `carbs` | decimal(6,2) | NO | 0 | Snapshot karbo |
| `fat` | decimal(6,2) | NO | 0 | Snapshot lemak |
| `meal` | meal_type | NO | — | Sarapan/makan siang/dll |
| `logged_at` | timestamptz | NO | NOW() | Kapan dicatat |
| `log_date` | date | NO | CURRENT_DATE | Auto-set via trigger dari `logged_at` (timezone Asia/Jakarta) |

**Constraints:**
- `check_nutrition_log_calories`, `protein`, `carbs`, `fat`: ≥ 0
- `check_serving_quantity`: > 0

**Mengapa snapshot data nutrisi?**
- Jika admin update nilai kalori "Nasi Putih" dari 130 → 140, log historis tidak ikut berubah
- Mendukung integritas riwayat & laporan PDF

---

### 5.6 `nutrition_target`

Target gizi harian hasil perhitungan kalkulator.

| Kolom | Tipe | Nullable | Default | Keterangan |
|---|---|---|---|---|
| `id` | uuid | NO | uuid_generate_v4() | PK |
| `subject_id` | uuid | NO | — | FK → subjects.id, CASCADE |
| `daily_calories` | decimal(7,2) | NO | — | Target kalori harian |
| `daily_protein` | decimal(6,2) | NO | 0 | Target protein (gram) |
| `daily_carbs` | decimal(6,2) | NO | 0 | Target karbo |
| `daily_fat` | decimal(6,2) | NO | 0 | Target lemak |
| `basal_metabolic_rate` | decimal(7,2) | YES | — | BMR (Mifflin-St Jeor). NULL untuk balita |
| `total_daily_energy_expenditure` | decimal(7,2) | YES | — | TDEE = BMR × activity. NULL untuk balita |
| `calculation_method` | text | YES | — | `'mifflin_st_jeor'`, `'akg_balita'`, dll |
| `effective_from` | date | NO | CURRENT_DATE | Mulai berlaku |
| `created_at` | timestamptz | NO | NOW() | — |

**Catatan:** Tabel ini disimpan **bukan dihitung ulang setiap query** — supaya cepat. Re-calculate target hanya saat ada perubahan signifikan (umur naik kategori, BB berubah drastis, ganti activity_level).

---

### 5.7 `articles`

Artikel edukasi (tips MPASI, info stunting, dll) — **admin only**.

| Kolom | Tipe | Nullable | Default | Keterangan |
|---|---|---|---|---|
| `id` | uuid | NO | uuid_generate_v4() | PK |
| `title` | text | NO | — | Judul |
| `slug` | text | NO | — | UNIQUE — URL-friendly identifier |
| `excerpt` | text | YES | — | Ringkasan singkat |
| `content` | text | NO | — | Konten lengkap (markdown/HTML) |
| `cover_image_url` | text | YES | — | URL gambar cover |
| `target_life_stage` | life_stage_type | YES | — | Target audience (NULL = umum) |
| `author_id` | uuid | YES | — | FK → profiles.id (admin penulis) |
| `is_published` | boolean | NO | false | Status publikasi |
| `published_at` | timestamptz | YES | — | Auto-set via trigger |
| `view_count` | integer | NO | 0 | Hit counter |
| `created_at` | timestamptz | NO | NOW() | — |
| `updated_at` | timestamptz | NO | NOW() | Auto-update |

**Constraints:**
- `check_article_published`: jika `is_published=true`, maka `published_at` & `author_id` HARUS NOT NULL
- `check_view_count`: view_count ≥ 0

---

### 5.8 `audit_log`

**Tabel immutable** — mencatat semua CUD pada profile/subject/food/article.

| Kolom | Tipe | Nullable | Default | Keterangan |
|---|---|---|---|---|
| `id` | uuid | NO | uuid_generate_v4() | PK |
| `actor_id` | uuid | YES | — | FK → profiles.id (siapa yang aksi) |
| `actor_email` | text | YES | — | **Snapshot** email actor |
| `actor_role` | profile_type | YES | — | **Snapshot** role actor saat aksi |
| `action` | action_type | NO | — | create/update/delete |
| `target_type` | audit_target_type | NO | — | profile/subject/food/article |
| `target_id` | uuid | YES | — | ID row yang dimodifikasi |
| `old_data` | jsonb | YES | — | Snapshot SEBELUM (NULL untuk create) |
| `new_data` | jsonb | YES | — | Snapshot SESUDAH (NULL untuk delete) |
| `description` | text | YES | — | Catatan manual (opsional) |
| `ip_address` | inet | YES | — | IP user (di-set dari app) |
| `user_agent` | text | YES | — | Browser/device info |
| `created_at` | timestamptz | NO | NOW() | — |

**Karakteristik:**
- Diisi otomatis oleh trigger `log_audit_action()` — **tidak ada INSERT manual dari aplikasi**
- **Tidak ada policy UPDATE/DELETE** → data tidak bisa diubah/dihapus oleh siapapun (immutable)
- Hanya admin yang bisa SELECT

---

## 6. Indexes

### 6.1 Subject & Growth
```sql
index_subjects_profile         ON subjects(profile_id)
index_subject_birth_date       ON subjects(birth_date)
index_growth_subject_date      ON growth_log(subject_id, recorded_at DESC)
```

### 6.2 Food (Partial Indexes — hanya yang tidak soft-deleted)
```sql
index_food_name_trgm   ON food USING gin (name_lower_case gin_trgm_ops)
                       WHERE deleted_at IS NULL
index_food_category    ON food(category) WHERE deleted_at IS NULL
index_food_verified    ON food(is_verified) WHERE deleted_at IS NULL
```

**`index_food_name_trgm`** menggunakan **GIN trigram** untuk:
- Substring search: `WHERE name_lower_case ILIKE '%ayam%'`
- Fuzzy/typo search: `WHERE name_lower_case % 'tlur'` (akan match "telur")

### 6.3 Nutrition Log & Target
```sql
index_nutrition_subject_date    ON nutrition_log(subject_id, log_date DESC)
index_nutrition_food            ON nutrition_log(food_id)
index_target_subject_effective  ON nutrition_target(subject_id, effective_from DESC)
```

### 6.4 Articles
```sql
index_articles_published    ON articles(is_published, published_at DESC)
index_articles_life_stage   ON articles(target_life_stage) WHERE is_published = true
index_articles_slug         ON articles(slug)
```

### 6.5 Audit Log
```sql
index_audit_actor_date    ON audit_log(actor_id, created_at DESC)
index_audit_action_date   ON audit_log(action, created_at DESC)
index_audit_target        ON audit_log(target_type, target_id)
index_audit_created_at    ON audit_log(created_at DESC)
```

---

## 7. Helper Functions

Function yang dipanggil di RLS policy, view, atau kode aplikasi.

### 7.1 `life_stage_of(birth_date)`

**Signature:** `life_stage_of(p_birth_date date) RETURNS life_stage_type`

Mengkalkulasi tahap usia berdasarkan tanggal lahir. **Selalu fresh** (dihitung runtime, tidak disimpan).

```sql
SELECT public.life_stage_of('2022-01-15'::date);  -- → 'balita'
SELECT public.life_stage_of('2010-03-20'::date);  -- → 'anak'
SELECT public.life_stage_of('2008-06-01'::date);  -- → 'remaja'
SELECT public.life_stage_of('1995-12-10'::date);  -- → 'dewasa'
```

**Cutoff:**
- balita: < 5 tahun
- anak: 5 – < 13 tahun
- remaja: 13 – < 19 tahun
- dewasa: ≥ 19 tahun

---

### 7.2 `age_years(birth_date)`

**Signature:** `age_years(p_birth_date date) RETURNS integer`

Umur dalam **tahun** (integer, hasil pembulatan ke bawah).

```sql
SELECT public.age_years('2020-03-15'::date);  -- → 6 (jika hari ini 2026-05-17)
```

---

### 7.3 `age_months(birth_date)`

**Signature:** `age_months(p_birth_date date) RETURNS integer`

Umur dalam **bulan** — penting untuk balita 0-59 bulan (WHO Z-score lookup pakai umur bulan).

```sql
SELECT public.age_months('2024-11-15'::date);  -- → 18 (jika hari ini 2026-05-17)
```

---

### 7.4 `is_admin()`

**Signature:** `is_admin() RETURNS boolean`
**Mode:** `SECURITY DEFINER STABLE`

Cek apakah current user adalah admin **aktif**. Dipakai di hampir semua RLS policy.

```sql
SELECT public.is_admin();  -- true / false
```

Implementasi:
```sql
SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
);
```

**Catatan:** Karena `SECURITY DEFINER`, function ini bypass RLS saat query profiles → mencegah recursion infinite ketika policy profiles itu sendiri memanggil `is_admin()`.

---

### 7.5 `owns_subject(subject_id)`

**Signature:** `owns_subject(p_subject_id uuid) RETURNS boolean`
**Mode:** `SECURITY DEFINER STABLE`

Cek apakah subject_id milik current user (`profile_id = auth.uid()`).

Dipakai di policy `growth_log`, `nutrition_log`, `nutrition_target`:
```sql
CREATE POLICY "growth_select_own_or_admin" ON public.growth_log
    FOR SELECT USING (public.owns_subject(subject_id) OR public.is_admin());
```

---

### 7.6 `set_updated_at()`

**Signature:** `set_updated_at() RETURNS trigger`

Trigger function untuk auto-update kolom `updated_at` setiap UPDATE.

Implementasi:
```sql
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
```

Dipakai oleh 4 trigger:
- `trigger_profiles_updated_at`
- `trigger_subjects_updated_at`
- `trigger_food_updated_at`
- `trigger_articles_updated_at`

---

## 8. Trigger Functions

Function khusus yang dipanggil oleh TRIGGER (bukan dipanggil langsung).

### 8.1 `log_audit_action()`

**Signature:** `log_audit_action() RETURNS trigger`
**Mode:** `SECURITY DEFINER SET search_path = public`

**Function paling penting** — mencatat semua CUD ke `audit_log` secara otomatis.

**Cara kerja:**
1. Baca argumen `TG_ARGV[0]` → `target_type` (food/profile/subject/article)
2. Deteksi `TG_OP` (INSERT/UPDATE/DELETE) → set `action` & `old_data`/`new_data`
3. Lookup actor email & role dari `auth.users` + `profiles`
4. INSERT ke `audit_log`

**Snapshot strategy:**
- INSERT: `old_data=NULL`, `new_data=to_jsonb(NEW)`
- UPDATE: `old_data=to_jsonb(OLD)`, `new_data=to_jsonb(NEW)`
- DELETE: `old_data=to_jsonb(OLD)`, `new_data=NULL`

Dipakai oleh 4 trigger:
| Trigger | Tabel | Argument |
|---|---|---|
| `trigger_audit_food` | food | `'food'` |
| `trigger_audit_profiles` | profiles | `'profile'` |
| `trigger_audit_subjects` | subjects | `'subject'` |
| `trigger_audit_articles` | articles | `'article'` |

---

### 8.2 `handle_new_user()`

**Signature:** `handle_new_user() RETURNS trigger`
**Mode:** `SECURITY DEFINER SET search_path = public`

Auto-create row di `public.profiles` saat user baru signup di `auth.users`.

Implementasi:
```sql
INSERT INTO public.profiles (id, full_name, role)
VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user'
);
```

- Default role: `'user'`
- Default full_name: dari `raw_user_meta_data.full_name` (kalau ada), fallback ke bagian sebelum `@` di email

Dipakai oleh trigger `on_auth_user_created` (AFTER INSERT ON auth.users).

---

### 8.3 `set_food_verified_timestamp()`

**Signature:** `set_food_verified_timestamp() RETURNS trigger`

Auto-set `verified_at` & `verified_by` saat admin toggle `is_verified`.

**Logika:**
- Jika `is_verified` berubah `false → true`: set `verified_at = NOW()`, `verified_by = auth.uid()`
- Jika `is_verified` berubah ke `false`: reset keduanya ke NULL

Dipakai oleh trigger `trigger_food_verified_timestamp` (BEFORE UPDATE).

---

### 8.4 `set_article_published_timestamp()`

**Signature:** `set_article_published_timestamp() RETURNS trigger`

Auto-set `published_at` saat artikel di-publish atau di-unpublish.

**Logika:**
- Saat INSERT dengan `is_published=true`: set `published_at = NOW()`
- Saat UPDATE `false → true`: set `published_at = NOW()`
- Saat UPDATE ke `false`: reset `published_at = NULL`

Dipakai oleh trigger `trigger_article_published_timestamp` (BEFORE INSERT OR UPDATE).

---

### 8.5 `set_nutrition_log_date()`

**Signature:** `set_nutrition_log_date() RETURNS trigger`

Auto-set kolom `log_date` di `nutrition_log` berdasarkan `logged_at`, dikonversi ke timezone **Asia/Jakarta**.

**Implementasi:**
```sql
NEW.log_date := (NEW.logged_at AT TIME ZONE 'Asia/Jakarta')::date;
```

**Kenapa pakai trigger, bukan GENERATED COLUMN?**
PostgreSQL hanya mengizinkan ekspresi `IMMUTABLE` di GENERATED COLUMN. Cast `timestamptz::date` adalah `STABLE` (hasilnya bergantung timezone session) → ditolak dengan error `42P17: generation expression is not immutable`. Solusinya: pakai BEFORE INSERT/UPDATE trigger dengan timezone eksplisit `Asia/Jakarta`.

**Konsekuensi:** Tanggal `log_date` selalu sesuai zona waktu WIB, tidak terpengaruh session timezone server.

Dipakai oleh trigger `trigger_set_nutrition_log_date` (BEFORE INSERT OR UPDATE).

---

## 9. Triggers

### 9.1 Audit Triggers (4)

```sql
trigger_audit_food      AFTER INSERT/UPDATE/DELETE ON food      → log_audit_action('food')
trigger_audit_profiles  AFTER INSERT/UPDATE/DELETE ON profiles  → log_audit_action('profile')
trigger_audit_subjects  AFTER INSERT/UPDATE/DELETE ON subjects  → log_audit_action('subject')
trigger_audit_articles  AFTER INSERT/UPDATE/DELETE ON articles  → log_audit_action('article')
```

### 9.2 Updated_at Triggers (4)

```sql
trigger_profiles_updated_at  BEFORE UPDATE ON profiles  → set_updated_at()
trigger_subjects_updated_at  BEFORE UPDATE ON subjects  → set_updated_at()
trigger_food_updated_at      BEFORE UPDATE ON food      → set_updated_at()
trigger_articles_updated_at  BEFORE UPDATE ON articles  → set_updated_at()
```

### 9.3 Auth Integration Triggers (1)

```sql
on_auth_user_created  AFTER INSERT ON auth.users  → handle_new_user()
```

### 9.4 Auto-Timestamp Triggers (3)

```sql
trigger_food_verified_timestamp     BEFORE UPDATE ON food            → set_food_verified_timestamp()
trigger_article_published_timestamp BEFORE INSERT/UPDATE ON articles → set_article_published_timestamp()
trigger_set_nutrition_log_date      BEFORE INSERT/UPDATE ON nutrition_log → set_nutrition_log_date()
```

**Total: 15 triggers** (timing & event yang berbeda untuk audit AFTER vs timestamp BEFORE).

---

## 10. Row Level Security (RLS)

RLS aktif di **semua 8 tabel**. Total **28 policy**.

### 10.1 Aturan Umum

| Pattern | Arti |
|---|---|
| `id = auth.uid()` | User hanya akses datanya sendiri |
| `public.is_admin()` | Bypass untuk admin |
| `public.owns_subject(subject_id)` | Akses jika subject milik user |
| `auth.role() = 'authenticated'` | Semua user login |

### 10.2 Policy per Tabel

#### `profiles`
| Policy | Operasi | Aturan |
|---|---|---|
| `profile_select_own_or_admin` | SELECT | User lihat dirinya, admin lihat semua |
| `profile_insert_own` | INSERT | User hanya bisa insert dirinya |
| `profile_update_own_or_admin` | UPDATE | User edit dirinya, admin edit semua |
| `profile_delete_admin_only` | DELETE | Hanya admin |

#### `subjects`
| Policy | Operasi | Aturan |
|---|---|---|
| `subject_select_own_or_admin` | SELECT | Pemilik atau admin |
| `subject_insert_own` | INSERT | Hanya untuk profile sendiri |
| `subject_update_own_or_admin` | UPDATE | Pemilik atau admin |
| `subject_delete_own_or_admin` | DELETE | Pemilik atau admin |

#### `growth_log`, `nutrition_log`, `nutrition_target`
Pola sama:
| Operasi | Aturan |
|---|---|
| SELECT | `owns_subject() OR is_admin()` |
| INSERT/UPDATE/DELETE | `owns_subject()` saja (admin tidak bisa write data user) |

#### `food` (Admin-Only CRUD)
| Policy | Operasi | Aturan |
|---|---|---|
| `food_select_active_or_admin` | SELECT | User lihat yang `deleted_at IS NULL`, admin lihat semua |
| `food_insert_admin_only` | INSERT | Hanya admin |
| `food_update_admin_only` | UPDATE | Hanya admin |
| `food_delete_admin_only` | DELETE | Hanya admin |

#### `articles` (Admin-Only CRUD)
| Policy | Operasi | Aturan |
|---|---|---|
| `article_select_published_or_admin` | SELECT | User lihat yang `is_published=true`, admin lihat semua |
| `article_insert_admin_only` | INSERT | Hanya admin |
| `article_update_admin_only` | UPDATE | Hanya admin |
| `article_delete_admin_only` | DELETE | Hanya admin |

#### `audit_log` (Immutable)
| Policy | Operasi | Aturan |
|---|---|---|
| `audit_select_admin_only` | SELECT | Hanya admin |
| — | INSERT | **Tidak ada policy** → diblokir (kecuali via trigger SECURITY DEFINER) |
| — | UPDATE | **Tidak ada policy** → diblokir selamanya |
| — | DELETE | **Tidak ada policy** → diblokir selamanya |

---

## 11. Views

### 11.1 `subjects_enriched`

Subjects + life_stage + umur dihitung otomatis.

```sql
SELECT s.*,
    life_stage_of(birth_date) AS life_stage,
    age_years(birth_date)     AS age_years,
    age_months(birth_date)    AS age_months
FROM subjects s;
```

**Use case:** Dashboard list semua subjek dengan info tahap usia.

---

### 11.2 `daily_nutrition_summary`

Total kalori & makro per subject per hari.

```sql
SELECT subject_id, log_date,
    SUM(calories) AS total_calories,
    SUM(protein), SUM(carbs), SUM(fat),
    COUNT(*) AS meal_count
FROM nutrition_log
GROUP BY subject_id, log_date;
```

**Use case:** Progress bar harian — total dimakan vs target.

---

### 11.3 `latest_growth`

Pengukuran TB/BB terbaru per subject (untuk dashboard).

```sql
SELECT DISTINCT ON (subject_id)
    subject_id, weight_kg, height_cm, bmi,
    height_for_age, weight_for_age, weight_for_height,
    stunting_status, wasting_status,
    recorded_at
FROM growth_log
ORDER BY subject_id, recorded_at DESC;
```

**Use case:** Card "Status Stunting" di dashboard balita.

---

### 11.4 `active_targets`

Target gizi aktif terbaru per subject (yang `effective_from <= today`).

```sql
SELECT DISTINCT ON (subject_id) *
FROM nutrition_target
WHERE effective_from <= CURRENT_DATE
ORDER BY subject_id, effective_from DESC;
```

**Use case:** Bandingkan asupan harian vs target untuk progress bar.

---

### 11.5 `food_active`

Food yang tidak soft-deleted — siap dipakai autocomplete.

```sql
SELECT id, name, brand, category, ...
FROM food WHERE deleted_at IS NULL;
```

---

### 11.6 `audit_log_detailed`

Audit log + nama actor (join dengan profiles).

```sql
SELECT a.*, p.full_name AS actor_name
FROM audit_log a
LEFT JOIN profiles p ON p.id = a.actor_id;
```

**Use case:** Tabel "Activity Log" di dashboard admin.

---

### 11.7 `admin_dashboard_stats`

Statistik ringkas untuk admin dashboard.

```sql
active_users, inactive_users, total_subjects,
total_foods, verified_foods,
published_articles, today_audit_count
```

---

## 12. Grants

Supabase pakai PostgREST untuk API — view & function harus di-GRANT ke role `authenticated`:

### Views (SELECT)
```sql
GRANT SELECT ON subjects_enriched, daily_nutrition_summary, latest_growth,
                active_targets, food_active, audit_log_detailed,
                admin_dashboard_stats
TO authenticated;
```

### Functions (EXECUTE)
```sql
GRANT EXECUTE ON FUNCTION life_stage_of(date), age_years(date),
                          age_months(date), is_admin(), owns_subject(uuid)
TO authenticated;
```

**Catatan:** Tabel-tabel sudah otomatis ada GRANT default dari Supabase. Yang penting RLS-nya yang membatasi akses.

---

## 13. Deployment Guide

### 13.1 Run Schema di Supabase

1. Buka **Supabase Dashboard** → Project → SQL Editor
2. New Query → paste seluruh isi `peta/supabase/schema.sql`
3. Klik **Run** (jalankan sekali jalan, urutan sudah benar)
4. Verify: cek di Table Editor — harus ada 8 tabel + 7 view

### 13.2 Promote Admin Pertama

Setelah signup user pertama:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'youremail@gmail.com');
```

### 13.3 Generate TypeScript Types

```bash
pnpm dlx supabase gen types typescript --project-id <your-id> > peta/lib/database.types.ts
```

### 13.4 Verifikasi Setup

```sql
-- 1. Cek RLS aktif di semua tabel
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- 2. Cek jumlah policy per tabel
SELECT tablename, COUNT(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename;

-- 3. Cek trigger
SELECT event_object_table, trigger_name, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

---

## 14. Common Use Cases & Query Patterns

### 14.1 Onboarding — User Baru Buat Subject "Self"

```typescript
const { data: subject } = await supabase
  .from('subjects')
  .insert({
    profile_id: user.id,
    name: 'Andi',
    gender: 'male',
    birth_date: '1998-03-15',
    relationship: 'self',
    is_primary: true,
    height_cm: 175,
    activity_level: 1.55,
  })
  .select()
  .single();
```

### 14.2 Tambah Pengukuran TB/BB Anak

```typescript
const { data } = await supabase
  .from('growth_log')
  .insert({
    subject_id: childId,
    weight_kg: 12.5,
    height_cm: 85.2,
    height_for_age: -1.2,
    weight_for_age: -0.8,
    weight_for_height: -0.5,
    stunting_status: 'normal',
    wasting_status: 'normal',
    recorded_at: '2026-05-17',
  });
```

### 14.3 Search Food (Autocomplete)

```typescript
const { data: foods } = await supabase
  .from('food_active')
  .select('id, name, calories_per_100g, protein_per_100g')
  .ilike('name', `%${query}%`)
  .limit(10);
```

### 14.4 Catat Makanan

```typescript
const { data: food } = await supabase
  .from('food')
  .select('*')
  .eq('id', foodId)
  .single();

const servingQty = 1.5;
await supabase.from('nutrition_log').insert({
  subject_id: subjectId,
  food_id: food.id,
  food_name: food.name,
  serving_quantity: servingQty,
  serving_unit: 'porsi',
  calories: food.calories_per_100g * servingQty,
  protein:  food.protein_per_100g  * servingQty,
  carbs:    food.carbs_per_100g    * servingQty,
  fat:      food.fat_per_100g      * servingQty,
  meal: 'lunch',
});
```

### 14.5 Dashboard Harian — Total vs Target

```typescript
const today = new Date().toISOString().slice(0, 10);

const { data: summary } = await supabase
  .from('daily_nutrition_summary')
  .select('*')
  .eq('subject_id', subjectId)
  .eq('log_date', today)
  .single();

const { data: target } = await supabase
  .from('active_targets')
  .select('*')
  .eq('subject_id', subjectId)
  .single();

// Progress: summary.total_calories / target.daily_calories * 100
```

### 14.6 List Anak + Status Stunting

```typescript
const { data: children } = await supabase
  .from('subjects_enriched')
  .select(`
    id, name, age_months, life_stage,
    latest_growth ( stunting_status, haz_score, recorded_at )
  `)
  .eq('profile_id', user.id)
  .in('life_stage', ['balita', 'anak']);
```

### 14.7 Admin: Lihat Audit Log Hari Ini

```typescript
const { data: logs } = await supabase
  .from('audit_log_detailed')
  .select('*')
  .gte('created_at', new Date().toISOString().slice(0, 10))
  .order('created_at', { ascending: false });
```

### 14.8 Admin: Soft-Delete Food

```typescript
await supabase
  .from('food')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', foodId);
```
Nutrition_log historis tetap valid karena snapshot `food_name`, `calories`, dll.

### 14.9 Admin: Verifikasi Food

```typescript
await supabase
  .from('food')
  .update({ is_verified: true })
  .eq('id', foodId);

// verified_at & verified_by otomatis ke-set via trigger
```

### 14.10 Admin: Publish Article

```typescript
await supabase
  .from('articles')
  .insert({
    title: 'Tips MPASI Tinggi Protein',
    slug: 'tips-mpasi-tinggi-protein',
    content: '...',
    target_life_stage: 'balita',
    author_id: adminId,
    is_published: true,
  });

// published_at otomatis ke-set via trigger
```

---

## Lampiran: Daftar Lengkap Object Database

### Tables (8)
- `profiles`, `subjects`, `growth_log`, `food`, `nutrition_log`, `nutrition_target`, `articles`, `audit_log`

### Enums (11)
- `gender_type`, `relationship_type`, `stunting_status_type`, `wasting_status_type`, `food_source_type`, `meal_type`, `profile_type`, `life_stage_type`, `audit_target_type`, `action_type`, `category_type`

### Helper Functions (6)
- `life_stage_of(date)`, `age_years(date)`, `age_months(date)`, `is_admin()`, `owns_subject(uuid)`, `set_updated_at()`

### Trigger Functions (5)
- `log_audit_action()`, `handle_new_user()`, `set_food_verified_timestamp()`, `set_article_published_timestamp()`, `set_nutrition_log_date()`

### Triggers (15)
- Audit: 4 — Updated_at: 4 — Auth: 1 — Timestamp: 3 (food_verified, article_published, nutrition_log_date)

### Views (7)
- `subjects_enriched`, `daily_nutrition_summary`, `latest_growth`, `active_targets`, `food_active`, `audit_log_detailed`, `admin_dashboard_stats`

### Indexes (16 + 1 partial unique)
- Subject: 2 — Growth: 1 — Food: 3 — Nutrition: 2 — Target: 1 — Articles: 3 — Audit: 4

### RLS Policies (28)
- profiles: 4 — subjects: 4 — growth_log: 4 — food: 4 — nutrition_log: 4 — nutrition_target: 4 — articles: 4 — audit_log: 1 (SELECT only — write blocked)

---

## Changelog

| Versi | Tanggal | Perubahan |
|---|---|---|
| v1 | — | Struktur awal: profiles + dependents |
| v2 | — | Refactor: profiles + subjects pattern |
| v3 | — | Tambah role & audit_log |
| v4 | 2026-05-17 | Tambah articles, food category, soft delete, verified status, view dashboard admin, fix semua bug |
| **v4.1** | 2026-05-17 | Fix error `42P17`: ganti `nutrition_log.log_date` dari GENERATED COLUMN ke trigger-based (timezone Asia/Jakarta) |

---

> **Referensi Eksternal:**
> - WHO Child Growth Standards (2006) — untuk Z-score balita
> - WHO Growth Reference 5-19 years (2007) — untuk anak/remaja
> - Permenkes RI No. 2 Tahun 2020 — Standar Antropometri Anak
> - Permenkes RI No. 28 Tahun 2019 — AKG Indonesia
> - Mifflin-St Jeor (1990) — BMR untuk dewasa
> - Quetelet (1832) / Keys et al. (1972) — Body Mass Index
