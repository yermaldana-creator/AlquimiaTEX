import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * Cliente Supabase puro sin dependencias de cookies() de Next.js.
 * Diseñado específicamente para ejecutarse de forma segura dentro de Next.js unstable_cache().
 */
export function getCachedSupabaseClient() {
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSupabaseJsClient(
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

/**
 * Cliente Supabase inteligente para Server Actions / Server Components:
 * 1. Prioriza SUPABASE_SERVICE_ROLE_KEY o SUPABASE_SECRET_KEY (acceso total de administración, bypass RLS).
 * 2. Si no existe la service key en producción (ej. Vercel sin esa variable configurada),
 *    utiliza el cliente basado en cookies del socio autenticado (satisface las políticas RLS 'TO authenticated').
 * 3. Fallback a cliente cacheado estándar.
 */
export function getSupabaseQueryClient() {
  const hasServiceKey = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  );

  if (hasServiceKey) {
    return getCachedSupabaseClient();
  }

  try {
    return createServerClient();
  } catch {
    return getCachedSupabaseClient();
  }
}
