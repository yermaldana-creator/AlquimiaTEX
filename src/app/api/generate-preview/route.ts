import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Rate limiting simple en memoria por IP (máximo 3 peticiones por IP)
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

    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        { error: "La descripción debe tener al menos 10 caracteres para generar una idea visual." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Si hay API KEY configurada, intentamos generar con Gemini
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Crea un mockup visual orientativo para un producto de sublimación textil (${product || "producto"}) con el siguiente diseño: ${description}. Estilo limpio, sobre fondo neutro, centrado.`;

        // Intentar generación de imagen con Imagen 3
        const response = await ai.models.generateImages({
          model: "imagen-3.0-generate-002",
          prompt,
          config: {
            numberOfImages: 1,
            aspectRatio: "1:1",
            outputMimeType: "image/jpeg",
          },
        });

        const imageBase64 = response.generatedImages?.[0]?.image?.imageBytes;

        if (imageBase64) {
          return NextResponse.json({
            success: true,
            imageUrl: `data:image/jpeg;base64,${imageBase64}`,
            remainingAttempts: remaining,
            isAiReal: true,
          });
        }
      } catch (err: unknown) {
        console.warn("Gemini API call error (fallback enabled):", err);
      }
    }

    // Fallback gracioso y estético si no hay API key o si se supera la cuota
    // Genera una previsualización estilizada en SVG embebido
    const escapedDesc = description.slice(0, 80).replace(/[<>&"]/g, "");
    const svgMockup = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="600" height="600" fill="#f8fafc" rx="24"/>
        <rect x="50" y="50" width="500" height="500" fill="url(#grad)" rx="20" opacity="0.1"/>
        <circle cx="300" cy="240" r="90" fill="#7c3aed" opacity="0.15"/>
        <path d="M260 250 L340 250 M300 210 L300 290" stroke="#7c3aed" stroke-width="8" stroke-linecap="round"/>
        <text x="300" y="380" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#1e1b4b" text-anchor="middle">
          Idea Visual para: ${product?.toUpperCase() || "SUBLIMACIÓN"}
        </text>
        <text x="300" y="420" font-family="system-ui, sans-serif" font-size="16" fill="#64748b" text-anchor="middle">
          "${escapedDesc}..."
        </text>
        <text x="300" y="490" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#7c3aed" text-anchor="middle">
          ✦ Concepto orientativo AlquimiaTex
        </text>
      </svg>
    `;

    const svgBase64 = `data:image/svg+xml;utf8,${encodeURIComponent(svgMockup)}`;

    return NextResponse.json({
      success: true,
      imageUrl: svgBase64,
      remainingAttempts: remaining,
      isAiReal: false,
      notice: apiKey
        ? "Concepto generado con éxito"
        : "Demostración de idea visual (configura GEMINI_API_KEY en .env.local para fotos reales con IA)",
    });
  } catch (error: unknown) {
    console.error("Error en endpoint generate-preview:", error);
    return NextResponse.json(
      { error: "No se pudo generar la idea visual. Por favor intenta de nuevo." },
      { status: 500 }
    );
  }
}
