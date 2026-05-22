# [API_BE] Authentication API Documentation — PETA

> **Base URL**: `https://<your-domain>/api`
> **Spec**: OpenAPI 3.0 — lihat [`api-spec/openapi.yaml`](api-spec/openapi.yaml)
> **Auth Provider**: Supabase Auth (cookie-based session via `@supabase/ssr`)
> **Last Updated**: 2026-05-17

---

## Daftar Isi

1. [Overview](#1-overview)
2. [Authentication Flow](#2-authentication-flow)
3. [Endpoints](#3-endpoints)
4. [Response Format](#4-response-format)
5. [Error Codes](#5-error-codes)
6. [Testing Guide](#6-testing-guide)

---

## 1. Overview

API authentication PETA dibangun di atas **Supabase Auth** dengan pola **cookie-based session** (httpOnly cookie via `@supabase/ssr`).

### Endpoint Summary

| Method | Path | Deskripsi | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Daftar user baru | ❌ |
| `POST` | `/api/auth/login` | Login dengan email + password | ❌ |
| `POST` | `/api/auth/logout` | Logout (clear session) | ✅ |
| `GET`  | `/api/auth/me` | Get current user info | ✅ |

---

## 2. Authentication Flow

### Register & Login Flow

```
Client                              Server                          Supabase
  │                                    │                                │
  │  POST /api/auth/register           │                                │
  │  { email, password, fullName }     │                                │
  ├───────────────────────────────────▶│                                │
  │                                    │  supabase.auth.signUp()        │
  │                                    ├───────────────────────────────▶│
  │                                    │                                │
  │                                    │  ON INSERT auth.users:         │
  │                                    │  → trigger handle_new_user()   │
  │                                    │  → INSERT public.profiles      │
  │                                    │                                │
  │                                    │  ◀──── { user, session }       │
  │                                    │                                │
  │                                    │  Set-Cookie:                   │
  │                                    │    sb-<id>-auth-token=...      │
  │  ◀─── 201 Created                  │  (httpOnly, secure, sameSite)  │
  │  { user, session }                 │                                │
```

### Authenticated Request Flow

```
Client (browser)                     Server
  │                                     │
  │  GET /api/auth/me                   │
  │  Cookie: sb-...-auth-token=...      │
  ├────────────────────────────────────▶│
  │                                     │  createServerClient(cookies)
  │                                     │  supabase.auth.getUser()
  │                                     │  (cookie auto-read & validate)
  │                                     │
  │  ◀──── 200 OK                       │
  │  { user: {...} }                    │
```

---

## 3. Endpoints

### 3.1 `POST /api/auth/register`

Daftar user baru. Trigger `handle_new_user()` di database otomatis membuat row di `public.profiles` dengan `role='user'`.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "Andi Wijaya"
}
```

**Validation:**
- `email`: string, format email valid
- `password`: string, minimal 8 karakter
- `fullName`: string, 2-100 karakter

#### Response

**Success — `201 Created`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "8a3d2e9f-1c4b-4a5e-9d8f-7c6b5a4e3d2c",
      "email": "user@example.com",
      "fullName": "Andi Wijaya",
      "role": "user"
    },
    "session": {
      "accessToken": "eyJhbGc...",
      "expiresAt": "2026-05-17T12:00:00.000Z"
    }
  }
}
```

**Error — `400 Bad Request` (Validation):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input tidak valid",
    "details": {
      "email": ["Format email tidak valid"],
      "password": ["Password minimal 8 karakter"]
    }
  }
}
```

**Error — `409 Conflict`:**
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "Email sudah terdaftar"
  }
}
```

#### cURL Example

```bash
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "andi@petai.id",
    "password": "Secure123!",
    "fullName": "Andi Wijaya"
  }'
```

---

### 3.2 `POST /api/auth/login`

Login dengan email + password. Session disimpan sebagai httpOnly cookie.

#### Request

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Response

**Success — `200 OK`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "fullName": "Andi Wijaya",
      "role": "user"
    },
    "session": {
      "accessToken": "eyJhbGc...",
      "expiresAt": "2026-05-17T12:00:00.000Z"
    }
  }
}
```

**Error — `401 Unauthorized`:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email atau password salah"
  }
}
```

#### cURL Example

```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "andi@petai.id",
    "password": "Secure123!"
  }'
```

Pakai `-c cookies.txt` untuk simpan cookie, lalu `-b cookies.txt` di request berikutnya.

---

### 3.3 `POST /api/auth/logout`

Logout user. Hapus session cookie.

#### Request

**Headers:**
```
Cookie: sb-<project>-auth-token=...
```

**Body:** (kosong)

#### Response

**Success — `200 OK`:**
```json
{
  "success": true,
  "data": {
    "message": "Logout berhasil"
  }
}
```

#### cURL Example

```bash
curl -X POST https://your-domain.com/api/auth/logout \
  -b cookies.txt
```

---

### 3.4 `GET /api/auth/me`

Get info user yang sedang login. Berguna untuk hydrate state di client setelah refresh.

#### Request

**Headers:**
```
Cookie: sb-<project>-auth-token=...
```

#### Response

**Success — `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "8a3d2e9f-...",
    "email": "user@example.com",
    "fullName": "Andi Wijaya",
    "role": "user",
    "avatarUrl": null,
    "isAdmin": false
  }
}
```

**Error — `401 Unauthorized`:**
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User tidak ditemukan"
  }
}
```

#### cURL Example

```bash
curl -X GET https://your-domain.com/api/auth/me \
  -b cookies.txt
```

---

## 4. Response Format

Semua response mengikuti format standar:

### Success Response

```typescript
{
  success: true,
  data: <T>  // tipe spesifik per endpoint
}
```

### Error Response

```typescript
{
  success: false,
  error: {
    code: string,        // machine-readable code (e.g., 'INVALID_CREDENTIALS')
    message: string,     // human-readable message dalam Bahasa Indonesia
    details?: object     // optional, untuk validation errors
  }
}
```

---

## 5. Error Codes

| HTTP Status | Code | Message | Kapan Terjadi |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | Input tidak valid | Body tidak sesuai Zod schema |
| `400` | `WEAK_PASSWORD` | Password terlalu lemah | Supabase tolak password |
| `401` | `INVALID_CREDENTIALS` | Email atau password salah | Login gagal |
| `401` | `USER_NOT_FOUND` | User tidak ditemukan | Token invalid / expired |
| `409` | `EMAIL_EXISTS` | Email sudah terdaftar | Register dengan email yang sudah ada |
| `500` | `INTERNAL_ERROR` | Terjadi kesalahan | Bug / DB error / network |
| `500` | `PROFILE_NOT_FOUND` | Profile tidak ditemukan | Trigger handle_new_user gagal |

---

## 6. Testing Guide

### A. Pakai Postman

1. Import OpenAPI spec: File → Import → Pilih `docs/api-spec/openapi.yaml`
2. Postman akan auto-generate collection dengan 4 request
3. Set environment variable `baseUrl` ke `http://localhost:3000`
4. Run request `register` → `login` → `me` → `logout` berurutan
5. Cookie otomatis disimpan oleh Postman (default behavior)

### B. Pakai Swagger UI Online

1. Buka [Swagger Editor](https://editor.swagger.io/)
2. File → Import file → pilih `openapi.yaml`
3. Test request langsung dari browser (klik "Try it out")

### C. Pakai cURL

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@test.id","password":"Test1234!","fullName":"Test User"}'

# 2. Get current user
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt

# 3. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt

# 4. Login (after logout)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@test.id","password":"Test1234!"}'
```

### D. Pakai HTTP File di VSCode (REST Client)

Install extension "REST Client" → buat file `tests/auth.http`:

```http
### Register
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "test@test.id",
  "password": "Test1234!",
  "fullName": "Test User"
}

### Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@test.id",
  "password": "Test1234!"
}

### Me
GET http://localhost:3000/api/auth/me

### Logout
POST http://localhost:3000/api/auth/logout
```

---

## Catatan Implementasi

### Cookie Configuration

Cookie session di-set otomatis oleh `@supabase/ssr` dengan:
- **httpOnly**: ✅ (tidak bisa diakses JavaScript di client)
- **secure**: ✅ (HTTPS only di production)
- **sameSite**: `lax` (default)
- **path**: `/`
- **expires**: ~1 jam (refresh token diatur otomatis)

### CSRF Protection

Cookie `sameSite=lax` cukup untuk mitigasi CSRF dasar. Untuk endpoint write (POST/PATCH/DELETE), pertimbangkan tambahan:
- Origin/Referer check di middleware
- CSRF token di header (kalau pakai cross-origin)

### Rate Limiting

**Belum diimplementasi.** Rekomendasi:
- Pakai Supabase Auth built-in rate limiting (default: 30 req/hour per IP untuk signup)
- Atau pakai Upstash Rate Limit di middleware

### Refresh Token

Refresh token di-handle otomatis oleh `@supabase/ssr` saat session mau expire. Tidak perlu endpoint manual.
