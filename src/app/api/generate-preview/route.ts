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

// Instrucciones de ángulo y posición para mockup realista de camisa
const SHIRT_PLACEMENT_PROMPTS: Record<string, string> = {
  pecho_completo:
    "Front view flat-lay studio product photography of the t-shirt, placing the provided artwork large and centered across the front chest.",
  pecho_izquierdo:
    "Front view flat-lay studio product photography of the t-shirt, placing the provided artwork as a small neat left-chest pocket-sized logo on the wearer's left chest (heart side), leaving the rest of the shirt completely clean.",
  espalda_completa:
    "Back view flat-lay studio product photography showing the rear side of the t-shirt, placing the provided artwork large and centered across the upper-to-mid back.",
  pecho_y_espalda:
    "Split side-by-side flat-lay studio product photography showing BOTH front view (left) and back view (right) of the exact same t-shirt, placing the provided artwork cleanly on the front chest and centered on the back.",
};

function describeShirtSilhouette(shirtCut?: string, shirtFabric?: string): string {
  if (shirtFabric === "oversize" || shirtCut === "oversize") {
    return "boxy relaxed streetwear oversized crewneck t-shirt";
  }
  if (shirtCut === "dama") {
    return "fitted women's crewneck t-shirt";
  }
  return "classic unisex crewneck t-shirt";
}

async function buildMockupPromptWithGemini(params: {
  description: string;
  shirtColorLabel: string;
  shirtColorHex: string;
  shirtCut?: string;
  shirtFabric?: string;
  printPlacement: string;
  apiKey?: string;
}): Promise<string> {
  const silhouette = describeShirtSilhouette(params.shirtCut, params.shirtFabric);
  const placementInstr =
    SHIRT_PLACEMENT_PROMPTS[params.printPlacement] || SHIRT_PLACEMENT_PROMPTS.pecho_completo;

  const fallbackPrompt = `Realistic studio product photography mockup: ${placementInstr} Garment: ${silhouette} in exact solid color ${params.shirtColorLabel} (${params.shirtColorHex}). Natural cotton/fabric folds, clean neutral light-gray studio surface, soft even lighting. Keep the provided graphic artwork faithfully printed onto the fabric without altering its design.`;

  if (!params.apiKey) {
    return fallbackPrompt;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: params.apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: `You are an expert prompt engineer for FLUX.1 Kontext image-to-image apparel mockups. Write a single concise English prompt (under 360 characters) instructing FLUX.1 Kontext to place the provided reference graphic artwork onto a realistic flat-lay studio t-shirt mockup.
Strict requirements:
- Garment silhouette: ${silhouette}
- Exact garment color: ${params.shirtColorLabel} (hex ${params.shirtColorHex})
- Camera angle & print placement: ${placementInstr}
- Keep the provided artwork design faithful and crisp on the fabric, realistic textile texture and soft studio lighting on a clean neutral surface.
- User theme context: ${params.description.slice(0, 180)}
Output ONLY the raw prompt text without quotes or explanations.`,
    });

    const optimized = response.text?.trim().replace(/^["']|["']$/g, "");
    if (optimized && optimized.length > 15) {
      return optimized;
    }
  } catch (err: unknown) {
    console.warn("Aviso en prompt de mockup con Gemini (usando plantilla estructurada):", err instanceof Error ? err.message : err);
  }

  return fallbackPrompt;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    const body = await req.json();
    const {
      mode = "artwork",
      description = "",
      product = "camisa",
      artworkImageUrl = "",
      shirtColorLabel = "Blanco",
      shirtColorHex = "#FFFFFF",
      shirtCut = "unisex",
      shirtFabric = "microdurazno",
      printPlacement = "pecho_completo",
    } = body;

    const abacusKey = process.env.ABACUS_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!abacusKey) {
      console.error("ERROR CRÍTICO: ABACUS_API_KEY no está configurada en .env.local");
      return NextResponse.json(
        { error: "La clave de Abacus.AI no está configurada en el servidor." },
        { status: 500 }
      );
    }

    const abacusUrl =
      (process.env.ABACUS_BASE_URL || "https://routellm.abacus.ai/v1") + "/chat/completions";

    // =========================================================
    // PASO B (mode === "mockup"): Montar el Arte Limpio sobre la camisa
    // No descuenta intento adicional del rate limit
    // =========================================================
    if (mode === "mockup") {
      if (!artworkImageUrl || typeof artworkImageUrl !== "string") {
        return NextResponse.json(
          { error: "Falta la imagen de arte limpio para generar el mockup." },
          { status: 400 }
        );
      }

      const mockupPrompt = await buildMockupPromptWithGemini({
        description: String(description || ""),
        shirtColorLabel: String(shirtColorLabel || "Blanco"),
        shirtColorHex: String(shirtColorHex || "#FFFFFF"),
        shirtCut: String(shirtCut || "unisex"),
        shirtFabric: String(shirtFabric || "microdurazno"),
        printPlacement: String(printPlacement || "pecho_completo"),
        apiKey: geminiKey,
      });

      console.log(`[IA Mockup] Prompt FLUX.1 Kontext: "${mockupPrompt}"`);

      const callAbacusMockup = async (useImageInput: boolean) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 90000);
        try {
          const messageContent = useImageInput
            ? [
                {
                  type: "image_url",
                  image_url: { url: artworkImageUrl },
                },
                {
                  type: "text",
                  text: mockupPrompt,
                },
              ]
            : mockupPrompt;

          return await fetch(abacusUrl, {
            method: "POST",
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${abacusKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "flux_kontext",
              messages: [{ role: "user", content: messageContent }],
              modalities: ["image"],
            }),
          });
        } finally {
          clearTimeout(timeout);
        }
      };

      let res = await callAbacusMockup(true);
      if (!res.ok && res.status >= 400 && res.status < 500) {
        console.warn(`[IA Mockup] Entrada multimodal devolvió ${res.status}; reintentando con prompt estructurado...`);
        res = await callAbacusMockup(false);
      }

      if (res.ok) {
        const data = await res.json();
        const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (imageUrl) {
          return NextResponse.json({
            success: true,
            mode: "mockup",
            imageUrl,
            optimizedPrompt: mockupPrompt,
            provider: "Abacus.AI (FLUX.1 Kontext)",
          });
        }
      }

      const errorText = await res.text().catch(() => "");
      console.error(`[IA Mockup] Error HTTP ${res.status}:`, errorText);
      return NextResponse.json(
        { error: "No se pudo montar el mockup sobre la camisa, pero tu arte limpio está listo." },
        { status: 502 }
      );
    }

    // =========================================================
    // PASO A (mode === "artwork"): Generar Arte Limpio aislado
    // =========================================================
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

    // 1. Optimizar el prompt con Gemini
    console.log(`[IA] Optimizando prompt con Gemini para ${product || "producto"} (${description.length} caracteres)...`);
    const optimizedPrompt = await optimizePromptWithGemini(description.trim(), product, geminiKey);
    console.log(`[IA] Prompt optimizado para FLUX.1: "${optimizedPrompt}"`);

    // 2. Generación con Abacus.AI usando el modelo flux_kontext (FLUX.1 Kontext)
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
          mode: "artwork",
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
