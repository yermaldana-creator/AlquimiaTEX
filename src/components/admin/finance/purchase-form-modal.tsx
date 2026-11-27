"use client";

import { useState, useMemo, useTransition } from "react";
import { X, ShoppingCart, Loader2, Search } from "lucide-react";
import { registerInventoryPurchase } from "@/actions/finance.actions";
import type { CashAccount, FinanceDashboardData } from "@/types";

interface PurchaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: CashAccount[];
  inventoryItems: FinanceDashboardData["inventoryItems"];
  onSuccess: () => void;
}

export function PurchaseFormModal({
  isOpen,
  onClose,
  accounts,
  inventoryItems,
  onSuccess,
}: PurchaseFormModalProps) {
  const [itemSearch, setItemSearch] = useState("");
  const [itemId, setItemId] = useState<string>(inventoryItems[0]?.id || "");
  const [quantity, setQuantity] = useState<string>("");
  const [totalCost, setTotalCost] = useState<string>("");
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || "");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredItems = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    if (!q) return inventoryItems;
    return inventoryItems.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        (it.variant && it.variant.toLowerCase().includes(q)) ||
        it.category.toLowerCase().includes(q)
    );
  }, [inventoryItems, itemSearch]);

  if (!isOpen) return null;

  const selectedItem =
    inventoryItems.find((i) => i.id === itemId) || filteredItems[0] || inventoryItems[0];
  const selectedAccount = accounts.find((a) => a.id === accountId) || accounts[0];

  const qtyNum = parseFloat(quantity);
  const totalNum = parseFloat(totalCost);
  const computedUnitCost =
    !isNaN(qtyNum) && qtyNum > 0 && !isNaN(totalNum) && totalNum > 0
      ? totalNum / qtyNum
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedItem) {
      setError("Selecciona un ítem del inventario.");
      return;
    }
    if (!selectedAccount) {
      setError("Selecciona la cuenta con la que se pagó.");
      return;
    }
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError("La cantidad comprada debe ser mayor a 0.");
      return;
    }
    if (isNaN(totalNum) || totalNum <= 0) {
      setError("El costo total debe ser mayor a 0.");
      return;
    }

    startTransition(async () => {
      const res = await registerInventoryPurchase({
        inventory_item_id: selectedItem.id,
        quantity: qtyNum,
        total_cost: totalNum,
        account_id: selectedAccount.id,
        notes: notes.trim() || null,
      });

      if (!res.success) {
        setError(res.error || "No se pudo registrar la compra.");
        return;
      }

      setQuantity("");
      setTotalCost("");
      setNotes("");
      onSuccess();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[6px_6px_0px_#0A0A0A] dark:shadow-[6px_6px_0px_#000000] overflow-hidden max-h-[92vh] flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between bg-[#F8F5EE] dark:bg-zinc-900 border-b-2 border-black dark:border-zinc-700 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-black dark:text-[#FACC15]" />
            <h3 className="font-oswald text-lg font-black uppercase text-black dark:text-white">
              Registrar Compra de Insumo
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          {/* BUSCADOR Y SELECTOR DE ÍTEM */}
          <div className="space-y-1.5">
            <label className="block font-mono text-[11px] font-bold uppercase text-slate-700 dark:text-zinc-300">
              Ítem del Inventario *
            </label>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder="Filtrar ítem por nombre o variante..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#F8F5EE] dark:bg-zinc-900 border border-black/40 dark:border-zinc-700 font-mono text-xs text-black dark:text-white"
              />
            </div>
            <select
              value={selectedItem?.id || ""}
              onChange={(e) => setItemId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 font-mono text-xs font-bold text-black dark:text-white"
            >
              {filteredItems.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name}
                  {it.variant ? ` (${it.variant})` : ""} — Stock actual: {it.quantity} {it.unit}
                </option>
              ))}
            </select>
          </div>

          {/* CANTIDAD Y COSTO TOTAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-mono text-[11px] font-bold uppercase text-slate-700 dark:text-zinc-300">
                Cantidad Comprada ({selectedItem?.unit || "uds"}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Ej: 12"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 font-mono text-sm font-black text-black dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-mono text-[11px] font-bold uppercase text-slate-700 dark:text-zinc-300">
                Costo Total ({selectedAccount?.currency || "USD"}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                placeholder="Ej: 36.00"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 font-mono text-sm font-black text-black dark:text-white"
              />
            </div>
          </div>

          {/* PREVIEW AUTOMÁTICO DE LAS 3 ACCIONES */}
          {computedUnitCost !== null && selectedItem && (
            <div className="bg-[#CFFAFE] dark:bg-cyan-950/40 border-2 border-black dark:border-cyan-700 p-3 font-mono text-[11px] space-y-1 text-black dark:text-cyan-100">
              <p className="font-black uppercase">⚡ Acciones automáticas al guardar:</p>
              <p>
                1. Stock: <strong>{selectedItem.quantity}</strong> →{" "}
                <strong>{(selectedItem.quantity + qtyNum).toFixed(2)} {selectedItem.unit}</strong>
              </p>
              <p>
                2. Costo unitario actualizado:{" "}
                <strong>
                  {computedUnitCost.toFixed(2)} {selectedAccount?.currency} / {selectedItem.unit}
                </strong>
              </p>
              <p>
                3. Egreso en caja:{" "}
                <strong>
                  -{totalNum.toFixed(2)} {selectedAccount?.currency}
                </strong>{" "}
                en {selectedAccount?.name}
              </p>
            </div>
          )}

          {/* CUENTA CON LA QUE SE PAGÓ */}
          <div className="space-y-1">
            <label className="block font-mono text-[11px] font-bold uppercase text-slate-700 dark:text-zinc-300">
              Cuenta con la que se pagó *
            </label>
            <select
              value={selectedAccount?.id || ""}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8F5EE] dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 font-mono text-xs font-bold text-black dark:text-white"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency}) — Saldo: {acc.balance.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
          </div>

          {/* NOTAS */}
          <div className="space-y-1">
            <label className="block font-mono text-[11px] font-bold uppercase text-slate-700 dark:text-zinc-300">
              Proveedor / Notas (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Proveedor El Castillo, factura #402"
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 font-mono text-xs text-black dark:text-white"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-600 text-rose-700 dark:text-rose-300 font-mono text-xs font-bold">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/15 dark:border-zinc-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-3.5 py-2 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-xs font-bold uppercase text-black dark:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-black bg-[#FACC15] hover:bg-[#EAB308] text-black font-mono text-xs font-black uppercase shadow-[2.5px_2.5px_0px_#0A0A0A] disabled:opacity-60"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Confirmar Compra</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
