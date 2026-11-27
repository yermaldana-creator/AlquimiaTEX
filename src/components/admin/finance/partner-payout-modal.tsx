"use client";

import { useState, useTransition } from "react";
import { X, Users, Loader2 } from "lucide-react";
import { createCashMovement } from "@/actions/finance.actions";
import type { CashAccount } from "@/types";

export const OFFICIAL_PARTNERS = ["Yahir", "Fernando", "Adriana"] as const;
export type PartnerName = (typeof OFFICIAL_PARTNERS)[number];

const QUICK_CONCEPTS = [
  "Reparto de ganancias",
  "Adelanto",
  "Pago por producción",
] as const;

interface PartnerPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: CashAccount[];
  onSuccess: () => void;
}

export function PartnerPayoutModal({
  isOpen,
  onClose,
  accounts,
  onSuccess,
}: PartnerPayoutModalProps) {
  const [partner, setPartner] = useState<PartnerName>("Yahir");
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || "");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
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

    const cleanNote = note.trim() || "Reparto de ganancias";
    const structuredConcept = `[${partner}] ${cleanNote}`;

    startTransition(async () => {
      const res = await createCashMovement({
        account_id: selectedAccount.id,
        type: "egreso",
        amount: parsedAmount,
        concept: structuredConcept,
        category: "pago_socios",
      });

      if (!res.success) {
        setError(res.error || "No se pudo registrar el pago al socio.");
        return;
      }

      setAmount("");
      setNote("");
      onSuccess();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[6px_6px_0px_#0A0A0A] dark:shadow-[6px_6px_0px_#000000] overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between bg-[#F3E8FF] dark:bg-purple-950/50 border-b-2 border-black dark:border-zinc-700 px-4 py-3">
          <div className="flex items-center gap-2 text-[#581C87] dark:text-purple-200">
            <Users className="h-5 w-5" />
            <h3 className="font-oswald text-lg font-black uppercase">
              Registrar Pago a Socio
            </h3>
          </div>
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
          {/* SELECTOR DE SOCIO */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[11px] font-bold uppercase text-slate-700 dark:text-zinc-300">
              Socio Beneficiario *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {OFFICIAL_PARTNERS.map((p) => {
                const isSelected = partner === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPartner(p)}
                    className={`py-2 px-2 border-2 border-black dark:border-zinc-700 font-mono text-xs font-black uppercase transition-all ${
                      isSelected
                        ? "bg-[#581C87] text-[#FACC15] shadow-[2.5px_2.5px_0px_#0A0A0A] -translate-y-0.5"
                        : "bg-[#F8F5EE] dark:bg-zinc-900 text-black dark:text-zinc-200 hover:bg-slate-100"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CUENTA DE ORIGEN */}
          <div className="space-y-1">
            <label className="block font-mono text-[11px] font-bold uppercase text-slate-700 dark:text-zinc-300">
              Cuenta de Origen *
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
              placeholder="Ej: 40.00"
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 font-mono text-sm font-black text-black dark:text-white"
            />
          </div>

          {/* CONCEPTO / NOTA OPCIONAL */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[11px] font-bold uppercase text-slate-700 dark:text-zinc-300">
              Concepto / Nota (opcional)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_CONCEPTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNote(c)}
                  className={`px-2 py-1 border border-black dark:border-zinc-700 font-mono text-[10px] font-bold transition-colors ${
                    note === c
                      ? "bg-[#FACC15] text-black"
                      : "bg-[#F8F5EE] dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: Reparto de ganancias semana 4, Adelanto..."
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
              <span>Registrar Pago</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
