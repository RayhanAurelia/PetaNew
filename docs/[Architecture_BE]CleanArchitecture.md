# [Architecture_BE] Clean Architecture Documentation — PETA

> **Project**: PETA — Pencegahan Stunting & Tracker Gizi
> **Framework**: Next.js 16 (App Router) + Supabase
> **Pattern**: Clean Architecture (Robert C. Martin, 2012)
> **Last Updated**: 2026-05-17

---

## Daftar Isi

1. [Filosofi Clean Architecture](#1-filosofi-clean-architecture)
2. [Struktur Folder PETA](#2-struktur-folder-peta)
3. [Penjelasan Setiap Layer](#3-penjelasan-setiap-layer)
4. [Aturan Dependency (The Dependency Rule)](#4-aturan-dependency-the-dependency-rule)
5. [Alur Request (Request Flow)](#5-alur-request-request-flow)
6. [Naming Convention](#6-naming-convention)
7. [Cara Menambah Fitur Baru](#7-cara-menambah-fitur-baru)

---

## 1. Filosofi Clean Architecture

Clean Architecture memisahkan kode menjadi **lapisan konsentris**, di mana **business logic** (inti aplikasi) **tidak tahu** tentang framework, database, atau UI.

### Tujuan Utama

| Tujuan | Manfaat |
|---|---|
| **Independen framework** | Ganti Next.js → Express tanpa ubah business logic |
| **Independen database** | Ganti Supabase → MySQL tanpa ubah use case |
| **Testable** | Bisa unit test tanpa internet/DB (pakai mock) |
| **Independen UI** | Bisa pakai React, mobile, atau CLI dengan logic yang sama |

### Diagram Layer

```
        ┌───────────────────────────────────────────────────────┐
        │  4. Presentation (Next.js Route Handlers)             │
        │     app/api/auth/*/route.ts                            │
        │  ┌─────────────────────────────────────────────────┐  │
        │  │  3. Infrastructure (Supabase implementation)    │  │
        │  │     src/infrastructure/                          │  │
        │  │  ┌───────────────────────────────────────────┐  │  │
        │  │  │  2. Application (Use Cases + DTOs)        │  │  │
        │  │  │     src/application/                       │  │  │
        │  │  │  ┌─────────────────────────────────────┐  │  │  │
        │  │  │  │  1. Domain (Entities + Interfaces)  │  │  │  │
        │  │  │  │     src/domain/                      │  │  │  │
        │  │  │  └─────────────────────────────────────┘  │  │  │
        │  │  └───────────────────────────────────────────┘  │  │
        │  └─────────────────────────────────────────────────┘  │
        └───────────────────────────────────────────────────────┘
        
                Dependency points INWARD (→ ke dalam)
                Layer dalam tidak tahu layer luar
```

---

## 2. Struktur Folder PETA

```
peta/
├── src/                                    ← Core Clean Architecture
│   ├── domain/                             ← Layer 1: Domain
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   └── Session.ts
│   │   ├── repositories/
│   │   │   └── IAuthRepository.ts
│   │   └── errors/
│   │       └── AuthErrors.ts
│   │
│   ├── application/                        ← Layer 2: Application
│   │   ├── use-cases/
│   │   │   └── auth/
│   │   │       ├── RegisterUserUseCase.ts
│   │   │       ├── LoginUserUseCase.ts
│   │   │       ├── LogoutUserUseCase.ts
│   │   │       └── GetCurrentUserUseCase.ts
│   │   ├── dtos/
│   │   │   └── auth/
│   │   │       ├── RegisterDTO.ts
│   │   │       └── LoginDTO.ts
│   │   └── validators/
│   │       └── auth/
│   │           └── authSchema.ts
│   │
│   └── infrastructure/                     ← Layer 3: Infrastructure
│       ├── supabase/
│       │   └── repositories/
│       │       └── SupabaseAuthRepository.ts
│       ├── mappers/
│       │   ├── UserMapper.ts
│       │   └── SessionMapper.ts
│       └── di/
│           └── container.ts
│
├── app/                                    ← Layer 4: Presentation
│   └── api/
│       └── auth/
│           ├── register/route.ts
│           ├── login/route.ts
│           ├── logout/route.ts
│           └── me/route.ts
│
├── lib/                                    ← Shared helpers (framework-specific)
│   └── supabase/
│       └── server.ts                       ← Supabase server client
│
└── docs/
    ├── [Schema-SQL_BE]Database.md
    ├── [Architecture_BE]CleanArchitecture.md  ← FILE INI
    ├── [API_BE]Authentication.md
    └── api-spec/
        └── openapi.yaml
```

---

## 3. Penjelasan Setiap Layer

### Layer 1: Domain (`src/domain/`)

**Inti bisnis. Tidak boleh import apa pun dari luar.**

#### `entities/`
Pure business objects — TypeScript class biasa, tidak bergantung pada framework atau database.

**Contoh: `User.ts`**
```typescript
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly fullName: string,
    public readonly role: 'user' | 'admin',
    // ...
  ) {}

  isAdmin(): boolean {
    return this.role === 'admin';
  }
}
```

- ❌ TIDAK boleh import dari Supabase, Next.js, atau library eksternal
- ✅ Boleh ada method bisnis (`isAdmin()`, `isExpired()`, dll)
- ✅ Imutable (pakai `readonly`)

#### `repositories/`
**Interface** (kontrak) yang nanti diimplementasikan di Infrastructure layer.

**Contoh: `IAuthRepository.ts`**
```typescript
export interface IAuthRepository {
  register(email: string, password: string, fullName: string): Promise<AuthResult>;
  login(email: string, password: string): Promise<AuthResult>;
  // ...
}
```

- Disinilah "Dependency Inversion" terjadi
- Use case bergantung pada interface ini, BUKAN pada implementasi konkret

#### `errors/`
Custom error class untuk domain — biar bisa di-catch & ditranslate ke HTTP status di Presentation layer.

---

### Layer 2: Application (`src/application/`)

**Business rules. Mengorkestrasi entities.**

#### `use-cases/`
Setiap aksi bisnis = 1 file. Pola: 1 class dengan satu method `execute()`.

**Contoh: `RegisterUserUseCase.ts`**
```typescript
export class RegisterUserUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(input: RegisterInputDTO): Promise<AuthOutputDTO> {
    const result = await this.authRepo.register(...);
    return { user: {...}, session: {...} };
  }
}
```

- Dependency injection via constructor
- Bergantung pada **interface** (`IAuthRepository`), bukan implementasi
- Return DTO, bukan entity langsung

#### `dtos/` (Data Transfer Objects)
Shape data yang masuk/keluar use case. Boilerplate tapi penting — memisahkan internal model dari API contract.

#### `validators/`
Input validation pakai Zod. Output: schema yang bisa di-`parse()` di Presentation layer.

---

### Layer 3: Infrastructure (`src/infrastructure/`)

**Implementasi konkret dari interface domain. Tahu tentang framework & database.**

#### `supabase/repositories/`
Implementasi `IAuthRepository` pakai Supabase.

**Contoh: `SupabaseAuthRepository.ts`**
```typescript
export class SupabaseAuthRepository implements IAuthRepository {
  constructor(private readonly client: SupabaseClient) {}

  async register(email, password, fullName): Promise<AuthResult> {
    const { data, error } = await this.client.auth.signUp({...});
    // translate Supabase error → domain error
    // map Supabase data → domain entity
    return { user: UserMapper.toDomain(...), session: ... };
  }
}
```

- Translate error Supabase → domain error (misal `Invalid credentials` → `InvalidCredentialsError`)
- Pakai mapper untuk convert tipe Supabase → entity domain

#### `mappers/`
Convert raw data (Supabase row) → Domain entity. Pure function.

#### `di/` (Dependency Injection)
Wire-up semua dependency di satu tempat. Bisa pakai library DI atau manual.

**Contoh: `container.ts`**
```typescript
export async function getAuthUseCases() {
  const supabase = await createClient();
  const authRepo = new SupabaseAuthRepository(supabase);
  return {
    register: new RegisterUserUseCase(authRepo),
    login: new LoginUserUseCase(authRepo),
    // ...
  };
}
```

---

### Layer 4: Presentation (`app/api/`)

**Adapter dari HTTP → Use Case. Thin layer.**

**Contoh: `app/api/auth/register/route.ts`**
```typescript
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = registerSchema.parse(body);             // validate
    const { register } = await getAuthUseCases();         // get use case
    const result = await register.execute(input);         // execute
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err) {
    return handleError(err);                              // map error → HTTP status
  }
}
```

**Tanggung jawab presentation layer:**
- Parse request (JSON, query params, cookies)
- Validate input (via Zod schema)
- Call use case
- Translate domain error → HTTP status code
- Format response

---

## 4. Aturan Dependency (The Dependency Rule)

> **Source code dependencies harus selalu menunjuk ke dalam.**

| Layer | Boleh import dari | TIDAK boleh import dari |
|---|---|---|
| **Domain** | (nothing) | Application, Infrastructure, Presentation |
| **Application** | Domain | Infrastructure, Presentation |
| **Infrastructure** | Domain, Application | Presentation |
| **Presentation** | Domain, Application, Infrastructure | (nothing — paling luar) |

### Cara Cek Apakah Aturannya Dilanggar

```bash
# Cek apakah domain layer punya import terlarang
grep -rE "from '.*(next|supabase|infrastructure|application|presentation)" src/domain/
# Output harus kosong!
```

### Anti-Pattern (JANGAN dilakukan)

❌ Import Supabase di entity:
```typescript
// src/domain/entities/User.ts
import { User as SupabaseUser } from '@supabase/supabase-js';  // ❌ DILARANG
```

❌ Import Next.js di use case:
```typescript
// src/application/use-cases/auth/RegisterUserUseCase.ts
import { NextRequest } from 'next/server';  // ❌ DILARANG
```

✅ Yang Benar:
```typescript
// Use case terima DTO (tipe milik domain/application)
async execute(input: RegisterInputDTO): Promise<AuthOutputDTO>
```

---

## 5. Alur Request (Request Flow)

### Contoh: User Register

```
1. Client POST /api/auth/register
   { email, password, fullName }
              ↓
2. [Presentation] app/api/auth/register/route.ts
   - Parse body via req.json()
   - Validate via registerSchema.parse()
              ↓
3. [Infrastructure DI] container.ts
   - Buat SupabaseClient (server-side)
   - Inject ke SupabaseAuthRepository
   - Inject repo ke RegisterUserUseCase
              ↓
4. [Application] RegisterUserUseCase.execute()
   - Panggil authRepo.register()
              ↓
5. [Infrastructure] SupabaseAuthRepository.register()
   - Call supabase.auth.signUp()
   - Translate error (jika ada) → domain error
   - Map Supabase data → Domain entity (User, Session)
              ↓
6. [Application] Use case returns AuthOutputDTO
              ↓
7. [Presentation] route.ts
   - NextResponse.json({ data, success: true })
              ↓
8. Client menerima 201 Created
```

### Aliran Error

```
[Supabase Error]
   ↓ (translate at Repository)
[Domain Error] e.g. EmailAlreadyExistsError
   ↓ (bubble up via throw)
[Use Case]
   ↓ (bubble up via throw)
[Presentation route.ts]
   ↓ (catch + map to HTTP status)
[HTTP Response] e.g. 409 Conflict
```

---

## 6. Naming Convention

| Pattern | Contoh | Lokasi |
|---|---|---|
| Entity | `User`, `Session` | `domain/entities/` |
| Interface | `IAuthRepository`, `IUserRepository` | `domain/repositories/` |
| Error | `InvalidCredentialsError`, `UserNotFoundError` | `domain/errors/` |
| Use Case | `RegisterUserUseCase`, `LoginUserUseCase` | `application/use-cases/<feature>/` |
| DTO | `RegisterInputDTO`, `AuthOutputDTO` | `application/dtos/<feature>/` |
| Validator | `registerSchema`, `loginSchema` (Zod) | `application/validators/<feature>/` |
| Repository impl | `SupabaseAuthRepository` | `infrastructure/<provider>/repositories/` |
| Mapper | `UserMapper`, `SessionMapper` | `infrastructure/mappers/` |
| Route handler | `route.ts` (file name fix dari Next.js) | `app/api/<feature>/<action>/` |

---

## 7. Cara Menambah Fitur Baru

Misalkan ingin menambah fitur **"Subjects Management"** (CRUD anak/dewasa yang dilacak):

### Step 1: Domain
```
src/domain/entities/Subject.ts             ← buat entity
src/domain/repositories/ISubjectRepository.ts  ← buat interface
src/domain/errors/SubjectErrors.ts         ← (kalau perlu) error khusus
```

### Step 2: Application
```
src/application/use-cases/subjects/
  CreateSubjectUseCase.ts
  ListSubjectsUseCase.ts
  UpdateSubjectUseCase.ts
  DeleteSubjectUseCase.ts
src/application/dtos/subjects/
  SubjectDTO.ts
src/application/validators/subjects/
  subjectSchema.ts
```

### Step 3: Infrastructure
```
src/infrastructure/supabase/repositories/SupabaseSubjectRepository.ts
src/infrastructure/mappers/SubjectMapper.ts
src/infrastructure/di/container.ts          ← tambah factory untuk subject
```

### Step 4: Presentation
```
app/api/subjects/route.ts                   ← GET (list), POST (create)
app/api/subjects/[id]/route.ts              ← GET (one), PATCH, DELETE
```

### Step 5: Dokumentasi
```
docs/[API_BE]Subjects.md
docs/api-spec/openapi.yaml                  ← tambah path /subjects
```

---

## Lampiran: Kapan Clean Architecture TIDAK Cocok?

Clean Architecture **overkill** untuk:
- ❌ Prototype / MVP cepat
- ❌ Aplikasi 1-orang dengan <5 fitur
- ❌ Tim tidak familiar dengan DI/Interface

Clean Architecture **wajib** untuk:
- ✅ Aplikasi enterprise / production jangka panjang
- ✅ Tim besar dengan banyak developer
- ✅ Project yang sering ganti vendor (DB, auth provider, dll)
- ✅ Aplikasi yang butuh test coverage tinggi

PETA dipilih Clean Architecture karena: **portofolio mahasiswa yang ingin menunjukkan pemahaman arsitektur software level enterprise**.
