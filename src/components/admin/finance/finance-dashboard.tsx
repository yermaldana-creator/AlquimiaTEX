"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Wallet,
  Plus,
  ShoppingCart,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  RefreshCw,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import {
  deleteCashMovement,
  deleteInventoryPurchase,
  getFinanceDashboardData,
} from "@/actions/finance.actions";
import { CashMovementModal } from "./cash-movement-modal";
import { PurchaseFormModal } from "./purchase-form-modal";
import type {
  CashCurrency,
  CashMovement,
  FinanceDashboardData,
  InventoryPurchase,
} from "@/types";

interface FinanceDashboardProps {
  initialData: FinanceDashboardData;
}

function formatMoney(amount: number, currency: CashCurrency): string {
  const formatted = amount.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (currency === "BS") return `Bs. ${formatted}`;
  if (currency === "USDT") return `${formatted} USDT`;
  return `$${formatted}`;
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-VE", {
      timeZone: "America/Caracas",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function FinanceDashboard({ initialData }: FinanceDashboardProps) {
  const [data, setData] = useState<FinanceDashboardData>(initialData);
  const [activeTab, setActiveTab] = useState<"caja" | "compras">("caja");
  const [selectedDate, setSelectedDate] = useState<string>(initialData.selectedDate);
  const [accountFilter, setAccountFilter] = useState<string>("todas");
  const [typeFilter, setTypeFilter] = useState<string>("todos");
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState<CashMovement | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<InventoryPurchase | null>(null);
  const [deletePurchaseError, setDeletePurchaseError] = useState<string | null>(null);
  const [isDeletingPurchase, setIsDeletingPurchase] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirmDeletePurchase = async () => {
    if (!purchaseToDelete) return;
    setIsDeletingPurchase(true);
    setDeletePurchaseError(null);

    try {
      const res = await deleteInventoryPurchase(purchaseToDelete.id);
      if (!res.success) {
        setDeletePurchaseError(res.error || "No se pudo eliminar la compra.");
        return;
      }
      setPurchaseToDelete(null);
      reloadData();
    } catch {
      setDeletePurchaseError("Error inesperado al eliminar la compra.");
    } finally {
      setIsDeletingPurchase(false);
    }
  };

  const handleConfirmDeleteMovement = async () => {
    if (!movementToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await deleteCashMovement(movementToDelete.id);
      if (!res.success) {
        setDeleteError(res.error || "No se pudo eliminar el movimiento.");
        return;
      }
      setMovementToDelete(null);
      reloadData();
    } catch {
      setDeleteError("Error inesperado al eliminar el movimiento.");
    } finally {
      setIsDeleting(false);
    }
  };

  const reloadData = (dateOverride?: string) => {
    const targetDate = dateOverride ?? selectedDate;
    startTransition(async () => {
      try {
        const fresh = await getFinanceDashboardData(targetDate);
        setData(fresh);
      } catch (err) {
        console.error("Error recargando finanzas:", err);
      }
    });
  };

  const handleDateChange = (nextDate: string) => {
    setSelectedDate(nextDate);
    reloadData(nextDate);
  };

  const filteredMovements = data.movements.filter((m) => {
    if (accountFilter !== "todas" && m.account_id !== accountFilter) return false;
    if (typeFilter !== "todos" && m.type !== typeFilter) return false;
    return true;
  });

  const accountTheme = (currency: CashCurrency) => {
    if (currency === "USD") {
      return {
        cardBg: "bg-[#DCFCE7] dark:bg-emerald-950/40",
        badgeBg: "bg-emerald-600 text-white",
        text: "text-emerald-900 dark:text-emerald-200",
      };
    }
    if (currency === "BS") {
      return {
        cardBg: "bg-[#CFFAFE] dark:bg-cyan-950/40",
        badgeBg: "bg-[#0891B2] text-white",
        text: "text-cyan-950 dark:text-cyan-200",
      };
    }
    return {
      cardBg: "bg-[#FEF9C3] dark:bg-amber-950/40",
      badgeBg: "bg-[#CA8A04] text-black",
      text: "text-amber-950 dark:text-amber-200",
    };
  };

  return (
    <div className="space-y-6">
      {/* 1. TARJETAS DE SALDO REAL EN VIVO POR CUENTA */}
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-oswald text-sm font-black uppercase tracking-wider text-black dark:text-zinc-200">
            [ 1. Saldos en Vivo por Cuenta ]
          </h2>
          <button
            type="button"
            onClick={() => reloadData()}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase px-2.5 py-1 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-slate-100"
          >
            <RefreshCw className={`h-3 w-3 ${isPending ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.accounts.map((acc) => {
            const theme = accountTheme(acc.currency);
            return (
              <div
                key={acc.id}
                className={`${theme.cardBg} border-2 border-black dark:border-zinc-700 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-2`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-black uppercase text-black dark:text-white">
                    {acc.name}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-black px-2 py-0.5 border border-black ${theme.badgeBg}`}
                  >
                    {acc.currency}
                  </span>
                </div>
                <div className={`font-oswald text-3xl sm:text-4xl font-black ${theme.text}`}>
                  {formatMoney(acc.balance, acc.currency)}
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-black/15 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    +{formatMoney(acc.total_in, acc.currency)}
                  </span>
                  <span className="text-rose-700 dark:text-rose-400 font-bold">
                    -{formatMoney(acc.total_out, acc.currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. SUB-PESTAÑAS DEL MÓDULO FINANZAS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black dark:border-zinc-700 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("caja")}
            className={`inline-flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-zinc-700 font-mono text-xs font-black uppercase shrink-0 transition-all ${
              activeTab === "caja"
                ? "bg-black text-[#FACC15] shadow-[3px_3px_0px_#06B6D4] -translate-y-0.5"
                : "bg-white dark:bg-zinc-900 text-black dark:text-zinc-200 hover:bg-slate-100"
            }`}
          >
            <Wallet className="h-4 w-4" />
            <span>Caja Diaria y Movimientos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("compras")}
            className={`inline-flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-zinc-700 font-mono text-xs font-black uppercase shrink-0 transition-all ${
              activeTab === "compras"
                ? "bg-[#581C87] text-[#FACC15] shadow-[3px_3px_0px_#0A0A0A] -translate-y-0.5"
                : "bg-white dark:bg-zinc-900 text-black dark:text-zinc-200 hover:bg-slate-100"
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Compras de Insumos ({data.purchases.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "caja" ? (
            <button
              type="button"
              onClick={() => setIsMovementModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-black bg-[#FACC15] hover:bg-[#EAB308] text-black font-mono text-xs font-black uppercase shadow-[3px_3px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              <span>Registrar Movimiento</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsPurchaseModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-black bg-[#FACC15] hover:bg-[#EAB308] text-black font-mono text-xs font-black uppercase shadow-[3px_3px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              <span>Registrar Compra</span>
            </button>
          )}
        </div>
      </div>

      {/* CONTENIDO PESTAÑA 1: CAJA DIARIA Y MOVIMIENTOS */}
      {activeTab === "caja" && (
        <div className="space-y-6">
          {/* CIERRE DEL DÍA */}
          <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-4 sm:p-5 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/15 dark:border-zinc-700 pb-3">
              <div>
                <h3 className="font-oswald text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#0891B2]" />
                  <span>Cierre del Día</span>
                </h3>
                <p className="font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                  Resumen de ingresos, egresos y balance neto por moneda para la fecha seleccionada.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="font-mono text-[11px] font-bold uppercase text-slate-600 dark:text-zinc-400">
                  Fecha:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#F8F5EE] dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 font-mono text-xs font-bold text-black dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {data.dailyClosing.map((row) => (
                <div
                  key={row.currency}
                  className="bg-[#F8F5EE] dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black uppercase text-black dark:text-white">
                      {row.label}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                      {row.movementsCount} mov.
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 font-mono text-[11px]">
                    <div>
                      <span className="block text-[9px] uppercase text-slate-500">Ingresos</span>
                      <strong className="text-emerald-700 dark:text-emerald-400">
                        +{formatMoney(row.totalIn, row.currency)}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase text-slate-500">Egresos</span>
                      <strong className="text-rose-700 dark:text-rose-400">
                        -{formatMoney(row.totalOut, row.currency)}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase text-slate-500">Neto</span>
                      <strong
                        className={
                          row.netBalance >= 0
                            ? "text-black dark:text-white"
                            : "text-rose-700 dark:text-rose-400"
                        }
                      >
                        {formatMoney(row.netBalance, row.currency)}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HISTORIAL DE MOVIMIENTOS */}
          <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] overflow-hidden">
            <div className="p-4 border-b-2 border-black dark:border-zinc-700 bg-[#F8F5EE] dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-oswald text-base font-black uppercase text-black dark:text-white">
                Movimientos Recientes ({filteredMovements.length})
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={accountFilter}
                  onChange={(e) => setAccountFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 font-mono text-xs text-black dark:text-white"
                >
                  <option value="todas">Todas las cuentas</option>
                  {data.accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 font-mono text-xs text-black dark:text-white"
                >
                  <option value="todos">Ingresos y Egresos</option>
                  <option value="ingreso">Solo Ingresos</option>
                  <option value="egreso">Solo Egresos</option>
                </select>
              </div>
            </div>

            {filteredMovements.length === 0 ? (
              <div className="p-8 text-center font-mono text-xs text-slate-500 dark:text-zinc-400">
                No hay movimientos registrados todavía. Usa <strong>+ Registrar Movimiento</strong> para comenzar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="bg-black text-[#FACC15] uppercase text-[10px]">
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Cuenta</th>
                      <th className="p-3">Concepto</th>
                      <th className="p-3 text-right">Monto</th>
                      <th className="p-3">Socio</th>
                      <th className="p-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/15 dark:divide-zinc-800">
                    {filteredMovements.map((m) => (
                      <tr
                        key={m.id}
                        className="hover:bg-[#F8F5EE]/70 dark:hover:bg-zinc-900/60 transition-colors"
                      >
                        <td className="p-3 whitespace-nowrap text-[11px] text-slate-600 dark:text-zinc-400">
                          {formatDateTime(m.created_at)}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {m.type === "ingreso" ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-700 px-2 py-0.5 text-[10px] font-black uppercase">
                              <ArrowDownCircle className="h-3 w-3" />
                              Ingreso
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-700 px-2 py-0.5 text-[10px] font-black uppercase">
                              <ArrowUpCircle className="h-3 w-3" />
                              Egreso
                            </span>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap font-bold text-black dark:text-zinc-200">
                          {m.account_name}
                        </td>
                        <td className="p-3 text-black dark:text-zinc-100">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>{m.concept}</span>
                            {m.related_order_id && (
                              <Link
                                href={`/admin/pedidos/${m.related_order_id}`}
                                className="inline-flex items-center gap-0.5 text-[10px] bg-[#FACC15] text-black px-1.5 py-0.5 border border-black font-bold hover:underline"
                              >
                                <span>Ver Pedido</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </Link>
                            )}
                          </div>
                        </td>
                        <td
                          className={`p-3 text-right whitespace-nowrap font-black ${
                            m.type === "ingreso"
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-rose-700 dark:text-rose-400"
                          }`}
                        >
                          {m.type === "ingreso" ? "+" : "-"}
                          {formatMoney(m.amount, m.currency)}
                        </td>
                        <td className="p-3 text-[11px] text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                          {m.created_by.split("@")[0]}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          {m.related_purchase_id ? (
                            <span
                              title="Vinculado a una compra de inventario (no se puede eliminar directamente para no descuadrar stock)"
                              className="inline-flex items-center justify-center px-2 py-1 border border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase cursor-not-allowed"
                            >
                              Compra
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteError(null);
                                setMovementToDelete(m);
                              }}
                              className="inline-flex items-center justify-center p-1.5 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white shadow-[1.5px_1.5px_0px_#0A0A0A] transition-all"
                              title="Eliminar movimiento"
                              aria-label="Eliminar movimiento"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTENIDO PESTAÑA 2: COMPRAS DE INSUMOS */}
      {activeTab === "compras" && (
        <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] overflow-hidden">
          <div className="p-4 border-b-2 border-black dark:border-zinc-700 bg-[#F8F5EE] dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-oswald text-base font-black uppercase text-black dark:text-white">
                Historial de Compras de Insumos ({data.purchases.length})
              </h3>
              <p className="font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                Cada compra suma stock al inventario, actualiza el costo unitario y descuenta automáticamente de la caja elegida.
              </p>
            </div>
          </div>

          {data.purchases.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-slate-500 dark:text-zinc-400">
              Aún no has registrado compras de insumos. Pulsa <strong>+ Registrar Compra</strong> para cargar tu primera reposición.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-black text-[#FACC15] uppercase text-[10px]">
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Insumo</th>
                    <th className="p-3 text-right">Cantidad</th>
                    <th className="p-3 text-right">Costo Unit.</th>
                    <th className="p-3 text-right">Costo Total</th>
                    <th className="p-3">Cuenta</th>
                    <th className="p-3">Notas</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/15 dark:divide-zinc-800">
                  {data.purchases.map((p) => {
                    const cur = p.account_currency || "USD";
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-[#F8F5EE]/70 dark:hover:bg-zinc-900/60 transition-colors"
                      >
                        <td className="p-3 whitespace-nowrap text-[11px] text-slate-600 dark:text-zinc-400">
                          {formatDateTime(p.created_at)}
                        </td>
                        <td className="p-3 font-bold text-black dark:text-zinc-100">
                          {p.inventory_item_name}
                          {p.inventory_item_variant && (
                            <span className="ml-1 text-[10px] text-slate-500 dark:text-zinc-400">
                              ({p.inventory_item_variant})
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap font-bold text-emerald-700 dark:text-emerald-400">
                          +{p.quantity} {p.inventory_item_unit}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap text-slate-700 dark:text-zinc-300">
                          {formatMoney(p.unit_cost, cur)}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap font-black text-rose-700 dark:text-rose-400">
                          -{formatMoney(p.total_cost, cur)}
                        </td>
                        <td className="p-3 whitespace-nowrap text-black dark:text-zinc-200">
                          {p.account_name}
                        </td>
                        <td className="p-3 text-[11px] text-slate-600 dark:text-zinc-400 max-w-xs truncate">
                          {p.notes || "—"}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setDeletePurchaseError(null);
                              setPurchaseToDelete(p);
                            }}
                            className="inline-flex items-center justify-center p-1.5 border-2 border-black dark:border-zinc-700 bg-rose-600 hover:bg-rose-700 text-white shadow-[1.5px_1.5px_0px_#0A0A0A] transition-all"
                            title="Eliminar compra y revertir stock y caja"
                            aria-label="Eliminar compra"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODALES */}
      <CashMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        accounts={data.accounts}
        onSuccess={() => reloadData()}
      />

      <PurchaseFormModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        accounts={data.accounts}
        inventoryItems={data.inventoryItems}
        onSuccess={() => reloadData()}
      />

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR MOVIMIENTO */}
      {movementToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[6px_6px_0px_#0A0A0A] dark:shadow-[6px_6px_0px_#000000] overflow-hidden">
            <div className="flex items-center justify-between bg-[#FFE4E6] dark:bg-rose-950/60 border-b-2 border-black dark:border-zinc-700 px-4 py-3">
              <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <h3 className="font-oswald text-lg font-black uppercase">
                  Confirmar Eliminación
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !isDeleting && setMovementToDelete(null)}
                className="p-1 text-rose-900 dark:text-rose-200 hover:opacity-75"
                aria-label="Cerrar confirmación"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 font-mono text-xs">
              <p className="text-slate-700 dark:text-zinc-300">
                ¿Estás seguro de eliminar este movimiento? Los saldos en vivo de la cuenta y el Cierre del Día se recalcularán automáticamente.
              </p>

              <div className="bg-[#F8F5EE] dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase text-slate-500">Tipo / Cuenta:</span>
                  <strong className="text-black dark:text-white uppercase">
                    {movementToDelete.type} • {movementToDelete.account_name}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase text-slate-500">Monto:</span>
                  <strong
                    className={
                      movementToDelete.type === "ingreso"
                        ? "text-emerald-700 dark:text-emerald-400 text-sm"
                        : "text-rose-700 dark:text-rose-400 text-sm"
                    }
                  >
                    {movementToDelete.type === "ingreso" ? "+" : "-"}
                    {formatMoney(movementToDelete.amount, movementToDelete.currency)}
                  </strong>
                </div>
                <div className="pt-1 border-t border-black/10 dark:border-zinc-700">
                  <span className="text-[10px] uppercase text-slate-500 block">Concepto:</span>
                  <strong className="text-black dark:text-zinc-100 break-words">
                    {movementToDelete.concept}
                  </strong>
                </div>
              </div>

              {deleteError && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-600 text-rose-700 dark:text-rose-300 font-bold">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/15 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setMovementToDelete(null)}
                  disabled={isDeleting}
                  className="px-3.5 py-2 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold uppercase text-black dark:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void handleConfirmDeleteMovement()}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-black bg-rose-600 hover:bg-rose-700 text-white font-black uppercase shadow-[2.5px_2.5px_0px_#0A0A0A] disabled:opacity-60"
                >
                  {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span>Sí, Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR COMPRA DE INSUMO */}
      {purchaseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[6px_6px_0px_#0A0A0A] dark:shadow-[6px_6px_0px_#000000] overflow-hidden">
            <div className="flex items-center justify-between bg-[#FFE4E6] dark:bg-rose-950/60 border-b-2 border-black dark:border-zinc-700 px-4 py-3">
              <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <h3 className="font-oswald text-lg font-black uppercase">
                  Revertir y Eliminar Compra
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !isDeletingPurchase && setPurchaseToDelete(null)}
                className="p-1 text-rose-900 dark:text-rose-200 hover:opacity-75"
                aria-label="Cerrar confirmación"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 font-mono text-xs">
              <p className="text-slate-700 dark:text-zinc-300">
                Al eliminar esta compra se revertirán automáticamente el inventario y el saldo de caja:
              </p>

              <div className="bg-[#F8F5EE] dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase text-slate-500">Insumo:</span>
                  <strong className="text-black dark:text-white text-right">
                    {purchaseToDelete.inventory_item_name}
                    {purchaseToDelete.inventory_item_variant
                      ? ` (${purchaseToDelete.inventory_item_variant})`
                      : ""}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase text-slate-500">Se restará del stock:</span>
                  <strong className="text-rose-700 dark:text-rose-400">
                    -{purchaseToDelete.quantity} {purchaseToDelete.inventory_item_unit || "ud"}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase text-slate-500">Se devolverá a caja:</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 text-sm">
                    +{formatMoney(purchaseToDelete.total_cost, purchaseToDelete.account_currency || "USD")}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/10 dark:border-zinc-700">
                  <span className="text-[10px] uppercase text-slate-500">Cuenta:</span>
                  <strong className="text-black dark:text-zinc-200">
                    {purchaseToDelete.account_name}
                  </strong>
                </div>
              </div>

              {deletePurchaseError && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-600 text-rose-700 dark:text-rose-300 font-bold">
                  {deletePurchaseError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/15 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setPurchaseToDelete(null)}
                  disabled={isDeletingPurchase}
                  className="px-3.5 py-2 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold uppercase text-black dark:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void handleConfirmDeletePurchase()}
                  disabled={isDeletingPurchase}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-black bg-rose-600 hover:bg-rose-700 text-white font-black uppercase shadow-[2.5px_2.5px_0px_#0A0A0A] disabled:opacity-60"
                >
                  {isDeletingPurchase ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span>Sí, Revertir y Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
