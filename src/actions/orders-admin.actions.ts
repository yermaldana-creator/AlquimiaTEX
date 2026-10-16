"use server";

import { getOrders, updateOrderStatus } from "@/actions/orders.actions";
import type { AdminOrder, OrderStatus } from "@/types";

/**
 * Obtiene todos los pedidos registrados en Supabase (compatibilidad con Dashboard).
 */
export async function getOrdersAdmin(): Promise<AdminOrder[]> {
  try {
    const result = await getOrders({ page: 1, limit: 100 });
    return result.orders;
  } catch (err) {
    console.error("Error en getOrdersAdmin:", err);
    return [];
  }
}

/**
 * Actualiza el estado de un pedido (compatibilidad).
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  return await updateOrderStatus(orderId, newStatus);
}
