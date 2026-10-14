export const PRODUCT_TYPES = [
  {
    id: "camisa",
    name: "Camisa / Franela",
    description: "Sublimación de alta durabilidad en tela suave al tacto",
    badge: "Más vendido",
  },
  {
    id: "mousepad",
    name: "Mousepad",
    description: "Deslizamiento suave y base de goma antideslizante",
    badge: "Gamer / Oficina",
  },
  {
    id: "rompecabezas",
    name: "Rompecabezas",
    description: "Regalo creativo con acabado brillante",
    badge: "Regalo ideal",
  },
  {
    id: "otro",
    name: "Otro Producto",
    description: "Tazas, gorras u otros artículos personalizados a cotizar",
    badge: "A convenir",
  },
] as const;

export const SHIRT_SIZES = [
  { value: "S", label: "S (Adulto)" },
  { value: "M", label: "M (Adulto)" },
  { value: "L", label: "L (Adulto)" },
  { value: "XL", label: "XL (Adulto)" },
  { value: "2XL", label: "2XL (Adulto)" },
  { value: "N4", label: "Talla 4 (Niño)" },
  { value: "N6", label: "Talla 6 (Niño)" },
  { value: "N8", label: "Talla 8 (Niño)" },
  { value: "N10", label: "Talla 10 (Niño)" },
  { value: "N12", label: "Talla 12 (Niño)" },
  { value: "N14", label: "Talla 14 (Niño)" },
  { value: "N16", label: "Talla 16 (Niño)" },
] as const;

export const SHIRT_CUTS = [
  { value: "unisex", label: "Caballero / Unisex (Corte clásico recto)" },
  { value: "dama", label: "Dama (Corte entallado femenino)" },
  { value: "oversize", label: "Oversize (Corte amplio y holgado)" },
] as const;

export const SHIRT_COLORS = [
  { value: "blanco", label: "Blanco (Máxima fidelidad y viveza de colores)", hex: "#FFFFFF" },
  { value: "gris_jaspeado", label: "Gris Jaspeado Claro", hex: "#D6D6D6" },
] as const;

export const MOUSEPAD_SIZES = [
  { value: "estandar", label: "Estándar (22 x 18 cm) — Ideal para trabajo diario" },
  { value: "gamer_xl", label: "Gamer XL (70 x 30 cm) — Abarca teclado y mouse" },
  { value: "gamer_xxl", label: "Gamer XXL (90 x 40 cm) — Escritorio completo" },
  { value: "ergonomico", label: "Ergonómico — Con almohadilla de gel para muñeca" },
] as const;

export const PUZZLE_FORMATS = [
  { value: "a5_80", label: "A5 (Aprox. 80 piezas - 15 x 20 cm)" },
  { value: "a4_120", label: "A4 (Aprox. 120 piezas - 20 x 29 cm - Más pedido)" },
  { value: "a3_240", label: "A3 (Aprox. 240 piezas - 29 x 40 cm - Gran formato)" },
  { value: "corazon_75", label: "Corazón (Aprox. 75 piezas - Especial parejas / regalos)" },
] as const;

export const DEFAULT_WHATSAPP_NUMBER = "584241589317";

export const MAX_ORDER_ITEMS = 10;

// Condiciones de pago oficiales
export const ORDER_PRICING_CONDITIONS = {
  unidad: {
    id: "unidad",
    title: "Pedido por Unidad (Al detal)",
    condition: "Pago del 100% por anticipado de forma obligatoria",
    badge: "1 a 11 unidades",
    description: "Para pedidos al detal, se cancela la totalidad del importe antes de iniciar corte y estampado.",
  },
  docena: {
    id: "docena",
    title: "Pedido por Docena (Al mayor)",
    condition: "Abono del 50% por anticipado, 50% contra entrega",
    badge: "12+ unidades",
    description: "Para pedidos por docena, abonas el 50% para inicio de confección y el 50% restante contra entrega en taller o despacho.",
  },
} as const;

// Ofertas por Docena del Catálogo Oficial
export const WHOLESALE_CATALOG_OFFERS = [
  {
    id: "microdurazno_blanca",
    name: "Microdurazno Blanca",
    unitPrice: 5,
    dozenPrice: 60,
    tag: "Hasta talla XL",
    description: "Tela suave al tacto con excelente absorción de tinta y máxima fidelidad de color.",
    features: [
      "Hasta 2 estampados por pieza (delante y detrás)",
      "Tallas disponibles hasta XL",
      "Tela blanca con máxima viveza de color",
    ],
  },
  {
    id: "microdurazno_negra",
    name: "Microdurazno Negra",
    unitPrice: 7,
    dozenPrice: 84,
    tag: "Hasta talla XL",
    description: "Microdurazno negra con estampado textil de alta resistencia al lavado.",
    features: [
      "Hasta 2 estampados por pieza (delante y detrás)",
      "Tallas disponibles hasta XL",
      "Color negro profundo y elegante",
    ],
  },
  {
    id: "jersey_poliester",
    name: "50% Jersey / 50% Poliéster",
    unitPrice: 10,
    dozenPrice: 120,
    tag: "Cualquier color",
    description: "Mezcla resistente y fresca, ideal para uniformes de empresas, eventos y dotaciones.",
    features: [
      "Hasta 2 estampados por pieza (delante y detrás)",
      "Disponible en cualquier color",
      "Alta durabilidad y confort térmico",
    ],
  },
] as const;

// Políticas Oficiales del Taller
export const CATALOG_POLICIES = {
  deliveryTime: "⏳ Tiempo estimado: 4 a 7 días hábiles desde la confirmación del abono.",
  printsIncluded: "Incluye hasta 2 estampados por pieza (delante y detrás).",
  volumeExclusions: "Oversize y 100% Algodón Peinado no aplican para descuentos por volumen.",
  digitalMockup: "El diseño digital (mockup) es gratuito y se presenta antes de estampar.",
  sizeGuarantee: "No se realizan cambios por errores en la elección de tallas.",
};

// Instrucciones de pago manuales
export const PAYMENT_INFO = {
  pagoMovil: {
    bank: "Banesco (0134) / Banco de Venezuela (0102)",
    phone: "0424-1589317",
    idNumber: "V-00.000.000",
    beneficiary: "AlquimiaTex",
  },
  binance: {
    payId: "000000000",
    network: "USDT (Red BEP-20 / TRC-20)",
  },
  cash: {
    location: "Taller AlquimiaTex, La Dolorita, Caracas",
    currency: "Dólares en efectivo (billetes en buen estado) o Bolívares en efectivo",
  },
};
