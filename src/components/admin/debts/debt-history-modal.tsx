"use client";

import { X, History, DollarSign, Calendar, UserCheck } from "lucide-react";
import type { Debt, DebtPaymentRecord } from "@/types";

interface DebtHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
}

export function DebtHistoryModal({
  isOpen,
  onClose,
  debt,
}: DebtHistoryModalProps) {
  if (!isOpen || !debt) return null;

  const currencySymbol = debt.currency === "USD" ? "$" : "Bs.";
  const payments: DebtPaymentRecord[] = Array.isArray(debt.payments) ? debt.payments : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#F8F5EE] dark:bg-[#1E1E1E] border-4 border-black dark:border-zinc-700 shadow-[8px_8px_0px_#0A0A0A] dark:shadow-[8px_8px_0px_#000000] w-full max-w-lg p-5 sm:p-6 my-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black dark:border-zinc-700 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <History className="h-6 w-6 text-black dark:text-white" />
            <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black dark:text-white tracking-wide">
              Historial de Abonos
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 border-2 border-black dark:border-zinc-700 font-bold text-black dark:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Resumen */}
        <div className="mb-4 p-3 bg-white dark:bg-[#262626] border-2 border-black dark:border-zinc-700 space-y-1.5">
          <div className="flex justify-between items-center">
            <p className="font-oswald text-base font-bold text-black dark:text-white">
              {debt.entity_name}
            </p>
            <span
              className={`font-mono text-[10px] font-black uppercase px-2 py-0.5 border border-black dark:border-zinc-600 ${
                debt.status === "pagada"
                  ? "bg-[#DCFCE7] text-[#14532D]"
                  : debt.status === "parcial"
                  ? "bg-[#FEF08A] text-[#854D0E]"
                  : "bg-white text-slate-800"
              }`}
            >
              {debt.status}
            </span>
          </div>

          <div className="flex justify-between font-mono text-xs text-slate-600 dark:text-zinc-300">
            <span>Monto Total: <strong>{currencySymbol} {debt.amount_original.toFixed(2)}</strong></span>
            <span>Abonado: <strong className="text-emerald-600 dark:text-emerald-400">{currencySymbol} {debt.amount_paid.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Lista de Abonos */}
        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
          {payments.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-300 dark:border-zinc-700 p-4">
              <DollarSign className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="font-mono text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">
                No hay abonos registrados todavía
              </p>
              <p className="font-mono text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                Utiliza el botón &quot;+ Abonar&quot; en la tabla para registrar pagos parciales o totales.
              </p>
            </div>
          ) : (
            payments.map((p, idx) => (
              <div
                key={p.id || idx}
                className="bg-white dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-3 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-600 dark:text-zinc-300">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{p.date}</span>
                  </div>
                  <div className="font-oswald text-base font-black text-emerald-600 dark:text-emerald-400">
                    +{currencySymbol} {Number(p.amount).toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                  <span className="font-bold text-slate-700 dark:text-zinc-300">
                    Método: {p.payment_method}
                  </span>
                  {p.registered_by && (
                    <span className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3" />
                      {p.registered_by}
                    </span>
                  )}
                </div>

                {p.notes && (
                  <p className="font-mono text-[11px] text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-[#1f1f1f] p-1.5 border border-slate-200 dark:border-zinc-700 mt-1 italic">
                    &quot;{p.notes}&quot;
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 mt-4 border-t-2 border-black dark:border-zinc-700">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#FACC15] text-black border-2 border-black dark:border-zinc-700 font-mono text-xs font-black uppercase shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
