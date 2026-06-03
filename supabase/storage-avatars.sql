-- =====================================================================
-- Supabase Storage setup: bucket `avatars` untuk foto profil user PETA.
-- =====================================================================
-- Cara pakai:
--   1. Buka Supabase Dashboard → SQL Editor.
--   2. Paste seluruh file ini, lalu Run.
--   3. Atau: buat bucket manual di Storage tab dulu (Public = ON),
--      lalu jalankan hanya bagian POLICY di bawah.
--
-- Bucket dibuat PUBLIC supaya URL avatar bisa dipakai langsung di <img src>.
-- Tetap aman: write (INSERT/UPDATE/DELETE) di-gate oleh RLS — user hanya bisa
-- menulis ke folder dengan prefix UUID-nya sendiri.
-- =====================================================================


-- 1) Buat bucket (idempotent: tidak error kalau sudah ada).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,                       -- public read
    2 * 1024 * 1024,            -- max 2 MB per file
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public             = EXCLUDED.public,
    file_size_limit    = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;


-- 2) Policy: siapa pun (anon + authenticated) boleh BACA file di bucket ini.
--    Public bucket sudah membolehkan getPublicUrl(), policy ini menegaskan.
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');


-- 3) Policy: authenticated user hanya boleh upload ke folder ber-prefix
--    UUID-nya sendiri. Path file kita: `{user_id}/avatar-{ts}.{ext}`.
DROP POLICY IF EXISTS "avatars_insert_own_folder" ON storage.objects;
CREATE POLICY "avatars_insert_own_folder" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );


-- 4) Policy: user hanya boleh meng-update file miliknya sendiri
--    (mis. kalau ke depan kita pakai upsert).
DROP POLICY IF EXISTS "avatars_update_own_folder" ON storage.objects;
CREATE POLICY "avatars_update_own_folder" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );


-- 5) Policy: user hanya boleh menghapus file miliknya sendiri.
DROP POLICY IF EXISTS "avatars_delete_own_folder" ON storage.objects;
CREATE POLICY "avatars_delete_own_folder" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );


-- =====================================================================
-- Selesai. Cek hasil:
--   SELECT id, name, public FROM storage.buckets WHERE id = 'avatars';
--   SELECT policyname, cmd FROM pg_policies WHERE schemaname='storage' AND tablename='objects';
-- =====================================================================
