import { Package, AlertTriangle, Layers, DollarSign } from "lucide-react";
import type { InventoryKpiData } from "@/types";

interface InventoryKpisProps {
  kpis: InventoryKpiData;
}

export function InventoryKpis({ kpis }: InventoryKpisProps) {
  const hasAlerts = kpis.lowStockAlerts > 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. TOTAL ÍTEMS */}
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-slate-600 dark:text-zinc-400">
            TOTAL EN CATÁLOGO
          </span>
          <Package className="h-4 w-4 text-black dark:text-white" />
        </div>
        <div className="font-oswald text-3xl sm:text-4xl font-black text-black dark:text-white">
          {kpis.totalItems}
        </div>
        <p className="font-mono text-[11px] text-slate-500 dark:text-zinc-400">
          Insumos y productos activos
        </p>
      </div>

      {/* 2. ALERTAS DE STOCK BAJO */}
      <div
        className={`border-2 border-black dark:border-zinc-700 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-1 transition-colors ${
          hasAlerts ? "bg-[#FFE4E6] dark:bg-rose-950/40 dark:border-rose-800/60" : "bg-white dark:bg-[#1E1E1E]"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`font-mono text-[10px] sm:text-xs font-bold uppercase ${
              hasAlerts ? "text-[#9F1239] dark:text-rose-300" : "text-slate-600 dark:text-zinc-400"
            }`}
          >
            STOCK BAJO MÍNIMO
          </span>
          <AlertTriangle
            className={`h-4 w-4 ${hasAlerts ? "text-[#E11D48] dark:text-rose-400 animate-bounce" : "text-slate-400 dark:text-zinc-500"}`}
          />
        </div>
        <div
          className={`font-oswald text-3xl sm:text-4xl font-black ${
            hasAlerts ? "text-[#9F1239] dark:text-rose-200" : "text-black dark:text-white"
          }`}
        >
          {kpis.lowStockAlerts}
        </div>
        <p
          className={`font-mono text-[11px] ${
            hasAlerts ? "text-[#BE123C] dark:text-rose-300 font-bold" : "text-slate-500 dark:text-zinc-400"
          }`}
        >
          {hasAlerts ? "¡Requieren reposición en taller!" : "Niveles de stock saludables"}
        </p>
      </div>

      {/* 3. METROS DE TELA */}
      <div className="bg-[#CFFAFE] dark:bg-cyan-950/30 border-2 border-black dark:border-cyan-800/60 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-[#155E75] dark:text-cyan-300">
            TELAS DISPONIBLES
          </span>
          <Layers className="h-4 w-4 text-[#06B6D4] dark:text-cyan-400" />
        </div>
        <div className="font-oswald text-3xl sm:text-4xl font-black text-[#155E75] dark:text-cyan-200">
          {kpis.totalFabricMeters} m
        </div>
        <p className="font-mono text-[11px] text-[#0E7490] dark:text-cyan-400/80">
          Metros totales en rollo
        </p>
      </div>

      {/* 4. VALOR DEL INVENTARIO */}
      <div className="bg-[#FAF5FF] dark:bg-purple-950/30 border-2 border-black dark:border-purple-800/60 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-[#581C87] dark:text-purple-300">
            CAPITAL ESTIMADO
          </span>
          <DollarSign className="h-4 w-4 text-[#581C87] dark:text-purple-400" />
        </div>
        <div className="font-oswald text-3xl sm:text-4xl font-black text-[#581C87] dark:text-purple-200">
          ${kpis.totalInventoryValue.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
        </div>
        <p className="font-mono text-[11px] text-purple-700 dark:text-purple-400/80">
          Inversión total en almacén
        </p>
      </div>
    </div>
  );
}
