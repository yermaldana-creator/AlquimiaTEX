"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { checkLoginRateLimit, resetLoginRateLimit } from "@/lib/rate-limiter";

export interface LoginActionResult {
  success: boolean;
  error?: string;
}

/**
 * Autentica a un socio con email y contraseña.
 * Incluye rate limiting estricto de 5 intentos por minuto por IP.
 * En caso de éxito, redirige a /admin o a la URL especificada en redirectTo.
 */
export async function loginAction(formData: FormData): Promise<LoginActionResult> {
  // 1. Obtener IP del cliente para el rate limiting
  const headerList = headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const realIp = headerList.get("x-real-ip");
  const clientIp = (forwardedFor ? forwardedFor.split(",")[0] : realIp) || "127.0.0.1";

  // 2. Verificar límite de intentos (5 por minuto por IP)
  const rateLimit = checkLoginRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: "Demasiados intentos fallidos. Espera un minuto e intenta de nuevo.",
    };
  }

  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();
  const redirectTo = (formData.get("redirectTo") as string) || "/admin";

  if (!email || !password) {
    return {
      success: false,
      error: "Por favor ingresa tu correo y contraseña.",
    };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Si Supabase devuelve error de rate limit (status 429)
    if (
      error.message?.toLowerCase().includes("rate limit") ||
      error.status === 429 ||
      error.message?.includes("over_email_send_rate_limit")
    ) {
      return {
        success: false,
        error: "Demasiados intentos fallidos. Espera un minuto e intenta de nuevo.",
      };
    }

    let userMessage = "Credenciales incorrectas. Verifica tu correo y contraseña.";
    if (error.message.includes("Invalid login credentials")) {
      userMessage = "Correo o contraseña incorrectos. Verifica e intenta nuevamente.";
    } else if (error.message.includes("Email not confirmed")) {
      userMessage = "El usuario no tiene el correo confirmado en Supabase (marca Auto Confirm User).";
    }

    return {
      success: false,
      error: userMessage,
    };
  }

  // 3. Login exitoso: limpiar contador de intentos de la IP
  resetLoginRateLimit(clientIp);

  revalidatePath("/admin", "layout");
  redirect(redirectTo);
}

/**
 * Cierra la sesión activa del socio y redirige a la pantalla de login.
 */
export async function logoutAction(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}

/**
 * Obtiene el usuario autenticado actual desde el servidor.
 * Retorna null si no hay sesión activa.
 */
export async function getSessionUser() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}
