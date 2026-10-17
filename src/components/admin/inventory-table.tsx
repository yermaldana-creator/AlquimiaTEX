"use client";

import { useState, useEffect, useTransition, useMemo, useCallback } from "react";
import {
  Search,
  X,
  Plus,
  Edit2,
  Archive,
  RotateCcw,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  PackageOpen,
} from "lucide-react";
import { INVENTORY_CATEGORY_CONFIG } from "@/lib/constants";
import {
  getInventory,
  adjustStockDelta,
  archiveInventoryItem,
  restoreInventoryItem,
} from "@/actions/inventory.actions";
import { InventoryTabs } from "./inventory-tabs";
import { InventoryFormModal } from "./inventory-form-modal";
import { exportInventoryToCsv, downloadCsvTemplate } from "./inventory-csv-export";
import type { InventoryItem, InventoryCategory } from "@/types";

interface InventoryTableProps {
  initialItems: InventoryItem[];
  initialCategory?: string;
  onRefreshKpis?: () => void;
}

export function InventoryTable({
  initialItems,
  initialCategory = "todos",
  onRefreshKpis,
}: InventoryTableProps) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [onlyAlerts, setOnlyAlerts] = useState<boolean>(false);
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Estados de carga y feedback
  const [isPending, startTransition] = useTransition();
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);

  // 1. Debounce de 300ms en el buscador
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Mostrar mensaje toast temporal
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 2. Fetch cuando cambie debouncedSearch, selectedCategory, onlyAlerts o showArchived
  const refreshItems = useCallback(() => {
    startTransition(async () => {
      try {
        const result = await getInventory({
          category: selectedCategory,
          search: debouncedSearch,
          onlyAlerts,
          showArchived,
        });
        setItems(result.items);
        if (onRefreshKpis) onRefreshKpis();
      } catch (err) {
        console.error("Error al refrescar inventario:", err);
      }
    });
  }, [selectedCategory, debouncedSearch, onlyAlerts, showArchived, onRefreshKpis]);

  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  // 3. Ajuste rápido (+1 / -1)
  const handleAdjustStock = (item: InventoryItem, delta: number) => {
    if (delta < 0 && item.quantity <= 0) {
      showToast("No puedes tener stock negativo.");
      return;
    }

    setAdjustingId(item.id);
    startTransition(async () => {
      const res = await adjustStockDelta(item.id, delta);
      if (res.success && res.newQuantity !== undefined) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, quantity: res.newQuantity! } : i))
        );
        if (onRefreshKpis) onRefreshKpis();
      } else {
        showToast(res.error || "No se pudo actualizar el stock.");
      }
      setAdjustingId(null);
    });
  };

  // 4. Archivar (Soft delete)
  const handleArchive = (id: string) => {
    startTransition(async () => {
      const res = await archiveInventoryItem(id);
      if (res.success) {
        showToast("Ítem archivado del inventario.");
        setConfirmArchiveId(null);
        refreshItems();
      } else {
        showToast(res.error || "Error al archivar.");
      }
    });
  };

  // 5. Restaurar ítem archivado
  const handleRestore = (id: string) => {
    startTransition(async () => {
      const res = await restoreInventoryItem(id);
      if (res.success) {
        showToast("Ítem restaurado al inventario activo.");
        refreshItems();
      } else {
        showToast(res.error || "Error al restaurar.");
      }
    });
  };

  // Conteo de ítems por categoría
  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {
      todos: items.length,
      material: 0,
      tela: 0,
      prenda: 0,
      otro: 0,
    };
    items.forEach((item) => {
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      }
    });
    return counts;
  }, [items]);

  return (
    <div className="space-y-4">
      {/* MENSAJE TOAST FLOTANTE */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-black text-[#FACC15] border-2 border-[#FACC15] px-4 py-3 shadow-[4px_4px_0px_#0A0A0A] font-mono text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom">
          <span>⚡ {toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white hover:text-[#FACC15] ml-2"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* BARRA SUPERIOR DE BÚSQUEDA, FILTROS Y BOTONES */}
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* BUSCADOR CON DEBOUNCE (300ms) */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre, tela, talla o notas (300ms)..."
              className="w-full pl-9 pr-8 py-2 bg-[#F8F5EE] dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 font-mono text-xs text-black dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000]"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                title="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* ACCIONES Y BOTONES PRINCIPALES */}
          <div className="flex flex-wrap items-center gap-2">
            {/* BOTÓN NUEVO ÍTEM */}
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsFormModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-black uppercase bg-[#FACC15] text-black border-2 border-black px-3.5 py-2 shadow-[2.5px_2.5px_0px_#0A0A0A] hover:bg-[#EAB308] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Ítem</span>
            </button>

            {/* EXPORTAR A CSV */}
            <button
              type="button"
              onClick={() => exportInventoryToCsv(items)}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-zinc-700 px-3 py-2 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all hover:translate-x-0.5 hover:translate-y-0.5"
              title="Descargar copia del inventario actual en formato CSV para Excel"
            >
              <Download className="h-3.5 w-3.5 text-black dark:text-white" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            {/* DESCARGAR PLANTILLA CSV */}
            <button
              type="button"
              onClick={() => downloadCsvTemplate()}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border-2 border-black dark:border-zinc-700 px-2.5 py-2 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all hover:translate-x-0.5 hover:translate-y-0.5"
              title="Descargar plantilla CSV con ejemplos para rellenar en Excel"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              <span className="hidden md:inline">Plantilla CSV</span>
            </button>
          </div>
        </div>

        {/* PESTAÑAS DE CATEGORÍA Y FILTROS TOGGLE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-dashed border-slate-300 dark:border-zinc-700">
          <InventoryTabs
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            countsByCategory={countsByCategory}
          />

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {/* TOGGLE SOLO ALERTAS */}
            <button
              type="button"
              onClick={() => setOnlyAlerts((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 border-2 border-black dark:border-zinc-700 font-bold uppercase transition-all ${
                onlyAlerts
                  ? "bg-[#F43F5E] text-white shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000]"
                  : "bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 shadow-[1px_1px_0px_#0A0A0A] dark:shadow-[1px_1px_0px_#000000]"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Solo Alertas</span>
            </button>

            {/* TOGGLE VER ARCHIVADOS */}
            <button
              type="button"
              onClick={() => setShowArchived((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 border-2 border-black dark:border-zinc-700 font-bold uppercase transition-all ${
                showArchived
                  ? "bg-black dark:bg-zinc-800 text-[#FACC15] shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000]"
                  : "bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 shadow-[1px_1px_0px_#0A0A0A] dark:shadow-[1px_1px_0px_#000000]"
              }`}
            >
              <Archive className="h-3.5 w-3.5" />
              <span>Ver Archivados</span>
            </button>
          </div>
        </div>
      </div>

      {/* TABLA PRINCIPAL DE INVENTARIO */}
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[6px_6px_0px_#0A0A0A] dark:shadow-[6px_6px_0px_#000000] overflow-hidden">
        {isPending ? (
          <div className="p-4 space-y-3 animate-pulse">
            <div className="border-b-2 border-black dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 p-3 grid grid-cols-12 gap-2">
              <div className="col-span-4 h-4 bg-slate-200 dark:bg-zinc-700" />
              <div className="col-span-2 h-4 bg-slate-200 dark:bg-zinc-700" />
              <div className="col-span-3 h-4 bg-slate-200 dark:bg-zinc-700" />
              <div className="col-span-1 h-4 bg-slate-200 dark:bg-zinc-700" />
              <div className="col-span-2 h-4 bg-slate-200 dark:bg-zinc-700" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="py-3 px-2 grid grid-cols-12 gap-2 items-center border-b border-slate-100 dark:border-zinc-800 last:border-0"
              >
                <div className="col-span-4 space-y-1">
                  <div className="h-4 w-40 bg-slate-200 dark:bg-zinc-700" />
                  <div className="h-3 w-24 bg-slate-200 dark:bg-zinc-700" />
                </div>
                <div className="col-span-2">
                  <div className="h-6 w-20 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <div className="h-7 w-7 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
                  <div className="h-6 w-14 bg-slate-200 dark:bg-zinc-700" />
                  <div className="h-7 w-7 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
                </div>
                <div className="col-span-1">
                  <div className="h-4 w-12 bg-slate-200 dark:bg-zinc-700" />
                </div>
                <div className="col-span-2 flex justify-end gap-1.5">
                  <div className="h-7 w-7 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
                  <div className="h-7 w-7 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <PackageOpen className="h-10 w-10 text-slate-400 dark:text-zinc-600 mx-auto" />
            <h3 className="font-oswald text-lg font-black uppercase text-black dark:text-white">
              No hay ítems en esta vista
            </h3>
            <p className="font-mono text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
              {searchInput || onlyAlerts || showArchived || selectedCategory !== "todos"
                ? "Ningún ítem coincide con los filtros aplicados."
                : "Aún no has registrado materiales, telas o prendas en el taller."}
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsFormModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase px-3 py-1.5 bg-[#FACC15] text-black border-2 border-black shadow-[2px_2px_0px_#0A0A0A]"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Primer Ítem</span>
            </button>
          </div>
        ) : (
          <>
            {/* VISTA ESCRITORIO */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="bg-[#F8F5EE] dark:bg-zinc-900 border-b-2 border-black dark:border-zinc-700 font-oswald text-xs uppercase tracking-wider text-black dark:text-zinc-200">
                    <th className="p-3 border-r border-black dark:border-zinc-700">Categoría</th>
                    <th className="p-3 border-r border-black dark:border-zinc-700">Nombre del Ítem</th>
                    <th className="p-3 border-r border-black dark:border-zinc-700">Variante / Detalle</th>
                    <th className="p-3 border-r border-black dark:border-zinc-700 text-center">Existencia</th>
                    <th className="p-3 border-r border-black dark:border-zinc-700 text-center">Ajuste Rápido</th>
                    <th className="p-3 border-r border-black dark:border-zinc-700">Stock Mínimo</th>
                    <th className="p-3 border-r border-black dark:border-zinc-700">Costo / Valor</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black dark:divide-zinc-700 text-xs">
                  {items.map((item) => {
                    const catConfig =
                       INVENTORY_CATEGORY_CONFIG[item.category] ||
                      INVENTORY_CATEGORY_CONFIG.material;
                    const isLowStock =
                      Number(item.quantity) <= Number(item.min_stock_alert);
                    const isItemAdjusting = adjustingId === item.id;
                    const totalValue = (
                      Number(item.quantity || 0) * Number(item.cost_per_unit || 0)
                    ).toFixed(2);

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-[#FFFDF7] dark:hover:bg-zinc-800/50 transition-colors ${
                          item.archived_at ? "bg-slate-50 dark:bg-zinc-900/50 opacity-75" : ""
                        }`}
                      >
                        {/* CATEGORÍA */}
                        <td className="p-3 border-r border-black dark:border-zinc-700 align-middle">
                          <span
                            className={`inline-block font-mono text-[10px] font-bold uppercase px-2 py-0.5 border border-black dark:border-zinc-700 ${catConfig.badgeBg} ${catConfig.badgeText}`}
                          >
                            {catConfig.shortLabel}
                          </span>
                        </td>

                        {/* NOMBRE */}
                        <td className="p-3 border-r border-black dark:border-zinc-700 align-middle">
                          <div className="font-bold text-black dark:text-white text-sm">{item.name}</div>
                          {item.notes && (
                            <div className="font-mono text-[10px] text-slate-500 dark:text-zinc-400 truncate max-w-xs">
                              {item.notes}
                            </div>
                          )}
                        </td>

                        {/* VARIANTE */}
                        <td className="p-3 border-r border-black dark:border-zinc-700 align-middle font-mono text-xs">
                          {item.variant ? (
                            <span className="bg-[#F8F5EE] dark:bg-zinc-800 px-1.5 py-0.5 border border-slate-300 dark:border-zinc-700 font-bold text-slate-800 dark:text-zinc-200">
                              {item.variant}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-zinc-500 text-[10px]">—</span>
                          )}
                        </td>

                        {/* EXISTENCIA ACTUAL */}
                        <td className="p-3 border-r border-black dark:border-zinc-700 align-middle text-center">
                          <div className="font-oswald text-xl font-black text-black dark:text-white">
                            {item.quantity}{" "}
                            <span className="font-mono text-xs font-normal text-slate-600 dark:text-zinc-400">
                              {item.unit}
                            </span>
                          </div>
                        </td>

                        {/* AJUSTE RÁPIDO (+1 / -1) */}
                        <td className="p-3 border-r border-black dark:border-zinc-700 align-middle text-center">
                          <div className="inline-flex items-center gap-1.5">
                            {/* BOTÓN -1 (DESHABILITADO SI QUANTITY <= 0) */}
                            <button
                              type="button"
                              onClick={() => handleAdjustStock(item, -1)}
                              disabled={item.quantity <= 0 || isItemAdjusting}
                              className="h-7 w-7 inline-flex items-center justify-center font-mono text-xs font-black uppercase bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 shadow-[1px_1px_0px_#0A0A0A] dark:shadow-[1px_1px_0px_#000000] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              title={
                                item.quantity <= 0
                                  ? "No puedes bajar de cero"
                                  : "Restar 1 unidad"
                              }
                            >
                              -1
                            </button>

                            {/* BOTÓN +1 */}
                            <button
                              type="button"
                              onClick={() => handleAdjustStock(item, 1)}
                              disabled={isItemAdjusting}
                              className="h-7 w-7 inline-flex items-center justify-center font-mono text-xs font-black uppercase bg-[#FACC15] text-black border-2 border-black hover:bg-[#EAB308] shadow-[1px_1px_0px_#0A0A0A] disabled:opacity-50 transition-all"
                              title="Sumar 1 unidad"
                            >
                              +1
                            </button>
                          </div>
                        </td>

                        {/* STOCK MÍNIMO & ALERTA */}
                        <td className="p-3 border-r border-black dark:border-zinc-700 align-middle space-y-1">
                          <div className="font-mono text-xs text-slate-700 dark:text-zinc-300">
                            Min: <strong>{item.min_stock_alert}</strong> {item.unit}
                          </div>
                          {isLowStock && (
                            <span className="inline-flex items-center gap-1 font-mono text-[9px] font-black uppercase bg-[#FFE4E6] dark:bg-rose-950/40 text-[#9F1239] dark:text-rose-300 border border-[#F43F5E] dark:border-rose-600 px-1.5 py-0.5">
                              <AlertTriangle className="h-2.5 w-2.5 text-[#F43F5E] dark:text-rose-400" />
                              <span>Bajo Mínimo</span>
                            </span>
                          )}
                        </td>

                        {/* COSTO UNITARIO Y VALOR TOTAL */}
                        <td className="p-3 border-r border-black dark:border-zinc-700 align-middle font-mono text-xs space-y-0.5 text-black dark:text-zinc-200">
                          <div>
                            Costo: <strong>${item.cost_per_unit}</strong>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                            Total: <strong>${totalValue}</strong>
                          </div>
                        </td>

                        {/* ACCIONES */}
                        <td className="p-3 align-middle text-center">
                          <div className="inline-flex items-center gap-1.5">
                            {/* BOTÓN EDITAR */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem(item);
                                setIsFormModalOpen(true);
                              }}
                              className="p-1.5 bg-white dark:bg-zinc-800 text-black dark:text-white border border-black dark:border-zinc-700 hover:bg-[#FACC15] dark:hover:bg-[#FACC15] dark:hover:text-black shadow-[1px_1px_0px_#0A0A0A] dark:shadow-[1px_1px_0px_#000000] transition-all"
                              title="Editar ítem"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            {/* BOTÓN ARCHIVAR / RESTAURAR */}
                            {item.archived_at ? (
                              <button
                                type="button"
                                onClick={() => handleRestore(item.id)}
                                className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase px-2 py-1 bg-[#10B981] text-white border border-black shadow-[1px_1px_0px_#0A0A0A]"
                                title="Restaurar al inventario activo"
                              >
                                <RotateCcw className="h-3 w-3" />
                                <span>Restaurar</span>
                              </button>
                            ) : confirmArchiveId === item.id ? (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleArchive(item.id)}
                                  className="font-mono text-[10px] font-black uppercase px-2 py-1 bg-[#F43F5E] text-white border border-black shadow-[1px_1px_0px_#0A0A0A]"
                                >
                                  Confirmar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmArchiveId(null)}
                                  className="font-mono text-[10px] uppercase px-1 py-1 bg-white dark:bg-zinc-800 text-black dark:text-white border border-black dark:border-zinc-700"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmArchiveId(item.id)}
                                className="p-1.5 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-black dark:border-zinc-700 hover:bg-[#FFE4E6] dark:hover:bg-rose-950/40 hover:text-[#F43F5E] shadow-[1px_1px_0px_#0A0A0A] dark:shadow-[1px_1px_0px_#000000] transition-all"
                                title="Archivar ítem (Soft Delete)"
                              >
                                <Archive className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* VISTA MÓVIL (TARJETAS APILADAS) */}
            <div className="block md:hidden divide-y-2 divide-black dark:divide-zinc-700">
              {items.map((item) => {
                const catConfig =
                  INVENTORY_CATEGORY_CONFIG[item.category] ||
                  INVENTORY_CATEGORY_CONFIG.material;
                const isLowStock =
                  Number(item.quantity) <= Number(item.min_stock_alert);

                return (
                  <div
                    key={item.id}
                    className={`p-4 space-y-3 ${
                      item.archived_at ? "bg-slate-50 dark:bg-zinc-900/50 opacity-80" : "bg-white dark:bg-[#1E1E1E]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-black dark:border-zinc-700 pb-2">
                      <span
                        className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 border border-black dark:border-zinc-700 ${catConfig.badgeBg} ${catConfig.badgeText}`}
                      >
                        {catConfig.shortLabel}
                      </span>

                      {isLowStock && (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-black uppercase bg-[#FFE4E6] dark:bg-rose-950/40 text-[#9F1239] dark:text-rose-300 border border-[#F43F5E] dark:border-rose-600 px-2 py-0.5">
                          <AlertTriangle className="h-3 w-3 text-[#F43F5E] dark:text-rose-400" />
                          <span>Stock Bajo</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-black dark:text-white">{item.name}</h4>
                        {item.variant && (
                          <div className="font-mono text-xs text-slate-700 dark:text-zinc-300 font-bold pt-0.5">
                            Variante: {item.variant}
                          </div>
                        )}
                        {item.notes && (
                          <div className="font-mono text-[11px] text-slate-500 dark:text-zinc-400 pt-0.5">
                            {item.notes}
                          </div>
                        )}
                      </div>

                      {/* EXISTENCIA */}
                      <div className="text-right">
                        <div className="font-oswald text-2xl font-black text-black dark:text-white">
                          {item.quantity}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500 dark:text-zinc-400 uppercase">
                          {item.unit}
                        </div>
                      </div>
                    </div>

                    {/* AJUSTES Y ACCIONES EN MÓVIL */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-dashed border-slate-300 dark:border-zinc-700">
                      {/* CONTROLES +1 Y -1 */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(item, -1)}
                          disabled={item.quantity <= 0}
                          className="h-8 w-9 font-mono text-xs font-black uppercase bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 shadow-[1px_1px_0px_#0A0A0A] dark:shadow-[1px_1px_0px_#000000] disabled:opacity-30"
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(item, 1)}
                          className="h-8 w-9 font-mono text-xs font-black uppercase bg-[#FACC15] text-black border-2 border-black hover:bg-[#EAB308] shadow-[1px_1px_0px_#0A0A0A]"
                        >
                          +1
                        </button>
                      </div>

                      {/* EDITAR / ARCHIVAR */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(item);
                            setIsFormModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 font-mono text-xs font-bold uppercase bg-white dark:bg-zinc-800 text-black dark:text-white border border-black dark:border-zinc-700 hover:bg-[#FACC15] dark:hover:bg-[#FACC15] dark:hover:text-black shadow-[1px_1px_0px_#0A0A0A] dark:shadow-[1px_1px_0px_#000000]"
                        >
                          Editar
                        </button>

                        {item.archived_at ? (
                          <button
                            type="button"
                            onClick={() => handleRestore(item.id)}
                            className="px-2.5 py-1.5 font-mono text-xs font-bold uppercase bg-[#10B981] text-white border border-black shadow-[1px_1px_0px_#0A0A0A]"
                          >
                            Restaurar
                          </button>
                        ) : confirmArchiveId === item.id ? (
                          <button
                            type="button"
                            onClick={() => handleArchive(item.id)}
                            className="px-2 py-1.5 font-mono text-xs font-black uppercase bg-[#F43F5E] text-white border border-black"
                          >
                            Confirmar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmArchiveId(item.id)}
                            className="px-2.5 py-1.5 font-mono text-xs font-bold uppercase bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-black dark:border-zinc-700 hover:bg-[#FFE4E6] dark:hover:bg-rose-950/40"
                          >
                            Archivar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* PIE DE TABLA */}
        <div className="bg-[#F8F5EE] dark:bg-zinc-900 border-t-2 border-black dark:border-zinc-700 p-3 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-xs text-slate-700 dark:text-zinc-300">
          <div>
            Mostrando <strong>{items.length}</strong> ítems en la vista actual.
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400">
            * Los cambios de stock se guardan en tiempo real en Supabase.
          </div>
        </div>
      </div>

      {/* MODAL PARA AGREGAR O EDITAR */}
      <InventoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingItem(null);
        }}
        initialItem={editingItem}
        defaultCategory={
          selectedCategory !== "todos"
            ? (selectedCategory as InventoryCategory)
            : "material"
        }
        onSaved={(msg) => {
          if (msg) showToast(msg);
          refreshItems();
        }}
      />
    </div>
  );
}
