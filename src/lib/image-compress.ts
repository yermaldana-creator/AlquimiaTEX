/**
 * Comprime y redimensiona imágenes en el navegador antes de subirlas a /api/upload-order-asset.
 * Mantiene alta nitidez para sublimación (máx. 1600px) reduciendo fotos de 3-8 MB a ~200-450 KB.
 */

const MAX_DIMENSION = 1600;
const SKIP_COMPRESSION_THRESHOLD_BYTES = 350 * 1024; // 350 KB

export async function dataUrlToOptimizedBlob(
  dataUrl: string
): Promise<{ blob: Blob; mimeType: string; ext: string }> {
  const res = await fetch(dataUrl);
  const originalBlob = await res.blob();
  const originalType = originalBlob.type || "image/png";

  const isAllowed =
    originalType === "image/jpeg" ||
    originalType === "image/png" ||
    originalType === "image/webp";

  // Si ya es pequeña y de un formato permitido, la enviamos tal cual sin recomprimir
  if (isAllowed && originalBlob.size <= SKIP_COMPRESSION_THRESHOLD_BYTES) {
    const ext = originalType === "image/jpeg" ? "jpg" : originalType.split("/")[1] || "png";
    return { blob: originalBlob, mimeType: originalType, ext };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          const ext = originalType === "image/jpeg" ? "jpg" : "png";
          resolve({ blob: originalBlob, mimeType: isAllowed ? originalType : "image/png", ext });
          return;
        }

        // Usar WebP (conserva transparencia y comprime muy bien) o JPEG como fallback
        const targetMime = originalType === "image/jpeg" ? "image/jpeg" : "image/webp";
        if (targetMime === "image/jpeg") {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (compressed) => {
            if (!compressed) {
              const ext = originalType === "image/jpeg" ? "jpg" : "png";
              resolve({ blob: originalBlob, mimeType: isAllowed ? originalType : "image/png", ext });
              return;
            }
            const mime = compressed.type || targetMime;
            const ext = mime === "image/jpeg" ? "jpg" : mime === "image/webp" ? "webp" : "png";
            resolve({ blob: compressed, mimeType: mime, ext });
          },
          targetMime,
          0.86
        );
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      if (isAllowed) {
        const ext = originalType === "image/jpeg" ? "jpg" : originalType.split("/")[1] || "png";
        resolve({ blob: originalBlob, mimeType: originalType, ext });
      } else {
        reject(new Error("No se pudo procesar la imagen seleccionada."));
      }
    };
    img.src = dataUrl;
  });
}

/**
 * Sube una imagen (data URL) al endpoint seguro /api/upload-order-asset.
 * Si ya es una URL pública de order-references, la retorna sin re-subir.
 */
export async function uploadOrderAssetFromClient(
  source: string | undefined,
  filePrefix: string
): Promise<string | undefined> {
  if (!source) return source;
  if (source.includes("/storage/v1/object/public/order-references/")) {
    return source;
  }
  if (!source.startsWith("data:")) {
    return source;
  }

  const { blob, mimeType, ext } = await dataUrlToOptimizedBlob(source);

  const formData = new FormData();
  formData.append("file", blob, `${filePrefix}.${ext}`);
  formData.append("prefix", filePrefix);
  formData.append("mimeType", mimeType);

  const response = await fetch("/api/upload-order-asset", {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data?.publicUrl) {
    throw new Error(data?.error || "No se pudo subir una de las imágenes del pedido.");
  }

  return data.publicUrl as string;
}
