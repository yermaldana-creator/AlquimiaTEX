import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase puro sin dependencias de cookies() de Next.js.
 * Diseñado específicamente para ejecutarse de forma segura dentro de Next.js unstable_cache().
 */
export function getCachedSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
