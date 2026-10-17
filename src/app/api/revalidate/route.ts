import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Endpoint de revalidación bajo demanda (On-Demand Revalidation)
 * Permite invalidar la caché de unstable_cache y rutas de Next.js desde scripts
 * o webhooks externos usando la clave secreta de administración.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const secretKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY;

    if (!secretKey || authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json(
        { error: "No autorizado. Token de administración inválido o ausente." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { paths = [], tags = [] } = body;

    // Rutas administrativas que se invalidan
    const defaultPaths = ["/admin/inventario", "/admin/costos", "/admin/pedidos"];
    const allPaths = Array.from(new Set([...defaultPaths, ...paths]));
    for (const p of allPaths) {
      revalidatePath(p);
    }

    // Cache Tags asociados a las Server Actions de AlquimiaTex
    const defaultTags = ["admin-inventory", "admin-costs", "admin-orders"];
    const allTags = Array.from(new Set([...defaultTags, ...tags]));
    for (const t of allTags) {
      revalidateTag(t);
    }

    return NextResponse.json({
      success: true,
      message: "Caché de Next.js revalidada exitosamente.",
      revalidatedPaths: allPaths,
      revalidatedTags: allTags,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/revalidate] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
