import type { NextConfig } from "next";

/**
 * Host Supabase Storage di-allowlist agar `next/image` boleh memuat gambar
 * publik (avatar, sampul artikel, gambar makanan). Hostname diambil dari
 * NEXT_PUBLIC_SUPABASE_URL supaya otomatis ikut berubah antar environment.
 */
const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
