"use client";

import { getBrowserSupabase } from "./client";

const BUCKET = "avatars";
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export class AvatarUploadError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "TOO_LARGE"
      | "BAD_TYPE"
      | "NO_SESSION"
      | "UPLOAD_FAILED",
  ) {
    super(message);
    this.name = "AvatarUploadError";
  }
}

export interface UploadAvatarResult {
  publicUrl: string;
  path: string;
}

/**
 * Upload file gambar ke bucket Supabase Storage `avatars` di folder user_id-nya,
 * lalu return public URL. Validasi tipe & ukuran di client supaya UX cepat.
 *
 * Folder convention: `${user.id}/avatar-${timestamp}.${ext}` — selaras dengan
 * RLS policy bucket avatars yang memeriksa `(storage.foldername(name))[1] = auth.uid()`.
 */
export async function uploadAvatar(file: File): Promise<UploadAvatarResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new AvatarUploadError(
      "Gambar harus berformat JPG, PNG, atau WebP.",
      "BAD_TYPE",
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new AvatarUploadError(
      `Ukuran gambar maksimal 2 MB (file ini ${(file.size / 1024 / 1024).toFixed(1)} MB).`,
      "TOO_LARGE",
    );
  }

  const supabase = getBrowserSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new AvatarUploadError(
      "Session habis. Silakan login ulang.",
      "NO_SESSION",
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new AvatarUploadError(
      uploadError.message || "Gagal mengunggah avatar ke storage.",
      "UPLOAD_FAILED",
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { publicUrl, path };
}
