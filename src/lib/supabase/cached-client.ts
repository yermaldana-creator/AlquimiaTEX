import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase puro sin dependencias de cookies() de Next.js.
 * Diseñado específicamente para ejecutarse de forma segura dentro de Next.js unstable_cache().
 */
export function getCachedSupabaseClient() {
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
