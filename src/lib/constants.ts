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

export const DEFAULT_WHATSAPP_NUMBER = "584120000000";

export const MAX_ORDER_ITEMS = 10;

// Instrucciones de pago manuales
export const PAYMENT_INFO = {
  depositPercentage: 30,
  pagoMovil: {
    bank: "Banesco (0134) / Banco de Venezuela (0102)",
    phone: "0412-0000000",
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
