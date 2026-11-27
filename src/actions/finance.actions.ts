"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseQueryClient } from "@/lib/supabase/cached-client";
import { getSessionUser } from "@/actions/auth.actions";
import {
  cashMovementSchema,
  inventoryPurchaseSchema,
  type CashMovementFormData,
  type InventoryPurchaseFormData,
} from "@/lib/schemas";
import type {
  CashAccount,
  CashCurrency,
  CashMovement,
  DailyClosingByCurrency,
  FinanceDashboardData,
  InventoryCategory,
  InventoryPurchase,
} from "@/types";

const CURRENCY_LABELS: Record<CashCurrency, string> = {
  USD: "Dólares Efectivo (USD)",
  BS: "Bolívares / Pago Móvil (Bs)",
  USDT: "Binance (USDT)",
};

function getTodayCaracasDate(): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Caracas",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

function toCaracasDateKey(isoString: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Caracas",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date(isoString));
  } catch {
    return isoString.split("T")[0];
  }
}

/**
 * Obtiene las cuentas de caja con su saldo real calculado en vivo.
 * Reutilizable en Finanzas y en la ficha de Pedidos.
 */
export async function getCashAccountsWithBalance(): Promise<CashAccount[]> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("No autorizado. Debes iniciar sesión como socio del taller.");
  }

  const supabase = getSupabaseQueryClient();

  const [{ data: accountsRaw, error: accErr }, { data: allMovsRaw, error: movErr }] =
    await Promise.all([
      supabase
        .from("cash_accounts")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true }),
      supabase.from("cash_movements").select("account_id, type, amount"),
    ]);

  if (accErr) {
    console.error("Error cargando cash_accounts:", accErr.message);
    return [];
  }
  if (movErr) {
    console.error("Error cargando cash_movements para saldos:", movErr.message);
  }

  const totalsByAccount = new Map<string, { totalIn: number; totalOut: number }>();
  (allMovsRaw || []).forEach((m) => {
    const accId = m.account_id as string;
    const prev = totalsByAccount.get(accId) || { totalIn: 0, totalOut: 0 };
    const amt = Number(m.amount || 0);
    if (m.type === "ingreso") {
      prev.totalIn += amt;
    } else if (m.type === "egreso") {
      prev.totalOut += amt;
    }
    totalsByAccount.set(accId, prev);
  });

  return (accountsRaw || []).map((acc) => {
    const sums = totalsByAccount.get(acc.id) || { totalIn: 0, totalOut: 0 };
    const initial = Number(acc.initial_balance || 0);
    const balance = Number((initial + sums.totalIn - sums.totalOut).toFixed(2));
    return {
      id: acc.id,
      slug: acc.slug,
      name: acc.name,
      currency: acc.currency as CashCurrency,
      initial_balance: initial,
      total_in: Number(sums.totalIn.toFixed(2)),
      total_out: Number(sums.totalOut.toFixed(2)),
      balance,
      is_active: Boolean(acc.is_active),
      created_at: acc.created_at,
    };
  });
}

/**
 * Obtiene todos los datos del Dashboard de Finanzas / Caja Diaria y Compras.
 */
export async function getFinanceDashboardData(
  dateStr?: string
): Promise<FinanceDashboardData> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("No autorizado. Debes iniciar sesión como socio del taller.");
  }

  const selectedDate =
    dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? dateStr : getTodayCaracasDate();

  const supabase = getSupabaseQueryClient();

  const [accounts, movementsRes, purchasesRes, inventoryRes] = await Promise.all([
    getCashAccountsWithBalance(),
    supabase
      .from("cash_movements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("inventory_purchases")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("inventory_items")
      .select("id, name, variant, category, unit, quantity, cost_per_unit")
      .is("archived_at", null)
      .order("name", { ascending: true }),
  ]);

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const inventoryItems = (inventoryRes.data || []).map((it) => ({
    id: it.id as string,
    name: it.name as string,
    variant: (it.variant as string | null) || null,
    category: it.category as InventoryCategory,
    unit: (it.unit as string) || "unidad",
    quantity: Number(it.quantity || 0),
    cost_per_unit: Number(it.cost_per_unit || 0),
  }));
  const itemMap = new Map(inventoryItems.map((it) => [it.id, it]));

  const movements: CashMovement[] = (movementsRes.data || []).map((m) => {
    const acc = accountMap.get(m.account_id);
    return {
      id: m.id,
      account_id: m.account_id,
      account_name: acc?.name || "Cuenta",
      type: m.type,
      amount: Number(m.amount || 0),
      currency: m.currency as CashCurrency,
      concept: m.concept,
      category: m.category || "general",
      related_order_id: m.related_order_id || null,
      related_purchase_id: m.related_purchase_id || null,
      created_by: m.created_by,
      created_at: m.created_at,
    };
  });

  // Cierre del día para la fecha seleccionada (en horario America/Caracas)
  const dailyMovements = movements.filter(
    (m) => toCaracasDateKey(m.created_at) === selectedDate
  );

  const currencies: CashCurrency[] = ["USD", "BS", "USDT"];
  const dailyClosing: DailyClosingByCurrency[] = currencies.map((currency) => {
    const matching = dailyMovements.filter((m) => m.currency === currency);
    const totalIn = matching
      .filter((m) => m.type === "ingreso")
      .reduce((sum, m) => sum + m.amount, 0);
    const totalOut = matching
      .filter((m) => m.type === "egreso")
      .reduce((sum, m) => sum + m.amount, 0);
    return {
      currency,
      label: CURRENCY_LABELS[currency],
      totalIn: Number(totalIn.toFixed(2)),
      totalOut: Number(totalOut.toFixed(2)),
      netBalance: Number((totalIn - totalOut).toFixed(2)),
      movementsCount: matching.length,
    };
  });

  const purchases: InventoryPurchase[] = (purchasesRes.data || []).map((p) => {
    const item = itemMap.get(p.inventory_item_id);
    const acc = accountMap.get(p.account_id);
    return {
      id: p.id,
      inventory_item_id: p.inventory_item_id,
      inventory_item_name: item?.name || "Ítem de inventario",
      inventory_item_variant: item?.variant || null,
      inventory_item_unit: item?.unit || "unidad",
      quantity: Number(p.quantity || 0),
      total_cost: Number(p.total_cost || 0),
      unit_cost: Number(p.unit_cost || 0),
      account_id: p.account_id,
      account_name: acc?.name || "Cuenta",
      account_currency: acc?.currency || "USD",
      notes: p.notes || null,
      created_by: p.created_by,
      created_at: p.created_at,
    };
  });

  return {
    selectedDate,
    accounts,
    movements,
    dailyMovements,
    dailyClosing,
    purchases,
    inventoryItems,
  };
}

/**
 * Registra un ingreso o egreso manual (o vinculado a un pedido) en cash_movements.
 */
export async function createCashMovement(
  input: CashMovementFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado. Inicia sesión como socio." };
    }

    const parsed = cashMovementSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Datos del movimiento inválidos.",
      };
    }

    const data = parsed.data;
    const supabase = getSupabaseQueryClient();

    const { data: account, error: accErr } = await supabase
      .from("cash_accounts")
      .select("id, currency, name")
      .eq("id", data.account_id)
      .single();

    if (accErr || !account) {
      return { success: false, error: "La cuenta seleccionada no existe." };
    }

    const { error: insertErr } = await supabase.from("cash_movements").insert([
      {
        account_id: account.id,
        type: data.type,
        amount: Number(data.amount.toFixed(2)),
        currency: account.currency,
        concept: data.concept.trim(),
        category: data.category || "general",
        related_order_id: data.related_order_id || null,
        created_by: user.email || "socio",
      },
    ]);

    if (insertErr) {
      console.error("Error al insertar cash_movements:", insertErr.message);
      return { success: false, error: "No se pudo registrar el movimiento en caja." };
    }

    revalidatePath("/admin/finanzas");
    revalidatePath("/admin");
    if (data.related_order_id) {
      revalidatePath(`/admin/pedidos/${data.related_order_id}`);
    }

    return { success: true };
  } catch (err) {
    console.error("Error inesperado en createCashMovement:", err);
    return { success: false, error: "Error inesperado al registrar movimiento." };
  }
}

/**
 * Registra una compra de insumos ejecutando automáticamente las 3 acciones:
 * 1) Registra la compra en inventory_purchases.
 * 2) Suma la cantidad al stock y actualiza cost_per_unit en inventory_items.
 * 3) Registra el egreso automático en cash_movements vinculado a la compra.
 */
export async function registerInventoryPurchase(
  input: InventoryPurchaseFormData
): Promise<{ success: boolean; error?: string; unitCost?: number; newQuantity?: number }> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado. Inicia sesión como socio." };
    }

    const parsed = inventoryPurchaseSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Datos de compra inválidos.",
      };
    }

    const data = parsed.data;
    const supabase = getSupabaseQueryClient();

    const [{ data: item, error: itemErr }, { data: account, error: accErr }] =
      await Promise.all([
        supabase
          .from("inventory_items")
          .select("id, name, variant, unit, quantity, cost_per_unit")
          .eq("id", data.inventory_item_id)
          .single(),
        supabase
          .from("cash_accounts")
          .select("id, name, currency")
          .eq("id", data.account_id)
          .single(),
      ]);

    if (itemErr || !item) {
      return { success: false, error: "El ítem seleccionado no existe en el inventario." };
    }
    if (accErr || !account) {
      return { success: false, error: "La cuenta seleccionada no existe." };
    }

    const unitCost = Number((data.total_cost / data.quantity).toFixed(4));
    const currentQty = Number(item.quantity || 0);
    const newQuantity = Number((currentQty + data.quantity).toFixed(2));
    const actorEmail = user.email || "socio";

    // 1. Insertar registro de compra en inventory_purchases
    const { data: purchaseRow, error: purchErr } = await supabase
      .from("inventory_purchases")
      .insert([
        {
          inventory_item_id: item.id,
          quantity: Number(data.quantity.toFixed(2)),
          total_cost: Number(data.total_cost.toFixed(2)),
          unit_cost: unitCost,
          account_id: account.id,
          notes: data.notes?.trim() || null,
          created_by: actorEmail,
        },
      ])
      .select("id")
      .single();

    if (purchErr || !purchaseRow) {
      console.error("Error insertando inventory_purchases:", purchErr?.message);
      return { success: false, error: "No se pudo registrar la compra de insumos." };
    }

    // 2. Sumar stock y actualizar costo unitario en inventory_items
    const { error: stockErr } = await supabase
      .from("inventory_items")
      .update({
        quantity: newQuantity,
        cost_per_unit: Number(unitCost.toFixed(2)),
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (stockErr) {
      console.error("Error actualizando stock/costo en inventory_items:", stockErr.message);
      return {
        success: false,
        error: "La compra se creó pero falló la actualización del inventario.",
      };
    }

    // 3. Registrar egreso automático en cash_movements descontando de la cuenta
    const variantSuffix = item.variant ? ` (${item.variant})` : "";
    const concept = `Compra insumo: ${item.name}${variantSuffix} x${data.quantity} ${item.unit || "ud"}`;

    const { error: movErr } = await supabase.from("cash_movements").insert([
      {
        account_id: account.id,
        type: "egreso",
        amount: Number(data.total_cost.toFixed(2)),
        currency: account.currency,
        concept,
        category: "compra_insumos",
        related_purchase_id: purchaseRow.id,
        created_by: actorEmail,
      },
    ]);

    if (movErr) {
      console.error("Error registrando egreso automático en cash_movements:", movErr.message);
      return {
        success: false,
        error: "Stock actualizado, pero no se pudo registrar el egreso en caja.",
      };
    }

    revalidatePath("/admin/finanzas");
    revalidatePath("/admin/inventario");
    revalidatePath("/admin/costos");
    revalidatePath("/admin");

    return {
      success: true,
      unitCost,
      newQuantity,
    };
  } catch (err) {
    console.error("Error inesperado en registerInventoryPurchase:", err);
    return { success: false, error: "Error inesperado al registrar la compra." };
  }
}

/**
 * Elimina un movimiento manual o de pedido en cash_movements de forma segura.
 * Bloquea el borrado directo si el movimiento proviene de una compra de insumos
 * (related_purchase_id) para evitar descuadrar el stock del inventario.
 */
export async function deleteCashMovement(
  movementId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado. Inicia sesión como socio." };
    }

    const cleanId = movementId?.trim();
    if (
      !cleanId ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId)
    ) {
      return { success: false, error: "ID de movimiento no válido." };
    }

    const supabase = getSupabaseQueryClient();

    const { data: movement, error: fetchErr } = await supabase
      .from("cash_movements")
      .select("id, related_purchase_id, related_order_id")
      .eq("id", cleanId)
      .single();

    if (fetchErr || !movement) {
      return { success: false, error: "El movimiento no existe o ya fue eliminado." };
    }

    if (movement.related_purchase_id) {
      return {
        success: false,
        error:
          "Este movimiento proviene de una compra de insumos vinculada al inventario y no puede eliminarse directamente para no descuadrar el stock.",
      };
    }

    const { error: deleteErr } = await supabase
      .from("cash_movements")
      .delete()
      .eq("id", cleanId);

    if (deleteErr) {
      console.error("Error al eliminar cash_movements:", deleteErr.message);
      return { success: false, error: "No se pudo eliminar el movimiento en caja." };
    }

    revalidatePath("/admin/finanzas");
    revalidatePath("/admin");
    if (movement.related_order_id) {
      revalidatePath(`/admin/pedidos/${movement.related_order_id}`);
    }

    return { success: true };
  } catch (err) {
    console.error("Error inesperado en deleteCashMovement:", err);
    return { success: false, error: "Error inesperado al eliminar el movimiento." };
  }
}

/**
 * Elimina una compra de insumos en inventory_purchases revirtiendo automáticamente:
 * 1) Resta la cantidad comprada del ítem en inventory_items (con piso en 0).
 * 2) Elimina el egreso vinculado en cash_movements (devolviendo el saldo a la cuenta).
 * 3) Elimina el registro en inventory_purchases.
 */
export async function deleteInventoryPurchase(
  purchaseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado. Inicia sesión como socio." };
    }

    const cleanId = purchaseId?.trim();
    if (
      !cleanId ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId)
    ) {
      return { success: false, error: "ID de compra no válido." };
    }

    const supabase = getSupabaseQueryClient();

    // 0. Buscar la compra
    const { data: purchase, error: fetchErr } = await supabase
      .from("inventory_purchases")
      .select("id, inventory_item_id, quantity, total_cost, account_id")
      .eq("id", cleanId)
      .single();

    if (fetchErr || !purchase) {
      return { success: false, error: "La compra no existe o ya fue eliminada." };
    }

    // 1. Restar la cantidad comprada del stock del ítem (sin permitir stock negativo)
    const { data: item } = await supabase
      .from("inventory_items")
      .select("id, quantity")
      .eq("id", purchase.inventory_item_id)
      .single();

    if (item) {
      const currentQty = Number(item.quantity || 0);
      const purchasedQty = Number(purchase.quantity || 0);
      const nextQty = Number(Math.max(0, currentQty - purchasedQty).toFixed(2));

      const { error: stockErr } = await supabase
        .from("inventory_items")
        .update({
          quantity: nextQty,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (stockErr) {
        console.error("Error revirtiendo stock en inventory_items:", stockErr.message);
        return {
          success: false,
          error: "No se pudo revertir el stock del inventario. Operación cancelada.",
        };
      }
    }

    // 2. Eliminar el egreso vinculado en cash_movements
    const { error: movErr } = await supabase
      .from("cash_movements")
      .delete()
      .eq("related_purchase_id", cleanId);

    if (movErr) {
      console.error("Error eliminando egreso vinculado en cash_movements:", movErr.message);
      return {
        success: false,
        error: "No se pudo revertir el egreso en caja.",
      };
    }

    // 3. Eliminar el registro en inventory_purchases
    const { error: delErr } = await supabase
      .from("inventory_purchases")
      .delete()
      .eq("id", cleanId);

    if (delErr) {
      console.error("Error eliminando registro en inventory_purchases:", delErr.message);
      return {
        success: false,
        error: "No se pudo eliminar el registro de compra.",
      };
    }

    revalidatePath("/admin/finanzas");
    revalidatePath("/admin/inventario");
    revalidatePath("/admin");

    return { success: true };
  } catch (err) {
    console.error("Error inesperado en deleteInventoryPurchase:", err);
    return { success: false, error: "Error inesperado al eliminar la compra." };
  }
}
