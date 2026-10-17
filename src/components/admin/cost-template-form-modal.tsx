"use client";

import { useState, useMemo, useTransition } from "react";
import {
  X,
  Plus,
  Trash2,
  Layers,
  Loader2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import {
  createProductCostTemplate,
  updateProductCostTemplate,
} from "@/actions/costs.actions";
import {
  roundTo,
  calculateLiveUnitCost,
  calculateLivePricing,
} from "@/lib/cost-calculator";
import {
  COST_TEMPLATE_CATEGORIES,
  COST_MARGIN_TYPES,
  COST_COMPONENT_CATEGORIES,
  PROFITABILITY_CONFIG,
} from "@/lib/constants";
import type {
  CostComponent,
  CostMarginType,
  CostTemplateCategory,
  CostTemplateItem,
  ProductCostTemplate,
  ProductCostTemplateFormData,
} from "@/types";

interface CostTemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  allComponents: CostComponent[];
  initialTemplate?: ProductCostTemplate | null;
}

export function CostTemplateFormModal({
  isOpen,
  onClose,
  onSuccess,
  allComponents,
  initialTemplate,
}: CostTemplateFormModalProps) {
  const [productName, setProductName] = useState<string>(
    initialTemplate?.product_name || ""
  );
  const [category, setCategory] = useState<CostTemplateCategory>(
    initialTemplate?.category || "camisa"
  );
  const [description, setDescription] = useState<string>(
    initialTemplate?.description || ""
  );
  const [marginType, setMarginType] = useState<CostMarginType>(
    initialTemplate?.margin_type || "fixed"
  );
  const [marginValue, setMarginValue] = useState<number>(
    initialTemplate?.margin_value ?? (initialTemplate?.margin_type === "percentage" ? 35 : 1.76)
  );
  const [componentsList, setComponentsList] = useState<CostTemplateItem[]>(
    initialTemplate?.components && initialTemplate.components.length > 0
      ? initialTemplate.components
      : []
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Mapa rápido de componentes para búsqueda y cálculo
  const componentsMap = useMemo(() => {
    const map = new Map<string, CostComponent>();
    for (const comp of allComponents) {
      map.set(comp.id, comp);
    }
    return map;
  }, [allComponents]);

  // Cálculo en vivo del costo de fabricación unitario
  const { unitCost } = useMemo(() => {
    return calculateLiveUnitCost(componentsList, componentsMap);
  }, [componentsList, componentsMap]);

  // Cálculo en vivo del precio de venta y rentabilidad según el modo de margen seleccionado
  const livePricing = useMemo(() => {
    return calculateLivePricing(unitCost, marginType, marginValue);
  }, [unitCost, marginType, marginValue]);

  // Agregar fila de ingrediente a la receta
  const handleAddComponentRow = () => {
    // Escoger el primer componente disponible que no esté ya o el primero
    const available = allComponents.find(
      (c) => !componentsList.some((item) => item.component_id === c.id)
    ) || allComponents[0];

    if (!available) {
      setErrorMsg("No hay insumos base disponibles. Crea algunos primero en la pestaña Insumos.");
      return;
    }

    setComponentsList((prev) => [
      ...prev,
      {
        component_id: available.id,
        quantity: 1,
        unit: available.unit,
      },
    ]);
  };

  const handleUpdateItem = (
    index: number,
    field: "component_id" | "quantity",
    value: string | number
  ) => {
    setComponentsList((prev) => {
      const copy = [...prev];
      if (field === "component_id") {
        const comp = componentsMap.get(String(value));
        copy[index] = {
          ...copy[index],
          component_id: String(value),
          unit: comp?.unit || "unidad",
        };
      } else {
        copy[index] = {
          ...copy[index],
          quantity: Math.max(0, Number(value) || 0),
        };
      }
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setComponentsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setErrorMsg("El nombre de la receta / producto es obligatorio.");
      return;
    }

    if (componentsList.length === 0) {
      setErrorMsg("Debes agregar al menos un insumo a la receta.");
      return;
    }

    setErrorMsg(null);

    const payload: ProductCostTemplateFormData = {
      product_name: productName.trim(),
      category,
      description: description.trim() || null,
      margin_type: marginType,
      margin_value: Number(marginValue) || 0,
      target_price: marginType === "target_price" ? Number(marginValue) : null,
      components: componentsList,
      is_active: true,
    };

    startTransition(async () => {
      try {
        if (initialTemplate) {
          const res = await updateProductCostTemplate(initialTemplate.id, payload);
          if (!res.success) {
            setErrorMsg(res.error || "Error al actualizar la receta.");
            return;
          }
        } else {
          const res = await createProductCostTemplate(payload);
          if (!res.success) {
            setErrorMsg(res.error || "Error al crear la receta.");
            return;
          }
        }

        onSuccess();
        onClose();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error inesperado.";
        setErrorMsg(message);
      }
    });
  };

  if (!isOpen) return null;

  const profConfig = PROFITABILITY_CONFIG[livePricing.profitabilityLevel];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[8px_8px_0px_#0A0A0A] dark:shadow-[8px_8px_0px_#000000] w-full max-w-3xl my-6 p-6 space-y-5 animate-in fade-in-50 zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* ENCABEZADO */}
        <div className="flex items-center justify-between border-b-2 border-black dark:border-zinc-700 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#7E22CE] dark:text-purple-400" />
            <h3 className="font-oswald text-xl font-black uppercase text-black dark:text-[#F5F5F5]">
              {initialTemplate ? "Editar Receta de Costos" : "Nueva Receta de Producto"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-black dark:text-white hover:opacity-75 p-1 border border-black dark:border-zinc-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#FEE2E2] dark:bg-red-950/60 border-2 border-black dark:border-zinc-700 text-[#991B1B] dark:text-red-300 font-mono text-xs font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* DATOS GENERALES */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="block font-mono text-xs font-bold uppercase text-black dark:text-[#F5F5F5]">
                Nombre del Producto / Receta *
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ej: Franela Microdurazno Sublimada, Franela DTF Algodón, Taza 11oz..."
                className="w-full bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-2.5 text-xs font-mono font-bold text-black dark:text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-mono text-xs font-bold uppercase text-black dark:text-[#F5F5F5]">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CostTemplateCategory)}
                className="w-full bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-2.5 text-xs font-mono font-bold text-black dark:text-[#F5F5F5] focus:outline-none"
              >
                {Object.values(COST_TEMPLATE_CATEGORIES).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-mono text-xs font-bold uppercase text-black dark:text-[#F5F5F5]">
              Descripción / Notas de Fabricación (Opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Estampado frente y espalda en taller AlquimiaTex, incluye bolsa"
              className="w-full bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-2 text-xs font-mono text-black dark:text-[#F5F5F5] focus:outline-none"
            />
          </div>

          {/* CONSTRUCTOR DE INGREDIENTES / COMPONENTES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black dark:border-zinc-700 pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#FACC15]" />
                <h4 className="font-oswald text-sm font-black uppercase tracking-wider text-black dark:text-[#F5F5F5]">
                  Fórmula de Componentes e Insumos
                </h4>
              </div>
              <button
                type="button"
                onClick={handleAddComponentRow}
                disabled={allComponents.length === 0}
                className="inline-flex items-center gap-1.5 bg-[#FACC15] text-black font-mono text-xs font-bold px-3 py-1 border border-black dark:border-zinc-700 shadow-[2px_2px_0px_#0A0A0A] hover:bg-[#EAB308] transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Agregar Insumo</span>
              </button>
            </div>

            {allComponents.length === 0 ? (
              <div className="p-4 bg-[#FEF9C3] dark:bg-yellow-950/40 border border-black dark:border-zinc-700 font-mono text-xs text-black dark:text-[#F5F5F5]">
                ⚠️ Aún no tienes componentes base registrados. Primero registra telas, tintas y empaques en la pestaña &quot;Insumos y Costos Base&quot;.
              </div>
            ) : componentsList.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-black/30 dark:border-zinc-700 space-y-2">
                <p className="font-mono text-xs text-slate-500 dark:text-zinc-400">
                  Esta receta aún no tiene ingredientes agregados.
                </p>
                <button
                  type="button"
                  onClick={handleAddComponentRow}
                  className="font-mono text-xs font-bold underline text-black dark:text-[#F5F5F5]"
                >
                  Haz clic aquí para agregar el primer insumo (ej: Prenda base)
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {componentsList.map((item, index) => {
                  const comp = componentsMap.get(item.component_id);
                  const subtotal = roundTo((item.quantity || 0) * (comp?.cost_per_unit || 0), 2);
                  const catConfig = comp
                    ? COST_COMPONENT_CATEGORIES[comp.category]
                    : COST_COMPONENT_CATEGORIES.otro;

                  return (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000]"
                    >
                      {/* SELECTOR DE INSUMO */}
                      <div className="flex-1">
                        <select
                          value={item.component_id}
                          onChange={(e) =>
                            handleUpdateItem(index, "component_id", e.target.value)
                          }
                          className="w-full bg-white dark:bg-[#1E1E1E] border border-black dark:border-zinc-700 p-1.5 text-xs font-mono font-bold text-black dark:text-[#F5F5F5] focus:outline-none"
                        >
                          {allComponents.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} (${Number(c.cost_per_unit).toFixed(4)} / {c.unit})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* BADGE CATEGORÍA */}
                      {catConfig && (
                        <span
                          className={`hidden md:inline-block font-mono text-[9px] font-bold px-1.5 py-0.5 border border-black shrink-0 ${catConfig.bg} ${catConfig.text}`}
                        >
                          {catConfig.shortLabel}
                        </span>
                      )}

                      {/* CANTIDAD Y UNIDAD */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={item.quantity || ""}
                          onChange={(e) =>
                            handleUpdateItem(index, "quantity", e.target.value)
                          }
                          className="w-20 bg-white dark:bg-[#1E1E1E] border border-black dark:border-zinc-700 p-1.5 text-xs font-mono font-bold text-black dark:text-[#F5F5F5] text-right focus:outline-none"
                        />
                        <span className="font-mono text-xs text-slate-600 dark:text-zinc-400 w-12 truncate">
                          {item.unit || comp?.unit || "ud"}
                        </span>
                      </div>

                      {/* SUBTOTAL CALCULADO */}
                      <div className="w-24 text-right font-mono font-bold text-xs text-black dark:text-[#F5F5F5] shrink-0">
                        ${subtotal.toFixed(2)}
                      </div>

                      {/* ELIMINAR FILA */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-950 dark:hover:bg-red-900 border border-black dark:border-zinc-700 text-red-700 dark:text-red-300 transition-colors shrink-0"
                        title="Eliminar insumo de la receta"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}

                {/* FILA DE TOTAL DE COSTO DE FABRICACIÓN */}
                <div className="flex items-center justify-between p-3 bg-black dark:bg-zinc-800 text-white border-2 border-black dark:border-zinc-700 font-mono text-xs">
                  <span className="uppercase font-bold tracking-wider text-slate-300">
                    Costo Total de Fabricación Unitario (C):
                  </span>
                  <span className="font-oswald text-lg font-black text-[#FACC15]">
                    ${unitCost.toFixed(2)} USD
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* SELECTOR DE MODO DE MARGEN Y CÁLCULO DE PRECIO DE VENTA */}
          <div className="space-y-4 pt-2 border-t-2 border-black dark:border-zinc-700">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#16A34A] dark:text-emerald-400" />
              <h4 className="font-oswald text-sm font-black uppercase tracking-wider text-black dark:text-[#F5F5F5]">
                Configuración de Margen y Precio de Venta
              </h4>
            </div>

            {/* SELECTOR DE LOS 3 MODOS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {Object.values(COST_MARGIN_TYPES).map((mode) => {
                const isSelected = marginType === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setMarginType(mode.id as CostMarginType);
                      // Ajustar valor sugerido inicial si cambia el modo
                      if (mode.id === "fixed" && marginValue > 15) setMarginValue(1.76);
                      if (mode.id === "percentage" && marginValue < 10) setMarginValue(35);
                      if (mode.id === "target_price" && marginValue < unitCost) {
                        setMarginValue(roundTo(unitCost * 1.35, 2));
                      }
                    }}
                    className={`p-3 text-left border-2 border-black dark:border-zinc-700 transition-all font-mono text-xs flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? "bg-[#FACC15] text-black shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] -translate-y-0.5"
                        : "bg-white dark:bg-[#262626] text-black dark:text-[#F5F5F5] hover:bg-slate-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span className="font-bold">{mode.label}</span>
                    <span className="text-[10px] opacity-80 leading-tight">
                      {mode.description}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* INPUT DEL VALOR DEL MARGEN */}
            <div className="p-4 bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="font-mono text-xs font-bold uppercase text-black dark:text-[#F5F5F5]">
                  {marginType === "fixed" && "Ganancia Fija Deseada por Prenda ($ USD)"}
                  {marginType === "percentage" && "Porcentaje de Recargo sobre Costo (% Mark-up)"}
                  {marginType === "target_price" && "Precio de Venta Sugerido al Público ($ USD)"}
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-slate-500">
                      {COST_MARGIN_TYPES[marginType].symbol}
                    </span>
                    <input
                      type="number"
                      step={marginType === "percentage" ? "1" : "0.01"}
                      min="0"
                      value={marginValue || ""}
                      onChange={(e) => setMarginValue(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 pl-6 pr-2 py-1.5 font-mono text-sm font-black text-black dark:text-[#F5F5F5] text-right focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* TARJETA DE RESULTADO Y RENTABILIDAD EN VIVO */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-black/20 dark:border-zinc-700">
                <div className="bg-white dark:bg-[#1E1E1E] p-2 border border-black dark:border-zinc-700">
                  <span className="block font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                    Costo Fabricación
                  </span>
                  <span className="font-mono text-sm font-black text-black dark:text-[#F5F5F5]">
                    ${livePricing.salePrice > 0 ? unitCost.toFixed(2) : "0.00"}
                  </span>
                </div>

                <div className="bg-white dark:bg-[#1E1E1E] p-2 border border-black dark:border-zinc-700">
                  <span className="block font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                    Ganancia Neta
                  </span>
                  <span
                    className={`font-mono text-sm font-black ${
                      livePricing.profit < 0 ? "text-red-600" : "text-[#16A34A] dark:text-emerald-400"
                    }`}
                  >
                    ${livePricing.profit.toFixed(2)}
                  </span>
                </div>

                <div className="bg-white dark:bg-[#1E1E1E] p-2 border border-black dark:border-zinc-700">
                  <span className="block font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                    Precio Sugerido
                  </span>
                  <span className="font-mono text-sm font-black text-[#2563EB] dark:text-blue-400">
                    ${livePricing.salePrice.toFixed(2)}
                  </span>
                </div>

                <div className="bg-white dark:bg-[#1E1E1E] p-2 border border-black dark:border-zinc-700 flex flex-col justify-between">
                  <span className="block font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                    Rentabilidad
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-block font-mono text-[10px] font-bold px-1.5 py-0.5 border border-black ${profConfig.badgeBg} ${profConfig.badgeText}`}
                    >
                      {profConfig.icon} {livePricing.marginPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black dark:border-zinc-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 border-2 border-black dark:border-zinc-700 font-mono text-xs font-bold bg-white dark:bg-[#262626] text-black dark:text-[#F5F5F5] hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || componentsList.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-black dark:border-zinc-700 font-mono text-xs font-black uppercase bg-[#FACC15] text-black shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] hover:bg-[#EAB308] disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{initialTemplate ? "Guardar Cambios" : "Guardar Receta"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
