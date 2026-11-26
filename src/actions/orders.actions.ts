"use server";

import crypto from "crypto";
import { headers } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseQueryClient } from "@/lib/supabase/cached-client";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";
import { getSessionUser } from "@/actions/auth.actions";
import { MAX_ORDER_ITEMS, normalizeOrderStatus, ORDER_STATUSES } from "@/lib/constants";
import {
  orderItemSchema,
  step3ContactSchema,
  type OrderItem,
  type Step3ContactFormData,
} from "@/lib/schemas";
import type { AdminOrder, GetOrdersParams, GetOrdersResult, OrderStatus } from "@/types";

const MAX_ORDERS_PER_IP_WINDOW = 5;
const ORDER_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const ALLOWED_UPLOAD_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

function getClientIpHash(): string {
  const headerList = headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const realIp = headerList.get("x-real-ip");
  const rawIp = (forwardedFor ? forwardedFor.split(",")[0] : realIp)?.trim() || "127.0.0.1";
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 16) || "alquimiatex-order-rl";
  return crypto.createHash("sha256").update(`${rawIp}:${salt}`).digest("hex");
}

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

async function uploadAssetToOrderReferences(
  supabase: ReturnType<typeof getSupabaseQueryClient>,
  source: string | undefined,
  filePrefix: string
): Promise<string | undefined> {
  if (!source) return source;
  // Si ya es una URL pública de nuestro bucket order-references, no re-subir
  if (source.includes("/storage/v1/object/public/order-references/")) {
    return source;
  }

  try {
    let buffer: Buffer | null = null;
    let contentType = "image/png";
    let ext = "png";

    if (source.startsWith("data:")) {
      const matches = source.match(/^data:([A-Za-z0-9\-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        contentType = matches[1].toLowerCase();
        ext = (contentType.split("/")[1] || "png").replace("jpeg", "jpg");
        buffer = Buffer.from(matches[2], "base64");
      }
    } else if (source.startsWith("http://") || source.startsWith("https://")) {
      const res = await fetch(source);
      if (res.ok) {
        contentType = (res.headers.get("content-type") || "image/png").split(";")[0].trim().toLowerCase();
        ext = (contentType.split("/")[1] || "png").replace("jpeg", "jpg");
        buffer = Buffer.from(await res.arrayBuffer());
      }
    }

    if (!buffer || buffer.length === 0) return source;
    if (buffer.length > MAX_UPLOAD_BYTES) return source;
    if (!ALLOWED_UPLOAD_MIME_TYPES.has(contentType)) return source;

    const fileName = `${filePrefix}-${Date.now()}.${ext}`;
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
      return publicUrl;
    }
  } catch (e) {
    console.warn(`Error al subir asset ${filePrefix} a order-references:`, e);
  }

  return source;
}

export async function submitOrderAction(payload: SubmitOrderPayload): Promise<SubmitOrderResponse> {
  try {
    // 0. Validación estricta con Zod en el servidor
    const parsedItems = z
      .array(orderItemSchema)
      .min(1, "Debes agregar al menos un producto al pedido.")
      .max(MAX_ORDER_ITEMS, `Máximo ${MAX_ORDER_ITEMS} productos por pedido.`)
      .safeParse(payload?.items);

    if (!parsedItems.success) {
      return {
        success: false,
        orderCode: "",
        whatsappUrl: "",
        error: parsedItems.error.issues[0]?.message || "Los productos del pedido no son válidos.",
      };
    }

    const parsedContact = step3ContactSchema.safeParse(payload?.contact);
    if (!parsedContact.success) {
      return {
        success: false,
        orderCode: "",
        whatsappUrl: "",
        error: parsedContact.error.issues[0]?.message || "Verifica tus datos de contacto y términos.",
      };
    }

    const items = parsedItems.data;
    const contact = parsedContact.data;

    // Usamos service_role en el servidor para rate-limit, Storage y registro confiable en 'orders'
    const supabase = getSupabaseQueryClient();

    // 1. Anti-spam: Rate-limiting persistente por IP (máx. 5 pedidos cada 10 minutos)
    const ipHash = getClientIpHash();
    const windowStartIso = new Date(Date.now() - ORDER_RATE_LIMIT_WINDOW_MS).toISOString();

    const { count: recentOrderCount, error: rlErr } = await supabase
      .from("order_rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", windowStartIso);

    if (!rlErr && typeof recentOrderCount === "number" && recentOrderCount >= MAX_ORDERS_PER_IP_WINDOW) {
      return {
        success: false,
        orderCode: "",
        whatsappUrl: "",
        error:
          "Has enviado varios pedidos seguidos desde esta conexión. Por favor espera 10 minutos antes de registrar otro pedido.",
      };
    }

    // Generar código amigable: #ALQ-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `#ALQ-${randomSuffix}`;
    const cleanCode = orderCode.replace("#", "");

    // 2. Subir imágenes pendientes (fallback si alguna aún llega en base64 o URL externa)
    const processedItems = await Promise.all(
      items.map(async (item, idx) => {
        const [uploadedRef, uploadedBackRef, uploadedAiArt, uploadedAiMockup] = await Promise.all([
          item.referenceImage
            ? uploadAssetToOrderReferences(supabase, item.referenceImage, `${cleanCode}-item-${idx + 1}-ref`)
            : Promise.resolve(undefined),
          item.backReferenceImage
            ? uploadAssetToOrderReferences(supabase, item.backReferenceImage, `${cleanCode}-item-${idx + 1}-espalda`)
            : Promise.resolve(undefined),
          item.aiGeneratedImage
            ? uploadAssetToOrderReferences(supabase, item.aiGeneratedImage, `${cleanCode}-item-${idx + 1}-arte-ia`)
            : Promise.resolve(undefined),
          item.aiMockupImage
            ? uploadAssetToOrderReferences(supabase, item.aiMockupImage, `${cleanCode}-item-${idx + 1}-mockup`)
            : Promise.resolve(undefined),
        ]);

        return {
          ...item,
          ...(uploadedRef
            ? {
                referenceImageUrl: uploadedRef,
                referenceImage: uploadedRef,
              }
            : {}),
          ...(uploadedBackRef
            ? {
                backReferenceImageUrl: uploadedBackRef,
                backReferenceImage: uploadedBackRef,
              }
            : {}),
          ...(uploadedAiArt ? { aiGeneratedImage: uploadedAiArt } : {}),
          ...(uploadedAiMockup ? { aiMockupImage: uploadedAiMockup } : {}),
        };
      })
    );

    // 3. Guardar en la tabla de Supabase 'orders' (sin silenciar errores reales)
    const { error: dbErr } = await supabase.from("orders").insert([
      {
        order_code: orderCode,
        customer_name: contact.customerName.trim(),
        customer_phone: contact.customerPhone.trim(),
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
      return {
        success: false,
        orderCode: "",
        whatsappUrl: "",
        error: "No pudimos registrar tu pedido en el sistema. Por favor intenta de nuevo en unos segundos.",
      };
    }

    // Registrar evento de rate-limit (no bloqueante si la tabla aún no existiera en algún entorno)
    await supabase
      .from("order_rate_limits")
      .insert([{ ip_hash: ipHash }])
      .then(({ error }) => {
        if (error) console.warn("Aviso al registrar order_rate_limits:", error.message);
      });

    // 4. Generar la URL final de WhatsApp
    const whatsappUrl = buildWhatsAppOrderUrl({
      orderCode,
      customerName: contact.customerName.trim(),
      customerPhone: contact.customerPhone.trim(),
      deliveryDate: contact.deliveryDate,
      orderPricingType: contact.orderPricingType,
      paymentMethod: contact.paymentMethod,
      items: processedItems,
    });

    revalidateTag("admin-orders");
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
 * Consulta directamente Supabase garantizando datos en tiempo real en Vercel.
 */
export async function getOrders(params?: GetOrdersParams): Promise<GetOrdersResult> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("No autorizado. Debes iniciar sesión como socio del taller.");
  }

  const { page = 1, limit = 20, status = "todos", search = "" } = params || {};
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);

  const supabase = getSupabaseQueryClient();
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
  if (search && search.trim()) {
    const term = search.trim();
    query = query.or(
      `order_code.ilike.%${term}%,customer_name.ilike.%${term}%,customer_phone.ilike.%${term}%`
    );
  }

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
    revalidateTag("admin-orders");

    return { success: true };
  } catch (err: unknown) {
    console.error("Error inesperado en updateOrderStatus:", err);
    return { success: false, error: "Ocurrió un error inesperado al actualizar el estado." };
  }
}
