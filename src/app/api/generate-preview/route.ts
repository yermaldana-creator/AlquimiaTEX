import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getCachedSupabaseClient } from "@/lib/supabase/cached-client";
import {
  MAX_AI_GENERATIONS_PER_IP_24H,
  MAX_DAILY_GLOBAL_AI_GENERATIONS,
} from "@/lib/constants";

// Fallback en memoria si SUPABASE_SERVICE_ROLE_KEY no está configurada en desarrollo local
const ipAttemptsFallback = new Map<string, { count: number; resetAt: number }>();
const WINDOW_24H_MS = 24 * 60 * 60 * 1000;

function extractClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return req.ip || "127.0.0.1";
}

function hashIpAddress(ip: string): string {
  const salt = process.env.AI_RATE_LIMIT_SALT || "alquimiatex-ai-v1";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function getMaxDailyGlobalLimit(): number {
  const envVal = Number(process.env.MAX_DAILY_GLOBAL_AI_GENERATIONS);
  if (Number.isFinite(envVal) && envVal > 0) return Math.floor(envVal);
  return MAX_DAILY_GLOBAL_AI_GENERATIONS;
}

interface QuotaCheckResult {
  allowed: boolean;
  limitType?: "ip" | "global";
  errorMessage?: string;
  ipCount: number;
  usedSupabase: boolean;
}

async function checkSupabaseQuota(ipHash: string): Promise<QuotaCheckResult> {
  const hasServiceKey = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  );
  const maxGlobal = getMaxDailyGlobalLimit();

  if (hasServiceKey && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = getCachedSupabaseClient();
      const since24h = new Date(Date.now() - WINDOW_24H_MS).toISOString();

      const [ipRes, globalRes] = await Promise.all([
        supabase
          .from("ai_usage_logs")
          .select("id", { count: "exact", head: true })
          .eq("ip_hash", ipHash)
          .gte("created_at", since24h),
        supabase
          .from("ai_usage_logs")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since24h),
      ]);

      if (!ipRes.error && !globalRes.error) {
        const ipCount = ipRes.count ?? 0;
        const globalCount = globalRes.count ?? 0;

        if (ipCount >= MAX_AI_GENERATIONS_PER_IP_24H) {
          return {
            allowed: false,
            limitType: "ip",
            errorMessage:
              "Has alcanzado el límite de 3 diseños con IA por hoy. Puedes subir tu propia foto o describir tu idea y nuestro taller hará el mockup gratis por ti.",
            ipCount,
            usedSupabase: true,
          };
        }

        if (globalCount >= maxGlobal) {
          return {
            allowed: false,
            limitType: "global",
            errorMessage:
              "Nuestro generador de IA alcanzó su cupo máximo diario por hoy. Puedes subir tu propia foto o describir tu idea y nuestro taller hará el mockup gratis por ti.",
            ipCount,
            usedSupabase: true,
          };
        }

        return {
          allowed: true,
          ipCount,
          usedSupabase: true,
        };
      }

      console.warn(
        "[IA Quota] Error consultando ai_usage_logs en Supabase (usando fallback en memoria):",
        ipRes.error?.message || globalRes.error?.message
      );
    } catch (err) {
      console.warn("[IA Quota] Excepción consultando Supabase (usando fallback en memoria):", err);
    }
  }

  // Fallback en memoria (solo si falla Supabase o falta service key en local)
  const now = Date.now();
  const entry = ipAttemptsFallback.get(ipHash);
  const currentCount = !entry || now > entry.resetAt ? 0 : entry.count;

  if (currentCount >= MAX_AI_GENERATIONS_PER_IP_24H) {
    return {
      allowed: false,
      limitType: "ip",
      errorMessage:
        "Has alcanzado el límite de 3 diseños con IA por hoy. Puedes subir tu propia foto o describir tu idea y nuestro taller hará el mockup gratis por ti.",
      ipCount: currentCount,
      usedSupabase: false,
    };
  }

  return {
    allowed: true,
    ipCount: currentCount,
    usedSupabase: false,
  };
}

async function recordSuccessfulAiUsage(
  ipHash: string,
  product: string,
  usedSupabase: boolean
): Promise<void> {
  if (usedSupabase) {
    try {
      const supabase = getCachedSupabaseClient();
      const { error } = await supabase
        .from("ai_usage_logs")
        .insert([{ ip_hash: ipHash, product: product || "otro" }]);
      if (error) {
        console.warn("[IA Quota] No se pudo registrar uso en ai_usage_logs:", error.message);
      }
      return;
    } catch (err) {
      console.warn("[IA Quota] Excepción registrando en ai_usage_logs:", err);
    }
  }

  // Fallback en memoria
  const now = Date.now();
  const entry = ipAttemptsFallback.get(ipHash);
  if (!entry || now > entry.resetAt) {
    ipAttemptsFallback.set(ipHash, { count: 1, resetAt: now + WINDOW_24H_MS });
  } else {
    entry.count += 1;
  }
}

// Especificaciones físicas y de proporción por producto para sublimación
const PRODUCT_SPECIFICATIONS: Record<string, string> = {
  camisa:
    "Centered vertical chest/back apparel graphic print (portrait ~3:4 aspect ratio), clean isolated graphic on plain background, no t-shirt mockup, ready for DTF or textile sublimation.",
  mousepad:
    "Standard rectangular mousepad 22x18 cm (horizontal landscape ~1.22:1 aspect ratio), full-bleed edge-to-edge desk mat illustration, sharp details and vivid colors.",
  rompecabezas:
    "A4 rectangular jigsaw puzzle format 20x29 cm (vertical portrait ~1:1.45 aspect ratio), intricate full-bleed detailed composition suitable for 120-piece puzzle sublimation.",
  taza:
    "Panoramic wrap-around 11oz mug strip 20x9 cm (wide horizontal banner ~2.2:1 aspect ratio), continuous seamless horizontal composition designed to wrap around a ceramic mug.",
  otro:
    "Centered high-resolution graphic artwork for custom sublimation printing, vibrant colors, crisp edges, clean isolated background.",
};

// Optimizar el prompt del usuario en español a un prompt conciso en inglés para FLUX.1 usando Gemini
async function optimizePromptWithGemini(
  description: string,
  product: string,
  apiKey?: string
): Promise<string> {
  const productKey = (product || "otro").toLowerCase();
  const productSpec = PRODUCT_SPECIFICATIONS[productKey] || PRODUCT_SPECIFICATIONS.otro;

  if (!apiKey) {
    return `High-resolution sublimation artwork (${productSpec}): ${description.slice(0, 260)}. Vibrant colors, sharp details, print ready.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: `You are an expert prompt engineer for FLUX.1 image generation for textile and merchandise sublimation. Transform the following user description into a single concise English prompt (under 300 characters) that strictly respects the physical dimensions, aspect ratio, and framing of the target product. Output ONLY the raw prompt text without quotes or markdown explanations.\n\nProduct: ${productKey}\nPhysical Format & Framing: ${productSpec}\nUser Description: ${description}`,
    });

    const optimized = response.text?.trim().replace(/^["']|["']$/g, "");
    if (optimized && optimized.length > 10) {
      return optimized;
    }
  } catch (err: unknown) {
    console.warn("Aviso en optimización con Gemini (usando plantilla estructurada):", err instanceof Error ? err.message : err);
  }

  return `High-resolution sublimation artwork (${productSpec}): ${description.slice(0, 260)}. Vibrant colors, sharp details, print ready.`;
}

export async function POST(req: NextRequest) {
  try {
    const rawIp = extractClientIp(req);
    const ipHash = hashIpAddress(rawIp);

    // Verificar cuota persistente en Supabase (3/24h por IP + fusible global diario)
    const quota = await checkSupabaseQuota(ipHash);

    if (!quota.allowed) {
      return NextResponse.json(
        {
          error:
            quota.errorMessage ||
            "Has alcanzado el límite de 3 diseños con IA por hoy. Puedes subir tu propia foto o describir tu idea y nuestro taller hará el mockup gratis por ti.",
          limitType: quota.limitType || "ip",
          remainingAttempts: 0,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { description = "", product = "camisa" } = body;

    // Validación de longitud estricta (10 a 500 caracteres)
    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        { error: "La descripción debe tener al menos 10 caracteres para generar una idea visual." },
        { status: 400 }
      );
    }

    if (description.trim().length > 500) {
      return NextResponse.json(
        { error: "La descripción no puede superar los 500 caracteres para el modelo de imagen." },
        { status: 400 }
      );
    }

    const abacusKey = process.env.ABACUS_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!abacusKey) {
      console.error("ERROR CRÍTICO: ABACUS_API_KEY no está configurada en .env.local");
      return NextResponse.json(
        { error: "La clave de Abacus.AI no está configurada en el servidor." },
        { status: 500 }
      );
    }

    // 1. Optimizar el prompt con Gemini (siempre genera Arte Limpio aislado)
    console.log(`[IA] Optimizando prompt con Gemini para ${product || "producto"} (${description.length} caracteres)...`);
    const optimizedPrompt = await optimizePromptWithGemini(description.trim(), product, geminiKey);
    console.log(`[IA] Prompt optimizado para FLUX.1: "${optimizedPrompt}"`);

    // 2. Generación con Abacus.AI usando el modelo flux_kontext (FLUX.1 Kontext)
    const abacusUrl =
      (process.env.ABACUS_BASE_URL || "https://routellm.abacus.ai/v1") + "/chat/completions";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    console.log(`[Abacus.AI] Enviando solicitud a flux_kontext...`);
    const startTime = Date.now();

    const res = await fetch(abacusUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${abacusKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "flux_kontext",
        messages: [
          {
            role: "user",
            content: optimizedPrompt,
          },
        ],
        modalities: ["image"],
      }),
    });
    clearTimeout(timeout);

    const elapsed = Date.now() - startTime;
    console.log(`[Abacus.AI] Respuesta recibida en ${elapsed}ms con código HTTP ${res.status}`);

    if (res.ok) {
      const data = await res.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (imageUrl) {
        // Registrar el consumo en Supabase ÚNICAMENTE cuando Abacus.AI devolvió la imagen con éxito
        await recordSuccessfulAiUsage(ipHash, product, quota.usedSupabase);
        const remainingAttempts = Math.max(0, MAX_AI_GENERATIONS_PER_IP_24H - (quota.ipCount + 1));

        console.log(
          `[IA] Imagen generada con éxito (${imageUrl.length} bytes). Restantes IP (24h): ${remainingAttempts}.`
        );
        return NextResponse.json({
          success: true,
          imageUrl,
          remainingAttempts,
          modelUsed: "flux_kontext",
          optimizedPrompt,
          estimatedCredits: 4,
          provider: "Abacus.AI (FLUX.1 Kontext)",
        });
      } else {
        console.warn("[Abacus.AI] Respuesta 200 pero sin imagen en choices[0].message.images:", JSON.stringify(data));
      }
    } else {
      const errorText = await res.text();
      console.error(`[Abacus.AI] Error de API HTTP ${res.status}:`, errorText);
      return NextResponse.json(
        { error: `Abacus.AI devolvió error ${res.status}: ${errorText.slice(0, 150)}` },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "No se pudo generar la imagen con Abacus.AI. Por favor intenta de nuevo." },
      { status: 500 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[IA Route] Excepción no controlada en generate-preview:", errorMsg);

    if (errorMsg.includes("aborted") || errorMsg.includes("timeout")) {
      return NextResponse.json(
        { error: "El tiempo de espera con Abacus.AI se agotó (>90s). Por favor intenta con una descripción más concisa." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: `Error en el servicio de IA: ${errorMsg}` },
      { status: 500 }
    );
  }
}
