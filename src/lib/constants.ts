export const APP_VERSION = "v1.0";

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

export const SHIRT_CUT_LABELS: Record<string, string> = {
  unisex: "Caballero / Unisex",
  dama: "Dama",
  oversize: "Oversize",
};

export const SHIRT_FABRICS = [
  {
    value: "microdurazno",
    label: "Microdurazno",
    description: "Tacto extrasuave, elástica y fresca. Máxima viveza en sublimación.",
  },
  {
    value: "jersey_algodon_50",
    label: "50% Jersey / Algodón",
    description: "Equilibrio ideal entre frescura, caída y resistencia diaria.",
  },
  {
    value: "algodon_100_peinado",
    label: "Algodón 100% Peinado",
    description: "Calidad premium superior, ultra suave y máxima transpirabilidad.",
  },
  {
    value: "poliester_deportivo",
    label: "Poliéster Deportivo",
    description: "Secado rápido, fresca y ligera. Ideal para entrenamiento y uniformes.",
  },
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

// -------------------------------------------------------------
// Catálogo Oficial de los 6 Estados de Pedidos (Sub-módulo 2A)
// -------------------------------------------------------------
export const ORDER_STATUSES = [
  "pendiente_contacto",
  "abono_verificado",
  "en_produccion",
  "listo_para_entrega",
  "entregado",
  "cancelado",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

export interface OrderStatusConfigItem {
  label: string;
  shortLabel: string;
  bg: string;
  text: string;
  border: string;
  dotColor: string;
  hex: string;
  description: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatusValue, OrderStatusConfigItem> = {
  pendiente_contacto: {
    label: "🟡 Pendiente de Contacto",
    shortLabel: "Pendiente",
    bg: "bg-[#FEF9C3]",
    text: "text-[#854D0E]",
    border: "border-[#CA8A04]",
    dotColor: "bg-[#FACC15]",
    hex: "#FACC15",
    description: "Pedido recibido en web, contacto inicial pendiente",
  },
  abono_verificado: {
    label: "🔵 Abono Verificado",
    shortLabel: "Abonado",
    bg: "bg-[#CFFAFE]",
    text: "text-[#155E75]",
    border: "border-[#06B6D4]",
    dotColor: "bg-[#06B6D4]",
    hex: "#06B6D4",
    description: "50% mayor o 100% detal confirmado en banco",
  },
  en_produccion: {
    label: "🟣 En Producción",
    shortLabel: "En Producción",
    bg: "bg-[#F3E8FF]",
    text: "text-[#581C87]",
    border: "border-[#7E22CE]",
    dotColor: "bg-[#581C87]",
    hex: "#581C87",
    description: "En corte, impresión de papel o planchado",
  },
  listo_para_entrega: {
    label: "🟢 Listo para Entrega",
    shortLabel: "Listo",
    bg: "bg-[#DCFCE7]",
    text: "text-[#166534]",
    border: "border-[#10B981]",
    dotColor: "bg-[#10B981]",
    hex: "#10B981",
    description: "Prenda terminada, revisada y empacada",
  },
  entregado: {
    label: "⚪ Entregado",
    shortLabel: "Entregado",
    bg: "bg-[#F1F5F9]",
    text: "text-[#334155]",
    border: "border-[#64748B]",
    dotColor: "bg-[#6B7280]",
    hex: "#6B7280",
    description: "Entregado en La Dolorita o despachado",
  },
  cancelado: {
    label: "🔴 Cancelado",
    shortLabel: "Cancelado",
    bg: "bg-[#FFE4E6]",
    text: "text-[#9F1239]",
    border: "border-[#F43F5E]",
    dotColor: "bg-[#F43F5E]",
    hex: "#F43F5E",
    description: "Anulado por el cliente o falta de pago",
  },
};

/**
 * Normaliza estados anteriores de la BD para compatibilidad retroactiva.
 */
export function normalizeOrderStatus(rawStatus: string | null | undefined): OrderStatusValue {
  if (!rawStatus) return "pendiente_contacto";
  if (rawStatus === "abonado") return "abono_verificado";
  if (rawStatus === "en_confeccion") return "en_produccion";
  if (rawStatus === "listo") return "listo_para_entrega";

  if (rawStatus in ORDER_STATUS_CONFIG) {
    return rawStatus as OrderStatusValue;
  }
  return "pendiente_contacto";
}

// -------------------------------------------------------------
// Catálogo de Inventario del Taller (Sub-módulo 2B)
// -------------------------------------------------------------
export const INVENTORY_CATEGORIES = [
  "material",
  "tela",
  "prenda",
  "otro",
] as const;

export type InventoryCategoryValue = (typeof INVENTORY_CATEGORIES)[number];

export interface InventoryCategoryConfigItem {
  id: InventoryCategoryValue;
  label: string;
  shortLabel: string;
  bg: string;
  text: string;
  border: string;
  hex: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  defaultUnit: string;
}

export const INVENTORY_CATEGORY_CONFIG: Record<
  InventoryCategoryValue,
  InventoryCategoryConfigItem
> = {
  material: {
    id: "material",
    label: "🟡 Materiales / Insumos",
    shortLabel: "Materiales",
    bg: "bg-[#FEF9C3]",
    text: "text-[#854D0E]",
    border: "border-[#CA8A04]",
    hex: "#FACC15",
    badgeBg: "bg-[#FACC15]",
    badgeText: "text-black",
    description: "Tintas de sublimación, papel, cinta térmica, vinil textil, bolsas",
    defaultUnit: "unidad",
  },
  tela: {
    id: "tela",
    label: "🔵 Telas por Metro",
    shortLabel: "Telas",
    bg: "bg-[#CFFAFE]",
    text: "text-[#155E75]",
    border: "border-[#06B6D4]",
    hex: "#06B6D4",
    badgeBg: "bg-[#06B6D4]",
    badgeText: "text-black",
    description: "Microdurazno Heavy, Micro Rib, Jersey Boxer por metros",
    defaultUnit: "metro",
  },
  prenda: {
    id: "prenda",
    label: "🟣 Prendas en Stock",
    shortLabel: "Prendas",
    bg: "bg-[#F3E8FF]",
    text: "text-[#581C87]",
    border: "border-[#7E22CE]",
    hex: "#581C87",
    badgeBg: "bg-[#581C87]",
    badgeText: "text-[#FACC15]",
    description: "Franelas listas por tela + color + talla + corte",
    defaultUnit: "unidad",
  },
  otro: {
    id: "otro",
    label: "🔴 Otros Productos",
    shortLabel: "Otros",
    bg: "bg-[#FFE4E6]",
    text: "text-[#9F1239]",
    border: "border-[#F43F5E]",
    hex: "#F43F5E",
    badgeBg: "bg-[#F43F5E]",
    badgeText: "text-white",
    description: "Tazas 11oz, mágicas, mousepads, rompecabezas, peluches",
    defaultUnit: "unidad",
  },
};

export const INVENTORY_COMMON_UNITS = [
  { value: "unidad", label: "Unidades (uds)" },
  { value: "metro", label: "Metros (m)" },
  { value: "hoja", label: "Hojas" },
  { value: "resma", label: "Resmas" },
  { value: "ml", label: "Mililitros (ml)" },
  { value: "rollo", label: "Rollos" },
  { value: "paquete", label: "Paquetes" },
  { value: "set", label: "Sets / Juegos" },
] as const;

// -------------------------------------------------------------
// Onboarding y Ayuda del Taller (Lenguaje Coloquial Venezolano)
// -------------------------------------------------------------
export const ONBOARDING_SLIDES = [
  {
    step: 1,
    title: "¡Epa, bienvenido al taller digital! 🛠️",
    badge: "PASO 1 DE 3",
    tagline: "Le decimos adiós al Excel fastidioso",
    description:
      "Aquí los 3 socios controlamos los pedidos, el inventario y las cuentas del taller sin enredos ni libros que se pierdan. Todo sincronizado en vivo.",
    tip: "Tip: Si tienes el celular en la mano en el taller, todo el panel se adapta fino a la pantalla.",
  },
  {
    step: 2,
    title: "Inventario activo y ajuste al vuelo 🧵",
    badge: "PASO 2 DE 3",
    tagline: "Telas por metro, tintas, franelas y tazas",
    description:
      "Usa los botones rápidos [+1] y [-1] para cuadrar stock cuando cortes o empaques. Si intentas meter un ítem que ya existe, el taller no se vuelve loco: te suma la cantidad automáticamente.",
    tip: "Ojo: Si una tela o tinta baja del mínimo que pusiste, el taller te prende una alerta roja para comprar a tiempo.",
  },
  {
    step: 3,
    title: "Pedidos claritos y artes directos 🚀",
    badge: "PASO 3 DE 3",
    tagline: "WhatsApp en un toque y descarga de artes",
    description:
      "En la sección de Pedidos ves cada orden que llega de la web. Puedes cambiar el estado, escribirle al cliente con un clic a su WhatsApp y descargar todas las imágenes para sublimación en un solo archivo ZIP.",
    tip: "Si alguna vez te pierdes, dale al botón '¿Dudas del taller?' arriba y revisas las preguntas frecuentes.",
  },
];

export const WORKSHOP_FAQS = [
  {
    question: "¿Cómo marco un pedido como entregado?",
    answer:
      "Te vas a la pestaña 'Pedidos', abres la ficha del pedido que acabas de despachar y en el selector de estado lo cambias a '⚪ Entregado'. El sistema guarda el cambio de inmediato y avisa que ya salió del taller.",
  },
  {
    question: "¿Cómo agrego tela o franelas al inventario?",
    answer:
      "En 'Inventario', dale al botón amarillo '+ Nuevo Ítem'. Escoge la categoría (ej: 'Telas por Metro'), pon el nombre ('Microdurazno Heavy'), el color ('Blanca') y los metros. Si ya tenías esa tela registrada, el sistema no la duplica, sino que le suma los metros nuevos automáticamente.",
  },
  {
    question: "¿Qué pasa si me equivoqué de cantidad?",
    answer:
      "No hay rollo. En la tabla tienes botones rápidos [-1] y [+1] para ajustar al momento. O le das al botón de 'Editar' y corriges el número exacto. Eso sí: el taller te bloquea números negativos para que la cuenta nunca dé en rojo.",
  },
  {
    question: "¿Cómo descargo las imágenes del cliente para estampar?",
    answer:
      "Abre la ficha del pedido en 'Pedidos'. Arriba a la derecha tienes el botón amarillo 'Descargar todas las imágenes (ZIP)'. Te baja un archivo comprimido con todos los artes limpios listos para mandar a la impresora o plancha.",
  },
  {
    question: "¿Cómo borro un material que ya no usamos sin perder historial?",
    answer:
      "Ahora usamos 'Archivar' en vez de borrar directo. Le das al botón 'Archivar' y el ítem se esconde de la lista diaria. Si algún día vuelve a entrar al taller, activas la casilla 'Ver archivados' y le das a 'Restaurar'.",
  },
  {
    question: "¿Cómo me llevo una copia del inventario a Excel?",
    answer:
      "En la parte superior de la tabla de inventario tienes el botón 'Exportar CSV'. Le das clic y te baja un archivo compatible con Excel al instante con todas tus existencias, metros y costos.",
  },
];

// -------------------------------------------------------------
// Submódulo 3: Costos y Precios (Fórmulas y Catálogos)
// -------------------------------------------------------------

export const COST_COMPONENT_CATEGORIES = {
  prenda_base: {
    id: "prenda_base",
    label: "🟣 Prenda Base (Sublimación)",
    shortLabel: "Prenda Sublimación",
    bg: "bg-[#F3E8FF] dark:bg-purple-950/40",
    text: "text-[#581C87] dark:text-purple-300",
    border: "border-[#7E22CE] dark:border-purple-600",
    hex: "#7E22CE",
    badgeBg: "bg-[#581C87] dark:bg-purple-600",
    badgeText: "text-[#FACC15] dark:text-white",
    description: "Franelas y prendas aptas para sublimar (Microdurazno, poliéster, etc.)",
    defaultUnit: "unidad",
  },
  prenda_dtf: {
    id: "prenda_dtf",
    label: "🔵 Prenda DTF",
    shortLabel: "Prenda DTF",
    bg: "bg-[#DBEAFE] dark:bg-blue-950/40",
    text: "text-[#1E40AF] dark:text-blue-300",
    border: "border-[#2563EB] dark:border-blue-600",
    hex: "#2563EB",
    badgeBg: "bg-[#1E40AF] dark:bg-blue-600",
    badgeText: "text-white",
    description: "Prendas para técnica DTF (algodón, colores oscuros, mezclas)",
    defaultUnit: "unidad",
  },
  tinta: {
    id: "tinta",
    label: "🟡 Tinta de Impresión",
    shortLabel: "Tinta",
    bg: "bg-[#FEF9C3] dark:bg-yellow-950/40",
    text: "text-[#854D0E] dark:text-yellow-300",
    border: "border-[#CA8A04] dark:border-yellow-600",
    hex: "#CA8A04",
    badgeBg: "bg-[#CA8A04] dark:bg-yellow-500",
    badgeText: "text-black",
    description: "Tintas de sublimación (CMYK) o tintas textiles / DTF (por ml)",
    defaultUnit: "ml",
  },
  papel: {
    id: "papel",
    label: "🟢 Papel / Film de Transferencia",
    shortLabel: "Papel / Film",
    bg: "bg-[#DCFCE7] dark:bg-emerald-950/40",
    text: "text-[#166534] dark:text-emerald-300",
    border: "border-[#16A34A] dark:border-emerald-600",
    hex: "#16A34A",
    badgeBg: "bg-[#16A34A] dark:bg-emerald-600",
    badgeText: "text-white",
    description: "Hojas de sublimación premium, papel transfer o film DTF",
    defaultUnit: "hoja",
  },
  empaque: {
    id: "empaque",
    label: "📦 Empaque y Bolsas",
    shortLabel: "Empaque",
    bg: "bg-[#E0E7FF] dark:bg-indigo-950/40",
    text: "text-[#3730A3] dark:text-indigo-300",
    border: "border-[#4F46E5] dark:border-indigo-600",
    hex: "#4F46E5",
    badgeBg: "bg-[#4F46E5] dark:bg-indigo-600",
    badgeText: "text-white",
    description: "Bolsas de entrega, etiquetas, precintos y cajas protectoras",
    defaultUnit: "unidad",
  },
  mano_obra: {
    id: "mano_obra",
    label: "🛠️ Mano de Obra / Operación",
    shortLabel: "Mano de Obra",
    bg: "bg-[#FFEDD5] dark:bg-amber-950/40",
    text: "text-[#9A3412] dark:text-amber-300",
    border: "border-[#EA580C] dark:border-amber-600",
    hex: "#EA580C",
    badgeBg: "bg-[#EA580C] dark:bg-amber-600",
    badgeText: "text-white",
    description: "Corte, planchado, estampado y control de calidad por prenda",
    defaultUnit: "servicio",
  },
  otro: {
    id: "otro",
    label: "🔴 Insumos Secundarios / Otros",
    shortLabel: "Otros Insumos",
    bg: "bg-[#FFE4E6] dark:bg-rose-950/40",
    text: "text-[#9F1239] dark:text-rose-300",
    border: "border-[#E11D48] dark:border-rose-600",
    hex: "#E11D48",
    badgeBg: "bg-[#E11D48] dark:bg-rose-600",
    badgeText: "text-white",
    description: "Cinta térmica, tazas base 11oz, mousepads base, rompecabezas virgen",
    defaultUnit: "unidad",
  },
} as const;

export const COST_TEMPLATE_CATEGORIES = {
  camisa: {
    id: "camisa",
    label: "👕 Franelas y Ropa",
    description: "Prendas sublimadas, DTF o transfer textil",
  },
  taza: {
    id: "taza",
    label: "☕ Tazas y Pocillos",
    description: "Tazas 11oz, mágicas, cónicas y sets apilables",
  },
  mousepad: {
    id: "mousepad",
    label: "🖱️ Mousepads y Accesorios",
    description: "Almohadillas gamer y de oficina sublimadas",
  },
  otro: {
    id: "otro",
    label: "📦 Otros Productos",
    description: "Puzzles, bolsos, llaveros y artículos promocionales",
  },
} as const;

export const COST_MARGIN_TYPES = {
  fixed: {
    id: "fixed",
    label: "💵 Margen Fijo ($)",
    description: "Sumar una cantidad fija de dólares de ganancia al costo de fabricación",
    placeholder: "Ej: 1.76",
    symbol: "$",
  },
  percentage: {
    id: "percentage",
    label: "📈 Porcentaje de Recargo (%)",
    description: "Aplicar un margen porcentual sobre el costo de fabricación (Mark-up)",
    placeholder: "Ej: 33.6",
    symbol: "%",
  },
  target_price: {
    id: "target_price",
    label: "🎯 Precio de Venta Deseado ($)",
    description: "Fijar el precio final de calle y calcular la ganancia y margen automáticamente",
    placeholder: "Ej: 7.00",
    symbol: "$",
  },
} as const;

export const COST_COMMON_UNITS = [
  { value: "unidad", label: "Unidad (ud)" },
  { value: "ml", label: "Mililitro (ml)" },
  { value: "hoja", label: "Hoja" },
  { value: "metro", label: "Metro (m)" },
  { value: "servicio", label: "Servicio / Pasada" },
  { value: "cm", label: "Centímetro (cm)" },
  { value: "set", label: "Set / Juego" },
] as const;

export const PROFITABILITY_CONFIG = {
  high: {
    minMargin: 40,
    label: "Alta Rentabilidad",
    badgeBg: "bg-[#10B981] dark:bg-emerald-600",
    badgeText: "text-white font-bold",
    border: "border-[#059669]",
    icon: "🟢",
    description: "Margen saludable superior al 40%. Excelente retorno de inversión.",
  },
  medium: {
    minMargin: 20,
    label: "Rentabilidad Media",
    badgeBg: "bg-[#FACC15] dark:bg-yellow-500",
    badgeText: "text-black font-bold",
    border: "border-[#CA8A04]",
    icon: "🟡",
    description: "Margen estándar entre 20% y 40%. Aceptable para volumen o mayoreo.",
  },
  low: {
    minMargin: 0,
    label: "Baja Rentabilidad",
    badgeBg: "bg-[#EF4444] dark:bg-rose-600",
    badgeText: "text-white font-bold",
    border: "border-[#DC2626]",
    icon: "🔴",
    description: "Margen menor al 20%. Evaluar aumento de precio o reducción de insumos.",
  },
  loss: {
    minMargin: -Infinity,
    label: "¡Pérdida Crítica!",
    badgeBg: "bg-black dark:bg-zinc-950",
    badgeText: "text-red-400 font-black",
    border: "border-red-600",
    icon: "⚠️",
    description: "El precio de venta está por debajo del costo de fabricación.",
  },
} as const;

