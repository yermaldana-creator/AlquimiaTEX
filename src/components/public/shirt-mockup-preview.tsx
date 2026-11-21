"use client";

import * as React from "react";
import { Shirt } from "lucide-react";
import {
  IS_CHRISTMAS_SEASON,
  getShirtColorHex,
  getShirtColorLabel,
  getFrontPlacementLabel,
  getBackPlacementLabel,
} from "@/lib/constants";

interface ShirtMockupPreviewProps {
  shirtColor?: string;
  frontPlacement: string;
  backPlacement: string;
  frontImage?: string;
  backImage?: string;
  onMockupGenerated?: (dataUrl: string) => void;
}

interface PlacementBox {
  x: number; // 0..1 relativo al lienzo cuadrado
  y: number; // 0..1 relativo al lienzo cuadrado
  w: number; // 0..1
  h: number; // 0..1
}

// =========================================================================
// COORDENADAS CALIBRADAS PARA LIENZO CUADRADO 1:1 (public/mockups/*.png)
// =========================================================================

// Modo 1 Camisa Centrada (shirt-front-single.png / shirt-back-single.png)
const SINGLE_FRONT_BOXES: Record<string, PlacementBox> = {
  logo_izquierdo: { x: 0.56, y: 0.30, w: 0.11, h: 0.14 }, // ~5x8 cm (lado corazón)
  cuadrado_chico: { x: 0.38, y: 0.31, w: 0.24, h: 0.24 }, // ~16x16 cm
  cuadrado_mediano: { x: 0.34, y: 0.29, w: 0.32, h: 0.32 }, // ~22x22 cm
  cuadrado_grande: { x: 0.31, y: 0.27, w: 0.38, h: 0.38 }, // ~26x26 cm
  extendido_pecho: { x: 0.31, y: 0.30, w: 0.38, h: 0.15 }, // ~26x10 cm (franja ancha superior)
};

const SINGLE_BACK_BOXES: Record<string, PlacementBox> = {
  extendido_espalda: { x: 0.29, y: 0.24, w: 0.42, h: 0.15 }, // ~29x10 cm (franja superior espalda)
  espalda_mediana: { x: 0.31, y: 0.25, w: 0.38, h: 0.45 }, // ~26x35 cm
  espalda_completa: { x: 0.28, y: 0.22, w: 0.44, h: 0.54 }, // ~30x42 cm (casi todo el torso trasero)
};

// Modo 2 Camisas Lado a Lado (shirt-front-left.png + shirt-back-right.png)
const DUAL_FRONT_BOXES: Record<string, PlacementBox> = {
  logo_izquierdo: { x: 0.295, y: 0.35, w: 0.065, h: 0.085 },
  cuadrado_chico: { x: 0.195, y: 0.36, w: 0.14, h: 0.14 },
  cuadrado_mediano: { x: 0.175, y: 0.34, w: 0.18, h: 0.18 },
  cuadrado_grande: { x: 0.16, y: 0.33, w: 0.21, h: 0.21 },
  extendido_pecho: { x: 0.16, y: 0.35, w: 0.21, h: 0.085 },
};

const DUAL_BACK_BOXES: Record<string, PlacementBox> = {
  extendido_espalda: { x: 0.62, y: 0.31, w: 0.23, h: 0.085 },
  espalda_mediana: { x: 0.63, y: 0.32, w: 0.21, h: 0.26 },
  espalda_completa: { x: 0.615, y: 0.30, w: 0.24, h: 0.32 },
};

function getLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 0.9;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Capa 1 (Fallback): Fondo de estudio oscuro elegante con bokeh suave
 * (y acentos festivos discretos cuando IS_CHRISTMAS_SEASON === true).
 */
function drawStudioBackground(ctx: CanvasRenderingContext2D, size: number) {
  // Degradado radial de estudio oscuro
  const bgGrad = ctx.createRadialGradient(
    size * 0.5,
    size * 0.42,
    size * 0.06,
    size * 0.5,
    size * 0.5,
    size * 0.72
  );
  bgGrad.addColorStop(0, "#2B2F3B");
  bgGrad.addColorStop(0.55, "#181B23");
  bgGrad.addColorStop(1, "#0D0F14");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Luces bokeh suaves de estudio
  const bokehDots = IS_CHRISTMAS_SEASON
    ? [
        { x: 0.14, y: 0.18, r: 0.09, color: "rgba(250, 204, 21, 0.11)" }, // Dorado
        { x: 0.86, y: 0.22, r: 0.11, color: "rgba(225, 29, 72, 0.10)" }, // Rojo navideño
        { x: 0.82, y: 0.82, r: 0.12, color: "rgba(21, 128, 61, 0.11)" }, // Verde pino
        { x: 0.18, y: 0.80, r: 0.10, color: "rgba(250, 204, 21, 0.08)" },
        { x: 0.72, y: 0.12, r: 0.05, color: "rgba(255, 255, 255, 0.07)" },
        { x: 0.26, y: 0.88, r: 0.06, color: "rgba(225, 29, 72, 0.07)" },
      ]
    : [
        { x: 0.16, y: 0.20, r: 0.10, color: "rgba(255, 255, 255, 0.06)" },
        { x: 0.84, y: 0.24, r: 0.12, color: "rgba(6, 182, 212, 0.07)" },
        { x: 0.78, y: 0.82, r: 0.11, color: "rgba(255, 255, 255, 0.05)" },
        { x: 0.20, y: 0.82, r: 0.09, color: "rgba(250, 204, 21, 0.05)" },
      ];

  for (const dot of bokehDots) {
    const g = ctx.createRadialGradient(
      size * dot.x,
      size * dot.y,
      0,
      size * dot.x,
      size * dot.y,
      size * dot.r
    );
    g.addColorStop(0, dot.color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(size * dot.x, size * dot.y, size * dot.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Capa 2: Tiñe un PNG blanco transparente al HEX exacto preservando volumen y sombras
 * y lo pega con drop-shadow / halo de contorno para destacar sobre el fondo oscuro.
 */
function drawTintedShirtLayer(
  ctx: CanvasRenderingContext2D,
  template: HTMLImageElement,
  size: number,
  hexColor: string
) {
  const off = document.createElement("canvas");
  off.width = size;
  off.height = size;
  const octx = off.getContext("2d");
  if (!octx) return;

  // 1. Pintar máscara del PNG oficial (0, 0, size, size)
  octx.drawImage(template, 0, 0, size, size);
  // 2. Rellenar con color exacto HEX
  octx.globalCompositeOperation = "source-atop";
  octx.fillStyle = hexColor;
  octx.fillRect(0, 0, size, size);
  // 3. Preservar sombras naturales del PNG blanco con multiply
  octx.globalCompositeOperation = "multiply";
  octx.drawImage(template, 0, 0, size, size);
  // 4. Recortar alfa final
  octx.globalCompositeOperation = "destination-in";
  octx.drawImage(template, 0, 0, size, size);

  const isVeryDark = getLuminance(hexColor) < 0.22;

  ctx.save();
  // En prendas negras/marino oscuro agregamos un halo sutil claro + sombra para separarlas del fondo oscuro
  if (isVeryDark) {
    ctx.shadowColor = "rgba(255, 255, 255, 0.24)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  } else {
    ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
    ctx.shadowBlur = 22;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;
  }
  ctx.drawImage(off, 0, 0, size, size);
  ctx.restore();
}

/**
 * Capa 3: Dibuja el estampado del cliente centrado dentro de su rectángulo calibrado.
 */
function drawArtworkInBox(
  ctx: CanvasRenderingContext2D,
  art: HTMLImageElement,
  size: number,
  box: PlacementBox,
  useMultiply: boolean
) {
  const bx = size * box.x;
  const by = size * box.y;
  const bw = size * box.w;
  const bh = size * box.h;

  const scale = Math.min(bw / art.width, bh / art.height);
  const dw = art.width * scale;
  const dh = art.height * scale;
  const dx = bx + (bw - dw) / 2;
  const dy = by + (bh - dh) / 2;

  ctx.save();
  if (useMultiply) {
    ctx.globalCompositeOperation = "multiply";
  }
  ctx.drawImage(art, dx, dy, dw, dh);
  ctx.restore();
}

export function ShirtMockupPreview({
  shirtColor = "blanco",
  frontPlacement,
  backPlacement,
  frontImage,
  backImage,
  onMockupGenerated,
}: ShirtMockupPreviewProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const lastExportRef = React.useRef<string>("");
  const hexColor = getShirtColorHex(shirtColor);
  const isLightShirt = getLuminance(hexColor) >= 0.52;
  const [blendWhiteBg, setBlendWhiteBg] = React.useState<boolean>(isLightShirt);

  React.useEffect(() => {
    setBlendWhiteBg(getLuminance(getShirtColorHex(shirtColor)) >= 0.52);
  }, [shirtColor]);

  const hasFront = frontPlacement !== "ninguno";
  const hasBack = backPlacement !== "ninguno";
  const showDual = hasFront && hasBack;
  const effectiveBackImage = backImage || frontImage;

  React.useEffect(() => {
    let cancelled = false;

    const renderMockup = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = 800;
      canvas.width = size;
      canvas.height = size;

      // Cargar capas necesarias en paralelo
      const bgCandidate = IS_CHRISTMAS_SEASON
        ? "/mockups/bg-christmas.jpg"
        : "/mockups/bg-custom.jpg";

      const [
        primaryBg,
        fallbackBg,
        shirtFrontTpl,
        shirtBackTpl,
        logoOverlay,
        frontArt,
        backArt,
      ] = await Promise.all([
        loadImage(bgCandidate),
        IS_CHRISTMAS_SEASON ? loadImage("/mockups/bg-custom.jpg") : Promise.resolve(null),
        hasFront
          ? loadImage(showDual ? "/mockups/shirt-front-left.png" : "/mockups/shirt-front-single.png")
          : Promise.resolve(null),
        hasBack
          ? loadImage(showDual ? "/mockups/shirt-back-right.png" : "/mockups/shirt-back-single.png")
          : Promise.resolve(null),
        loadImage("/mockups/logo-overlay.png"),
        frontImage ? loadImage(frontImage) : Promise.resolve(null),
        effectiveBackImage ? loadImage(effectiveBackImage) : Promise.resolve(null),
      ]);

      if (cancelled) return;

      // CAPA 1: Fondo (JPG personalizado/navideño o estudio oscuro por código)
      const activeBg = primaryBg || fallbackBg;
      if (activeBg) {
        const bgScale = Math.max(size / activeBg.width, size / activeBg.height);
        const bw = activeBg.width * bgScale;
        const bh = activeBg.height * bgScale;
        ctx.drawImage(activeBg, (size - bw) / 2, (size - bh) / 2, bw, bh);
      } else {
        drawStudioBackground(ctx, size);
      }

      // CAPA 2: Camisa(s) teñidas al HEX exacto con drop-shadow
      if (hasFront && shirtFrontTpl) {
        drawTintedShirtLayer(ctx, shirtFrontTpl, size, hexColor);
      }
      if (hasBack && shirtBackTpl) {
        drawTintedShirtLayer(ctx, shirtBackTpl, size, hexColor);
      }

      // CAPA 3: Estampado(s) en coordenadas calibradas
      const shouldMultiply = blendWhiteBg && isLightShirt;
      if (hasFront && frontArt) {
        const frontBox = showDual
          ? DUAL_FRONT_BOXES[frontPlacement] || DUAL_FRONT_BOXES.cuadrado_mediano
          : SINGLE_FRONT_BOXES[frontPlacement] || SINGLE_FRONT_BOXES.cuadrado_mediano;
        drawArtworkInBox(ctx, frontArt, size, frontBox, shouldMultiply);
      }

      if (hasBack && backArt) {
        const backBox = showDual
          ? DUAL_BACK_BOXES[backPlacement] || DUAL_BACK_BOXES.espalda_mediana
          : SINGLE_BACK_BOXES[backPlacement] || SINGLE_BACK_BOXES.espalda_mediana;
        drawArtworkInBox(ctx, backArt, size, backBox, shouldMultiply);
      }

      // CAPA 4: Logo AlquimiaTex arriba de todo (0, 0, size, size)
      if (logoOverlay) {
        ctx.drawImage(logoOverlay, 0, 0, size, size);
      }

      // Exportar imagen compuesta para guardarla en el pedido y subirla a Supabase Storage
      if (onMockupGenerated && (frontArt || backArt)) {
        try {
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
          if (dataUrl && dataUrl !== lastExportRef.current) {
            lastExportRef.current = dataUrl;
            onMockupGenerated(dataUrl);
          }
        } catch {
          // Fallback silencioso
        }
      }
    };

    renderMockup();
    return () => {
      cancelled = true;
    };
  }, [
    hexColor,
    isLightShirt,
    blendWhiteBg,
    frontPlacement,
    backPlacement,
    frontImage,
    effectiveBackImage,
    hasFront,
    hasBack,
    showDual,
    onMockupGenerated,
  ]);

  if (!frontImage && !backImage) return null;

  return (
    <div className="rounded-xl border-2 border-black bg-[#FAF7F0] p-3 space-y-2.5 shadow-[3px_3px_0px_#0A0A0A]">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="font-mono text-[10px] font-black uppercase text-[#0A0A0A] flex items-center gap-1.5">
          <Shirt className="h-3.5 w-3.5 text-[#0891B2]" />
          <span>Mockup de Estudio • {getShirtColorLabel(shirtColor)}</span>
        </span>

        {isLightShirt && (
          <label className="inline-flex items-center gap-1.5 cursor-pointer font-mono text-[10px] font-bold text-slate-700">
            <input
              type="checkbox"
              checked={blendWhiteBg}
              onChange={(e) => setBlendWhiteBg(e.target.checked)}
              className="h-3.5 w-3.5 accent-black"
            />
            <span>Fundir fondo blanco</span>
          </label>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border-2 border-black bg-[#0D0F14] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full max-w-[360px] aspect-square h-auto object-contain block"
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5 font-mono text-[10px] text-slate-800">
        {hasFront && (
          <span className="rounded border border-black/30 bg-white px-2 py-0.5 font-bold">
            Frente: {getFrontPlacementLabel(frontPlacement, true)}
          </span>
        )}
        {hasBack && (
          <span className="rounded border border-black/30 bg-white px-2 py-0.5 font-bold">
            Espalda: {getBackPlacementLabel(backPlacement, true)}
          </span>
        )}
      </div>
    </div>
  );
}
