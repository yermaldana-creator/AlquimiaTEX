"use client";

import { useState, useMemo } from "react";
import {
  Calculator,
  Package,
  Layers,
  CheckCircle2,
} from "lucide-react";
import {
  COST_COMPONENT_CATEGORIES,
  PROFITABILITY_CONFIG,
} from "@/lib/constants";
import type { CalculatedTemplatePricing, CostSimulationResult } from "@/types";

interface PriceCalculatorProps {
  templates: CalculatedTemplatePricing[];
  selectedTemplateId?: string | null;
}

export function PriceCalculator({
  templates,
  selectedTemplateId,
}: PriceCalculatorProps) {
  // Estado para la receta seleccionada
  const [activeId, setActiveId] = useState<string>(() => {
    if (selectedTemplateId) return selectedTemplateId;
    return templates[0]?.template.id || "";
  });

  // Cantidad de prendas a simular (por defecto 1 docena = 12)
  const [quantity, setQuantity] = useState<number>(12);

  // Receta actualmente seleccionada
  const currentPricing = useMemo(() => {
    return templates.find((t) => t.template.id === activeId) || templates[0] || null;
  }, [templates, activeId]);

  // Cálculo de la simulación de volumen
  const simulation: CostSimulationResult | null = useMemo(() => {
    if (!currentPricing) return null;
    const qty = Math.max(1, Math.round(quantity));
    const totalCost = Number((currentPricing.unitCost * qty).toFixed(2));
    const totalRevenue = Number((currentPricing.salePrice * qty).toFixed(2));
    const totalProfit = Number((totalRevenue - totalCost).toFixed(2));

    const requiredComponents = currentPricing.hydratedComponents.map((item) => {
      const totalItemQty = Number((item.quantity * qty).toFixed(2));
      const totalItemCost = Number((totalItemQty * item.cost_per_unit).toFixed(2));
      return {
        component_id: item.component_id,
        name: item.component_name,
        category: item.component_category,
        totalQuantity: totalItemQty,
        unit: item.unit,
        unitCost: item.cost_per_unit,
        totalCost: totalItemCost,
      };
    });

    return {
      templateId: currentPricing.template.id,
      productName: currentPricing.template.product_name,
      quantity: qty,
      unitCost: currentPricing.unitCost,
      unitSalePrice: currentPricing.salePrice,
      unitProfit: currentPricing.profit,
      totalCost,
      totalRevenue,
      totalProfit,
      marginPercentage: currentPricing.marginPercentage,
      requiredComponents,
    };
  }, [currentPricing, quantity]);

  if (templates.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-8 text-center space-y-3 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000]">
        <Layers className="h-8 w-8 text-slate-400 dark:text-zinc-500 mx-auto" />
        <h4 className="font-oswald text-lg font-black uppercase text-black dark:text-[#F5F5F5]">
          Aún no hay recetas creadas
        </h4>
        <p className="font-mono text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
          Para usar la calculadora y simular pedidos por volumen, primero crea una receta en la pestaña &quot;Recetas de Productos&quot;.
        </p>
      </div>
    );
  }

  const profConfig = currentPricing
    ? PROFITABILITY_CONFIG[currentPricing.profitabilityLevel]
    : PROFITABILITY_CONFIG.medium;

  const PRESET_QUANTITIES = [
    { label: "1 ud (Muestra)", value: 1 },
    { label: "6 uds (Media Docena)", value: 6 },
    { label: "12 uds (1 Docena)", value: 12 },
    { label: "24 uds (2 Docenas)", value: 24 },
    { label: "50 uds (Campaña)", value: 50 },
    { label: "100 uds (Corporativo)", value: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* TARJETA PRINCIPAL DE CONFIGURACIÓN */}
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-5 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-black dark:border-zinc-700 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[#FACC15]" />
              <h3 className="font-oswald text-xl font-black uppercase text-black dark:text-[#F5F5F5]">
                Simulador de Pedidos por Volumen
              </h3>
            </div>
            <p className="font-mono text-xs text-slate-600 dark:text-zinc-400">
              Cotiza corridas completas de producción y calcula la inversión exacta en materiales y ganancia neta.
            </p>
          </div>

          {/* SELECTOR DE RECETA */}
          <div className="w-full md:w-80 space-y-1">
            <label className="block font-mono text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400">
              Seleccionar Producto / Receta:
            </label>
            <select
              value={activeId}
              onChange={(e) => setActiveId(e.target.value)}
              className="w-full bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-2 font-mono text-xs font-black text-black dark:text-[#F5F5F5] focus:outline-none"
            >
              {templates.map((t) => (
                <option key={t.template.id} value={t.template.id}>
                  {t.template.product_name} (${t.salePrice.toFixed(2)} USD)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SELECTOR DE CANTIDAD */}
        <div className="space-y-2">
          <label className="block font-mono text-xs font-bold uppercase text-black dark:text-[#F5F5F5]">
            Cantidad de Piezas a Producir:
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_QUANTITIES.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setQuantity(preset.value)}
                className={`font-mono text-xs font-bold px-3 py-1.5 border-2 border-black dark:border-zinc-700 transition-all ${
                  quantity === preset.value
                    ? "bg-[#FACC15] text-black shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                    : "bg-[#F8F5EE] dark:bg-[#262626] text-black dark:text-[#F5F5F5] hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                {preset.label}
              </button>
            ))}

            <div className="flex items-center gap-1.5 ml-auto">
              <span className="font-mono text-xs text-slate-500 dark:text-zinc-400">Otra cantidad:</span>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-1.5 font-mono text-sm font-black text-black dark:text-[#F5F5F5] text-right focus:outline-none"
              />
              <span className="font-mono text-xs text-slate-600 dark:text-zinc-400">uds</span>
            </div>
          </div>
        </div>
      </div>

      {/* RESULTADOS DE LA SIMULACIÓN */}
      {simulation && (
        <div className="space-y-6">
          {/* 4 GRANDES CARDS MÉTRICAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. INVERSIÓN TOTAL */}
            <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
              <span className="font-mono text-[11px] font-bold uppercase text-slate-500 dark:text-zinc-400">
                Inversión en Insumos
              </span>
              <div className="my-1">
                <span className="font-oswald text-3xl font-black text-black dark:text-[#F5F5F5]">
                  ${simulation.totalCost.toFixed(2)}
                </span>
                <span className="font-mono text-xs text-slate-500 ml-1">USD</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                ${simulation.unitCost.toFixed(2)} / prenda × {simulation.quantity} uds
              </span>
            </div>

            {/* 2. FACTURACIÓN BRUTA */}
            <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
              <span className="font-mono text-[11px] font-bold uppercase text-slate-500 dark:text-zinc-400">
                Facturación al Cliente
              </span>
              <div className="my-1">
                <span className="font-oswald text-3xl font-black text-[#2563EB] dark:text-blue-400">
                  ${simulation.totalRevenue.toFixed(2)}
                </span>
                <span className="font-mono text-xs text-slate-500 ml-1">USD</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                ${simulation.unitSalePrice.toFixed(2)} / prenda sugerido
              </span>
            </div>

            {/* 3. GANANCIA NETA */}
            <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
              <span className="font-mono text-[11px] font-bold uppercase text-slate-500 dark:text-zinc-400">
                Ganancia Neta del Taller
              </span>
              <div className="my-1">
                <span
                  className={`font-oswald text-3xl font-black ${
                    simulation.totalProfit < 0
                      ? "text-red-600"
                      : "text-[#16A34A] dark:text-emerald-400"
                  }`}
                >
                  +${simulation.totalProfit.toFixed(2)}
                </span>
                <span className="font-mono text-xs text-slate-500 ml-1">USD</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                +${simulation.unitProfit.toFixed(2)} limpios por unidad
              </span>
            </div>

            {/* 4. RENTABILIDAD & BADGE */}
            <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
              <span className="font-mono text-[11px] font-bold uppercase text-slate-500 dark:text-zinc-400">
                Margen de Retorno
              </span>
              <div className="my-1">
                <span className="font-oswald text-3xl font-black text-[#7E22CE] dark:text-purple-400">
                  +{simulation.marginPercentage}%
                </span>
              </div>
              <div>
                <span
                  className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 border border-black ${profConfig.badgeBg} ${profConfig.badgeText}`}
                >
                  {profConfig.icon} {profConfig.label}
                </span>
              </div>
            </div>
          </div>

          {/* LISTA DE MATERIALES NECESARIOS PARA EL LOTE */}
          <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-5 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black dark:border-zinc-700 pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#2563EB] dark:text-blue-400" />
                <h4 className="font-oswald text-base font-black uppercase tracking-wider text-black dark:text-[#F5F5F5]">
                  Lista de Insumos Necesarios para {simulation.quantity} Unidades
                </h4>
              </div>
              <span className="font-mono text-xs text-slate-500 dark:text-zinc-400">
                Inversión total: <strong>${simulation.totalCost.toFixed(2)} USD</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="bg-[#F8F5EE] dark:bg-[#262626] border-b-2 border-black dark:border-zinc-700 uppercase font-bold text-black dark:text-[#F5F5F5]">
                    <th className="p-3 border-r border-black dark:border-zinc-700">Material / Insumo</th>
                    <th className="p-3 border-r border-black dark:border-zinc-700">Categoría</th>
                    <th className="p-3 border-r border-black dark:border-zinc-700 text-right">Cantidad Requerida</th>
                    <th className="p-3 border-r border-black dark:border-zinc-700 text-right">Costo Unitario ($)</th>
                    <th className="p-3 text-right">Costo en el Lote ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black dark:divide-zinc-700">
                  {simulation.requiredComponents.map((item, idx) => {
                    const catConfig = COST_COMPONENT_CATEGORIES[item.category] || COST_COMPONENT_CATEGORIES.otro;

                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                        <td className="p-3 border-r border-black dark:border-zinc-700 font-bold text-black dark:text-[#F5F5F5]">
                          {item.name}
                        </td>
                        <td className="p-3 border-r border-black dark:border-zinc-700">
                          <span
                            className={`inline-block font-mono text-[9px] font-bold px-1.5 py-0.5 border border-black ${catConfig.bg} ${catConfig.text}`}
                          >
                            {catConfig.shortLabel}
                          </span>
                        </td>
                        <td className="p-3 border-r border-black dark:border-zinc-700 text-right font-black text-black dark:text-[#F5F5F5]">
                          {item.totalQuantity} {item.unit}
                        </td>
                        <td className="p-3 border-r border-black dark:border-zinc-700 text-right text-slate-600 dark:text-zinc-400">
                          ${Number(item.unitCost).toFixed(4)}
                        </td>
                        <td className="p-3 text-right font-black text-black dark:text-[#F5F5F5]">
                          ${item.totalCost.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* TIP COLOQUIAL VENEZOLANO */}
            <div className="p-3 bg-[#DCFCE7] dark:bg-emerald-950/40 border border-black dark:border-zinc-700 text-[#166534] dark:text-emerald-300 font-mono text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                💡 <strong>Dato del taller:</strong> Para un pedido de {simulation.quantity} unidades, necesitas tener listos exactamente <strong>${simulation.totalCost.toFixed(2)}</strong> de capital para compra de materiales. Al cobrar, te quedan <strong>${simulation.totalProfit.toFixed(2)}</strong> de ganancia pura.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
