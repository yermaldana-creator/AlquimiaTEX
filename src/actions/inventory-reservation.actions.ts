"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/actions/auth.actions";
import type { OrderInventoryReservationRecord } from "@/types";

export interface ReservationItemPayload {
  order_item_id: string;
  inventory_item_id: string;
  inventory_item_name: string;
  quantity: number;
}

export interface ReservationActionResult {
  success: boolean;
  message?: string;
  error?: string;
  reservations?: OrderInventoryReservationRecord[];
}

/**
 * Reserva inventario atómicamente para un pedido invocando la función RPC reserve_order_inventory en Supabase.
 */
export async function reserveOrderInventoryAction(
  orderId: string,
  reservations: ReservationItemPayload[]
): Promise<ReservationActionResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado. Inicia sesión como socio del taller." };
    }

    if (!orderId) {
      return { success: false, error: "Identificador de pedido inválido." };
    }

    if (!reservations || reservations.length === 0) {
      return { success: false, error: "Debes seleccionar insumos para apartar." };
    }

    const supabase = createClient();

    const { data, error } = await supabase.rpc("reserve_order_inventory", {
      p_order_id: orderId,
      p_reservations: reservations,
    });

    if (error) {
      console.error("[reserveOrderInventoryAction] Error RPC:", error);
      return { success: false, error: error.message };
    }

    if (data && data.success === false) {
      return { success: false, error: data.error || "No se pudo apartar el inventario." };
    }

    // Invalida la caché del panel admin para reflejar el nuevo stock y estado
    revalidateTag("admin-orders");
    revalidateTag("admin-inventory");
    revalidatePath("/admin");
    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${orderId}`);
    revalidatePath("/admin/inventario");

    return {
      success: true,
      message: data?.message || "Inventario apartado exitosamente.",
      reservations: data?.reservations || [],
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al apartar inventario.";
    console.error("[reserveOrderInventoryAction] Excepción:", err);
    return { success: false, error: message };
  }
}

/**
 * Libera el inventario reservado y devuelve las cantidades al almacén invocando release_order_inventory.
 */
export async function releaseOrderInventoryAction(
  orderId: string
): Promise<ReservationActionResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado. Inicia sesión como socio del taller." };
    }

    if (!orderId) {
      return { success: false, error: "Identificador de pedido inválido." };
    }

    const supabase = createClient();

    const { data, error } = await supabase.rpc("release_order_inventory", {
      p_order_id: orderId,
    });

    if (error) {
      console.error("[releaseOrderInventoryAction] Error RPC:", error);
      return { success: false, error: error.message };
    }

    if (data && data.success === false) {
      return { success: false, error: data.error || "No se pudo liberar el inventario." };
    }

    // Invalida la caché
    revalidateTag("admin-orders");
    revalidateTag("admin-inventory");
    revalidatePath("/admin");
    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${orderId}`);
    revalidatePath("/admin/inventario");

    return {
      success: true,
      message: data?.message || "Inventario devuelto al almacén exitosamente.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al liberar inventario.";
    console.error("[releaseOrderInventoryAction] Excepción:", err);
    return { success: false, error: message };
  }
}
