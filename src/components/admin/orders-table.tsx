"use client";

import { useState, useMemo } from "react";
import {
  Search,
  MessageCircle,
  ExternalLink,
  Calendar,
  X,
  ShoppingBag,
} from "lucide-react";
import type { AdminOrder, OrderStatus } from "@/types";
import { OrderStatusSelect, ORDER_STATUS_CONFIG } from "./order-status-badge";

interface OrdersTableProps {
  initialOrders: AdminOrder[];
}

function cleanPhoneForWhatsApp(phone: string): string {
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("0")) {
    clean = "58" + clean.substring(1);
  }
  if (!clean.startsWith("58") && clean.length === 10) {
    clean = "58" + clean;
  }
  return clean;
}

function getDeliveryBadge(dateStr: string) {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `Atrasado (${Math.abs(diffDays)}d)`, color: "bg-red-100 text-red-900 border-red-500" };
  }
  if (diffDays === 0) {
    return { label: "¡Entrega Hoy!", color: "bg-[#FACC15] text-black border-black font-black" };
  }
  if (diffDays === 1) {
    return { label: "Entrega Mañana", color: "bg-amber-100 text-amber-900 border-amber-400" };
  }
  return { label: `En ${diffDays} días`, color: "bg-slate-100 text-slate-700 border-slate-300" };
}

export function OrdersTable({ initialOrders }: OrdersTableProps) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [selectedPricing, setSelectedPricing] = useState<string>("todos");

  // Actualizar estado local cuando un selector de estado cambia
  const handleStatusUpdated = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Conteo de pedidos por estado para las pestañas
  const countsByStatus = useMemo(() => {
    const counts: Record<string, number> = { todos: orders.length };
    Object.keys(ORDER_STATUS_CONFIG).forEach((k) => {
      counts[k] = 0;
    });
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });
    return counts;
  }, [orders]);

  // Filtrado reactivo en tiempo real
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Filtro por Estado
      if (selectedStatus !== "todos" && order.status !== selectedStatus) {
        return false;
      }

      // 2. Filtro por Modalidad (Unidad / Docena)
      if (selectedPricing !== "todos") {
        const orderType = order.order_pricing_type || order.payment_type || "unidad";
        if (selectedPricing === "docena" && orderType !== "docena") return false;
        if (selectedPricing === "unidad" && orderType !== "unidad") return false;
      }

      // 3. Filtro por Buscador (Código, Nombre, Teléfono)
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = order.order_code?.toLowerCase().includes(q);
        const matchName = order.customer_name?.toLowerCase().includes(q);
        const matchPhone = order.customer_phone?.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchPhone) {
          return false;
        }
      }

      return true;
    });
  }, [orders, selectedStatus, selectedPricing, searchQuery]);

  return (
    <div className="space-y-4">
      {/* BARRA SUPERIOR DE BÚSQUEDA Y FILTROS */}
      <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#0A0A0A] space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* BUSCADOR EN VIVO */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código #ALQ, nombre o teléfono..."
              className="w-full pl-9 pr-8 py-2 bg-[#F8F5EE] border-2 border-black font-mono text-xs text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-[2px_2px_0px_#0A0A0A]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* FILTRO POR MODALIDAD */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="font-bold text-slate-600 hidden sm:inline">Tipo:</span>
            <select
              value={selectedPricing}
              onChange={(e) => setSelectedPricing(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F8F5EE] border-2 border-black font-bold uppercase shadow-[2px_2px_0px_#0A0A0A] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            >
              <option value="todos">Todos los Tipos</option>
              <option value="unidad">Al Detal (Unidad)</option>
              <option value="docena">Al Mayor (Docena)</option>
            </select>
          </div>
        </div>

        {/* PESTAÑAS TÁCTILES POR ESTADO */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
          <button
            onClick={() => setSelectedStatus("todos")}
            className={`px-3 py-1.5 border-2 border-black font-bold uppercase transition-all shrink-0 ${
              selectedStatus === "todos"
                ? "bg-black text-[#FACC15] shadow-[2px_2px_0px_#0A0A0A] -translate-y-0.5"
                : "bg-[#F8F5EE] text-slate-800 hover:bg-white shadow-[1px_1px_0px_#0A0A0A]"
            }`}
          >
            Todos ({countsByStatus.todos || 0})
          </button>

          {Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => {
            const count = countsByStatus[key] || 0;
            const isSelected = selectedStatus === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedStatus(key)}
                className={`px-3 py-1.5 border-2 border-black font-bold uppercase transition-all shrink-0 ${
                  isSelected
                    ? "bg-[#581C87] text-[#FACC15] shadow-[2px_2px_0px_#0A0A0A] -translate-y-0.5"
                    : `${config.bg} ${config.text} hover:opacity-90 shadow-[1px_1px_0px_#0A0A0A]`
                }`}
              >
                <span>{config.shortLabel}</span>
                <span className="ml-1.5 px-1 bg-white text-black text-[10px] border border-black">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TABLA PRINCIPAL DE PEDIDOS */}
      <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#0A0A0A] overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="font-oswald text-lg font-black uppercase text-black">
              No se encontraron pedidos
            </h3>
            <p className="font-mono text-xs text-slate-600 max-w-md mx-auto">
              {searchQuery || selectedStatus !== "todos" || selectedPricing !== "todos"
                ? "Ningún pedido coincide con los filtros o búsqueda actuales."
                : "Aún no hay pedidos registrados en Supabase. Puedes crear uno de prueba en la web pública."}
            </p>
            {(searchQuery || selectedStatus !== "todos" || selectedPricing !== "todos") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("todos");
                  setSelectedPricing("todos");
                }}
                className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase px-3 py-1.5 bg-[#FACC15] text-black border-2 border-black shadow-[2px_2px_0px_#0A0A0A]"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="bg-[#F8F5EE] border-b-2 border-black font-oswald text-xs uppercase tracking-wider text-black">
                  <th className="p-3 border-r border-black">Código</th>
                  <th className="p-3 border-r border-black">Cliente / Contacto</th>
                  <th className="p-3 border-r border-black">Prendas / Artículos</th>
                  <th className="p-3 border-r border-black">Entrega Prometida</th>
                  <th className="p-3 border-r border-black">Modalidad / Pago</th>
                  <th className="p-3">Estado del Pedido</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black text-xs">
                {filteredOrders.map((order) => {
                  const deliveryBadge = getDeliveryBadge(order.delivery_date);
                  const waNumber = cleanPhoneForWhatsApp(order.customer_phone);
                  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
                    `¡Hola ${order.customer_name}! Te saludamos desde el taller AlquimiaTex respecto a tu pedido ${order.order_code}.`
                  )}`;

                  const isDocena =
                    (order.order_pricing_type || order.payment_type) === "docena";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#FFFDF7] transition-colors"
                    >
                      {/* CÓDIGO */}
                      <td className="p-3 border-r border-black align-top">
                        <span className="font-mono text-xs font-black bg-[#FACC15] text-black px-1.5 py-0.5 border border-black shadow-[1.5px_1.5px_0px_#0A0A0A] block text-center">
                          {order.order_code}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 block text-center pt-1">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString("es-VE", {
                                day: "2-digit",
                                month: "short",
                              })
                            : ""}
                        </span>
                      </td>

                      {/* CLIENTE & WHATSAPP */}
                      <td className="p-3 border-r border-black align-top space-y-1">
                        <div className="font-bold text-black text-sm">
                          {order.customer_name}
                        </div>
                        <div className="font-mono text-[11px] text-slate-700">
                          {order.customer_phone}
                        </div>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 border border-emerald-600 transition-colors"
                          title="Escribir al WhatsApp del cliente"
                        >
                          <MessageCircle className="h-3 w-3 text-emerald-600" />
                          <span>WhatsApp</span>
                          <ExternalLink className="h-2.5 w-2.5 text-emerald-700" />
                        </a>
                      </td>

                      {/* PRODUCTOS / DESGLOSE */}
                      <td className="p-3 border-r border-black align-top space-y-1.5 max-w-xs">
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div
                                key={item.id || idx}
                                className="font-mono text-[11px] leading-tight text-slate-800 bg-[#F8F5EE] p-1.5 border border-slate-300"
                              >
                                <div className="font-bold text-black flex items-center justify-between">
                                  <span>
                                    {item.quantity}x {item.product === "camisa" ? "Camisa" : item.product}
                                  </span>
                                  {item.aiGeneratedImage && (
                                    <span className="text-[9px] bg-[#581C87] text-[#FACC15] px-1 border border-black">
                                      IA
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-600">
                                  {item.shirtSize && `Talla ${item.shirtSize}`}
                                  {item.shirtCut && ` • ${item.shirtCut}`}
                                  {item.shirtColor && ` • ${item.shirtColor}`}
                                  {item.shirtFabric && ` • ${item.shirtFabric}`}
                                  {item.mousepadSize && `Medida ${item.mousepadSize}`}
                                  {item.puzzlePieces && `${item.puzzlePieces} piezas`}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="font-mono text-slate-400 text-[11px]">
                            Sin items registrados
                          </span>
                        )}
                      </td>

                      {/* ENTREGA */}
                      <td className="p-3 border-r border-black align-top space-y-1">
                        <div className="font-mono text-xs font-bold text-black flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          <span>{order.delivery_date}</span>
                        </div>
                        {deliveryBadge && (
                          <span
                            className={`inline-block px-1.5 py-0.5 text-[10px] font-mono border ${deliveryBadge.color}`}
                          >
                            {deliveryBadge.label}
                          </span>
                        )}
                      </td>

                      {/* PAGO / MODALIDAD */}
                      <td className="p-3 border-r border-black align-top space-y-1">
                        <span
                          className={`inline-block font-mono text-[10px] font-black uppercase px-2 py-0.5 border border-black ${
                            isDocena
                              ? "bg-[#581C87] text-[#FACC15]"
                              : "bg-white text-black"
                          }`}
                        >
                          {isDocena ? "Docena (50% Abono)" : "Al Detal (100%)"}
                        </span>
                        <div className="font-mono text-[11px] text-slate-600 uppercase">
                          {order.payment_method || "No especificado"}
                        </div>
                      </td>

                      {/* ESTADO CON SELECTOR EN LÍNEA */}
                      <td className="p-3 align-top space-y-2">
                        <OrderStatusSelect
                          orderId={order.id}
                          currentStatus={order.status}
                          onStatusUpdated={(newStatus) =>
                            handleStatusUpdated(order.id, newStatus)
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PIE DE TABLA CON CONTEO */}
        <div className="bg-[#F8F5EE] border-t-2 border-black p-3 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-xs text-slate-700">
          <div>
            Mostrando <strong>{filteredOrders.length}</strong> de{" "}
            <strong>{orders.length}</strong> pedidos registrados.
          </div>
          <div className="text-[11px] text-slate-500">
            * El cambio de estado se guarda automáticamente en Supabase.
          </div>
        </div>
      </div>
    </div>
  );
}
