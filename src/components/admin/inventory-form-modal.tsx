"use client";

import { useState, useEffect, useTransition } from "react";
import { X, Loader2, Save, Info } from "lucide-react";
import {
  INVENTORY_CATEGORIES,
  INVENTORY_CATEGORY_CONFIG,
  INVENTORY_COMMON_UNITS,
  SHIRT_SIZES,
  SHIRT_CUTS,
  SHIRT_COLORS,
} from "@/lib/constants";
import { createOrUpdateInventoryItem, updateInventoryItem } from "@/actions/inventory.actions";
import type { InventoryCategory, InventoryFormData, InventoryItem } from "@/types";

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (message?: string) => void;
  initialItem?: InventoryItem | null;
  defaultCategory?: InventoryCategory;
}

export function InventoryFormModal({
  isOpen,
  onClose,
  onSaved,
  initialItem,
  defaultCategory = "material",
}: InventoryFormModalProps) {
  const isEditing = Boolean(initialItem);

  const [category, setCategory] = useState<InventoryCategory>(
    initialItem?.category || defaultCategory
  );
  const [name, setName] = useState<string>(initialItem?.name || "");
  const [variant, setVariant] = useState<string>(initialItem?.variant || "");
  const [quantity, setQuantity] = useState<string>(
    initialItem ? String(initialItem.quantity) : "1"
  );
  const [unit, setUnit] = useState<string>(
    initialItem?.unit || INVENTORY_CATEGORY_CONFIG[defaultCategory].defaultUnit
  );
  const [minStockAlert, setMinStockAlert] = useState<string>(
    initialItem ? String(initialItem.min_stock_alert) : "0"
  );
  const [costPerUnit, setCostPerUnit] = useState<string>(
    initialItem ? String(initialItem.cost_per_unit) : "0"
  );
  const [notes, setNotes] = useState<string>(initialItem?.notes || "");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Reiniciar estado cuando cambia initialItem o isOpen
  useEffect(() => {
    if (initialItem) {
      setCategory(initialItem.category);
      setName(initialItem.name);
      setVariant(initialItem.variant || "");
      setQuantity(String(initialItem.quantity));
      setUnit(initialItem.unit);
      setMinStockAlert(String(initialItem.min_stock_alert));
      setCostPerUnit(String(initialItem.cost_per_unit));
      setNotes(initialItem.notes || "");
    } else {
      setCategory(defaultCategory);
      setName("");
      setVariant("");
      setQuantity(defaultCategory === "tela" ? "10" : "1");
      setUnit(INVENTORY_CATEGORY_CONFIG[defaultCategory].defaultUnit);
      setMinStockAlert(defaultCategory === "tela" ? "5" : "3");
      setCostPerUnit("0");
      setNotes("");
    }
    setErrorMsg(null);
  }, [initialItem, defaultCategory, isOpen]);

  // Al cambiar de categoría, ajustar la unidad predeterminada si el usuario no la ha tocado
  const handleCategoryChange = (newCat: InventoryCategory) => {
    setCategory(newCat);
    if (!isEditing) {
      setUnit(INVENTORY_CATEGORY_CONFIG[newCat].defaultUnit);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty < 0) {
      setErrorMsg("No puedes tener stock negativo.");
      return;
    }

    if (!name.trim()) {
      setErrorMsg("Por favor ingresa el nombre del ítem o producto.");
      return;
    }

    const payload: InventoryFormData = {
      category,
      name: name.trim(),
      variant: variant.trim() || null,
      quantity: parsedQty,
      unit: unit.trim() || "unidad",
      min_stock_alert: parseFloat(minStockAlert) || 0,
      cost_per_unit: parseFloat(costPerUnit) || 0,
      notes: notes.trim() || null,
    };

    startTransition(async () => {
      if (isEditing && initialItem) {
        const res = await updateInventoryItem(initialItem.id, payload);
        if (res.success) {
          onSaved(res.message);
          onClose();
        } else {
          setErrorMsg(res.error || "Error al actualizar el ítem.");
        }
      } else {
        const res = await createOrUpdateInventoryItem(payload);
        if (res.success) {
          onSaved(res.message);
          onClose();
        } else {
          setErrorMsg(res.error || "Error al registrar el ítem.");
        }
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#F8F5EE] border-2 border-black max-w-lg w-full shadow-[6px_6px_0px_#0A0A0A] p-5 sm:p-6 space-y-4 my-8">
        {/* ENCABEZADO */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase bg-[#FACC15] text-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_#0A0A0A]">
              {isEditing ? "EDITAR REGISTRO" : "NUEVO INGRESO AL TALLER"}
            </span>
            <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black pt-1">
              {isEditing ? "Modificar Ítem de Inventario" : "Agregar Ítem al Inventario"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 bg-white text-black border-2 border-black hover:bg-slate-100 shadow-[1.5px_1.5px_0px_#0A0A0A] transition-transform hover:scale-105"
            title="Cerrar ventana"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <div className="bg-[#FFE4E6] border-2 border-[#E11D48] p-3 font-mono text-xs text-[#9F1239] font-bold">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {/* CATEGORÍA */}
          <div className="space-y-1">
            <label className="font-bold text-black uppercase flex items-center justify-between">
              <span>Categoría del Taller:</span>
              <span className="text-slate-500 text-[10px] lowercase font-normal">
                (clasificación en almacén)
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {INVENTORY_CATEGORIES.map((catKey) => {
                const config = INVENTORY_CATEGORY_CONFIG[catKey];
                const isSelected = category === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => handleCategoryChange(catKey)}
                    className={`py-2 px-2 border-2 border-black font-bold uppercase text-center transition-all ${
                      isSelected
                        ? `${config.badgeBg} ${config.badgeText} shadow-[2px_2px_0px_#0A0A0A] -translate-y-0.5`
                        : "bg-white text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {config.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* NOMBRE DEL ÍTEM */}
          <div className="space-y-1">
            <label className="font-bold text-black uppercase block">
              Nombre del Ítem / Producto: *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                category === "tela"
                  ? "Ej: Microdurazno Heavy, Micro Rib..."
                  : category === "prenda"
                  ? "Ej: Franela Microdurazno, Franela Boxer..."
                  : category === "material"
                  ? "Ej: Tinta Sublimación, Papel A4, Cinta Térmica..."
                  : "Ej: Taza 11oz, Mousepad Gamer, Rompecabezas..."
              }
              required
              className="w-full p-2 bg-white border-2 border-black font-mono text-xs text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-[2px_2px_0px_#0A0A0A]"
            />
          </div>

          {/* VARIANTE / ESPECIFICACIÓN */}
          <div className="space-y-1">
            <label className="font-bold text-black uppercase flex items-center justify-between">
              <span>Variante / Talla / Color:</span>
              <span className="text-slate-500 text-[10px] font-normal">
                (opcional para agrupar)
              </span>
            </label>
            <input
              type="text"
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              placeholder={
                category === "prenda"
                  ? "Ej: Blanca Dama M, Negra Caballero L..."
                  : category === "tela"
                  ? "Ej: Blanca, Negra, Gris Jaspeado..."
                  : category === "material"
                  ? "Ej: Color Cian, 100ml, 50 metros..."
                  : "Ej: Mágica Negra, 70x30 cm, 120 piezas..."
              }
              className="w-full p-2 bg-white border-2 border-black font-mono text-xs text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-[2px_2px_0px_#0A0A0A]"
            />

            {/* SUGERENCIAS RÁPIDAS PARA PRENDAS */}
            {category === "prenda" && (
              <div className="flex flex-wrap gap-1 pt-1 text-[10px]">
                <span className="text-slate-500 py-0.5">Sugerir:</span>
                {SHIRT_CUTS.map((cut) => (
                  <button
                    key={cut.value}
                    type="button"
                    onClick={() => setVariant((prev) => `${prev} ${cut.label.split(" ")[0]}`.trim())}
                    className="px-1.5 py-0.5 bg-white border border-black hover:bg-[#FACC15]"
                  >
                    +{cut.label.split(" ")[0]}
                  </button>
                ))}
                {SHIRT_SIZES.slice(0, 5).map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => setVariant((prev) => `${prev} ${size.value}`.trim())}
                    className="px-1.5 py-0.5 bg-white border border-black hover:bg-[#FACC15]"
                  >
                    +{size.value}
                  </button>
                ))}
                {SHIRT_COLORS.map((col) => (
                  <button
                    key={col.value}
                    type="button"
                    onClick={() => setVariant((prev) => `${prev} ${col.label.split(" ")[0]}`.trim())}
                    className="px-1.5 py-0.5 bg-white border border-black hover:bg-[#FACC15]"
                  >
                    +{col.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CANTIDAD Y UNIDAD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-black uppercase block">
                Cantidad a Ingresar: *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full p-2 bg-white border-2 border-black font-mono text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-[2px_2px_0px_#0A0A0A]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-black uppercase block">
                Unidad de Medida:
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2 bg-white border-2 border-black font-mono text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-[2px_2px_0px_#0A0A0A] cursor-pointer"
              >
                {INVENTORY_COMMON_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STOCK MÍNIMO Y COSTO UNITARIO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-black uppercase flex items-center justify-between">
                <span>Alerta Mínima:</span>
                <span
                  className="text-slate-500 cursor-help"
                  title="El taller te avisa en rojo cuando te quede menos de esto"
                >
                  <Info className="h-3.5 w-3.5" />
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value)}
                className="w-full p-2 bg-white border-2 border-black font-mono text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-[2px_2px_0px_#0A0A0A]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-black uppercase flex items-center justify-between">
                <span>Costo Unitario ($ USD):</span>
                <span
                  className="text-slate-500 cursor-help"
                  title="Lo que nos costó comprar o traer cada unidad o metro en dólares"
                >
                  <Info className="h-3.5 w-3.5" />
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                className="w-full p-2 bg-white border-2 border-black font-mono text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-[2px_2px_0px_#0A0A0A]"
              />
            </div>
          </div>

          {/* NOTAS ADICIONALES */}
          <div className="space-y-1">
            <label className="font-bold text-black uppercase block">
              Notas del Taller (Opcional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Proveedor Petare, rollo nuevo, lote de marzo..."
              className="w-full p-2 bg-white border-2 border-black font-mono text-xs text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-[2px_2px_0px_#0A0A0A]"
            />
          </div>

          {/* PIE Y BOTONES DE ACCIÓN */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-dashed border-slate-300">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="font-mono text-xs font-bold uppercase px-3.5 py-2 bg-white text-black border-2 border-black hover:bg-slate-100 shadow-[2px_2px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="font-mono text-xs font-black uppercase px-4 py-2 bg-[#FACC15] text-black border-2 border-black hover:bg-[#EAB308] shadow-[2.5px_2.5px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-1.5 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 text-black" />
                  <span>{isEditing ? "Guardar Cambios" : "Registrar en Almacén"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
