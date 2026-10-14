import { DEFAULT_WHATSAPP_NUMBER } from "./constants";
import type { OrderItem } from "./schemas";

export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

interface WhatsAppOrderParams {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  deliveryDate: string;
  paymentMethod: string;
  orderPricingType?: "unidad" | "docena";
  items: OrderItem[];
}

const PAYMENT_LABELS: Record<string, string> = {
  pago_movil: "Pago Móvil",
  binance: "Binance USDT",
  efectivo: "Efectivo en Taller",
  acordar: "A convenir por WhatsApp",
};

export function buildWhatsAppOrderUrl(params: WhatsAppOrderParams): string {
  const businessNumber = cleanPhoneNumber(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER
  );

  const isDocena = params.orderPricingType === "docena";
  const paymentConditionText = isDocena
    ? "Abono del 50% por anticipado, 50% contra entrega"
    : "Pago del 100% por anticipado de forma obligatoria";

  let message = `¡Hola AlquimiaTex! 👋 Quiero coordinar el siguiente pedido:\n\n`;
  message += `📋 *PEDIDO:* ${params.orderCode}\n`;
  message += `👤 *CLIENTE:* ${params.customerName} (${params.customerPhone})\n`;
  message += `📅 *ENTREGA ESTIMADA:* ${params.deliveryDate} (4 a 7 días hábiles)\n`;
  message += `💳 *PAGO PREFERIDO:* ${PAYMENT_LABELS[params.paymentMethod] || params.paymentMethod}\n`;
  message += `🏷️ *MODALIDAD:* ${isDocena ? "Pedido por Docena (Al mayor)" : "Pedido por Unidad (Al detal)"}\n`;
  message += `💰 *CONDICIÓN:* ${paymentConditionText}\n\n`;

  message += `📦 *PRODUCTOS SOLICITADOS (${params.items.length} tipo(s) de artículo):*\n`;

  params.items.forEach((item, index) => {
    const num = index + 1;
    message += `\n${num}️⃣ *${item.product.toUpperCase()}* (Cantidad: ${item.quantity})\n`;

    if (item.product === "camisa") {
      message += `   • Talla: ${item.shirtSize || "Por definir"}\n`;
      message += `   • Corte: ${item.shirtCut || "Unisex"}\n`;
      message += `   • Color: ${item.shirtColor || "Blanco"}\n`;
    } else if (item.product === "mousepad") {
      message += `   • Formato: ${item.mousepadSize || "Estándar"}\n`;
    } else if (item.product === "rompecabezas") {
      message += `   • Piezas: ${item.puzzlePieces || "A4"}\n`;
    } else if (item.product === "otro") {
      message += `   • Detalle: ${item.customProductDetails || "Personalizado"}\n`;
    }

    if (item.description && item.description.trim()) {
      message += `   • Idea de diseño: "${item.description.trim()}"\n`;
    }

    if (item.referenceImage) {
      message += `   • [Foto de referencia adjunta en web]\n`;
    }
  });

  message += `\n✨ *BENEFICIOS INCLUIDOS:*\n`;
  message += `   • Diseño digital (mockup) gratuito para aprobación antes de estampar.\n`;
  message += `   • Hasta 2 estampados por pieza (delante y detrás).\n`;
  message += `\n⚠️ *RECORDATORIO:* Adjunta tus fotos de referencia y captura del pago/abono en este chat.\n`;
  message += `🛡️ *Nota:* No se realizan cambios por errores en la elección de tallas.\n`;
  message += `⏳ *Tiempo de producción:* 4 a 7 días hábiles desde la confirmación del pago/abono.`;

  return `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;
}
