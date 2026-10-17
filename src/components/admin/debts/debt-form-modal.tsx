"use client";

import { useState, useEffect } from "react";
import { X, HandCoins, Receipt, AlertCircle, Loader2 } from "lucide-react";
import type { Debt, DebtFormData, DebtType, DebtCurrency } from "@/types";

interface DebtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DebtFormData) => Promise<{ success: boolean; error?: string }>;
  initialData?: Debt | null;
  defaultType?: DebtType;
}

export function DebtFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultType = "por_cobrar",
}: DebtFormModalProps) {
  const [type, setType] = useState<DebtType>(defaultType);
  const [entityName, setEntityName] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState<DebtCurrency>("USD");
  const [amountOriginal, setAmountOriginal] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setEntityName(initialData.entity_name || "");
      setDescription(initialData.description || "");
      setCurrency(initialData.currency || "USD");
      setAmountOriginal(String(initialData.amount_original ?? ""));
      setDueDate(initialData.due_date || "");
      setNotes(initialData.notes || "");
    } else {
      setType(defaultType);
      setEntityName("");
      setDescription("");
      setCurrency("USD");
      setAmountOriginal("");
      setDueDate("");
      setNotes("");
    }
    setErrorMessage(null);
  }, [initialData, defaultType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = entityName.trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorMessage("Por favor ingresa el nombre de la persona o entidad.");
      return;
    }

    const numericAmount = parseFloat(amountOriginal);
    if (isNaN(numericAmount) || numericAmount < 0) {
      setErrorMessage("Por favor ingresa un monto válido (0 o mayor).");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: DebtFormData = {
        type,
        entity_name: cleanName,
        description: description.trim() || null,
        currency,
        amount_original: numericAmount,
        due_date: dueDate.trim() || null,
        notes: notes.trim() || null,
      };

      const res = await onSubmit(payload);
      if (!res.success) {
        setErrorMessage(res.error || "Ocurrió un error al guardar la cuenta.");
      } else {
        onClose();
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error inesperado al guardar.");
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
      <div className="bg-[#F8F5EE] dark:bg-[#1E1E1E] border-4 border-black dark:border-zinc-700 shadow-[8px_8px_0px_#0A0A0A] dark:shadow-[8px_8px_0px_#000000] w-full max-w-lg p-5 sm:p-6 my-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black dark:border-zinc-700 pb-3 mb-4">
          <div className="flex items-center gap-2">
            {type === "por_cobrar" ? (
              <HandCoins className="h-6 w-6 text-[#15803D] dark:text-emerald-400" />
            ) : (
              <Receipt className="h-6 w-6 text-[#C2410C] dark:text-orange-400" />
            )}
            <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black dark:text-white tracking-wide">
              {initialData ? "Editar Cuenta / Deuda" : "Nueva Cuenta / Deuda"}
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

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-100 dark:bg-rose-950/50 border-2 border-rose-600 dark:border-rose-700 text-rose-800 dark:text-rose-200 flex items-center gap-2 font-mono text-xs font-bold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Deuda */}
          <div>
            <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-200 mb-1.5">
              Tipo de Registro
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("por_cobrar")}
                className={`py-2 px-3 border-2 border-black dark:border-zinc-700 font-mono text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all ${
                  type === "por_cobrar"
                    ? "bg-[#DCFCE7] text-[#14532D] shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                    : "bg-white dark:bg-[#262626] text-slate-700 dark:text-zinc-300 opacity-70 hover:opacity-100"
                }`}
              >
                <HandCoins className="h-3.5 w-3.5" />
                Por Cobrar (Cliente)
              </button>
              <button
                type="button"
                onClick={() => setType("por_pagar")}
                className={`py-2 px-3 border-2 border-black dark:border-zinc-700 font-mono text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all ${
                  type === "por_pagar"
                    ? "bg-[#FFEDD5] text-[#7C2D12] shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                    : "bg-white dark:bg-[#262626] text-slate-700 dark:text-zinc-300 opacity-70 hover:opacity-100"
                }`}
              >
                <Receipt className="h-3.5 w-3.5" />
                Por Pagar (Proveedor)
              </button>
            </div>
          </div>

          {/* Nombre Entidad */}
          <div>
            <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-200 mb-1">
              {type === "por_cobrar" ? "Nombre del Cliente / Deudor *" : "Proveedor / Acreedor *"}
            </label>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              placeholder={type === "por_cobrar" ? "Ej: Fabiana, Juan Pérez..." : "Ej: Distribuidora Textil, Adriana..."}
              className="w-full bg-white dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-2.5 font-mono text-sm text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              required
            />
          </div>

          {/* Moneda y Monto Original */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-200 mb-1">
                Moneda *
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as DebtCurrency)}
                className="w-full bg-white dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-2.5 font-mono text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              >
                <option value="USD">USD ($)</option>
                <option value="BS">BS (Bs.)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-200 mb-1">
                Monto Original *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-mono font-bold text-slate-500">
                  {currency === "USD" ? "$" : "Bs."}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amountOriginal}
                  onChange={(e) => setAmountOriginal(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-2.5 pl-10 font-mono text-sm text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Concepto / Descripción */}
          <div>
            <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-200 mb-1">
              Concepto / Detalle
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: 2 franelas negras DTF, préstamo para insumos..."
              className="w-full bg-white dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-2.5 font-mono text-sm text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            />
          </div>

          {/* Fecha de Vencimiento */}
          <div>
            <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-200 mb-1">
              Fecha Límite / Vencimiento (Opcional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-white dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-2.5 font-mono text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            />
          </div>

          {/* Notas Internas */}
          <div>
            <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-200 mb-1">
              Notas adicionales
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anotaciones para los socios..."
              className="w-full bg-white dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-2.5 font-mono text-xs text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            />
          </div>

          {/* Botones de Acción */}
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
              className="px-5 py-2 bg-[#FACC15] text-black border-2 border-black dark:border-zinc-700 font-mono text-xs font-black uppercase shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{initialData ? "Guardar Cambios" : "Crear Registro"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
