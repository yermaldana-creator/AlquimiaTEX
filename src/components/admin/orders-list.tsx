"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MessageCircle,
  ExternalLink,
  Calendar,
  X,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
} from "lucide-react";
import { ORDER_STATUS_CONFIG, ORDER_STATUSES, normalizeOrderStatus } from "@/lib/constants";
import { getOrders } from "@/actions/orders.actions";
import { OrderStatusSelect } from "./order-status-select";
import type { AdminOrder, OrderStatus } from "@/types";

interface OrdersListProps {
  initialOrders: AdminOrder[];
  initialTotalCount: number;
}

const PAGE_SIZE = 20;

function cleanPhoneForWhatsApp(phone: string): string {
  if (!phone) return "";
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
    return {
      label: `Atrasado (${Math.abs(diffDays)}d)`,
      color: "bg-red-100 text-red-900 border-red-500 font-bold",
    };
  }
  if (diffDays === 0) {
    return {
      label: "¡Entrega Hoy!",
      color: "bg-[#FACC15] text-black border-black font-black",
    };
  }
  if (diffDays === 1) {
    return {
      label: "Entrega Mañana",
      color: "bg-amber-100 text-amber-900 border-amber-400 font-bold",
    };
  }
  return {
    label: `En ${diffDays} días`,
    color: "bg-slate-100 text-slate-700 border-slate-300",
  };
}

export function OrdersList({ initialOrders, initialTotalCount }: OrdersListProps) {
  const router = useRouter();

  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);
  const [page, setPage] = useState<number>(1);
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // 1. Debounce de 300ms en el buscador antes de disparar la consulta a Supabase
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // 2. Fetch cuando cambie debouncedSearch, selectedStatus o page
  useEffect(() => {
    let isMounted = true;
    startTransition(async () => {
      try {
        const result = await getOrders({
          page,
          limit: PAGE_SIZE,
          status: selectedStatus,
          search: debouncedSearch,
        });
        if (isMounted) {
          setOrders(result.orders);
          setTotalCount(result.totalCount);
        }
      } catch (err) {
        console.error("Error al cargar pedidos filtrados:", err);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, selectedStatus, page]);

  // Actualización reactiva al cambiar de estado localmente
  const handleStatusUpdated = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Recarga manual
  const handleRefresh = () => {
    startTransition(async () => {
      const result = await getOrders({
        page,
        limit: PAGE_SIZE,
        status: selectedStatus,
        search: debouncedSearch,
      });
      setOrders(result.orders);
      setTotalCount(result.totalCount);
    });
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  // Conteo local por estado para las pestañas
  const countsByStatus = useMemo(() => {
    const counts: Record<string, number> = { todos: totalCount };
    ORDER_STATUSES.forEach((s) => {
      counts[s] = 0;
    });
    orders.forEach((o) => {
      const norm = normalizeOrderStatus(o.status);
      if (counts[norm] !== undefined) {
        counts[norm]++;
      }
    });
    return counts;
  }, [orders, totalCount]);

  return (
    <div className="space-y-4">
      {/* BARRA SUPERIOR DE BÚSQUEDA Y FILTROS */}
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* BUSCADOR CON DEBOUNCE (300ms) */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por #ALQ, cliente o teléfono (300ms live)..."
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

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-zinc-700 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
              title="Refrescar lista de pedidos"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refrescar</span>
            </button>
          </div>
        </div>

        {/* PESTAÑAS POR ESTADO (LOS 6 OFICIALES + TODOS) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
          <button
            onClick={() => {
              setSelectedStatus("todos");
              setPage(1);
            }}
            className={`px-3 py-1.5 border-2 border-black dark:border-zinc-700 font-bold uppercase transition-all shrink-0 ${
              selectedStatus === "todos"
                ? "bg-black dark:bg-zinc-800 text-[#FACC15] shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                : "bg-[#F8F5EE] dark:bg-zinc-900 text-slate-800 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 shadow-[1px_1px_0px_#0A0A0A] dark:shadow-[1px_1px_0px_#000000]"
            }`}
          >
            Todos ({totalCount})
          </button>

          {ORDER_STATUSES.map((statusKey) => {
            const config = ORDER_STATUS_CONFIG[statusKey];
            const isSelected = selectedStatus === statusKey;
            const count = countsByStatus[statusKey] || 0;

            return (
              <button
                key={statusKey}
                onClick={() => {
                  setSelectedStatus(statusKey);
                  setPage(1);
                }}
                className={`px-3 py-1.5 border-2 border-black dark:border-zinc-700 font-bold uppercase transition-all shrink-0 ${
                  isSelected
                    ? "bg-[#581C87] text-[#FACC15] shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                    : `${config.bg} ${config.text} hover:opacity-90 shadow-[1px_1px_0px_#0A0A0A] dark:shadow-[1px_1px_0px_#000000]`
                }`}
              >
                <span>{config.shortLabel}</span>
                {count > 0 && (
                  <span className="ml-1.5 px-1 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 text-[10px] border border-black dark:border-zinc-600 font-mono">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENEDOR DE RESULTADOS: TABLA EN DESKTOP / TARJETAS EN MOBILE */}
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[6px_6px_0px_#0A0A0A] dark:shadow-[6px_6px_0px_#000000] overflow-hidden">
        {isPending ? (
          <div className="p-4 space-y-3 animate-pulse">
            <div className="border-b-2 border-black dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 p-3 grid grid-cols-12 gap-2">
              <div className="col-span-2 h-4 bg-slate-200 dark:bg-zinc-700" />
              <div className="col-span-4 h-4 bg-slate-200 dark:bg-zinc-700" />
              <div className="col-span-2 h-4 bg-slate-200 dark:bg-zinc-700" />
              <div className="col-span-2 h-4 bg-slate-200 dark:bg-zinc-700" />
              <div className="col-span-2 h-4 bg-slate-200 dark:bg-zinc-700" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="py-3 px-2 grid grid-cols-12 gap-2 items-center border-b border-slate-100 dark:border-zinc-800 last:border-0"
              >
                <div className="col-span-2">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-zinc-700" />
                </div>
                <div className="col-span-4 space-y-1">
                  <div className="h-4 w-36 bg-slate-200 dark:bg-zinc-700" />
                  <div className="h-3 w-28 bg-slate-200 dark:bg-zinc-700" />
                </div>
                <div className="col-span-2">
                  <div className="h-4 w-16 bg-slate-200 dark:bg-zinc-700" />
                </div>
                <div className="col-span-2">
                  <div className="h-6 w-24 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
                </div>
                <div className="col-span-2 flex justify-end">
                  <div className="h-7 w-20 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700 shadow-[1.5px_1.5px_0px_#0A0A0A]" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="h-10 w-10 text-slate-400 dark:text-zinc-600 mx-auto" />
            <h3 className="font-oswald text-lg font-black uppercase text-black dark:text-white">
              No se encontraron pedidos
            </h3>
            <p className="font-mono text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
              {searchInput || selectedStatus !== "todos"
                ? "Ningún pedido coincide con la búsqueda o el filtro actual."
                : "No hay pedidos en la base de datos de Supabase."}
            </p>
            {(searchInput || selectedStatus !== "todos") && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSelectedStatus("todos");
                  setPage(1);
                }}
                className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase px-3 py-1.5 bg-[#FACC15] text-black border-2 border-black shadow-[2px_2px_0px_#0A0A0A]"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        ) : (
          <>
            {/* VISTA ESCRITORIO (TABLA RESPONSIVE) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="bg-[#F8F5EE] dark:bg-zinc-900 border-b-2 border-black dark:border-zinc-700 font-oswald text-xs uppercase tracking-wider text-black dark:text-zinc-200">
                    <th className="p-3 border-r border-black dark:border-zinc-700">Código</th>
                    <th className="p-3 border-r border-black dark:border-zinc-700">Cliente / Contacto</th>
                    <th className="p-3 border-r border-black dark:border-zinc-700">Prendas / Resumen</th>
                    <th className="p-3 border-r border-black dark:border-zinc-700">Entrega Deseada</th>
                    <th className="p-3 border-r border-black dark:border-zinc-700">Modalidad / Pago</th>
                    <th className="p-3 border-r border-black dark:border-zinc-700">Estado</th>
                    <th className="p-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black dark:divide-zinc-700 text-xs">
                  {orders.map((order) => {
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
                        onClick={() => router.push(`/admin/pedidos/${order.id}`)}
                        className="hover:bg-[#FFFDF7] dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                      >
                        {/* CÓDIGO */}
                        <td className="p-3 border-r border-black dark:border-zinc-700 align-top">
                          <span className="font-mono text-xs font-black bg-[#FACC15] text-black px-1.5 py-0.5 border border-black shadow-[1.5px_1.5px_0px_#0A0A0A] inline-block group-hover:scale-105 transition-transform">
                            {order.order_code}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400 block pt-1">
                            {order.created_at
                              ? new Date(order.created_at).toLocaleDateString("es-VE", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : ""}
                          </span>
                        </td>

                        {/* CLIENTE & WHATSAPP */}
                        <td
                          className="p-3 border-r border-black dark:border-zinc-700 align-top space-y-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="font-bold text-black dark:text-white text-sm">
                            {order.customer_name}
                          </div>
                          <div className="font-mono text-[11px] text-slate-700 dark:text-zinc-300">
                            {order.customer_phone}
                          </div>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-2 py-0.5 border border-emerald-600 dark:border-emerald-700 transition-colors"
                            title="Escribir al WhatsApp del cliente"
                          >
                            <MessageCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            <span>WhatsApp</span>
                            <ExternalLink className="h-2.5 w-2.5 text-emerald-700 dark:text-emerald-400" />
                          </a>
                        </td>

                        {/* PRODUCTOS / DESGLOSE */}
                        <td className="p-3 border-r border-black dark:border-zinc-700 align-top space-y-1 max-w-xs">
                          {order.items && order.items.length > 0 ? (
                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <div
                                  key={item.id || idx}
                                  className="font-mono text-[11px] leading-tight text-slate-800 dark:text-zinc-200 bg-[#F8F5EE] dark:bg-zinc-900 p-1.5 border border-slate-300 dark:border-zinc-700"
                                >
                                  <div className="font-bold text-black dark:text-white flex items-center justify-between">
                                    <span>
                                      {item.quantity}x{" "}
                                      {item.product === "camisa" ? "Camisa" : item.product}
                                    </span>
                                    {item.aiGeneratedImage && (
                                      <span className="text-[9px] bg-[#581C87] text-[#FACC15] px-1 border border-black font-bold">
                                        IA
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-600 dark:text-zinc-400">
                                    {item.shirtSize && `Talla ${item.shirtSize}`}
                                    {item.shirtCut && ` • ${item.shirtCut}`}
                                    {item.shirtFabric && ` • ${item.shirtFabric}`}
                                    {item.mousepadSize && `Medida ${item.mousepadSize}`}
                                    {item.puzzlePieces && `${item.puzzlePieces} piezas`}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="font-mono text-slate-400 dark:text-zinc-500 text-[11px]">
                              Sin items registrados
                            </span>
                          )}
                        </td>

                        {/* ENTREGA */}
                        <td className="p-3 border-r border-black dark:border-zinc-700 align-top space-y-1">
                          <div className="font-mono text-xs font-bold text-black dark:text-zinc-100 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
                            <span>{order.delivery_date || "Por definir"}</span>
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
                        <td className="p-3 border-r border-black dark:border-zinc-700 align-top space-y-1">
                          <span
                            className={`inline-block font-mono text-[10px] font-black uppercase px-2 py-0.5 border border-black dark:border-zinc-700 ${
                              isDocena
                                ? "bg-[#581C87] text-[#FACC15]"
                                : "bg-white dark:bg-zinc-800 text-black dark:text-zinc-200"
                            }`}
                          >
                            {isDocena ? "Docena (50% Abono)" : "Al Detal (100%)"}
                          </span>
                          <div className="font-mono text-[11px] text-slate-600 dark:text-zinc-400 uppercase">
                            {order.payment_method || "No especificado"}
                          </div>
                        </td>

                        {/* ESTADO CON SELECTOR EN LÍNEA */}
                        <td
                          className="p-3 border-r border-black dark:border-zinc-700 align-top space-y-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <OrderStatusSelect
                            orderId={order.id}
                            currentStatus={order.status}
                            onStatusUpdated={(newStatus) =>
                              handleStatusUpdated(order.id, newStatus)
                            }
                            size="sm"
                          />
                        </td>

                        {/* ACCIÓN (VER FICHA) */}
                        <td
                          className="p-3 align-top text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            href={`/admin/pedidos/${order.id}`}
                            className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-zinc-700 px-2.5 py-1 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] hover:bg-[#FACC15] dark:hover:bg-[#FACC15] dark:hover:text-black transition-all hover:translate-x-0.5 hover:translate-y-0.5"
                            title="Ver ficha técnica detallada"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Ver</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* VISTA MÓVIL (TARJETAS APILADAS) */}
            <div className="block md:hidden divide-y-2 divide-black dark:divide-zinc-700">
              {orders.map((order) => {
                const deliveryBadge = getDeliveryBadge(order.delivery_date);
                const waNumber = cleanPhoneForWhatsApp(order.customer_phone);
                const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
                  `¡Hola ${order.customer_name}! Te saludamos desde el taller AlquimiaTex respecto a tu pedido ${order.order_code}.`
                )}`;
                const isDocena =
                  (order.order_pricing_type || order.payment_type) === "docena";

                return (
                  <div
                    key={order.id}
                    className="p-4 space-y-3 bg-white dark:bg-[#1E1E1E] hover:bg-[#FFFDF7] dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-black dark:border-zinc-700 pb-2">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="font-mono text-xs font-black bg-[#FACC15] text-black px-2 py-0.5 border border-black shadow-[1.5px_1.5px_0px_#0A0A0A] inline-flex items-center gap-1"
                      >
                        <span>{order.order_code}</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>

                      <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString("es-VE", {
                              day: "2-digit",
                              month: "short",
                            })
                          : ""}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-black dark:text-white">
                          {order.customer_name}
                        </div>
                        <div className="font-mono text-xs text-slate-600 dark:text-zinc-400">
                          {order.customer_phone}
                        </div>
                      </div>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-2 py-1 border border-emerald-600 dark:border-emerald-700"
                      >
                        <MessageCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    {/* PRENDAS RESUMEN */}
                    <div className="bg-[#F8F5EE] dark:bg-zinc-900 p-2 border border-slate-300 dark:border-zinc-700 font-mono text-xs space-y-1">
                      <div className="font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                        <span>Items ({order.items?.length || 0})</span>
                        <span className="text-[10px] uppercase">
                          {isDocena ? "Al Mayor" : "Al Detal"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-zinc-400">
                        {order.items?.map((item) => `${item.quantity}x ${item.product}`).join(", ")}
                      </div>
                    </div>

                    {/* ENTREGA Y ESTADO */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-500 dark:text-zinc-400" />
                          {order.delivery_date || "Sin fecha"}
                        </span>
                        {deliveryBadge && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-mono border ${deliveryBadge.color}`}
                          >
                            {deliveryBadge.label}
                          </span>
                        )}
                      </div>

                      <OrderStatusSelect
                        orderId={order.id}
                        currentStatus={order.status}
                        onStatusUpdated={(newStatus) =>
                          handleStatusUpdated(order.id, newStatus)
                        }
                        size="sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* PIE DE TABLA CON PAGINADOR (20 POR PÁGINA) */}
        <div className="bg-[#F8F5EE] dark:bg-zinc-900 border-t-2 border-black dark:border-zinc-700 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs text-slate-700 dark:text-zinc-300">
          <div>
            Mostrando página <strong>{page}</strong> de <strong>{totalPages}</strong> (
            <strong>{totalCount}</strong> pedidos en total)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isPending}
              className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-zinc-700 font-bold uppercase shadow-[1.5px_1.5px_0px_#0A0A0A] dark:shadow-[1.5px_1.5px_0px_#000000] hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Anterior</span>
            </button>

            <span className="px-2.5 py-1 bg-[#FACC15] text-black border-2 border-black font-black shadow-[1.5px_1.5px_0px_#0A0A0A]">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isPending}
              className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-zinc-700 font-bold uppercase shadow-[1.5px_1.5px_0px_#0A0A0A] dark:shadow-[1.5px_1.5px_0px_#000000] hover:bg-slate-100 dark:hover:bg-zinc-700 disabled:opacity-40 transition-all"
            >
              <span>Siguiente</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
