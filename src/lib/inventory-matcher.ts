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

  // 2. Plurales y sinónimos de productos
  s = s.replace(/\b(camisas|camisa|franelas|franela|remeras|remera|prendas|prenda)\b/g, "prenda");
  s = s.replace(/\b(tazas|taza|pocillos|pocillo|mugs|mug)\b/g, "taza");
  s = s.replace(/\b(mousepads|mousepad|pads|pad)\b/g, "mousepad");
  s = s.replace(/\b(rompecabezas|rompecabeza|puzzles|puzzle)\b/g, "rompecabezas");

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

  // 1. Extraer tokens normalizados del pedido según el tipo real de producto
  const productType = orderItem.product;
  const isShirt = productType === "camisa";
  const isMug = productType === "taza";
  const isMousepad = productType === "mousepad";
  const isPuzzle = productType === "rompecabezas";

  // Solo extraer atributos textiles cuando el producto es camisa/prenda
  const requestedSize = isShirt && orderItem.shirtSize ? orderItem.shirtSize.trim().toUpperCase() : null;
  const requestedFabric = isShirt ? normalizeStem(orderItem.shirtFabric || "") : "";
  const requestedColor = isShirt ? normalizeStem(orderItem.shirtColor || "") : "";
  const requestedCut = isShirt ? normalizeStem(orderItem.shirtCut || "") : "";

  const requestedMousepad = isMousepad ? normalizeStem(orderItem.mousepadSize || "") : "";
  const requestedPuzzle = isPuzzle ? normalizeStem((orderItem.puzzlePieces || "").replace(/_/g, " ")) : "";
  const requestedMugTokens = isMug
    ? normalizeStem((orderItem.mugType || "").replace(/_/g, " "))
        .split(/\s+/)
        .filter((t) => t.length >= 3 && t !== "taza")
    : [];
  const requestedDetails = productType === "otro" ? normalizeStem(orderItem.customProductDetails || "") : "";

  const candidates: MatchCandidate[] = [];

  for (const invItem of activeItems) {
    let score = 0;
    const reasons: string[] = [];

    const fullInvText = normalizeStem(`${invItem.name} ${invItem.variant || ""}`);
    const invSize = extractExactSize(`${invItem.name} ${invItem.variant || ""}`);

    const invIsMug = fullInvText.includes("taza");
    const invIsMousepad = fullInvText.includes("mousepad");
    const invIsPuzzle = fullInvText.includes("rompecabezas");
    const invIsGarment = invItem.category === "prenda" || invItem.category === "tela" || fullInvText.includes("prenda");

    // Priorización estricta por familia de producto
    if (isShirt) {
      if (invIsMug || invIsMousepad || invIsPuzzle) {
        score -= 60;
      } else if (invItem.category === "prenda") {
        score += 15;
        reasons.push("Categoría prenda");
      }

      if (requestedFabric && fullInvText.includes(requestedFabric)) {
        score += 40;
        reasons.push(`Tela ${orderItem.shirtFabric}`);
      }

      if (requestedSize && invSize) {
        if (requestedSize === invSize) {
          score += 30;
          reasons.push(`Talla ${requestedSize}`);
        } else {
          score -= 25;
        }
      }

      if (requestedColor && fullInvText.includes(requestedColor)) {
        score += 20;
        reasons.push(`Color ${orderItem.shirtColor}`);
      }

      if (requestedCut && fullInvText.includes(requestedCut)) {
        score += 15;
        reasons.push(`Corte ${orderItem.shirtCut}`);
      }
    } else if (isMug) {
      if (invIsMug) {
        score += 55;
        reasons.push("Taza de inventario");
        for (const token of requestedMugTokens) {
          if (fullInvText.includes(token)) {
            score += 20;
            reasons.push(`Variante ${token}`);
          }
        }
      } else if (invIsGarment || invIsMousepad || invIsPuzzle) {
        score -= 60;
      }
    } else if (isMousepad) {
      if (invIsMousepad) {
        score += 55;
        reasons.push("Mousepad");
        if (requestedMousepad && fullInvText.includes(requestedMousepad)) {
          score += 25;
          reasons.push(`Medida ${orderItem.mousepadSize}`);
        }
      } else if (invIsGarment || invIsMug || invIsPuzzle) {
        score -= 60;
      }
    } else if (isPuzzle) {
      if (invIsPuzzle) {
        score += 55;
        reasons.push("Rompecabezas");
        const puzzleTokens = requestedPuzzle.split(/\s+/).filter((t) => t.length >= 2);
        for (const token of puzzleTokens) {
          if (fullInvText.includes(token)) {
            score += 20;
            reasons.push(`Formato ${token.toUpperCase()}`);
          }
        }
      } else if (invIsGarment || invIsMug || invIsMousepad) {
        score -= 60;
      }
    } else {
      if (invItem.category === "material" || invItem.category === "otro") {
        score += 10;
      }
      if (requestedDetails && fullInvText.includes(requestedDetails)) {
        score += 50;
        reasons.push("Detalle personalizado");
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
