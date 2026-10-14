"use server";

import { createClient } from "@/lib/supabase/server";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";
import type { OrderItem, Step3ContactFormData } from "@/lib/schemas";

export interface SubmitOrderPayload {
  items: OrderItem[];
  contact: Step3ContactFormData;
}

export interface SubmitOrderResponse {
  success: boolean;
  orderCode: string;
  whatsappUrl: string;
  error?: string;
}

export async function submitOrderAction(payload: SubmitOrderPayload): Promise<SubmitOrderResponse> {
  try {
    const { items, contact } = payload;

    if (!items || items.length === 0) {
      return {
        success: false,
        orderCode: "",
        whatsappUrl: "",
        error: "Debes agregar al menos un producto al pedido.",
      };
    }

    // Generar código amigable: #ALQ-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `#ALQ-${randomSuffix}`;

    const supabase = createClient();

    // 1. Subir imágenes de referencia a Supabase Storage (bucket: order-references) si existen
    const processedItems = await Promise.all(
      items.map(async (item, idx) => {
        if (item.referenceImage && item.referenceImage.startsWith("data:")) {
          try {
            const matches = item.referenceImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
              const contentType = matches[1];
              const ext = contentType.split("/")[1] || "jpeg";
              const buffer = Buffer.from(matches[2], "base64");
              const fileName = `${orderCode.replace("#", "")}-item-${idx + 1}-${Date.now()}.${ext}`;

              const { data: uploadData, error: uploadErr } = await supabase.storage
                .from("order-references")
                .upload(fileName, buffer, {
                  contentType,
                  upsert: true,
                });

              if (!uploadErr && uploadData) {
                const {
                  data: { publicUrl },
                } = supabase.storage.from("order-references").getPublicUrl(fileName);

                return {
                  ...item,
                  referenceImageUrl: publicUrl,
                  referenceImage: publicUrl, // Reemplazar base64 pesado por URL
                };
              }
            }
          } catch (e) {
            console.warn(`Error al subir imagen del item ${idx}:`, e);
          }
        }
        return item;
      })
    );

    // 2. Intentar guardar en la tabla de Supabase 'orders'
    try {
      await supabase.from("orders").insert([
        {
          order_code: orderCode,
          customer_name: contact.customerName,
          customer_phone: contact.customerPhone,
          delivery_date: contact.deliveryDate,
          payment_method: contact.paymentMethod,
          items: processedItems,
          status: "pendiente_contacto",
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (dbErr) {
      // Fallback silencioso por si la tabla no está creada aún en SQL
      console.warn("Supabase orders table insert fallback:", dbErr);
    }

    // 3. Generar la URL final de WhatsApp
    const whatsappUrl = buildWhatsAppOrderUrl({
      orderCode,
      customerName: contact.customerName,
      customerPhone: contact.customerPhone,
      deliveryDate: contact.deliveryDate,
      paymentMethod: contact.paymentMethod,
      items: processedItems,
    });

    return {
      success: true,
      orderCode,
      whatsappUrl,
    };
  } catch (error: unknown) {
    console.error("Error en submitOrderAction:", error);
    return {
      success: false,
      orderCode: "",
      whatsappUrl: "",
      error: "Ocurrió un error al procesar el pedido. Por favor intenta de nuevo.",
    };
  }
}
