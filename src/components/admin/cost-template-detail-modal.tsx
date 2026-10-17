"use client";

import { X, Calculator, PieChart } from "lucide-react";
import {
  COST_TEMPLATE_CATEGORIES,
  COST_COMPONENT_CATEGORIES,
  COST_MARGIN_TYPES,
  PROFITABILITY_CONFIG,
} from "@/lib/constants";
import type { CalculatedTemplatePricing } from "@/types";

interface CostTemplateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pricing: CalculatedTemplatePricing | null;
  onSimulate?: (pricing: CalculatedTemplatePricing) => void;
}

export function CostTemplateDetailModal({
  isOpen,
  onClose,
  pricing,
  onSimulate,
}: CostTemplateDetailModalProps) {
  if (!isOpen || !pricing) return null;

  const { template, hydratedComponents, unitCost, salePrice, profit, marginPercentage, profitabilityLevel } = pricing;
  const catConfig = COST_TEMPLATE_CATEGORIES[template.category] || COST_TEMPLATE_CATEGORIES.otro;
  const profConfig = PROFITABILITY_CONFIG[profitabilityLevel];
  const marginModeConfig = COST_MARGIN_TYPES[template.margin_type];

  // Colores por categoría de insumo para la barra de desglose visual
  const categoryBarColors: Record<string, string> = {
    prenda_base: "bg-[#7E22CE]",
    prenda_dtf: "bg-[#2563EB]",
    tinta: "bg-[#CA8A04]",
    papel: "bg-[#16A34A]",
    empaque: "bg-[#4F46E5]",
    mano_obra: "bg-[#EA580C]",
    otro: "bg-[#E11D48]",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[8px_8px_0px_#0A0A0A] dark:shadow-[8px_8px_0px_#000000] w-full max-w-2xl my-6 p-6 space-y-5 animate-in fade-in-50 zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* ENCABEZADO */}
        <div className="flex items-start justify-between border-b-2 border-black dark:border-zinc-700 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 border border-black dark:border-zinc-700 bg-[#FACC15] text-black">
                {catConfig.label}
              </span>
              <span
                className={`font-mono text-[10px] font-bold px-2 py-0.5 border border-black ${profConfig.badgeBg} ${profConfig.badgeText}`}
              >
                {profConfig.icon} {profConfig.label}
              </span>
            </div>
            <h3 className="font-oswald text-2xl font-black uppercase text-black dark:text-[#F5F5F5]">
              {template.product_name}
            </h3>
            {template.description && (
              <p className="font-mono text-xs text-slate-600 dark:text-zinc-400">
                {template.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-black dark:text-white hover:opacity-75 p-1 border border-black dark:border-zinc-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 4 TARJETAS DE RESULTADO FINANCIERO */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-3 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000]">
            <span className="block font-mono text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400">
              Costo Unitario
            </span>
            <span className="font-oswald text-xl font-black text-black dark:text-[#F5F5F5]">
              ${unitCost.toFixed(2)}
            </span>
            <span className="font-mono text-[9px] text-slate-500 dark:text-zinc-400">
              Inversión directa
            </span>
          </div>

          <div className="bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-3 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000]">
            <span className="block font-mono text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400">
              Ganancia Neta
            </span>
            <span
              className={`font-oswald text-xl font-black ${
                profit < 0 ? "text-red-600" : "text-[#16A34A] dark:text-emerald-400"
              }`}
            >
              ${profit.toFixed(2)}
            </span>
            <span className="font-mono text-[9px] text-slate-500 dark:text-zinc-400">
              Por cada unidad
            </span>
          </div>

          <div className="bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-3 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000]">
            <span className="block font-mono text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400">
              Precio Sugerido
            </span>
            <span className="font-oswald text-xl font-black text-[#2563EB] dark:text-blue-400">
              ${salePrice.toFixed(2)}
            </span>
            <span className="font-mono text-[9px] text-slate-500 dark:text-zinc-400">
              Venta al público
            </span>
          </div>

          <div className="bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-3 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000]">
            <span className="block font-mono text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400">
              Margen / Mark-up
            </span>
            <span className="font-oswald text-xl font-black text-[#7E22CE] dark:text-purple-400">
              {marginPercentage > 0 ? `+${marginPercentage}%` : "0%"}
            </span>
            <span className="font-mono text-[9px] text-slate-500 dark:text-zinc-400">
              Sobre costo total
            </span>
          </div>
        </div>

        {/* BARRA VISUAL DE DISTRIBUCIÓN DEL COSTO */}
        <div className="space-y-2 bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-3.5 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000]">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="flex items-center gap-1.5 text-black dark:text-[#F5F5F5]">
              <PieChart className="h-4 w-4" />
              <span>Distribución Porcentual del Costo</span>
            </span>
            <span className="text-slate-500 dark:text-zinc-400">100% = ${unitCost.toFixed(2)}</span>
          </div>

          {/* BARRA SEGMENTADA */}
          <div className="h-5 w-full bg-slate-200 dark:bg-zinc-700 border border-black flex overflow-hidden">
            {hydratedComponents.map((item, idx) => {
              const pct = unitCost > 0 ? (item.subtotal / unitCost) * 100 : 0;
              const colorClass = categoryBarColors[item.component_category] || "bg-slate-500";
              if (pct <= 0) return null;

              return (
                <div
                  key={idx}
                  style={{ width: `${pct}%` }}
                  className={`${colorClass} hover:opacity-85 transition-opacity relative group`}
                  title={`${item.component_name}: $${item.subtotal.toFixed(2)} (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          {/* LEYENDA */}
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
            {hydratedComponents.map((item, idx) => {
              const pct = unitCost > 0 ? (item.subtotal / unitCost) * 100 : 0;
              const colorClass = categoryBarColors[item.component_category] || "bg-slate-500";

              return (
                <div key={idx} className="flex items-center gap-1 text-slate-700 dark:text-zinc-300">
                  <span className={`h-2.5 w-2.5 rounded-sm ${colorClass} border border-black`} />
                  <span>
                    {item.component_name} ({pct.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TABLA DE COMPONENTES */}
        <div className="space-y-2">
          <h4 className="font-oswald text-xs font-black uppercase tracking-wider text-black dark:text-[#F5F5F5]">
            Desglose Detallado de Ingredientes
          </h4>

          <div className="border-2 border-black dark:border-zinc-700 overflow-hidden">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="bg-[#F8F5EE] dark:bg-[#262626] border-b-2 border-black dark:border-zinc-700 text-[11px] uppercase font-bold text-black dark:text-[#F5F5F5]">
                  <th className="p-2 border-r border-black dark:border-zinc-700">Insumo</th>
                  <th className="p-2 border-r border-black dark:border-zinc-700 text-center">Cant.</th>
                  <th className="p-2 border-r border-black dark:border-zinc-700 text-right">Costo Unit.</th>
                  <th className="p-2 border-r border-black dark:border-zinc-700 text-right">Subtotal</th>
                  <th className="p-2 text-right">% Costo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/30 dark:divide-zinc-700">
                {hydratedComponents.map((item, idx) => {
                  const pct = unitCost > 0 ? (item.subtotal / unitCost) * 100 : 0;
                  const catConfigComp = COST_COMPONENT_CATEGORIES[item.component_category] || COST_COMPONENT_CATEGORIES.otro;

                  return (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                      <td className="p-2 border-r border-black dark:border-zinc-700 font-bold text-black dark:text-[#F5F5F5]">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] px-1 py-0.2 border border-black ${catConfigComp.bg} ${catConfigComp.text}`}>
                            {catConfigComp.shortLabel}
                          </span>
                          <span>{item.component_name}</span>
                        </div>
                      </td>
                      <td className="p-2 border-r border-black dark:border-zinc-700 text-center text-slate-700 dark:text-zinc-300">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-2 border-r border-black dark:border-zinc-700 text-right text-slate-600 dark:text-zinc-400">
                        ${Number(item.cost_per_unit).toFixed(4)}
                      </td>
                      <td className="p-2 border-r border-black dark:border-zinc-700 text-right font-black text-black dark:text-[#F5F5F5]">
                        ${item.subtotal.toFixed(2)}
                      </td>
                      <td className="p-2 text-right text-slate-600 dark:text-zinc-400">
                        {pct.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* EXPLICACIÓN DE REGLA DE MARGEN APLICADA */}
        <div className="p-3 bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 text-xs font-mono flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-bold text-black dark:text-[#F5F5F5] block">
              Regla de Ganancia: {marginModeConfig.label}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              {template.margin_type === "fixed" && `Se suman exactamente $${template.margin_value.toFixed(2)} de ganancia neta al costo de $${unitCost.toFixed(2)}.`}
              {template.margin_type === "percentage" && `Se aplica un recargo del ${template.margin_value}% sobre el costo unitario.`}
              {template.margin_type === "target_price" && `Precio de venta en calle fijado en $${template.margin_value.toFixed(2)} USD.`}
            </span>
          </div>
          <span className="font-oswald text-lg font-black text-[#16A34A] dark:text-emerald-400 shrink-0 ml-3">
            +${profit.toFixed(2)} / ud
          </span>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t-2 border-black dark:border-zinc-700">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border-2 border-black dark:border-zinc-700 font-mono text-xs font-bold bg-white dark:bg-[#262626] text-black dark:text-[#F5F5F5] hover:bg-slate-100"
          >
            Cerrar Ficha
          </button>

          {onSimulate && (
            <button
              type="button"
              onClick={() => {
                onSimulate(pricing);
                onClose();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-black dark:border-zinc-700 font-mono text-xs font-black uppercase bg-[#FACC15] text-black shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] hover:bg-[#EAB308] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <Calculator className="h-4 w-4" />
              <span>Simular Producción en Lote</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
