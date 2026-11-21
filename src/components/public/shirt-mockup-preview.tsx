"use client";

import * as React from "react";
import { Shirt } from "lucide-react";
import {
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
  x: number; // 0..1 relativo al ancho de una silueta
  y: number; // 0..1 relativo al alto de una silueta
  w: number; // 0..1
  h: number; // 0..1
}

// Coordenadas matemáticas limpias para cada zona de estampado sobre una camisa cuello redondo
const FRONT_BOXES: Record<string, PlacementBox> = {
  pecho_completo: { x: 0.30, y: 0.25, w: 0.40, h: 0.42 },
  pecho_izquierdo: { x: 0.56, y: 0.26, w: 0.14, h: 0.14 }, // Lado corazón (derecha visual en vista frontal)
  pecho_derecho: { x: 0.30, y: 0.26, w: 0.14, h: 0.14 },
  centro_pequeno: { x: 0.41, y: 0.27, w: 0.18, h: 0.18 },
};

const BACK_BOXES: Record<string, PlacementBox> = {
  espalda_completa: { x: 0.29, y: 0.22, w: 0.42, h: 0.46 },
  espalda_superior_pequeno: { x: 0.42, y: 0.16, w: 0.16, h: 0.13 },
  espalda_centro_pequeno: { x: 0.41, y: 0.28, w: 0.18, h: 0.18 },
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
 * Dibuja una silueta vectorial limpia de camisa cuello redondo (sin arrugas exageradas)
 * con sombreado de estudio sutil. Sirve como fallback inmediato si /mockups/shirt-*.png no existen.
 */
function drawProceduralShirt(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  hexColor: string,
  side: "front" | "back"
) {
  const isDark = getLuminance(hexColor) < 0.25;

  const tracePath = () => {
    ctx.beginPath();
    // Cuello izquierdo -> hombro izquierdo -> manga izquierda
    ctx.moveTo(w * 0.38, h * 0.10);
    ctx.quadraticCurveTo(w * 0.29, h * 0.12, w * 0.21, h * 0.16);
    ctx.lineTo(w * 0.05, h * 0.34);
    ctx.lineTo(w * 0.17, h * 0.46);
    ctx.lineTo(w * 0.25, h * 0.37);
    // Costado izquierdo -> dobladillo inferior
    ctx.lineTo(w * 0.24, h * 0.91);
    ctx.quadraticCurveTo(w * 0.50, h * 0.935, w * 0.76, h * 0.91);
    // Costado derecho -> manga derecha -> hombro derecho -> cuello derecho
    ctx.lineTo(w * 0.75, h * 0.37);
    ctx.lineTo(w * 0.83, h * 0.46);
    ctx.lineTo(w * 0.95, h * 0.34);
    ctx.lineTo(w * 0.79, h * 0.16);
    ctx.quadraticCurveTo(w * 0.71, h * 0.12, w * 0.62, h * 0.10);
    // Escote (frente más curvo, espalda más recto)
    if (side === "front") {
      ctx.quadraticCurveTo(w * 0.50, h * 0.21, w * 0.38, h * 0.10);
    } else {
      ctx.quadraticCurveTo(w * 0.50, h * 0.14, w * 0.38, h * 0.10);
    }
    ctx.closePath();
  };

  // Sombra suave debajo de la prenda
  ctx.save();
  ctx.shadowColor = "rgba(10, 10, 10, 0.14)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 8;
  tracePath();
  ctx.fillStyle = hexColor;
  ctx.fill();
  ctx.restore();

  // Sombreado de estudio sutil dentro de la silueta
  ctx.save();
  tracePath();
  ctx.clip();

  const gradH = ctx.createLinearGradient(w * 0.15, 0, w * 0.85, 0);
  gradH.addColorStop(0, "rgba(0,0,0,0.09)");
  gradH.addColorStop(0.25, "rgba(255,255,255,0.06)");
  gradH.addColorStop(0.5, "rgba(255,255,255,0.09)");
  gradH.addColorStop(0.75, "rgba(255,255,255,0.05)");
  gradH.addColorStop(1, "rgba(0,0,0,0.10)");
  ctx.fillStyle = gradH;
  ctx.fillRect(0, 0, w, h);

  // Costura sutil del cuello
  ctx.beginPath();
  ctx.moveTo(w * 0.37, h * 0.11);
  if (side === "front") {
    ctx.quadraticCurveTo(w * 0.50, h * 0.23, w * 0.63, h * 0.11);
  } else {
    ctx.quadraticCurveTo(w * 0.50, h * 0.16, w * 0.63, h * 0.11);
  }
  ctx.strokeStyle = isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.18)";
  ctx.lineWidth = Math.max(2, w * 0.006);
  ctx.stroke();

  // Interior del cuello visible en frente
  if (side === "front") {
    ctx.beginPath();
    ctx.moveTo(w * 0.38, h * 0.10);
    ctx.quadraticCurveTo(w * 0.50, h * 0.13, w * 0.62, h * 0.10);
    ctx.quadraticCurveTo(w * 0.50, h * 0.205, w * 0.38, h * 0.10);
    ctx.closePath();
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fill();
  }

  ctx.restore();

  // Contorno limpio de la prenda
  tracePath();
  ctx.strokeStyle = isDark ? "rgba(255,255,255,0.28)" : "rgba(10,10,10,0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * Dibuja una plantilla PNG teñida dinámicamente al HEX exacto preservando sombras.
 */
function drawTintedTemplate(
  ctx: CanvasRenderingContext2D,
  template: HTMLImageElement,
  w: number,
  h: number,
  hexColor: string
) {
  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const octx = off.getContext("2d");
  if (!octx) return;

  // Escalar plantilla manteniendo proporción
  const scale = Math.min((w * 0.9) / template.width, (h * 0.88) / template.height);
  const dw = template.width * scale;
  const dh = template.height * scale;
  const dx = (w - dw) / 2;
  const dy = (h - dh) / 2;

  // 1. Pintar máscara de la camisa
  octx.drawImage(template, dx, dy, dw, dh);
  // 2. Rellenar con color exacto HEX
  octx.globalCompositeOperation = "source-atop";
  octx.fillStyle = hexColor;
  octx.fillRect(0, 0, w, h);
  // 3. Preservar sombreado y textura de la plantilla con multiply
  octx.globalCompositeOperation = "multiply";
  octx.drawImage(template, dx, dy, dw, dh);
  // 4. Recortar alfa final
  octx.globalCompositeOperation = "destination-in";
  octx.drawImage(template, dx, dy, dw, dh);

  ctx.drawImage(off, 0, 0);
}

/**
 * Superpone el arte del cliente dentro de las coordenadas matemáticas exactas de la zona.
 */
function drawArtworkInBox(
  ctx: CanvasRenderingContext2D,
  art: HTMLImageElement,
  shirtW: number,
  shirtH: number,
  box: PlacementBox,
  useMultiply: boolean
) {
  const bx = shirtW * box.x;
  const by = shirtH * box.y;
  const bw = shirtW * box.w;
  const bh = shirtH * box.h;

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

  // Ajustar blend por defecto cuando cambia el color de camisa
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

      const totalW = showDual ? 960 : 540;
      const totalH = showDual ? 540 : 580;
      canvas.width = totalW;
      canvas.height = totalH;

      // Fondo limpio de estudio
      ctx.fillStyle = "#F5F2EB";
      ctx.fillRect(0, 0, totalW, totalH);

      // Cargar plantillas opcionales PNG (si existen en public/mockups/) y artes del cliente
      const [frontTpl, backTpl, frontArt, backArt] = await Promise.all([
        hasFront ? loadImage("/mockups/shirt-front.png") : Promise.resolve(null),
        hasBack ? loadImage("/mockups/shirt-back.png") : Promise.resolve(null),
        frontImage ? loadImage(frontImage) : Promise.resolve(null),
        effectiveBackImage ? loadImage(effectiveBackImage) : Promise.resolve(null),
      ]);

      if (cancelled) return;

      const renderSide = (
        offsetX: number,
        panelW: number,
        panelH: number,
        side: "front" | "back",
        tpl: HTMLImageElement | null,
        art: HTMLImageElement | null,
        placement: string
      ) => {
        ctx.save();
        ctx.translate(offsetX, 0);

        const topPad = showDual ? 28 : 16;
        const shirtH = panelH - topPad - 12;
        const shirtW = Math.min(panelW - 16, shirtH * 0.92);
        const startX = (panelW - shirtW) / 2;

        // Etiqueta de lado cuando hay 2 vistas
        if (showDual) {
          ctx.fillStyle = "#0A0A0A";
          ctx.font = "bold 16px monospace";
          ctx.textAlign = "center";
          ctx.fillText(
            side === "front" ? "FRENTE" : "ESPALDA",
            panelW / 2,
            24
          );
        }

        ctx.save();
        ctx.translate(startX, topPad);

        if (tpl) {
          drawTintedTemplate(ctx, tpl, shirtW, shirtH, hexColor);
        } else {
          drawProceduralShirt(ctx, shirtW, shirtH, hexColor, side);
        }

        const box = side === "front" ? FRONT_BOXES[placement] : BACK_BOXES[placement];
        if (art && box) {
          drawArtworkInBox(ctx, art, shirtW, shirtH, box, blendWhiteBg && isLightShirt);
        }

        ctx.restore();
        ctx.restore();
      };

      if (showDual) {
        renderSide(0, totalW / 2, totalH, "front", frontTpl, frontArt, frontPlacement);
        // Línea divisoria sutil
        ctx.strokeStyle = "rgba(10,10,10,0.12)";
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(totalW / 2, 18);
        ctx.lineTo(totalW / 2, totalH - 18);
        ctx.stroke();
        ctx.setLineDash([]);
        renderSide(totalW / 2, totalW / 2, totalH, "back", backTpl, backArt, backPlacement);
      } else if (hasFront) {
        renderSide(0, totalW, totalH, "front", frontTpl, frontArt, frontPlacement);
      } else if (hasBack) {
        renderSide(0, totalW, totalH, "back", backTpl, backArt, backPlacement);
      }

      // Exportar PNG limpio para guardarlo en el pedido y subirlo a Supabase Storage
      if (onMockupGenerated && (frontArt || backArt)) {
        try {
          const dataUrl = canvas.toDataURL("image/png");
          if (dataUrl && dataUrl !== lastExportRef.current) {
            lastExportRef.current = dataUrl;
            onMockupGenerated(dataUrl);
          }
        } catch {
          // Canvas tainted fallback silencioso
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
          <span>Mockup en vivo • {getShirtColorLabel(shirtColor)}</span>
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

      <div className="overflow-hidden rounded-lg border-2 border-black/20 bg-[#F5F2EB] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-h-[300px] object-contain block"
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[10px] text-slate-700">
        {hasFront && (
          <span className="rounded border border-black/25 bg-white px-2 py-0.5 font-bold">
            Frente: {getFrontPlacementLabel(frontPlacement)}
          </span>
        )}
        {hasBack && (
          <span className="rounded border border-black/25 bg-white px-2 py-0.5 font-bold">
            Espalda: {getBackPlacementLabel(backPlacement)}
          </span>
        )}
      </div>
    </div>
  );
}
