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
      <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#0A0A0A] space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-slate-600">
            TOTAL EN CATÁLOGO
          </span>
          <Package className="h-4 w-4 text-black" />
        </div>
        <div className="font-oswald text-3xl sm:text-4xl font-black text-black">
          {kpis.totalItems}
        </div>
        <p className="font-mono text-[11px] text-slate-500">
          Insumos y productos activos
        </p>
      </div>

      {/* 2. ALERTAS DE STOCK BAJO */}
      <div
        className={`border-2 border-black p-4 shadow-[4px_4px_0px_#0A0A0A] space-y-1 transition-colors ${
          hasAlerts ? "bg-[#FFE4E6]" : "bg-white"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`font-mono text-[10px] sm:text-xs font-bold uppercase ${
              hasAlerts ? "text-[#9F1239]" : "text-slate-600"
            }`}
          >
            STOCK BAJO MÍNIMO
          </span>
          <AlertTriangle
            className={`h-4 w-4 ${hasAlerts ? "text-[#E11D48] animate-bounce" : "text-slate-400"}`}
          />
        </div>
        <div
          className={`font-oswald text-3xl sm:text-4xl font-black ${
            hasAlerts ? "text-[#9F1239]" : "text-black"
          }`}
        >
          {kpis.lowStockAlerts}
        </div>
        <p
          className={`font-mono text-[11px] ${
            hasAlerts ? "text-[#BE123C] font-bold" : "text-slate-500"
          }`}
        >
          {hasAlerts ? "¡Requieren reposición en taller!" : "Niveles de stock saludables"}
        </p>
      </div>

      {/* 3. METROS DE TELA */}
      <div className="bg-[#CFFAFE] border-2 border-black p-4 shadow-[4px_4px_0px_#0A0A0A] space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-[#155E75]">
            TELAS DISPONIBLES
          </span>
          <Layers className="h-4 w-4 text-[#06B6D4]" />
        </div>
        <div className="font-oswald text-3xl sm:text-4xl font-black text-[#155E75]">
          {kpis.totalFabricMeters} m
        </div>
        <p className="font-mono text-[11px] text-[#0E7490]">
          Metros totales en rollo
        </p>
      </div>

      {/* 4. VALOR DEL INVENTARIO */}
      <div className="bg-[#FAF5FF] border-2 border-black p-4 shadow-[4px_4px_0px_#0A0A0A] space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-[#581C87]">
            CAPITAL ESTIMADO
          </span>
          <DollarSign className="h-4 w-4 text-[#581C87]" />
        </div>
        <div className="font-oswald text-3xl sm:text-4xl font-black text-[#581C87]">
          ${kpis.totalInventoryValue.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
        </div>
        <p className="font-mono text-[11px] text-purple-700">
          Inversión total en almacén
        </p>
      </div>
    </div>
  );
}
