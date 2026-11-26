import { NextRequest, NextResponse } from "next/server";
import { getSupabaseQueryClient } from "@/lib/supabase/cached-client";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB estricto
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Verifica los "magic bytes" reales del archivo para asegurar que es JPEG, PNG o WEBP auténtico
 * y evitar archivos maliciosos renombrados.
 */
function detectRealImageMime(buffer: Buffer): "image/jpeg" | "image/png" | "image/webp" | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // WEBP: "RIFF" (0..3) + "WEBP" (8..11)
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const rawPrefix = (formData.get("prefix") as string) || "order-asset";

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No se recibió ninguna imagen válida." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "El archivo de imagen está vacío." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "La imagen supera el peso máximo permitido de 5 MB." },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const detectedMime = detectRealImageMime(buffer);
    if (!detectedMime || !ALLOWED_MIME_TYPES.has(detectedMime)) {
      return NextResponse.json(
        { error: "Formato no permitido. Solo se aceptan imágenes JPG, PNG o WEBP." },
        { status: 400 }
      );
    }

    const safePrefix = rawPrefix
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 48) || "asset";

    const ext =
      detectedMime === "image/jpeg"
        ? "jpg"
        : detectedMime === "image/webp"
          ? "webp"
          : "png";

    const randomToken = Math.random().toString(36).slice(2, 8);
    const fileName = `${safePrefix}-${Date.now()}-${randomToken}.${ext}`;

    const supabase = getSupabaseQueryClient();
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from("order-references")
      .upload(fileName, buffer, {
        contentType: detectedMime,
        upsert: false,
      });

    if (uploadErr || !uploadData) {
      console.error("Error subiendo asset a order-references:", uploadErr?.message);
      return NextResponse.json(
        { error: "No se pudo guardar la imagen en el servidor. Intenta de nuevo." },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("order-references").getPublicUrl(fileName);

    return NextResponse.json({ publicUrl }, { status: 200 });
  } catch (error) {
    console.error("Error inesperado en /api/upload-order-asset:", error);
    return NextResponse.json(
      { error: "Error procesando la imagen. Verifica el formato e intenta de nuevo." },
      { status: 500 }
    );
  }
}
