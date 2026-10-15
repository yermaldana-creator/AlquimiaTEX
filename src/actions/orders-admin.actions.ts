"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { AdminOrder, OrderStatus } from "@/types";

/**
 * Obtiene todos los pedidos registrados en Supabase.
 * Requiere que el usuario esté autenticado como socio para que las políticas RLS permitan la lectura.
 */
export async function getOrdersAdmin(): Promise<AdminOrder[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener los pedidos en getOrdersAdmin:", error.message);
      return [];
    }

    return (data as AdminOrder[]) || [];
  } catch (err) {
    console.error("Error inesperado en getOrdersAdmin:", err);
    return [];
  }
}

/**
 * Actualiza el estado de un pedido en la base de datos de Supabase.
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      console.error("Error al actualizar estado en updateOrderStatusAction:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("Error inesperado en updateOrderStatusAction:", err);
    return { success: false, error: "Ocurrió un error inesperado al actualizar el estado." };
  }
}
