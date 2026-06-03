-- ============================================================================
-- Admin: manajemen pengguna
-- ----------------------------------------------------------------------------
-- Email pengguna tersimpan di `auth.users` (tidak diekspos ke client biasa),
-- sedangkan role/status ada di `public.profiles`. Fungsi-fungsi di bawah ini
-- berjalan SECURITY DEFINER dan memverifikasi pemanggilnya admin lewat
-- `public.is_admin()`, sehingga panel admin bisa membaca email & menghapus akun
-- TANPA perlu menaruh service-role key di aplikasi.
--
-- Jalankan sekali di Supabase SQL Editor (idempotent — aman dijalankan ulang).
-- Perubahan role/status cukup lewat UPDATE biasa (RLS profiles sudah
-- mengizinkan admin), jadi tidak butuh fungsi khusus.
-- ============================================================================

-- Daftar pengguna (profil + email) dengan filter opsional.
CREATE OR REPLACE FUNCTION public.admin_list_users(
    p_search text DEFAULT NULL,
    p_role public.profile_type DEFAULT NULL,
    p_active boolean DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    email text,
    full_name text,
    role public.profile_type,
    is_active boolean,
    avatar_url text,
    created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT p.id, u.email::text, p.full_name, p.role, p.is_active, p.avatar_url,
           p.created_at
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE public.is_admin()
      AND (
        p_search IS NULL
        OR p.full_name ILIKE '%' || p_search || '%'
        OR u.email ILIKE '%' || p_search || '%'
      )
      AND (p_role IS NULL OR p.role = p_role)
      AND (p_active IS NULL OR p.is_active = p_active)
    ORDER BY p.created_at DESC;
$$;

-- Ambil satu pengguna (profil + email) — dipakai setelah update untuk
-- mengembalikan baris terbaru yang utuh.
CREATE OR REPLACE FUNCTION public.admin_get_user(p_target uuid)
RETURNS TABLE (
    id uuid,
    email text,
    full_name text,
    role public.profile_type,
    is_active boolean,
    avatar_url text,
    created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT p.id, u.email::text, p.full_name, p.role, p.is_active, p.avatar_url,
           p.created_at
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE public.is_admin() AND p.id = p_target;
$$;

-- Hapus pengguna secara permanen (cascade ke profiles + seluruh datanya).
-- Tidak boleh menghapus diri sendiri.
CREATE OR REPLACE FUNCTION public.admin_delete_user(p_target uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
    END IF;
    IF p_target = auth.uid() THEN
        RAISE EXCEPTION 'cannot delete self' USING ERRCODE = 'P0001';
    END IF;
    DELETE FROM auth.users WHERE id = p_target;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_users(text, public.profile_type, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;
