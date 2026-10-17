"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseQueryClient } from "@/lib/supabase/cached-client";
import { getSessionUser } from "@/actions/auth.actions";
import type {
  InventoryItem,
  InventoryFormData,
  GetInventoryParams,
  InventoryKpiData,
} from "@/types";

export interface GetInventoryResult {
  items: InventoryItem[];
  kpis: InventoryKpiData;
  totalCount: number;
}

export interface InventoryMutationResult {
  success: boolean;
  merged?: boolean;
  message?: string;
  error?: string;
  newQuantity?: number;
}

/**
 * Consulta el inventario en Supabase con filtros por categoría, búsqueda y alertas.
 * Valida sesión de socio mediante getSessionUser().
 */
async function queryInventoryDataDirectly(
  category: string,
  search: string,
  onlyAlerts: boolean,
  showArchived: boolean
) {
  const supabase = getSupabaseQueryClient();

  // 1. Consulta base para los items
  let query = supabase.from("inventory_items").select("*");

  // Filtro de archivados (Soft Delete)
  if (showArchived) {
    query = query.not("archived_at", "is", null);
  } else {
    query = query.is("archived_at", null);
  }

  // Filtro por categoría
  if (category && category !== "todos") {
    query = query.eq("category", category);
  }

  // Buscador por nombre, variante o notas
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,variant.ilike.%${search}%,notes.ilike.%${search}%`
    );
  }

  // Ordenamiento por fecha de actualización
  query = query.order("updated_at", { ascending: false });

  const { data, error } = await query;

  console.log("DEBUG INVENTARIO: filas obtenidas =", data?.length, "error =", error);

  if (error) {
    console.error("Error al obtener inventario en getInventory:", error.message);
    return {
      items: [],
      kpis: {
        totalItems: 0,
        lowStockAlerts: 0,
        totalFabricMeters: 0,
        totalInventoryValue: 0,
      },
      totalCount: 0,
      error: error.message,
    };
  }

  let items = (data as InventoryItem[]) || [];

  // Filtro en memoria si pide "solo alertas"
  if (onlyAlerts) {
    items = items.filter(
      (item) => Number(item.quantity) <= Number(item.min_stock_alert)
    );
  }

  // 2. Consulta paralela o cálculo de KPIs sobre ítems activos (no archivados)
  const { data: allActiveItems } = await supabase
    .from("inventory_items")
    .select("category, quantity, min_stock_alert, cost_per_unit")
    .is("archived_at", null);

  const active = allActiveItems || [];

  const totalItems = active.length;
  const lowStockAlerts = active.filter(
    (item) => Number(item.quantity) <= Number(item.min_stock_alert)
  ).length;

  const totalFabricMeters = active
    .filter((item) => item.category === "tela")
    .reduce((acc, curr) => acc + Number(curr.quantity || 0), 0);

  const totalInventoryValue = active.reduce(
    (acc, curr) =>
      acc + Number(curr.quantity || 0) * Number(curr.cost_per_unit || 0),
    0
  );

  return {
    items,
    kpis: {
      totalItems,
      lowStockAlerts,
      totalFabricMeters: Number(totalFabricMeters.toFixed(2)),
      totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
    },
    totalCount: items.length,
    error: null,
  };
}

/**
 * Consulta el inventario en Supabase con filtros por categoría, búsqueda y alertas.
 * Valida sesión de socio mediante getSessionUser().
 */
export async function getInventory(params?: GetInventoryParams): Promise<GetInventoryResult> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("No autorizado. Debes iniciar sesión como socio del taller.");
  }

  const {
    category = "todos",
    search = "",
    onlyAlerts = false,
    showArchived = false,
  } = params || {};

  // Bypass temporal de unstable_cache para depuración forense en vivo
  const res = await queryInventoryDataDirectly(
    category,
    search.trim(),
    onlyAlerts,
    showArchived
  );

  return {
    items: res.items,
    kpis: res.kpis,
    totalCount: res.totalCount,
  };
}


/**
 * Crea un nuevo ítem o suma la cantidad si ya existe la combinación (category + name + variant).
 * Bloquea cantidades negativas.
 */
export async function createOrUpdateInventoryItem(
  payload: InventoryFormData
): Promise<InventoryMutationResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado. Inicia sesión como socio." };
    }

    const incomingQty = Number(payload.quantity);
    if (isNaN(incomingQty) || incomingQty < 0) {
      return { success: false, error: "No puedes tener stock negativo." };
    }

    const cleanName = payload.name.trim();
    const cleanVariant = payload.variant ? payload.variant.trim() : "";

    const supabase = createClient();

    // 1. Verificar si ya existe un ítem activo con la misma categoría, nombre y variante
    let checkQuery = supabase
      .from("inventory_items")
      .select("*")
      .is("archived_at", null)
      .eq("category", payload.category)
      .ilike("name", cleanName);

    if (cleanVariant) {
      checkQuery = checkQuery.ilike("variant", cleanVariant);
    } else {
      checkQuery = checkQuery.or("variant.is.null,variant.eq.''");
    }

    const { data: existingItems, error: searchErr } = await checkQuery;

    if (searchErr) {
      console.error("Error al verificar duplicados en createOrUpdateInventoryItem:", searchErr);
    }

    const existing = existingItems && existingItems.length > 0 ? existingItems[0] : null;

    if (existing) {
      // 2. Ya existe: Sumar la cantidad recibida y actualizar datos
      const newTotalQuantity = Number(existing.quantity) + incomingQty;

      const { error: updateErr } = await supabase
        .from("inventory_items")
        .update({
          quantity: newTotalQuantity,
          unit: payload.unit || existing.unit,
          min_stock_alert: payload.min_stock_alert ?? existing.min_stock_alert,
          cost_per_unit: payload.cost_per_unit ?? existing.cost_per_unit,
          notes: payload.notes ?? existing.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateErr) {
        return { success: false, error: updateErr.message };
      }

      revalidatePath("/admin/inventario");
      revalidateTag("admin-inventory");
      return {
        success: true,
        merged: true,
        message: "Ya existe este ítem. Se actualizó la cantidad.",
        newQuantity: newTotalQuantity,
      };
    }

    // 3. No existe: Insertar nuevo ítem
    const { error: insertErr } = await supabase.from("inventory_items").insert([
      {
        category: payload.category,
        name: cleanName,
        variant: cleanVariant || null,
        quantity: incomingQty,
        unit: payload.unit || "unidad",
        min_stock_alert: Number(payload.min_stock_alert || 0),
        cost_per_unit: Number(payload.cost_per_unit || 0),
        notes: payload.notes?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (insertErr) {
      return { success: false, error: insertErr.message };
    }

    revalidatePath("/admin/inventario");
    revalidateTag("admin-inventory");
    return {
      success: true,
      merged: false,
      message: "Ítem agregado exitosamente al inventario.",
    };
  } catch (err: unknown) {
    console.error("Error inesperado en createOrUpdateInventoryItem:", err);
    return { success: false, error: "Ocurrió un error inesperado al guardar el ítem." };
  }
}

/**
 * Actualiza los datos de un ítem existente.
 */
export async function updateInventoryItem(
  id: string,
  payload: Partial<InventoryFormData>
): Promise<InventoryMutationResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado. Inicia sesión como socio." };
    }

    if (payload.quantity !== undefined && Number(payload.quantity) < 0) {
      return { success: false, error: "No puedes tener stock negativo." };
    }

    const supabase = createClient();
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.category) updateData.category = payload.category;
    if (payload.name) updateData.name = payload.name.trim();
    if (payload.variant !== undefined) updateData.variant = payload.variant?.trim() || null;
    if (payload.quantity !== undefined) updateData.quantity = Number(payload.quantity);
    if (payload.unit) updateData.unit = payload.unit;
    if (payload.min_stock_alert !== undefined)
      updateData.min_stock_alert = Number(payload.min_stock_alert);
    if (payload.cost_per_unit !== undefined)
      updateData.cost_per_unit = Number(payload.cost_per_unit);
    if (payload.notes !== undefined) updateData.notes = payload.notes?.trim() || null;

    const { error } = await supabase.from("inventory_items").update(updateData).eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/inventario");
    revalidateTag("admin-inventory");
    return { success: true, message: "Ítem actualizado correctamente." };
  } catch (err: unknown) {
    console.error("Error inesperado en updateInventoryItem:", err);
    return { success: false, error: "Error inesperado al actualizar el ítem." };
  }
}

/**
 * Ajuste rápido de existencias (+1 o -1). Bloquea si la cantidad resultante es menor a cero.
 */
export async function adjustStockDelta(
  id: string,
  delta: number
): Promise<InventoryMutationResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado. Inicia sesión como socio." };
    }

    const supabase = createClient();

    // Obtener cantidad actual
    const { data: item, error: fetchErr } = await supabase
      .from("inventory_items")
      .select("id, quantity, name, unit")
      .eq("id", id)
      .single();

    if (fetchErr || !item) {
      return { success: false, error: "Ítem no encontrado en inventario." };
    }

    const currentQty = Number(item.quantity);
    const newQty = Number((currentQty + delta).toFixed(2));

    if (newQty < 0) {
      return { success: false, error: "No puedes tener stock negativo." };
    }

    const { error: updateErr } = await supabase
      .from("inventory_items")
      .update({
        quantity: newQty,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    revalidatePath("/admin/inventario");
    revalidateTag("admin-inventory");
    return { success: true, newQuantity: newQty };
  } catch (err: unknown) {
    console.error("Error inesperado en adjustStockDelta:", err);
    return { success: false, error: "Error inesperado al ajustar stock." };
  }
}

/**
 * Soft Delete: Archiva un ítem marcando archived_at = now().
 */
export async function archiveInventoryItem(id: string): Promise<InventoryMutationResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado. Inicia sesión como socio." };
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("inventory_items")
      .update({
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/inventario");
    revalidateTag("admin-inventory");
    return { success: true, message: "Ítem archivado correctamente." };
  } catch (err: unknown) {
    console.error("Error inesperado en archiveInventoryItem:", err);
    return { success: false, error: "Error inesperado al archivar ítem." };
  }
}

/**
 * Restaura un ítem archivado marcando archived_at = null.
 */
export async function restoreInventoryItem(id: string): Promise<InventoryMutationResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado. Inicia sesión como socio." };
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("inventory_items")
      .update({
        archived_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/inventario");
    revalidateTag("admin-inventory");
    return { success: true, message: "Ítem restaurado al inventario activo." };
  } catch (err: unknown) {
    console.error("Error inesperado en restoreInventoryItem:", err);
    return { success: false, error: "Error inesperado al restaurar ítem." };
  }
}
