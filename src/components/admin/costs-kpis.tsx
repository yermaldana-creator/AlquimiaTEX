"use client";

import { Sparkles, Layers, TrendingUp, Award, AlertTriangle } from "lucide-react";
import type { CostsKpiData } from "@/types";

export interface CostsKpisProps {
  kpis: CostsKpiData;
}

export function CostsKpis({ kpis }: CostsKpisProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {/* 1. RECETAS ACTIVAS */}
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-3.5 shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider">Recetas</span>
          <Layers className="h-4 w-4 text-[#7E22CE] dark:text-purple-400" />
        </div>
        <div>
          <div className="font-oswald text-2xl font-black text-black dark:text-[#F5F5F5]">
            {kpis.totalActiveTemplates}
          </div>
          <p className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">
            Fórmulas activas
          </p>
        </div>
      </div>

      {/* 2. INSUMOS Y COMPONENTES */}
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-3.5 shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider">Insumos Base</span>
          <Sparkles className="h-4 w-4 text-[#2563EB] dark:text-blue-400" />
        </div>
        <div>
          <div className="font-oswald text-2xl font-black text-black dark:text-[#F5F5F5]">
            {kpis.totalComponents}
          </div>
          <p className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">
            Costos registrados
          </p>
        </div>
      </div>

      {/* 3. MARGEN PROMEDIO */}
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-3.5 shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider">Margen Promedio</span>
          <TrendingUp className="h-4 w-4 text-[#16A34A] dark:text-emerald-400" />
        </div>
        <div>
          <div className="font-oswald text-2xl font-black text-[#16A34A] dark:text-emerald-400">
            {kpis.averageMarginPercentage > 0 ? `+${kpis.averageMarginPercentage}%` : "0%"}
          </div>
          <p className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">
            Sobre costo directo
          </p>
        </div>
      </div>

      {/* 4. PRODUCTO ESTRELLA */}
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-3.5 shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider">Más Rentable</span>
          <Award className="h-4 w-4 text-[#CA8A04] dark:text-yellow-400" />
        </div>
        <div className="truncate">
          <div className="font-oswald text-sm font-black text-black dark:text-[#F5F5F5] truncate" title={kpis.mostProfitableTemplate?.name || "Sin datos"}>
            {kpis.mostProfitableTemplate ? kpis.mostProfitableTemplate.name : "N/D"}
          </div>
          <p className="font-mono text-[10px] text-[#16A34A] dark:text-emerald-400 font-bold">
            {kpis.mostProfitableTemplate ? `+${kpis.mostProfitableTemplate.margin}% margen` : "Sin recetas"}
          </p>
        </div>
      </div>

      {/* 5. ALERTAS DE BAJO MARGEN */}
      <div className="col-span-2 md:col-span-1 bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-3.5 shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider">Margen Bajo</span>
          <AlertTriangle className={`h-4 w-4 ${kpis.lowMarginAlertsCount > 0 ? "text-red-500 animate-pulse" : "text-slate-400 dark:text-zinc-500"}`} />
        </div>
        <div>
          <div className={`font-oswald text-2xl font-black ${kpis.lowMarginAlertsCount > 0 ? "text-red-600 dark:text-red-400" : "text-black dark:text-[#F5F5F5]"}`}>
            {kpis.lowMarginAlertsCount}
          </div>
          <p className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">
            {kpis.lowMarginAlertsCount > 0 ? "Requiere revisión (<20%)" : "Rentabilidad óptima"}
          </p>
        </div>
      </div>
    </div>
  );
}
