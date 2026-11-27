"use client";

import { useState, useTransition } from "react";
import { X, ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";
import { createCashMovement } from "@/actions/finance.actions";
import type { CashAccount, CashMovementType } from "@/types";

interface CashMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: CashAccount[];
  onSuccess: () => void;
  defaultType?: CashMovementType;
  defaultConcept?: string;
  defaultCategory?: string;
  relatedOrderId?: string | null;
  title?: string;
}

const MOVEMENT_CATEGORIES = [
  { value: "venta_abono", label: "Venta / Abono de Pedido" },
  { value: "compra_insumos", label: "Compra de Insumos" },
  { value: "gasto_operativo", label: "Gasto Operativo / Servicios" },
  { value: "envio_logistica", label: "Envío / Delivery / Logística" },
  { value: "retiro_socios", label: "Retiro / Reparto Socios" },
  { value: "general", label: "General / Otro" },
];

export function CashMovementModal({
  isOpen,
  onClose,
  accounts,
  onSuccess,
  defaultType = "ingreso",
  defaultConcept = "",
  defaultCategory = "venta_abono",
  relatedOrderId = null,
  title = "Registrar Movimiento de Caja",
}: CashMovementModalProps) {
  const [type, setType] = useState<CashMovementType>(defaultType);
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || "");
  const [amount, setAmount] = useState<string>("");
  const [concept, setConcept] = useState<string>(defaultConcept);
  const [category, setCategory] = useState<string>(defaultCategory);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const selectedAccount = accounts.find((a) => a.id === accountId) || accounts[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (!selectedAccount) {
      setError("No hay cuentas de caja disponibles.");
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Ingresa un monto válido mayor a 0.");
      return;
    }
    if (concept.trim().length < 3) {
      setError("Escribe un concepto descriptivo (mín. 3 caracteres).");
      return;
    }

    startTransition(async () => {
      const res = await createCashMovement({
        account_id: selectedAccount.id,
        type,
        amount: parsedAmount,
        concept: concept.trim(),
        category,
        related_order_id: relatedOrderId || null,
      });

      if (!res.success) {
        setError(res.error || "No se pudo registrar el movimiento.");
        return;
      }

      setAmount("");
      setConcept(defaultConcept);
      onSuccess();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[6px_6px_0px_#0A0A0A] dark:shadow-[6px_6px_0px_#000000] overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between bg-[#F8F5EE] dark:bg-zinc-900 border-b-2 border-black dark:border-zinc-700 px-4 py-3">
          <h3 className="font-oswald text-lg font-black uppercase text-black dark:text-white">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* TIPO DE MOVIMIENTO */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("ingreso")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 border-2 border-black dark:border-zinc-700 font-mono text-xs font-black uppercase transition-all ${
                type === "ingreso"
                  ? "bg-emerald-500 text-white shadow-[2.5px_2.5px_0px_#0A0A0A]"
                  : "bg-[#F8F5EE] dark:bg-zinc-900 text-slate-700 dark:text-zinc-300"
              }`}
            >
              <ArrowDownCircle className="h-4 w-4" />
              <span>Ingreso (+)</span>
            </button>
            <button
              type="button"
              onClick={() => setType("egreso")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 border-2 border-black dark:border-zinc-700 font-mono text-xs font-black uppercase transition-all ${
                type === "egreso"
                  ? "bg-rose-600 text-white shadow-[2.5px_2.5px_0px_#0A0A0A]"
                  : "bg-[#F8F5EE] dark:bg-zinc-900 text-slate-700 dark:text-zinc-300"
              }`}
            >
              <ArrowUpCircle className="h-4 w-4" />
              <span>Egreso (-)</span>
            </button>
          </div>

          {/* CUENTA */}
          <div className="space-y-1">
            <label className="block font-mono text-[11px] font-bold uppercase text-slate-700 dark:text-zinc-300">
              Cuenta / Moneda *
            </label>
            <select
              value={selectedAccount?.id || ""}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8F5EE] dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 font-mono text-xs font-bold text-black dark:text-white"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency}) — Saldo: {acc.balance.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
          </div>

          {/* MONTO */}
          <div className="space-y-1">
            <label className="block font-mono text-[11px] font-bold uppercase text-slate-700 dark:text-zinc-300">
              Monto ({selectedAccount?.currency || "USD"}) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ej: 25.00"
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 font-mono text-sm font-black text-black dark:text-white"
            />
          </div>

          {/* CATEGORÍA */}
          <div className="space-y-1">
            <label className="block font-mono text-[11px] font-bold uppercase text-slate-700 dark:text-zinc-300">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8F5EE] dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 font-mono text-xs text-black dark:text-white"
            >
              {MOVEMENT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* CONCEPTO */}
          <div className="space-y-1">
            <label className="block font-mono text-[11px] font-bold uppercase text-slate-700 dark:text-zinc-300">
              Concepto / Descripción *
            </label>
            <input
              type="text"
              required
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej: Abono 50% pedido #ALQ-1234 — María Pérez"
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 font-mono text-xs text-black dark:text-white"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-600 text-rose-700 dark:text-rose-300 font-mono text-xs font-bold">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/15 dark:border-zinc-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-3.5 py-2 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-xs font-bold uppercase text-black dark:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-black bg-[#FACC15] hover:bg-[#EAB308] text-black font-mono text-xs font-black uppercase shadow-[2.5px_2.5px_0px_#0A0A0A] disabled:opacity-60"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Guardar en Caja</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
