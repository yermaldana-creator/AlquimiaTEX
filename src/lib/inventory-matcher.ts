import type { OrderItem, InventoryItem } from "@/types";

export interface MatchCandidate {
  item: InventoryItem;
  score: number;
  reasons: string[];
}

export interface BestMatchResult {
  bestMatch: InventoryItem | null;
  confidenceScore: number;
  matchReasons: string[];
  allCandidates: MatchCandidate[];
}

/**
 * Normaliza raíces léxicas para resolver género (blanco/blanca), plurales y acentos.
 */
export function normalizeStem(text: string): string {
  if (!text) return "";
  let s = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos: algodón -> algodon
    .trim();

  // 1. Abreviaciones clave del taller
  s = s.replace(/\bmd\b/g, "microdurazno");
  s = s.replace(/\bsubli\b/g, "sublimacion");
  s = s.replace(/\balg\b/g, "algodon");

  // 2. Plurales y sinónimos de prendas
  s = s.replace(/\b(camisas|camisa|franelas|franela|remeras|remera|prendas|prenda)\b/g, "prenda");
  s = s.replace(/\b(tazas|taza|pocillos|pocillo|mugs|mug)\b/g, "taza");
  s = s.replace(/\b(mousepads|mousepad|pads|pad)\b/g, "mousepad");

  // 3. Flexión de género en colores
  s = s.replace(/\b(blanco|blanca|blancos|blancas)\b/g, "blanc");
  s = s.replace(/\b(negro|negra|negros|negras)\b/g, "negr");
  s = s.replace(/\b(rojo|roja|rojos|rojas)\b/g, "roj");
  s = s.replace(/\b(amarillo|amarilla|amarillos|amarillas)\b/g, "amarill");

  // 4. Flexión de cortes
  s = s.replace(/\b(damas|dama|mujer|femenino)\b/g, "dama");
  s = s.replace(/\b(caballeros|caballero|hombre|masculino)\b/g, "caballero");

  return s;
}

/**
 * Extrae y valida la talla del ítem sin colisionar con palabras que contienen la letra (ej: 'M' en 'Microdurazno').
 */
export function extractExactSize(text: string): string | null {
  if (!text) return null;
  const match = text.toUpperCase().match(/\b(XS|S|M|L|XL|2XL|XXL|3XL)\b/);
  return match ? match[1] : null;
}

/**
 * Algoritmo Heurístico de Coincidencia (Fuzzy Smart Match)
 * Compara los atributos del ítem del pedido contra el catálogo de inventario activo.
 */
export function findBestInventoryMatch(
  orderItem: OrderItem,
  inventoryItems: InventoryItem[]
): BestMatchResult {
  // Filtrar solo ítems activos
  const activeItems = (inventoryItems || []).filter((i) => !i.archived_at);

  if (activeItems.length === 0) {
    return { bestMatch: null, confidenceScore: 0, matchReasons: [], allCandidates: [] };
  }

  // 1. Extraer tokens normalizados del pedido
  const isShirt = orderItem.product === "camisa";
  const requestedSize = orderItem.shirtSize ? orderItem.shirtSize.trim().toUpperCase() : null;
  const requestedFabric = normalizeStem(orderItem.shirtFabric || "");
  const requestedColor = normalizeStem(orderItem.shirtColor || "");
  const requestedCut = normalizeStem(orderItem.shirtCut || "");
  const requestedMousepad = normalizeStem(orderItem.mousepadSize || "");
  const requestedMug = normalizeStem(orderItem.mugType || "");
  const requestedDetails = normalizeStem(orderItem.customProductDetails || "");

  const candidates: MatchCandidate[] = [];

  for (const invItem of activeItems) {
    let score = 0;
    const reasons: string[] = [];

    const fullInvText = normalizeStem(`${invItem.name} ${invItem.variant || ""}`);
    const invSize = extractExactSize(`${invItem.name} ${invItem.variant || ""}`);

    // Regla 1: Afinidad de Categoría (Base 10 pts)
    if (isShirt && invItem.category === "prenda") {
      score += 10;
      reasons.push("Categoría prenda");
    } else if (!isShirt && (invItem.category === "material" || invItem.category === "otro")) {
      score += 10;
    }

    // Regla 2: Coincidencia de Tela / Material (+40 pts)
    if (requestedFabric && fullInvText.includes(requestedFabric)) {
      score += 40;
      reasons.push(`Tela ${orderItem.shirtFabric}`);
    }

    // Regla 3: Coincidencia exacta de Talla (+30 pts)
    if (requestedSize && invSize) {
      if (requestedSize === invSize) {
        score += 30;
        reasons.push(`Talla ${requestedSize}`);
      } else {
        // Penalización si es otra talla distinta (ej. pide M y el ítem es L)
        score -= 25;
      }
    }

    // Regla 4: Coincidencia de Color (+20 pts)
    if (requestedColor && fullInvText.includes(requestedColor)) {
      score += 20;
      reasons.push(`Color ${orderItem.shirtColor}`);
    }

    // Regla 5: Coincidencia de Corte / Género (+15 pts)
    if (requestedCut && fullInvText.includes(requestedCut)) {
      score += 15;
      reasons.push(`Corte ${orderItem.shirtCut}`);
    }

    // Regla 6: Mousepad o Artículos Especiales (+40 pts)
    if (requestedMousepad && fullInvText.includes(requestedMousepad)) {
      score += 40;
      reasons.push(`Medida ${orderItem.mousepadSize}`);
    }
    if (requestedDetails && fullInvText.includes(requestedDetails)) {
      score += 50;
      reasons.push("Detalle personalizado");
    }

    // Regla 7: Tazas (+45 pts)
    if (orderItem.product === "taza") {
      if (fullInvText.includes("taza") || fullInvText.includes("mug")) {
        score += 45;
        reasons.push("Taza de cerámica");
      }
      if (requestedMug && fullInvText.includes(requestedMug)) {
        score += 25;
        reasons.push(`Modelo ${orderItem.mugType}`);
      }
    }

    const finalScore = Math.max(0, Math.min(100, score));

    candidates.push({
      item: invItem,
      score: finalScore,
      reasons,
    });
  }

  // Ordenar de mayor a menor puntuación
  candidates.sort((a, b) => b.score - a.score);

  const top = candidates[0];
  const isMatchConfident = top && top.score >= 45;

  return {
    bestMatch: isMatchConfident ? top.item : null,
    confidenceScore: top ? top.score : 0,
    matchReasons: top ? top.reasons : [],
    allCandidates: candidates,
  };
}
