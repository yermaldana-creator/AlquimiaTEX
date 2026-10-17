"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Plus,
  Search,
  Edit2,
  Archive,
  RotateCcw,
  Sparkles,
  Loader2,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  createCostComponent,
  updateCostComponent,
  archiveCostComponent,
} from "@/actions/costs.actions";
import {
  COST_COMPONENT_CATEGORIES,
  COST_COMMON_UNITS,
} from "@/lib/constants";
import type {
  CostComponent,
  CostComponentCategory,
  CostComponentFormData,
} from "@/types";

interface CostComponentsManagerProps {
  initialComponents: CostComponent[];
  onRefresh?: () => void;
}

export function CostComponentsManager({
  initialComponents,
  onRefresh,
}: CostComponentsManagerProps) {
  const [components, setComponents] = useState<CostComponent[]>(initialComponents);
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Estados para modal de crear / editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<CostComponent | null>(null);
  const [formData, setFormData] = useState<CostComponentFormData>({
    name: "",
    category: "prenda_base",
    unit: "unidad",
    cost_per_unit: 0,
    notes: "",
  });

  // Estados de feedback y pending
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filtrado reactivo en cliente para respuesta instantánea
  const filteredComponents = useMemo(() => {
    return components.filter((item) => {
      // Filtro de archivado
      if (showArchived) {
        if (!item.archived_at) return false;
      } else {
        if (item.archived_at) return false;
      }

      // Filtro por categoría
      if (selectedCategory !== "todos" && item.category !== selectedCategory) {
        return false;
      }

      // Búsqueda por texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchNotes = item.notes?.toLowerCase().includes(query) ?? false;
        if (!matchName && !matchNotes) return false;
      }

      return true;
    });
  }, [components, showArchived, selectedCategory, searchQuery]);

  const openCreateModal = () => {
    setEditingComponent(null);
    setFormData({
      name: "",
      category: "prenda_base",
      unit: "unidad",
      cost_per_unit: 0,
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (comp: CostComponent) => {
    setEditingComponent(comp);
    setFormData({
      name: comp.name,
      category: comp.category,
      unit: comp.unit,
      cost_per_unit: comp.cost_per_unit,
      notes: comp.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFeedback({ type: "error", text: "Por favor escribe el nombre del insumo." });
      return;
    }

    startTransition(async () => {
      try {
        if (editingComponent) {
          const res = await updateCostComponent(editingComponent.id, formData);
          if (!res.success) {
            setFeedback({ type: "error", text: res.error || "Error al actualizar." });
            return;
          }
          setComponents((prev) =>
            prev.map((c) =>
              c.id === editingComponent.id
                ? {
                    ...c,
                    ...formData,
                    cost_per_unit: Number(formData.cost_per_unit),
                    updated_at: new Date().toISOString(),
                  }
                : c
            )
          );
          setFeedback({ type: "success", text: `Insumo "${formData.name}" actualizado.` });
        } else {
          const res = await createCostComponent(formData);
          if (!res.success || !res.component) {
            setFeedback({ type: "error", text: res.error || "Error al crear insumo." });
            return;
          }
          setComponents((prev) => [res.component!, ...prev]);
          setFeedback({ type: "success", text: `Insumo "${formData.name}" creado con éxito.` });
        }

        setIsModalOpen(false);
        onRefresh?.();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error inesperado.";
        setFeedback({ type: "error", text: message });
      }
    });
  };

  const handleToggleArchive = (comp: CostComponent) => {
    const isArchived = Boolean(comp.archived_at);
    const actionText = isArchived ? "restaurar" : "archivar";

    if (!confirm(`¿Estás seguro de que deseas ${actionText} el insumo "${comp.name}"?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await archiveCostComponent(comp.id, !isArchived);
        if (!res.success) {
          setFeedback({ type: "error", text: res.error || `Error al ${actionText}.` });
          return;
        }

        setComponents((prev) =>
          prev.map((c) =>
            c.id === comp.id
              ? {
                  ...c,
                  archived_at: isArchived ? null : new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }
              : c
          )
        );

        setFeedback({
          type: "success",
          text: `Insumo "${comp.name}" ${isArchived ? "restaurado" : "archivado"}.`,
        });
        onRefresh?.();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error inesperado.";
        setFeedback({ type: "error", text: message });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* ALERTA DE FEEDBACK */}
      {feedback && (
        <div
          className={`p-3.5 border-2 border-black dark:border-zinc-700 shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] flex items-center justify-between text-xs font-mono font-bold ${
            feedback.type === "success"
              ? "bg-[#DCFCE7] dark:bg-emerald-950/60 text-[#166534] dark:text-emerald-300"
              : "bg-[#FEE2E2] dark:bg-red-950/60 text-[#991B1B] dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-black dark:text-white hover:opacity-75"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* BARRA SUPERIOR: BÚSQUEDA, FILTRO DE CATEGORÍA Y NUEVO INSUMO */}
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5">
          {/* BUSCADOR */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar insumo (ej: Tinta, DTF, Microdurazno, Papel)..."
              className="w-full bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 pl-9 pr-3 py-2 text-xs font-mono text-black dark:text-[#F5F5F5] placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
          </div>

          {/* FILTRO DE CATEGORÍA */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 px-3 py-2 text-xs font-mono font-bold text-black dark:text-[#F5F5F5] focus:outline-none"
          >
            <option value="todos">Todas las categorías</option>
            {Object.values(COST_COMPONENT_CATEGORIES).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* CHECKBOX ARCHIVADOS */}
          <label className="flex items-center gap-2 px-3 py-2 bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 text-xs font-mono text-black dark:text-[#F5F5F5] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="accent-black h-3.5 w-3.5"
            />
            <span>Ver archivados</span>
          </label>
        </div>

        {/* BOTÓN NUEVO INSUMO */}
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-[#FACC15] text-black font-mono text-xs font-black uppercase px-4 py-2.5 border-2 border-black dark:border-zinc-700 shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] hover:bg-[#EAB308] transition-all hover:translate-x-0.5 hover:translate-y-0.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>+ Nuevo Insumo</span>
        </button>
      </div>

      {/* TABLA DE COMPONENTES */}
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] overflow-hidden">
        {filteredComponents.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <Sparkles className="h-8 w-8 text-slate-400 dark:text-zinc-500 mx-auto" />
            <p className="font-mono text-xs text-slate-600 dark:text-zinc-400">
              {components.length === 0
                ? "Aún no hay insumos registrados. Crea el primero con el botón amarillo de arriba."
                : "No se encontraron insumos con los filtros seleccionados."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-[#F8F5EE] dark:bg-[#262626] border-b-2 border-black dark:border-zinc-700 font-oswald text-xs uppercase tracking-wider text-black dark:text-[#F5F5F5]">
                  <th className="p-3 border-r border-black dark:border-zinc-700">Insumo / Nombre</th>
                  <th className="p-3 border-r border-black dark:border-zinc-700">Categoría</th>
                  <th className="p-3 border-r border-black dark:border-zinc-700">Unidad de Medida</th>
                  <th className="p-3 border-r border-black dark:border-zinc-700 text-right">Costo Unitario ($)</th>
                  <th className="p-3 border-r border-black dark:border-zinc-700">Notas / Aplicación</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black dark:divide-zinc-700">
                {filteredComponents.map((item) => {
                  const catConfig = COST_COMPONENT_CATEGORIES[item.category] || COST_COMPONENT_CATEGORIES.otro;
                  const isArchived = Boolean(item.archived_at);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors ${
                        isArchived ? "opacity-60 bg-slate-100 dark:bg-zinc-900/60" : ""
                      }`}
                    >
                      <td className="p-3 border-r border-black dark:border-zinc-700 font-bold text-black dark:text-[#F5F5F5]">
                        <div className="flex items-center gap-2">
                          <span>{item.name}</span>
                          {isArchived && (
                            <span className="font-mono text-[9px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-1.5 py-0.5 border border-red-400">
                              Archivado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 border-r border-black dark:border-zinc-700">
                        <span
                          className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 border border-black dark:border-zinc-700 ${catConfig.bg} ${catConfig.text}`}
                        >
                          {catConfig.shortLabel}
                        </span>
                      </td>
                      <td className="p-3 border-r border-black dark:border-zinc-700 font-mono text-slate-700 dark:text-zinc-300">
                        {item.unit}
                      </td>
                      <td className="p-3 border-r border-black dark:border-zinc-700 text-right font-mono font-black text-sm text-black dark:text-[#F5F5F5]">
                        ${Number(item.cost_per_unit).toFixed(4)}
                      </td>
                      <td className="p-3 border-r border-black dark:border-zinc-700 text-slate-500 dark:text-zinc-400 font-mono text-[11px] max-w-xs truncate">
                        {item.notes || "-"}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            title="Editar insumo"
                            disabled={isPending}
                            className="p-1.5 bg-white dark:bg-[#262626] border border-black dark:border-zinc-700 shadow-[1px_1px_0px_#0A0A0A] dark:shadow-[1px_1px_0px_#000000] hover:bg-slate-100 dark:hover:bg-zinc-700 text-black dark:text-[#F5F5F5]"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleArchive(item)}
                            title={isArchived ? "Restaurar insumo" : "Archivar insumo"}
                            disabled={isPending}
                            className={`p-1.5 border border-black dark:border-zinc-700 shadow-[1px_1px_0px_#0A0A0A] dark:shadow-[1px_1px_0px_#000000] ${
                              isArchived
                                ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                            }`}
                          >
                            {isArchived ? (
                              <RotateCcw className="h-3.5 w-3.5" />
                            ) : (
                              <Archive className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR INSUMO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[8px_8px_0px_#0A0A0A] dark:shadow-[8px_8px_0px_#000000] w-full max-w-lg p-6 space-y-5 animate-in fade-in-50 zoom-in-95">
            {/* ENCABEZADO MODAL */}
            <div className="flex items-center justify-between border-b-2 border-black dark:border-zinc-700 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#FACC15]" />
                <h3 className="font-oswald text-lg font-black uppercase text-black dark:text-[#F5F5F5]">
                  {editingComponent ? "Editar Insumo Base" : "Nuevo Insumo de Costo"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-black dark:text-white hover:opacity-75 p-1 border border-black dark:border-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* FORMULARIO */}
            <form onSubmit={handleSave} className="space-y-4">
              {/* NOMBRE */}
              <div className="space-y-1">
                <label className="block font-mono text-xs font-bold uppercase text-black dark:text-[#F5F5F5]">
                  Nombre del Insumo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Prenda Microdurazno (Sublimación), Tinta Sublimación, Papel A4..."
                  className="w-full bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-2.5 text-xs font-mono text-black dark:text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
                <p className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                  Tip: Puedes diferenciar insumos por técnica (ej: Prenda para Sublimación vs DTF).
                </p>
              </div>

              {/* CATEGORÍA Y UNIDAD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-[#F5F5F5]">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as CostComponentCategory,
                      })
                    }
                    className="w-full bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-2.5 text-xs font-mono font-bold text-black dark:text-[#F5F5F5] focus:outline-none"
                  >
                    {Object.values(COST_COMPONENT_CATEGORIES).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-[#F5F5F5]">
                    Unidad de Medida *
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-2.5 text-xs font-mono font-bold text-black dark:text-[#F5F5F5] focus:outline-none"
                    >
                      {COST_COMMON_UNITS.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* COSTO UNITARIO */}
              <div className="space-y-1">
                <label className="block font-mono text-xs font-bold uppercase text-black dark:text-[#F5F5F5]">
                  Costo Unitario en Dólares ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-sm text-slate-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    required
                    value={formData.cost_per_unit || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cost_per_unit: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.0000"
                    className="w-full bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 pl-8 pr-3 py-2.5 text-xs font-mono font-bold text-black dark:text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                </div>
                <p className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                  Permite hasta 4 decimales para insumos de precisión (ej: tinta a $0.3200/ml).
                </p>
              </div>

              {/* NOTAS */}
              <div className="space-y-1">
                <label className="block font-mono text-xs font-bold uppercase text-black dark:text-[#F5F5F5]">
                  Notas / Detalles del Proveedor (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ej: Proveedor Castillo, paquete de 100 hojas, etc."
                  className="w-full bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 p-2.5 text-xs font-mono text-black dark:text-[#F5F5F5] focus:outline-none"
                />
              </div>

              {/* BOTONES ACCIÓN */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2 border-2 border-black dark:border-zinc-700 font-mono text-xs font-bold bg-white dark:bg-[#262626] text-black dark:text-[#F5F5F5] hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2 border-2 border-black dark:border-zinc-700 font-mono text-xs font-black uppercase bg-[#FACC15] text-black shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] hover:bg-[#EAB308]"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{editingComponent ? "Guardar Cambios" : "Crear Insumo"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
