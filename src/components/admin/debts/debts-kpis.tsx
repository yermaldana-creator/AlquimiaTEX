"use client";

import { HandCoins, Receipt, Scale, AlertTriangle } from "lucide-react";
import type { DebtsKpiData } from "@/types";

interface DebtsKpisProps {
  kpis: DebtsKpiData;
}

export function DebtsKpis({ kpis }: DebtsKpisProps) {
  const hasOverdue = kpis.overdueDebtsCount > 0;
  const isNetPositive = kpis.netBalanceUsd >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. POR COBRAR (CLIENTES) */}
      <div className="bg-[#DCFCE7] dark:bg-emerald-950/30 border-2 border-black dark:border-emerald-800/60 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-[#166534] dark:text-emerald-300">
            TOTAL POR COBRAR (CLIENTES)
          </span>
          <HandCoins className="h-5 w-5 text-[#15803D] dark:text-emerald-400" />
        </div>
        <div>
          <div className="font-oswald text-3xl sm:text-4xl font-black text-[#14532D] dark:text-emerald-200">
            ${kpis.totalReceivableUsd.toFixed(2)}
          </div>
          {kpis.totalReceivableBs > 0 && (
            <div className="font-mono text-xs font-bold text-[#166534] dark:text-emerald-400 mt-0.5">
              + Bs. {kpis.totalReceivableBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
        <p className="font-mono text-[11px] text-[#166534]/90 dark:text-emerald-400/90 font-medium">
          {kpis.pendingReceivableCount} {kpis.pendingReceivableCount === 1 ? "cuenta por cobrar" : "cuentas por cobrar"}
        </p>
      </div>

      {/* 2. POR PAGAR (PROVEEDORES / NUESTRAS) */}
      <div className="bg-[#FFEDD5] dark:bg-orange-950/30 border-2 border-black dark:border-orange-800/60 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-[#9A3412] dark:text-orange-300">
            TOTAL POR PAGAR (NUESTRAS)
          </span>
          <Receipt className="h-5 w-5 text-[#C2410C] dark:text-orange-400" />
        </div>
        <div>
          <div className="font-oswald text-3xl sm:text-4xl font-black text-[#7C2D12] dark:text-orange-200">
            ${kpis.totalPayableUsd.toFixed(2)}
          </div>
          {kpis.totalPayableBs > 0 && (
            <div className="font-mono text-xs font-bold text-[#9A3412] dark:text-orange-400 mt-0.5">
              + Bs. {kpis.totalPayableBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
        <p className="font-mono text-[11px] text-[#9A3412]/90 dark:text-orange-400/90 font-medium">
          {kpis.pendingPayableCount} {kpis.pendingPayableCount === 1 ? "compromiso pendiente" : "compromisos pendientes"}
        </p>
      </div>

      {/* 3. BALANCE NETO ESTIMADO EN USD */}
      <div className="bg-[#FEF08A] dark:bg-amber-950/40 border-2 border-black dark:border-amber-700/60 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-[#854D0E] dark:text-amber-300">
            BALANCE NETO ($)
          </span>
          <Scale className="h-5 w-5 text-[#A16207] dark:text-amber-400" />
        </div>
        <div>
          <div
            className={`font-oswald text-3xl sm:text-4xl font-black ${
              isNetPositive
                ? "text-[#713F12] dark:text-amber-200"
                : "text-rose-700 dark:text-rose-300"
            }`}
          >
            {isNetPositive ? "+" : ""}${kpis.netBalanceUsd.toFixed(2)}
          </div>
          <p className="font-mono text-[11px] text-[#854D0E] dark:text-amber-400 font-medium mt-1">
            Cobrar USD - Pagar USD
          </p>
        </div>
        <p className="font-mono text-[11px] text-slate-700 dark:text-zinc-300 font-bold">
          {isNetPositive ? "✓ Flujo a favor del taller" : "⚠ Flujo negativo pendiente"}
        </p>
      </div>

      {/* 4. DEUDAS VENCIDAS */}
      <div
        className={`border-2 border-black dark:border-zinc-700 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-2 transition-colors ${
          hasOverdue
            ? "bg-[#FFE4E6] dark:bg-rose-950/40 dark:border-rose-800/60"
            : "bg-white dark:bg-[#1E1E1E]"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`font-mono text-[10px] sm:text-xs font-bold uppercase ${
              hasOverdue
                ? "text-[#9F1239] dark:text-rose-300"
                : "text-slate-600 dark:text-zinc-400"
            }`}
          >
            DEUDAS VENCIDAS
          </span>
          <AlertTriangle
            className={`h-5 w-5 ${
              hasOverdue
                ? "text-[#E11D48] dark:text-rose-400 animate-bounce"
                : "text-slate-400 dark:text-zinc-500"
            }`}
          />
        </div>
        <div>
          <div
            className={`font-oswald text-3xl sm:text-4xl font-black ${
              hasOverdue
                ? "text-[#9F1239] dark:text-rose-200"
                : "text-black dark:text-white"
            }`}
          >
            {kpis.overdueDebtsCount}
          </div>
          <p
            className={`font-mono text-[11px] mt-1 ${
              hasOverdue
                ? "text-[#BE123C] dark:text-rose-300 font-bold"
                : "text-slate-500 dark:text-zinc-400"
            }`}
          >
            {hasOverdue ? "¡Superaron la fecha pactada!" : "Todo al día sin vencimientos"}
          </p>
        </div>
        <p className="font-mono text-[11px] text-slate-500 dark:text-zinc-400">
          Control de compromisos
        </p>
      </div>
    </div>
  );
}
