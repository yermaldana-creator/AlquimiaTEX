import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Rate limiting en memoria por IP (máximo 3 peticiones por IP)
const ipAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hora

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = ipAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count };
}

// Optimizar el prompt del usuario en español a un prompt conciso en inglés para FLUX.1 usando Gemini
async function optimizePromptWithGemini(
  description: string,
  product: string,
  apiKey?: string
): Promise<string> {
  if (!apiKey) {
    return `High-resolution graphic design for a textile sublimation ${product || "item"}: ${description.slice(0, 300)}. Vibrant colors, clean isolated background, sharp details, apparel print ready.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: `You are an expert prompt engineer for FLUX.1 image generation for textile sublimation. Transform the following user description into a single concise English prompt (under 250 characters), centered graphic, vibrant colors, clean isolated background. Output ONLY the raw prompt text without quotes or markdown explanations.\n\nProduct: ${product || "item"}\nDescription: ${description}`,
    });

    const optimized = response.text?.trim().replace(/^["']|["']$/g, "");
    if (optimized && optimized.length > 10) {
      return optimized;
    }
  } catch (err: unknown) {
    console.warn("Aviso en optimización con Gemini (usando plantilla estructurada):", err instanceof Error ? err.message : err);
  }

  return `High-resolution graphic design for a textile sublimation ${product || "item"}: ${description.slice(0, 300)}. Vibrant colors, clean isolated background, sharp details, apparel print ready.`;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    const { allowed, remaining } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Has alcanzado el límite de 3 intentos de generación visual. Puedes continuar con tu pedido describiendo tu idea.",
          remainingAttempts: 0,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { description, product } = body;

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

    // 1. Optimizar el prompt con Gemini
    console.log(`[IA] Optimizando prompt con Gemini para ${product || "producto"} (${description.length} caracteres)...`);
    const optimizedPrompt = await optimizePromptWithGemini(description.trim(), product, geminiKey);
    console.log(`[IA] Prompt optimizado para FLUX.1: "${optimizedPrompt}"`);

    // 2. Generación con Abacus.AI usando el modelo flux_kontext (FLUX.1 Kontext)
    const abacusUrl =
      (process.env.ABACUS_BASE_URL || "https://routellm.abacus.ai/v1") + "/chat/completions";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000); // 90s timeout para garantizar la generación con FLUX.1

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
        console.log(`[Abacus.AI] Imagen generada con éxito (${imageUrl.length} bytes). Créditos estimados: 4.`);
        return NextResponse.json({
          success: true,
          imageUrl,
          remainingAttempts: remaining,
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

    // 3. Fallback de cortesía solo si falló la estructura de imagen
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
