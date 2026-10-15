"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface LoginActionResult {
  success: boolean;
  error?: string;
}

/**
 * Autentica a un socio con email y contraseña.
 * En caso de éxito, redirige a /admin o a la URL especificada en redirectTo.
 */
export async function loginAction(formData: FormData): Promise<LoginActionResult> {
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
