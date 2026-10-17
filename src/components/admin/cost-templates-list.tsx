"use client";

import { useState, useMemo, useTransition } from "react";
import {
  Plus,
  Search,
  Layers,
  Edit2,
  Archive,
  RotateCcw,
  Eye,
  Calculator,
} from "lucide-react";
import { archiveProductCostTemplate } from "@/actions/costs.actions";
import {
  COST_TEMPLATE_CATEGORIES,
  COST_MARGIN_TYPES,
  PROFITABILITY_CONFIG,
} from "@/lib/constants";
import type {
  CalculatedTemplatePricing,
  ProductCostTemplate,
} from "@/types";

interface CostTemplatesListProps {
  templates: CalculatedTemplatePricing[];
  onOpenCreate: () => void;
  onOpenEdit: (template: ProductCostTemplate) => void;
  onOpenDetail: (pricing: CalculatedTemplatePricing) => void;
  onSimulate: (pricing: CalculatedTemplatePricing) => void;
  onRefresh?: () => void;
}

export function CostTemplatesList({
  templates,
  onOpenCreate,
  onOpenEdit,
  onOpenDetail,
  onSimulate,
  onRefresh,
}: CostTemplatesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [selectedProfitability, setSelectedProfitability] = useState("todos");
  const [showArchived, setShowArchived] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Filtrado reactivo en cliente
  const filteredTemplates = useMemo(() => {
    return templates.filter((item) => {
      const isArchived = Boolean(item.template.archived_at);
      if (showArchived) {
        if (!isArchived) return false;
      } else {
        if (isArchived) return false;
      }

      if (selectedCategory !== "todos" && item.template.category !== selectedCategory) {
        return false;
      }

      if (selectedProfitability !== "todos" && item.profitabilityLevel !== selectedProfitability) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = item.template.product_name.toLowerCase().includes(query);
        const matchDesc = item.template.description?.toLowerCase().includes(query) ?? false;
        if (!matchName && !matchDesc) return false;
      }

      return true;
    });
  }, [templates, showArchived, selectedCategory, selectedProfitability, searchQuery]);

  const handleToggleArchive = (item: CalculatedTemplatePricing) => {
    const isArchived = Boolean(item.template.archived_at);
    const action = isArchived ? "restaurar" : "archivar";

    if (!confirm(`¿Estás seguro de que deseas ${action} la receta "${item.template.product_name}"?`)) {
      return;
    }

    startTransition(async () => {
      try {
        await archiveProductCostTemplate(item.template.id, !isArchived);
        onRefresh?.();
      } catch (err) {
        console.error("Error al archivar receta:", err);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* BARRA SUPERIOR DE BÚSQUEDA Y FILTROS */}
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row flex-wrap gap-2.5">
          {/* BUSCADOR */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar receta de producto..."
              className="w-full bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 pl-9 pr-3 py-2 text-xs font-mono text-black dark:text-[#F5F5F5] placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
          </div>

          {/* FILTRO CATEGORÍA */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 px-3 py-2 text-xs font-mono font-bold text-black dark:text-[#F5F5F5] focus:outline-none"
          >
            <option value="todos">Todas las categorías</option>
            {Object.values(COST_TEMPLATE_CATEGORIES).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* FILTRO RENTABILIDAD */}
          <select
            value={selectedProfitability}
            onChange={(e) => setSelectedProfitability(e.target.value)}
            className="bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 px-3 py-2 text-xs font-mono font-bold text-black dark:text-[#F5F5F5] focus:outline-none"
          >
            <option value="todos">Toda rentabilidad</option>
            <option value="high">🟢 Alta (&gt;40%)</option>
            <option value="medium">🟡 Media (20% - 40%)</option>
            <option value="low">🔴 Baja (&lt;20%)</option>
            <option value="loss">⚠️ Pérdida</option>
          </select>

          {/* VER ARCHIVADOS */}
          <label className="flex items-center gap-2 px-3 py-2 bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 text-xs font-mono text-black dark:text-[#F5F5F5] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="accent-black h-3.5 w-3.5"
            />
            <span>Archivadas</span>
          </label>
        </div>

        {/* BOTÓN NUEVA RECETA */}
        <button
          onClick={onOpenCreate}
          className="inline-flex items-center justify-center gap-2 bg-[#FACC15] text-black font-mono text-xs font-black uppercase px-4 py-2.5 border-2 border-black dark:border-zinc-700 shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] hover:bg-[#EAB308] transition-all hover:translate-x-0.5 hover:translate-y-0.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>+ Nueva Receta</span>
        </button>
      </div>

      {/* CUADRÍCULA DE TARJETAS DE RECETAS */}
      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="h-5 w-36 bg-slate-200 dark:bg-zinc-700" />
                  <div className="h-3 w-24 bg-slate-200 dark:bg-zinc-700" />
                </div>
                <div className="h-5 w-16 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-2.5 bg-slate-100 dark:bg-zinc-800 border-2 border-black dark:border-zinc-700">
                <div className="h-8 bg-slate-200 dark:bg-zinc-700" />
                <div className="h-8 bg-slate-200 dark:bg-zinc-700" />
                <div className="h-8 bg-slate-200 dark:bg-zinc-700" />
              </div>
              <div className="h-8 w-full bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
            </div>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-10 text-center space-y-3 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000]">
          <Layers className="h-10 w-10 text-slate-400 dark:text-zinc-500 mx-auto" />
          <h4 className="font-oswald text-lg font-black uppercase text-black dark:text-[#F5F5F5]">
            {templates.length === 0
              ? "Aún no hay recetas registradas"
              : "No se encontraron recetas con los filtros aplicados"}
          </h4>
          <p className="font-mono text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
            {templates.length === 0
              ? "Crea tu primera fórmula de producto combinando los insumos base para calcular costos y precios de venta exactos."
              : "Intenta cambiar los filtros de categoría o búsqueda para ver otras recetas."}
          </p>
          {templates.length === 0 && (
            <button
              onClick={onOpenCreate}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#FACC15] text-black font-mono text-xs font-black uppercase border-2 border-black shadow-[3px_3px_0px_#0A0A0A] hover:bg-[#EAB308]"
            >
              <Plus className="h-4 w-4" />
              <span>Crear mi primera receta</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((item) => {
            const { template, unitCost, salePrice, profit, marginPercentage, profitabilityLevel } = item;
            const catConfig = COST_TEMPLATE_CATEGORIES[template.category] || COST_TEMPLATE_CATEGORIES.otro;
            const profConfig = PROFITABILITY_CONFIG[profitabilityLevel];
            const marginConfig = COST_MARGIN_TYPES[template.margin_type];
            const isArchived = Boolean(template.archived_at);

            return (
              <div
                key={template.id}
                className={`bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] flex flex-col justify-between gap-4 transition-all hover:-translate-y-0.5 ${
                  isArchived ? "opacity-60 bg-slate-50 dark:bg-zinc-900/60" : ""
                }`}
              >
                {/* CABECERA DE LA TARJETA */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 border border-black dark:border-zinc-700 bg-[#F8F5EE] dark:bg-[#262626] text-black dark:text-[#F5F5F5]">
                      {catConfig.label}
                    </span>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 border border-black ${profConfig.badgeBg} ${profConfig.badgeText}`}
                    >
                      {profConfig.icon} {marginPercentage > 0 ? `+${marginPercentage}%` : `${marginPercentage}%`}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-oswald text-lg font-black uppercase text-black dark:text-[#F5F5F5] line-clamp-1" title={template.product_name}>
                      {template.product_name}
                    </h3>
                    {template.description && (
                      <p className="font-mono text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1">
                        {template.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* BLOQUE DE PRECIOS Y COSTOS */}
                <div className="grid grid-cols-3 gap-1.5 p-2.5 bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 font-mono text-center">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-500 dark:text-zinc-400">
                      Costo Fab.
                    </span>
                    <span className="font-oswald text-sm font-black text-black dark:text-[#F5F5F5]">
                      ${unitCost.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-500 dark:text-zinc-400">
                      P. Venta
                    </span>
                    <span className="font-oswald text-sm font-black text-[#2563EB] dark:text-blue-400">
                      ${salePrice.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-500 dark:text-zinc-400">
                      Ganancia
                    </span>
                    <span
                      className={`font-oswald text-sm font-black ${
                        profit < 0 ? "text-red-600" : "text-[#16A34A] dark:text-emerald-400"
                      }`}
                    >
                      +${profit.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* RESUMEN DE COMPONENTES */}
                <div className="space-y-1">
                  <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-zinc-400 block">
                    Insumos ({item.hydratedComponents.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.hydratedComponents.slice(0, 3).map((comp, idx) => (
                      <span
                        key={idx}
                        className="font-mono text-[10px] bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 border border-black/40 dark:border-zinc-700 text-slate-700 dark:text-zinc-300"
                      >
                        {comp.component_name} ({comp.quantity} {comp.unit})
                      </span>
                    ))}
                    {item.hydratedComponents.length > 3 && (
                      <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400 self-center">
                        +{item.hydratedComponents.length - 3} más
                      </span>
                    )}
                  </div>
                </div>

                {/* MODO DE MARGEN CONFIGURADO */}
                <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 border-t border-black/10 dark:border-zinc-800 pt-1">
                  Regla: <strong className="text-black dark:text-[#F5F5F5]">{marginConfig.label}</strong> ({template.margin_value})
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex items-center justify-between gap-1.5 pt-2 border-t-2 border-black dark:border-zinc-700">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenDetail(item)}
                      title="Ver ficha técnica completa"
                      className="inline-flex items-center gap-1 font-mono text-[11px] font-bold bg-[#F8F5EE] dark:bg-[#262626] border border-black dark:border-zinc-700 px-2 py-1 shadow-[1px_1px_0px_#0A0A0A] dark:shadow-[1px_1px_0px_#000000] hover:bg-slate-100 dark:hover:bg-zinc-700 text-black dark:text-[#F5F5F5]"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Ficha</span>
                    </button>
                    <button
                      onClick={() => onSimulate(item)}
                      title="Simular corrida de producción"
                      className="inline-flex items-center gap-1 font-mono text-[11px] font-bold bg-[#FACC15] text-black border border-black dark:border-zinc-700 px-2 py-1 shadow-[1px_1px_0px_#0A0A0A] dark:shadow-[1px_1px_0px_#000000] hover:bg-[#EAB308]"
                    >
                      <Calculator className="h-3 w-3" />
                      <span>Simular</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEdit(template)}
                      title="Editar receta"
                      disabled={isPending}
                      className="p-1 bg-white dark:bg-[#262626] border border-black dark:border-zinc-700 shadow-[1px_1px_0px_#0A0A0A] hover:bg-slate-100 dark:hover:bg-zinc-700 text-black dark:text-[#F5F5F5]"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(item)}
                      title={isArchived ? "Restaurar receta" : "Archivar receta"}
                      disabled={isPending}
                      className={`p-1 border border-black dark:border-zinc-700 shadow-[1px_1px_0px_#0A0A0A] ${
                        isArchived
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                      }`}
                    >
                      {isArchived ? (
                        <RotateCcw className="h-3.5 w-3.5" />
                      ) : (
                        <Archive className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
