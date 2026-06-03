"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Singleton browser Supabase client (anon key + session cookie).
 * Dipakai untuk operasi yang aman dilakukan di sisi client (mis. upload file ke
 * Storage bucket dengan RLS yang mengikat ke `auth.uid()`).
 */
let cached: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserSupabase() {
  if (!cached) {
    cached = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return cached;
}
