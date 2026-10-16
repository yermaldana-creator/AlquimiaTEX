"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";
import { getSessionUser } from "@/actions/auth.actions";
import { normalizeOrderStatus, ORDER_STATUSES } from "@/lib/constants";
import type { OrderItem, Step3ContactFormData } from "@/lib/schemas";
import type { AdminOrder, GetOrdersParams, GetOrdersResult, OrderStatus } from "@/types";

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

    // 2. Guardar en la tabla de Supabase 'orders'
    try {
      const { error: dbErr } = await supabase.from("orders").insert([
        {
          order_code: orderCode,
          customer_name: contact.customerName,
          customer_phone: contact.customerPhone,
          delivery_date: contact.deliveryDate,
          payment_type: contact.orderPricingType,
          order_pricing_type: contact.orderPricingType,
          payment_method: contact.paymentMethod,
          items: processedItems,
          status: "pendiente_contacto",
          created_at: new Date().toISOString(),
        },
      ]);

      if (dbErr) {
        console.error("❌ Error al guardar pedido en Supabase:", dbErr.message, dbErr.details || "");
      } else {
        console.log("✅ Pedido guardado exitosamente en Supabase con código:", orderCode);
      }
    } catch (dbErr) {
      console.warn("Supabase orders table insert fallback:", dbErr);
    }

    // 3. Generar la URL final de WhatsApp
    const whatsappUrl = buildWhatsAppOrderUrl({
      orderCode,
      customerName: contact.customerName,
      customerPhone: contact.customerPhone,
      deliveryDate: contact.deliveryDate,
      orderPricingType: contact.orderPricingType,
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

/**
 * Obtiene la lista de pedidos con paginación, filtros de estado y búsqueda.
 * Valida sesión de socio mediante getSessionUser().
 */
export async function getOrders(params?: GetOrdersParams): Promise<GetOrdersResult> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("No autorizado. Debes iniciar sesión como socio del taller.");
  }

  const { page = 1, limit = 20, status = "todos", search = "" } = params || {};
  const supabase = createClient();

  let query = supabase.from("orders").select("*", { count: "exact" });

  // Filtro por Estado
  if (status && status !== "todos") {
    if (status === "abono_verificado") {
      query = query.in("status", ["abono_verificado", "abonado"]);
    } else if (status === "en_produccion") {
      query = query.in("status", ["en_produccion", "en_confeccion"]);
    } else if (status === "listo_para_entrega") {
      query = query.in("status", ["listo_para_entrega", "listo"]);
    } else {
      query = query.eq("status", status);
    }
  }

  // Filtro por búsqueda (código, cliente o teléfono)
  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    query = query.or(
      `order_code.ilike.%${trimmedSearch}%,customer_name.ilike.%${trimmedSearch}%,customer_phone.ilike.%${trimmedSearch}%`
    );
  }

  // Paginación
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error al obtener pedidos en getOrders:", error.message);
    return {
      orders: [],
      totalCount: 0,
      page: safePage,
      totalPages: 0,
    };
  }

  const normalizedOrders = (data || []).map((order) => ({
    ...order,
    status: normalizeOrderStatus(order.status),
  })) as AdminOrder[];

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / safeLimit);

  return {
    orders: normalizedOrders,
    totalCount,
    page: safePage,
    totalPages,
  };
}

/**
 * Obtiene la ficha completa de un pedido por su ID de BD o por su código #ALQ-XXXX.
 * Valida sesión de socio mediante getSessionUser().
 */
export async function getOrderById(id: string): Promise<AdminOrder | null> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("No autorizado. Debes iniciar sesión como socio del taller.");
  }

  const supabase = createClient();
  const cleanId = decodeURIComponent(id).trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);

  let query = supabase.from("orders").select("*");
  if (isUuid) {
    query = query.eq("id", cleanId);
  } else {
    const formattedCode = cleanId.startsWith("#") ? cleanId : `#${cleanId}`;
    query = query.or(`id.eq.${cleanId},order_code.eq.${formattedCode},order_code.eq.${cleanId}`);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    console.error("Error al buscar pedido por ID:", error?.message);
    return null;
  }

  return {
    ...data,
    status: normalizeOrderStatus(data.status),
  } as AdminOrder;
}

/**
 * Actualiza el estado de un pedido en Supabase con los 6 estados oficiales.
 * Valida sesión de socio mediante getSessionUser().
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado. Inicia sesión como socio." };
    }

    if (!ORDER_STATUSES.includes(newStatus)) {
      return { success: false, error: "Estado no válido para el pedido." };
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      console.error("Error al actualizar estado en Supabase:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${orderId}`);

    return { success: true };
  } catch (err: unknown) {
    console.error("Error inesperado en updateOrderStatus:", err);
    return { success: false, error: "Ocurrió un error inesperado al actualizar el estado." };
  }
}
