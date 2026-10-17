"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseQueryClient } from "@/lib/supabase/cached-client";
import { getSessionUser } from "@/actions/auth.actions";
import { debtFormSchema, debtPaymentFormSchema } from "@/lib/schemas";
import type {
  Debt,
  DebtFormData,
  DebtPaymentFormData,
  DebtPaymentRecord,
  GetDebtsParams,
  GetDebtsResult,
} from "@/types";

export interface DebtMutationResult {
  success: boolean;
  message?: string;
  error?: string;
  debt?: Debt;
}

/**
 * Consulta deudas en Supabase con filtros por tipo (por cobrar / por pagar),
 * estado, moneda y búsqueda por nombre o concepto.
 */
export async function getDebts(params: GetDebtsParams = {}): Promise<GetDebtsResult> {
  const { type = "todos", status = "todos", currency = "todas", search = "" } = params;

  try {
    const supabase = getSupabaseQueryClient();
    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Consulta base filtrada para la tabla
    let query = supabase.from("debts").select("*");

    if (type !== "todos") {
      query = query.eq("type", type);
    }

    if (currency !== "todas") {
      query = query.eq("currency", currency);
    }

    if (status !== "todos") {
      if (status === "vencida") {
        query = query
          .neq("status", "pagada")
          .not("due_date", "is", null)
          .lt("due_date", todayStr);
      } else {
        query = query.eq("status", status);
      }
    }

    if (search && search.trim()) {
      const term = search.trim();
      query = query.or(
        `entity_name.ilike.%${term}%,description.ilike.%${term}%,notes.ilike.%${term}%`
      );
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error al obtener deudas en getDebts:", error.message);
      return {
        debts: [],
        kpis: {
          totalReceivableUsd: 0,
          totalReceivableBs: 0,
          pendingReceivableCount: 0,
          totalPayableUsd: 0,
          totalPayableBs: 0,
          pendingPayableCount: 0,
          netBalanceUsd: 0,
          overdueDebtsCount: 0,
        },
        totalCount: 0,
        error: error.message,
      };
    }

    // Normalizar items e identificar vencimiento al vuelo si due_date < hoy
    const debts: Debt[] = (data || []).map((row) => {
      const isPastDue =
        row.due_date &&
        row.due_date < todayStr &&
        row.status !== "pagada";

      return {
        ...row,
        amount_original: Number(row.amount_original || 0),
        amount_paid: Number(row.amount_paid || 0),
        status: isPastDue ? "vencida" : row.status,
        payments: Array.isArray(row.payments) ? row.payments : [],
      };
    });

    // 2. Consulta de todos los registros para cálculo de KPIs globales (sin verse afectados por filtros locales)
    const { data: allDebtsData } = await supabase
      .from("debts")
      .select("type, currency, amount_original, amount_paid, status, due_date");

    const allDebts = allDebtsData || [];

    let totalReceivableUsd = 0;
    let totalReceivableBs = 0;
    let pendingReceivableCount = 0;

    let totalPayableUsd = 0;
    let totalPayableBs = 0;
    let pendingPayableCount = 0;

    let overdueDebtsCount = 0;

    for (const d of allDebts) {
      const orig = Number(d.amount_original || 0);
      const paid = Number(d.amount_paid || 0);
      const pending = Math.max(0, orig - paid);
      const isPaid = d.status === "pagada" || pending <= 0;

      const isOverdue =
        d.due_date &&
        d.due_date < todayStr &&
        !isPaid;

      if (isOverdue) {
        overdueDebtsCount++;
      }

      if (d.type === "por_cobrar") {
        if (!isPaid) {
          pendingReceivableCount++;
          if (d.currency === "USD") {
            totalReceivableUsd += pending;
          } else {
            totalReceivableBs += pending;
          }
        }
      } else if (d.type === "por_pagar") {
        if (!isPaid) {
          pendingPayableCount++;
          if (d.currency === "USD") {
            totalPayableUsd += pending;
          } else {
            totalPayableBs += pending;
          }
        }
      }
    }

    const netBalanceUsd = totalReceivableUsd - totalPayableUsd;

    return {
      debts,
      kpis: {
        totalReceivableUsd: Number(totalReceivableUsd.toFixed(2)),
        totalReceivableBs: Number(totalReceivableBs.toFixed(2)),
        pendingReceivableCount,
        totalPayableUsd: Number(totalPayableUsd.toFixed(2)),
        totalPayableBs: Number(totalPayableBs.toFixed(2)),
        pendingPayableCount,
        netBalanceUsd: Number(netBalanceUsd.toFixed(2)),
        overdueDebtsCount,
      },
      totalCount: debts.length,
      error: null,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error inesperado en getDebts";
    console.error("Excepción en getDebts:", msg);
    return {
      debts: [],
      kpis: {
        totalReceivableUsd: 0,
        totalReceivableBs: 0,
        pendingReceivableCount: 0,
        totalPayableUsd: 0,
        totalPayableBs: 0,
        pendingPayableCount: 0,
        netBalanceUsd: 0,
        overdueDebtsCount: 0,
      },
      totalCount: 0,
      error: msg,
    };
  }
}

/**
 * Crea una nueva deuda (por cobrar o por pagar).
 */
export async function createDebt(payload: DebtFormData): Promise<DebtMutationResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado. Inicia sesión como socio." };
    }

    const parsed = debtFormSchema.safeParse(payload);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: errorMsg };
    }

    const { type, entity_name, description, currency, amount_original, due_date, notes } =
      parsed.data;

    const supabase = createClient();
    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from("debts")
      .insert([
        {
          type,
          entity_name: entity_name.trim(),
          description: description?.trim() || null,
          currency,
          amount_original: Number(amount_original),
          amount_paid: 0.0,
          status: "pendiente",
          due_date: due_date || null,
          payments: [],
          notes: notes?.trim() || null,
          created_at: nowIso,
          updated_at: nowIso,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error al crear deuda en Supabase:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/deudas");
    revalidateTag("admin-debts");

    return {
      success: true,
      message: type === "por_cobrar" ? "Cuenta por cobrar registrada con éxito." : "Cuenta por pagar registrada con éxito.",
      debt: data as Debt,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido al registrar deuda.";
    return { success: false, error: msg };
  }
}

/**
 * Actualiza los datos principales de una deuda existente.
 */
export async function updateDebt(
  id: string,
  payload: Partial<DebtFormData>
): Promise<DebtMutationResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado. Inicia sesión como socio." };
    }

    const supabase = createClient();

    // Obtener la deuda actual para validar coherencia de montos
    const { data: existing, error: fetchErr } = await supabase
      .from("debts")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !existing) {
      return { success: false, error: "La deuda no existe o fue eliminada." };
    }

    const amountOriginal =
      payload.amount_original !== undefined
        ? Number(payload.amount_original)
        : Number(existing.amount_original);

    const amountPaid = Number(existing.amount_paid || 0);

    let status = existing.status;
    if (amountPaid >= amountOriginal && amountOriginal > 0) {
      status = "pagada";
    } else if (amountPaid > 0) {
      status = "parcial";
    } else {
      status = "pendiente";
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      status,
    };

    if (payload.type !== undefined) updatePayload.type = payload.type;
    if (payload.entity_name !== undefined) updatePayload.entity_name = payload.entity_name.trim();
    if (payload.description !== undefined) updatePayload.description = payload.description?.trim() || null;
    if (payload.currency !== undefined) updatePayload.currency = payload.currency;
    if (payload.amount_original !== undefined) updatePayload.amount_original = amountOriginal;
    if (payload.due_date !== undefined) updatePayload.due_date = payload.due_date || null;
    if (payload.notes !== undefined) updatePayload.notes = payload.notes?.trim() || null;

    const { data, error } = await supabase
      .from("debts")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/deudas");
    revalidateTag("admin-debts");

    return {
      success: true,
      message: "Deuda actualizada correctamente.",
      debt: data as Debt,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al actualizar deuda.";
    return { success: false, error: msg };
  }
}

/**
 * Registra un abono (pago parcial o total) a una deuda.
 * Agrega el registro al array `payments` JSONB y actualiza `amount_paid` y `status`.
 */
export async function registerDebtPayment(
  debtId: string,
  payload: DebtPaymentFormData
): Promise<DebtMutationResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado. Inicia sesión como socio." };
    }

    const parsed = debtPaymentFormSchema.safeParse(payload);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: errorMsg };
    }

    const { amount, payment_method, date, notes } = parsed.data;

    const supabase = createClient();

    // 1. Obtener la deuda
    const { data: debt, error: fetchErr } = await supabase
      .from("debts")
      .select("*")
      .eq("id", debtId)
      .single();

    if (fetchErr || !debt) {
      return { success: false, error: "Deuda no encontrada." };
    }

    const currentPaid = Number(debt.amount_paid || 0);
    const originalAmount = Number(debt.amount_original || 0);
    const newPaid = Number((currentPaid + amount).toFixed(2));

    const isFullyPaid = newPaid >= originalAmount && originalAmount > 0;
    const newStatus = isFullyPaid ? "pagada" : "parcial";

    const paymentRecord: DebtPaymentRecord = {
      id: crypto.randomUUID(),
      amount: Number(amount.toFixed(2)),
      payment_method,
      date,
      notes: notes?.trim() || null,
      registered_by: (user.user_metadata?.name as string) || user.email || "Socio",
      created_at: new Date().toISOString(),
    };

    const existingPayments: DebtPaymentRecord[] = Array.isArray(debt.payments) ? debt.payments : [];
    const updatedPayments = [...existingPayments, paymentRecord];

    const { data, error } = await supabase
      .from("debts")
      .update({
        amount_paid: newPaid,
        status: newStatus,
        payments: updatedPayments,
        updated_at: new Date().toISOString(),
      })
      .eq("id", debtId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/deudas");
    revalidateTag("admin-debts");

    return {
      success: true,
      message: isFullyPaid
        ? "¡Deuda saldada completamente!"
        : `Abono de ${debt.currency === "USD" ? "$" : "Bs."} ${amount} registrado con éxito.`,
      debt: data as Debt,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al registrar abono.";
    return { success: false, error: msg };
  }
}

/**
 * Marca una deuda como 100% pagada en un solo clic.
 */
export async function markDebtAsPaid(
  debtId: string,
  paymentMethod: string = "Efectivo",
  notes?: string
): Promise<DebtMutationResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado. Inicia sesión como socio." };
    }

    const supabase = createClient();

    const { data: debt, error: fetchErr } = await supabase
      .from("debts")
      .select("*")
      .eq("id", debtId)
      .single();

    if (fetchErr || !debt) {
      return { success: false, error: "Deuda no encontrada." };
    }

    const originalAmount = Number(debt.amount_original || 0);
    const currentPaid = Number(debt.amount_paid || 0);
    const pendingAmount = Number(Math.max(0, originalAmount - currentPaid).toFixed(2));

    const existingPayments: DebtPaymentRecord[] = Array.isArray(debt.payments) ? debt.payments : [];

    // Si aún quedaba monto pendiente, registrar el pago final
    let updatedPayments = existingPayments;
    if (pendingAmount > 0) {
      const finalPayment: DebtPaymentRecord = {
        id: crypto.randomUUID(),
        amount: pendingAmount,
        payment_method: paymentMethod || "Liquidación total",
        date: new Date().toISOString().split("T")[0],
        notes: notes?.trim() || "Marcada como saldada totalmente.",
        registered_by: (user.user_metadata?.name as string) || user.email || "Socio",
        created_at: new Date().toISOString(),
      };
      updatedPayments = [...existingPayments, finalPayment];
    }

    const { data, error } = await supabase
      .from("debts")
      .update({
        amount_paid: originalAmount,
        status: "pagada",
        payments: updatedPayments,
        updated_at: new Date().toISOString(),
      })
      .eq("id", debtId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/deudas");
    revalidateTag("admin-debts");

    return {
      success: true,
      message: "Deuda saldada en su totalidad.",
      debt: data as Debt,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al saldar deuda.";
    return { success: false, error: msg };
  }
}

/**
 * Elimina una deuda del sistema.
 */
export async function deleteDebt(debtId: string): Promise<DebtMutationResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado. Inicia sesión como socio." };
    }

    const supabase = createClient();

    const { error } = await supabase.from("debts").delete().eq("id", debtId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/deudas");
    revalidateTag("admin-debts");

    return {
      success: true,
      message: "Registro de deuda eliminado correctamente.",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al eliminar deuda.";
    return { success: false, error: msg };
  }
}
