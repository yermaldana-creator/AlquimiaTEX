"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Lock,
  PackageCheck,
  Loader2,
} from "lucide-react";
import { findBestInventoryMatch } from "@/lib/inventory-matcher";
import {
  reserveOrderInventoryAction,
  releaseOrderInventoryAction,
  type ReservationItemPayload,
} from "@/actions/inventory-reservation.actions";
import type { AdminOrder, InventoryItem } from "@/types";

interface OrderInventoryPanelProps {
  order: AdminOrder;
  inventoryItems: InventoryItem[];
  onOrderUpdated?: () => void;
}

export function OrderInventoryPanel({
  order,
  inventoryItems,
  onOrderUpdated,
}: OrderInventoryPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isReserved = Boolean(order.inventory_reserved);

  // Inicializar el mapeo de cada item del pedido a un item de inventario
  const initialMapping = useMemo(() => {
    const map: Record<string, { itemId: string; isAutoSuggested: boolean; matchReasons: string[] }> = {};

    // Si ya fue reservado, cargar desde inventory_reservations
    if (order.inventory_reserved && order.inventory_reservations && order.inventory_reservations.length > 0) {
      for (const res of order.inventory_reservations) {
        map[res.order_item_id] = {
          itemId: res.inventory_item_id,
          isAutoSuggested: false,
          matchReasons: ["Reservado previamente"],
        };
      }
      return map;
    }

    // Si no está reservado, ejecutar Fuzzy Matcher automático
    for (const item of order.items || []) {
      const { bestMatch, matchReasons } = findBestInventoryMatch(item, inventoryItems);
      map[item.id] = {
        itemId: bestMatch ? bestMatch.id : "",
        isAutoSuggested: Boolean(bestMatch),
        matchReasons: matchReasons || [],
      };
    }
    return map;
  }, [order, inventoryItems]);

  const [selectedItemsMap, setSelectedItemsMap] = useState(initialMapping);

  // Manejar cambio manual de insumo por el socio
  const handleSelectInventoryItem = (orderItemId: string, inventoryItemId: string) => {
    setSelectedItemsMap((prev) => ({
      ...prev,
      [orderItemId]: {
        itemId: inventoryItemId,
        isAutoSuggested: false,
        matchReasons: ["Seleccionado manualmente por el socio"],
      },
    }));
  };

  // Calcular métricas de stock en vivo para cada ítem del pedido
  const itemEvaluations = useMemo(() => {
    return (order.items || []).map((orderItem) => {
      const selectedId = selectedItemsMap[orderItem.id]?.itemId;
      const invItem = inventoryItems.find((i) => i.id === selectedId);
      const isAutoSuggested = selectedItemsMap[orderItem.id]?.isAutoSuggested;
      const matchReasons = selectedItemsMap[orderItem.id]?.matchReasons || [];

      const requestedQty = Number(orderItem.quantity) || 1;
      const availableStock = invItem ? Number(invItem.quantity) || 0 : 0;
      const hasEnoughStock = availableStock >= requestedQty;
      const missingQty = Math.max(0, requestedQty - availableStock);
      const remainingStock = availableStock - requestedQty;

      return {
        orderItem,
        invItem,
        selectedId,
        isAutoSuggested,
        matchReasons,
        requestedQty,
        availableStock,
        hasEnoughStock,
        missingQty,
        remainingStock,
      };
    });
  }, [order.items, selectedItemsMap, inventoryItems]);

  // Chequeo global de viabilidad
  const allItemsMapped = itemEvaluations.every((ev) => Boolean(ev.invItem));
  const allItemsHaveStock = itemEvaluations.every((ev) => ev.hasEnoughStock);
  const totalMissingQty = itemEvaluations.reduce((acc, ev) => acc + ev.missingQty, 0);
  const totalRequestedUnits = (order.items || []).reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  // Ejecutar Reserva Atómica
  const handleReserveStock = () => {
    if (!allItemsMapped) {
      setFeedback({ type: "error", text: "Debes seleccionar un insumo de inventario para cada ítem del pedido." });
      return;
    }

    if (!allItemsHaveStock) {
      setFeedback({
        type: "error",
        text: `Faltan ${totalMissingQty} unidades para completar este pedido. Toca comprar tela o prendas antes de apartar.`,
      });
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const reservationsPayload: ReservationItemPayload[] = itemEvaluations.map((ev) => ({
        order_item_id: ev.orderItem.id,
        inventory_item_id: ev.invItem!.id,
        inventory_item_name: `${ev.invItem!.name}${ev.invItem!.variant ? ` (${ev.invItem!.variant})` : ""}`,
        quantity: ev.requestedQty,
      }));

      const res = await reserveOrderInventoryAction(order.id, reservationsPayload);

      if (res.success) {
        setFeedback({ type: "success", text: res.message || "Inventario apartado exitosamente." });
        onOrderUpdated?.();
      } else {
        setFeedback({ type: "error", text: res.error || "Ocurrió un error al apartar el inventario." });
      }
    });
  };

  // Ejecutar Reversión / Devolución a Inventario
  const handleReleaseStock = () => {
    if (!confirm("¿Estás seguro de devolver estas prendas al inventario? Las cantidades se repondrán al almacén.")) {
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const res = await releaseOrderInventoryAction(order.id);

      if (res.success) {
        setFeedback({ type: "success", text: res.message || "Inventario devuelto al almacén exitosamente." });
        onOrderUpdated?.();
      } else {
        setFeedback({ type: "error", text: res.error || "Ocurrió un error al liberar inventario." });
      }
    });
  };

  // Agrupar catálogo de inventario por categoría para el dropdown
  const groupedInventory = useMemo(() => {
    const active = (inventoryItems || []).filter((i) => !i.archived_at);
    return {
      prendas: active.filter((i) => i.category === "prenda"),
      materiales: active.filter((i) => i.category === "material"),
      telas: active.filter((i) => i.category === "tela"),
      otros: active.filter((i) => i.category === "otro"),
    };
  }, [inventoryItems]);

  return (
    <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[5px_5px_0px_#0A0A0A] dark:shadow-[5px_5px_0px_#000000] p-4 sm:p-5 space-y-4">
      {/* CABECERA DEL PANEL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black dark:border-zinc-700 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="bg-[#06B6D4] text-black font-mono text-[10px] font-bold px-2 py-0.5 border border-black uppercase shadow-[1.5px_1.5px_0px_#0A0A0A]">
              SUBMÓDULO 4
            </span>
            <span className="font-mono text-xs text-slate-600 dark:text-zinc-400">
              Conexión Pedidos • Almacén en Vivo
            </span>
          </div>
          <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black dark:text-white flex items-center gap-2 pt-1">
            <Boxes className="h-5 w-5 text-black dark:text-white" />
            <span>Control & Reserva de Inventario</span>
          </h3>
        </div>

        {/* BADGE DE ESTADO GLOBAL DE RESERVA */}
        <div>
          {isReserved ? (
            <div className="inline-flex items-center gap-1.5 bg-[#06B6D4] text-black border-2 border-black px-3 py-1 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#0A0A0A]">
              <Lock className="h-3.5 w-3.5" />
              <span>Inventario Ya Apartado</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-[#FACC15] text-black border-2 border-black px-3 py-1 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#0A0A0A]">
              <PackageCheck className="h-3.5 w-3.5" />
              <span>Pendiente por Apartar</span>
            </div>
          )}
        </div>
      </div>

      {/* MENSAJES DE FEEDBACK / ALERTAS */}
      {feedback && (
        <div
          className={`p-3 border-2 border-black font-mono text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-[#DCFCE7] text-emerald-950 border-emerald-800"
              : "bg-[#FFE4E6] text-rose-950 border-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-800 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-rose-800 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* DETALLE HISTÓRICO SI YA ESTÁ RESERVADO */}
      {isReserved && order.inventory_reserved_at && (
        <div className="bg-[#F8F5EE] dark:bg-zinc-850 p-3 border-2 border-black dark:border-zinc-700 font-mono text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-black dark:text-zinc-200 font-bold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Este pedido ya consumió stock del almacén:</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-zinc-400">
            Fecha de reserva:{" "}
            <strong>
              {new Date(order.inventory_reserved_at).toLocaleDateString("es-VE", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </strong>
          </p>
        </div>
      )}

      {/* LISTA DE ÍTEMS DEL PEDIDO Y SU MATCH CON INVENTARIO */}
      <div className="space-y-3">
        {itemEvaluations.map((ev, idx) => {
          const {
            orderItem,
            invItem,
            selectedId,
            isAutoSuggested,
            matchReasons,
            requestedQty,
            availableStock,
            hasEnoughStock,
            missingQty,
            remainingStock,
          } = ev;

          return (
            <div
              key={orderItem.id || idx}
              className={`border-2 border-black dark:border-zinc-700 p-3.5 space-y-3 transition-colors ${
                isReserved
                  ? "bg-[#F8F5EE] dark:bg-zinc-900/80"
                  : hasEnoughStock
                  ? "bg-white dark:bg-zinc-800"
                  : "bg-[#FFF1F2] dark:bg-rose-950/20 border-rose-600 dark:border-rose-800"
              }`}
            >
              {/* FILA 1: NOMBRE DEL ÍTEM DEL PEDIDO + ATRIBUTOS */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/20 dark:border-zinc-700 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-black bg-black dark:bg-zinc-900 text-[#FACC15] px-2 py-0.5 border border-black dark:border-zinc-700">
                    ITEM #{idx + 1}
                  </span>
                  <span className="font-oswald text-base font-black uppercase text-black dark:text-white">
                    {orderItem.product === "camisa"
                      ? "Camisa / Franela"
                      : orderItem.product === "mousepad"
                      ? "Mousepad"
                      : orderItem.product === "rompecabezas"
                      ? "Rompecabezas"
                      : "Producto Especial"}
                  </span>
                  {orderItem.shirtFabric && (
                    <span className="font-mono text-[11px] bg-slate-100 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200 px-1.5 py-0.5 border border-black/40">
                      Tela: {orderItem.shirtFabric}
                    </span>
                  )}
                  {orderItem.shirtSize && (
                    <span className="font-mono text-[11px] bg-[#FACC15] text-black px-1.5 py-0.5 border border-black font-bold">
                      Talla {orderItem.shirtSize}
                    </span>
                  )}
                  {orderItem.shirtCut && (
                    <span className="font-mono text-[11px] bg-slate-100 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200 px-1.5 py-0.5 border border-black/40 uppercase">
                      {orderItem.shirtCut}
                    </span>
                  )}
                  {orderItem.shirtColor && (
                    <span className="font-mono text-[11px] bg-slate-100 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200 px-1.5 py-0.5 border border-black/40">
                      Color: {orderItem.shirtColor}
                    </span>
                  )}
                </div>

                <div className="font-mono text-xs font-black text-black dark:text-white bg-slate-100 dark:bg-zinc-700 px-2.5 py-1 border border-black">
                  Solicitado: {requestedQty} {requestedQty > 1 ? "unidades" : "unidad"}
                </div>
              </div>

              {/* FILA 2: VINCULADOR CON INVENTARIO + ESTADO EN VIVO */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* SELECTOR DESPLEGABLE CON SUGERENCIA */}
                <div className="md:col-span-7 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-[11px] font-bold uppercase text-slate-600 dark:text-zinc-400">
                      Insumo de Almacén Vinculado:
                    </label>
                    {isAutoSuggested && (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[#0891B2] dark:text-[#22D3EE] bg-cyan-50 dark:bg-cyan-950/40 px-1.5 py-0.5 border border-[#06B6D4]">
                        <Sparkles className="h-3 w-3" />
                        <span>Sugerido por el sistema ⚡</span>
                      </span>
                    )}
                  </div>

                  <select
                    disabled={isReserved || isPending}
                    value={selectedId || ""}
                    onChange={(e) => handleSelectInventoryItem(orderItem.id, e.target.value)}
                    className="w-full font-mono text-xs bg-white dark:bg-zinc-900 text-black dark:text-white border-2 border-black dark:border-zinc-700 p-2 shadow-[2px_2px_0px_#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#FACC15] disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Seleccionar insumo de inventario --</option>
                    {groupedInventory.prendas.length > 0 && (
                      <optgroup label="👕 PRENDAS Y BASES">
                        {groupedInventory.prendas.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} {inv.variant ? `(${inv.variant})` : ""} — Stock: {inv.quantity} {inv.unit}s
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {groupedInventory.materiales.length > 0 && (
                      <optgroup label="📦 MATERIALES Y BLANKS">
                        {groupedInventory.materiales.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} {inv.variant ? `(${inv.variant})` : ""} — Stock: {inv.quantity} {inv.unit}s
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {groupedInventory.telas.length > 0 && (
                      <optgroup label="🧵 TELAS POR METRO">
                        {groupedInventory.telas.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} {inv.variant ? `(${inv.variant})` : ""} — Stock: {inv.quantity} {inv.unit}s
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {groupedInventory.otros.length > 0 && (
                      <optgroup label="🔹 OTROS">
                        {groupedInventory.otros.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} {inv.variant ? `(${inv.variant})` : ""} — Stock: {inv.quantity} {inv.unit}s
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>

                  {matchReasons.length > 0 && !isReserved && (
                    <p className="font-mono text-[10px] text-slate-500 dark:text-zinc-400 italic">
                      Motivo de coincidencia: {matchReasons.join(" • ")}
                    </p>
                  )}
                </div>

                {/* VISUALIZADOR DE STOCK & SEMÁFORO CMYK */}
                <div className="md:col-span-5 flex flex-col justify-center gap-1.5 p-2 bg-[#F8F5EE] dark:bg-zinc-850 border border-black dark:border-zinc-700">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-600 dark:text-zinc-400">En almacén hoy:</span>
                    <strong className="text-black dark:text-white text-sm">
                      {invItem ? `${availableStock} ${invItem.unit}s` : "No asignado"}
                    </strong>
                  </div>

                  {invItem && (
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-slate-600 dark:text-zinc-400">Saldo tras reserva:</span>
                      <strong
                        className={`text-sm ${
                          hasEnoughStock
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-[#F43F5E] dark:text-rose-400"
                        }`}
                      >
                        {remainingStock} {invItem.unit}s
                      </strong>
                    </div>
                  )}

                  {/* BADGE DE DISPONIBILIDAD */}
                  <div className="pt-1">
                    {!invItem ? (
                      <span className="block text-center font-mono text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-400 px-2 py-0.5">
                        ⚠️ Insumo sin seleccionar
                      </span>
                    ) : isReserved ? (
                      <span className="block text-center font-mono text-[10px] font-bold bg-[#06B6D4] text-black border border-black px-2 py-0.5">
                        ✅ Apartado en almacén
                      </span>
                    ) : hasEnoughStock ? (
                      <span className="block text-center font-mono text-[10px] font-black bg-[#DCFCE7] text-emerald-950 border border-emerald-600 px-2 py-0.5">
                        ✅ Stock Suficiente Disponible
                      </span>
                    ) : (
                      <span className="block text-center font-mono text-[10px] font-black bg-[#FFE4E6] text-rose-950 border border-rose-600 px-2 py-0.5">
                        ⚠️ Faltan {missingQty} unidades
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RESUMEN FINAL Y BOTONES DE ACCIÓN */}
      <div className="pt-3 border-t-2 border-black dark:border-zinc-700 space-y-3">
        {/* ALERTA COLOQUIAL SI FALTA STOCK (REQUERIMIENTO DEL TALLER) */}
        {!isReserved && !allItemsHaveStock && (
          <div className="p-3 bg-[#FFE4E6] dark:bg-rose-950/40 border-2 border-rose-600 text-rose-950 dark:text-rose-200 font-mono text-xs space-y-1 shadow-[2px_2px_0px_#0A0A0A]">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="h-4 w-4 text-rose-700 shrink-0" />
              <span>
                Faltan {totalMissingQty} {totalMissingQty === 1 ? "unidad" : "unidades"} para completar este pedido.
              </span>
            </div>
            <p className="text-[11px] text-rose-900 dark:text-rose-300">
              Toca comprar tela o prendas antes de apartar. Registra la nueva compra en el módulo de Inventario y luego
              podrás apartarlo aquí.
            </p>
          </div>
        )}

        {/* ACCIONES */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="font-mono text-xs text-slate-600 dark:text-zinc-400">
            Total en este pedido:{" "}
            <strong className="text-black dark:text-white">
              {totalRequestedUnits} {totalRequestedUnits === 1 ? "unidad" : "unidades"}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            {!isReserved ? (
              <button
                type="button"
                onClick={handleReserveStock}
                disabled={!allItemsMapped || !allItemsHaveStock || isPending}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 font-mono text-xs font-black uppercase bg-[#16A34A] text-white border-2 border-black shadow-[3px_3px_0px_#0A0A0A] hover:bg-[#15803D] transition-all hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 w-full sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Apartando en Almacén...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Apartar del Inventario</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReleaseStock}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 font-mono text-xs font-bold uppercase bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 transition-all hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50 w-full sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Liberando...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Liberar / Devolver a Inventario</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
