"use server";

import { createClient } from "@/lib/supabase/server";
import { feedbackSchema } from "@/lib/feedback-schema";
import { headers } from "next/headers";

export interface SubmitFeedbackResponse {
  success: boolean;
  error?: string;
}

export async function submitFeedbackAction(
  rawPayload: unknown
): Promise<SubmitFeedbackResponse> {
  try {
    const parseResult = feedbackSchema.safeParse(rawPayload);

    if (!parseResult.success) {
      const firstError =
        parseResult.error.issues[0]?.message ||
        "Datos de evaluación incompletos o inválidos.";
      return {
        success: false,
        error: firstError,
      };
    }

    const data = parseResult.data;

    // 1. FILTRO HONEYPOT ANTI-SPAM
    // Si un bot completó el campo oculto website_url, respondemos éxito silencioso sin guardar nada
    if (data.website_url && data.website_url.trim().length > 0) {
      console.warn("⚠️ Bot interceptado por honeypot en formulario de feedback.");
      return { success: true };
    }

    // 2. Extraer User-Agent para diagnóstico de dispositivo
    const headerList = headers();
    const userAgent = headerList.get("user-agent") || "desconocido";

    const supabase = createClient();

    // 3. Inserción en la tabla 'feedback' de Supabase
    const { error: insertErr } = await supabase.from("feedback").insert([
      {
        tester_name: data.tester_name,
        device_used: data.device_used,
        browser_used: data.browser_used,
        first_impression_rating: data.first_impression_rating,
        style_clarity: data.style_clarity,
        brand_trust: data.brand_trust,
        order_flow_rating: data.order_flow_rating,
        step1_experience: data.step1_experience,
        ai_generation_experience: data.ai_generation_experience,
        image_upload_experience: data.image_upload_experience,
        pricing_policy_clarity: data.pricing_policy_clarity,
        whatsapp_redirect_rating: data.whatsapp_redirect_rating,
        errors_found: data.errors_found || "Ninguno",
        most_liked_feature: data.most_liked_feature,
        least_liked_feature: data.least_liked_feature,
        nps_recommendation: data.nps_recommendation,
        version_tested: data.version_tested,
        user_agent: userAgent,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertErr) {
      console.error("❌ Error al guardar feedback en Supabase:", insertErr.message);
      return {
        success: false,
        error: "Hubo un error al guardar tu respuesta en el servidor. Por favor intenta de nuevo.",
      };
    }

    console.log("✅ Feedback guardado exitosamente de:", data.tester_name);
    return { success: true };
  } catch (err: unknown) {
    console.error("Error inesperado en submitFeedbackAction:", err);
    return {
      success: false,
      error: "Error inesperado al procesar el formulario.",
    };
  }
}
