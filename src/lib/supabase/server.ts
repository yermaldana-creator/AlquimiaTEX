import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60; // 604.800 segundos (7 días)

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        maxAge: SEVEN_DAYS_IN_SECONDS,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                maxAge: options?.maxAge ?? SEVEN_DAYS_IN_SECONDS,
              });
            });
          } catch {
            // El método `setAll` fue llamado desde un Server Component.
            // Esto puede ignorarse de forma segura si el middleware refresca las sesiones.
          }
        },
      },
    }
  );
}
