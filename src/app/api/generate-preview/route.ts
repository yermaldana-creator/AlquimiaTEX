import { NextRequest, NextResponse } from "next/server";

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

    const abacusKey = process.env.ABACUS_API_KEY;

    // 1. Generación con Abacus.AI usando el modelo más económico: FLUX.1 Kontext (pro_rate: 4)
    if (abacusKey) {
      try {
        const abacusUrl =
          (process.env.ABACUS_BASE_URL || "https://routellm.abacus.ai/v1") + "/chat/completions";

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 35000); // 35s timeout

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
                content: `High-resolution graphic design for a textile sublimation ${product || "item"}: ${description}. High quality, vibrant colors, centered graphic, clean background.`,
              },
            ],
            modalities: ["image"],
          }),
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

          if (imageUrl) {
            return NextResponse.json({
              success: true,
              imageUrl,
              remainingAttempts: remaining,
              modelUsed: "flux_kontext",
              estimatedCredits: 4,
              provider: "Abacus.AI (FLUX.1 Kontext)",
            });
          }
        } else {
          const errorText = await res.text();
          console.warn("Abacus.AI API non-200 response:", res.status, errorText);
        }
      } catch (err: unknown) {
        console.warn("Abacus.AI generation error (activating fallback):", err);
      }
    }

    // 2. Fallback de cortesía por si no hay red o se agota la cuota
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
        <text x="300" y="380" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#1e1b4b" text-anchor="middle">
          Idea para: ${product?.toUpperCase() || "SUBLIMACIÓN"}
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
    });
  } catch (error: unknown) {
    console.error("Error en endpoint generate-preview:", error);
    return NextResponse.json(
      { error: "No se pudo generar la idea visual. Por favor intenta de nuevo." },
      { status: 500 }
    );
  }
}
