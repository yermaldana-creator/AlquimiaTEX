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

  let message = `¡Hola AlquimiaTex! 👋 Quiero coordinar el siguiente pedido:\n\n`;
  message += `📋 *PEDIDO:* ${params.orderCode}\n`;
  message += `👤 *CLIENTE:* ${params.customerName} (${params.customerPhone})\n`;
  message += `📅 *ENTREGA ESTIMADA:* ${params.deliveryDate}\n`;
  message += `💳 *PAGO PREFERIDO:* ${PAYMENT_LABELS[params.paymentMethod] || params.paymentMethod}\n\n`;

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

  message += `\n⚠️ *Por favor adjunta tus fotos de referencia y captura del abono en este chat.*\n`;
  message += `💰 *Recordatorio:* Precio a cotizar • Se requiere el 30% de abono para iniciar producción en taller.`;

  return `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;
}
