import { Package, Clock, Flame, CheckCircle2 } from "lucide-react";
import { normalizeOrderStatus } from "@/lib/constants";
import type { AdminOrder } from "@/types";

interface OrdersKpiBarProps {
  orders: AdminOrder[];
}

export function OrdersKpiBar({ orders }: OrdersKpiBarProps) {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => normalizeOrderStatus(o.status) === "pendiente_contacto"
  ).length;
  const inWorkshopOrders = orders.filter((o) => {
    const s = normalizeOrderStatus(o.status);
    return s === "en_produccion" || s === "abono_verificado";
  }).length;
  const readyOrders = orders.filter(
    (o) => normalizeOrderStatus(o.status) === "listo_para_entrega"
  ).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. TOTAL PEDIDOS */}
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-slate-600 dark:text-zinc-400">
            TOTAL HISTÓRICO
          </span>
          <Package className="h-4 w-4 text-black dark:text-white" />
        </div>
        <div className="font-oswald text-3xl sm:text-4xl font-black text-black dark:text-white">
          {totalOrders}
        </div>
        <p className="font-mono text-[11px] text-slate-500 dark:text-zinc-400">
          Órdenes en base de datos
        </p>
      </div>

      {/* 2. PENDIENTES DE CONTACTO */}
      <div className="bg-[#FEFCE8] dark:bg-amber-950/30 border-2 border-black dark:border-amber-800/60 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-amber-800 dark:text-amber-300">
            POR CONTACTAR
          </span>
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="font-oswald text-3xl sm:text-4xl font-black text-amber-900 dark:text-amber-200">
          {pendingOrders}
        </div>
        <p className="font-mono text-[11px] text-amber-700 dark:text-amber-400/80">
          Nuevos pedidos sin abono
        </p>
      </div>

      {/* 3. EN PRODUCCIÓN / ABONO */}
      <div className="bg-[#FAF5FF] dark:bg-purple-950/30 border-2 border-black dark:border-purple-800/60 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-purple-800 dark:text-purple-300">
            EN PRODUCCIÓN
          </span>
          <Flame className="h-4 w-4 text-[#581C87] dark:text-purple-400" />
        </div>
        <div className="font-oswald text-3xl sm:text-4xl font-black text-[#581C87] dark:text-purple-200">
          {inWorkshopOrders}
        </div>
        <p className="font-mono text-[11px] text-purple-700 dark:text-purple-400/80">
          Abonados y en máquinas
        </p>
      </div>

      {/* 4. LISTOS PARA ENTREGA */}
      <div className="bg-[#F0FDF4] dark:bg-emerald-950/30 border-2 border-black dark:border-emerald-800/60 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
            LISTOS / EMPACADOS
          </span>
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="font-oswald text-3xl sm:text-4xl font-black text-emerald-900 dark:text-emerald-200">
          {readyOrders}
        </div>
        <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400/80">
          Esperando retiro o despacho
        </p>
      </div>
    </div>
  );
}
