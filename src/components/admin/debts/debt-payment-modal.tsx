"use client";

import { useState, useEffect } from "react";
import { X, DollarSign, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import type { Debt, DebtPaymentFormData } from "@/types";

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
  onSubmit: (debtId: string, data: DebtPaymentFormData) => Promise<{ success: boolean; error?: string }>;
}

export function DebtPaymentModal({
  isOpen,
  onClose,
  debt,
  onSubmit,
}: DebtPaymentModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Pago Móvil");
  const [date, setDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setPaymentMethod("Pago Móvil");
      setDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen || !debt) return null;

  const currencySymbol = debt.currency === "USD" ? "$" : "Bs.";
  const pendingBalance = Math.max(0, debt.amount_original - debt.amount_paid);

  const handleSetMaxAmount = () => {
    setAmount(pendingBalance.toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage("El monto del abono debe ser mayor a 0.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: DebtPaymentFormData = {
        amount: numericAmount,
        payment_method: paymentMethod,
        date: date || new Date().toISOString().split("T")[0],
        notes: notes.trim() || null,
      };

      const res = await onSubmit(debt.id, payload);
      if (!res.success) {
        setErrorMessage(res.error || "Ocurrió un error al registrar el abono.");
      } else {
        onClose();
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="bg-[#F8F5EE] dark:bg-[#1E1E1E] border-4 border-black dark:border-zinc-700 shadow-[8px_8px_0px_#0A0A0A] dark:shadow-[8px_8px_0px_#000000] w-full max-w-md p-5 sm:p-6 my-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black dark:border-zinc-700 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-[#15803D] dark:text-emerald-400" />
            <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black dark:text-white tracking-wide">
              Registrar Abono
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 border-2 border-black dark:border-zinc-700 font-bold text-black dark:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Resumen de la Deuda */}
        <div className="mb-4 p-3 bg-white dark:bg-[#262626] border-2 border-black dark:border-zinc-700 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400">
                {debt.type === "por_cobrar" ? "Cliente" : "Proveedor"}
              </span>
              <p className="font-oswald text-lg font-black text-black dark:text-white leading-tight">
                {debt.entity_name}
              </p>
              {debt.description && (
                <p className="font-mono text-xs text-slate-600 dark:text-zinc-300 mt-0.5">
                  {debt.description}
                </p>
              )}
            </div>
            <span
              className={`font-mono text-[10px] font-black uppercase px-2 py-0.5 border border-black dark:border-zinc-600 ${
                debt.type === "por_cobrar"
                  ? "bg-[#DCFCE7] text-[#14532D]"
                  : "bg-[#FFEDD5] text-[#7C2D12]"
              }`}
            >
              {debt.type === "por_cobrar" ? "Por Cobrar" : "Por Pagar"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-zinc-700 text-center font-mono">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Total</span>
              <span className="text-xs font-bold text-black dark:text-white">
                {currencySymbol} {debt.amount_original.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Abonado</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {currencySymbol} {debt.amount_paid.toFixed(2)}
              </span>
            </div>
            <div className="bg-amber-100 dark:bg-amber-950/40 p-1 border border-amber-300 dark:border-amber-700">
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block">Pendiente</span>
              <span className="text-xs font-black text-amber-900 dark:text-amber-200">
                {currencySymbol} {pendingBalance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-100 dark:bg-rose-950/50 border-2 border-rose-600 dark:border-rose-700 text-rose-800 dark:text-rose-200 flex items-center gap-2 font-mono text-xs font-bold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Monto del abono con botón de Saldar Todo */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono text-xs font-bold uppercase text-black dark:text-zinc-200">
                Monto del Abono *
              </label>
              {pendingBalance > 0 && (
                <button
                  type="button"
                  onClick={handleSetMaxAmount}
                  className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Abonar saldo restante ({currencySymbol} {pendingBalance.toFixed(2)})
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-mono font-bold text-slate-500">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-2.5 pl-10 font-mono text-base font-bold text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Método de pago */}
          <div>
            <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-200 mb-1">
              Método de Pago *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-white dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-2.5 font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            >
              <option value="Pago Móvil">Pago Móvil</option>
              <option value="Efectivo USD">Efectivo ($ USD)</option>
              <option value="Efectivo Bs">Efectivo (Bs.)</option>
              <option value="Binance Pay">Binance (USDT)</option>
              <option value="Zelle">Zelle</option>
              <option value="Transferencia Bancaria">Transferencia Bancaria</option>
              <option value="Otro">Otro Método</option>
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-200 mb-1">
              Fecha del Abono *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-2.5 font-mono text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              required
            />
          </div>

          {/* Notas o Referencia */}
          <div>
            <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-200 mb-1">
              Referencia / Comprobante (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Ref #49281, billete 20$..."
              className="w-full bg-white dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-2.5 font-mono text-sm text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black dark:border-zinc-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border-2 border-black dark:border-zinc-700 font-mono text-xs font-bold uppercase text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#22C55E] text-white border-2 border-black dark:border-zinc-700 font-mono text-xs font-black uppercase shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>Registrar Abono</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
