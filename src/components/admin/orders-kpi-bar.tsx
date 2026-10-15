import { Package, Clock, Flame, CheckCircle2 } from "lucide-react";
import type { AdminOrder } from "@/types";

interface OrdersKpiBarProps {
  orders: AdminOrder[];
}

export function OrdersKpiBar({ orders }: OrdersKpiBarProps) {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pendiente_contacto").length;
  const inWorkshopOrders = orders.filter(
    (o) => o.status === "en_confeccion" || o.status === "abonado"
  ).length;
  const readyOrders = orders.filter((o) => o.status === "listo").length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. TOTAL PEDIDOS */}
      <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#0A0A0A] space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-slate-600">
            TOTAL HISTÓRICO
          </span>
          <Package className="h-4 w-4 text-black" />
        </div>
        <div className="font-oswald text-3xl sm:text-4xl font-black text-black">
          {totalOrders}
        </div>
        <p className="font-mono text-[11px] text-slate-500">
          Órdenes en base de datos
        </p>
      </div>

      {/* 2. PENDIENTES DE CONTACTO */}
      <div className="bg-[#FEFCE8] border-2 border-black p-4 shadow-[4px_4px_0px_#0A0A0A] space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-amber-800">
            POR CONTACTAR
          </span>
          <Clock className="h-4 w-4 text-amber-600" />
        </div>
        <div className="font-oswald text-3xl sm:text-4xl font-black text-amber-900">
          {pendingOrders}
        </div>
        <p className="font-mono text-[11px] text-amber-700">
          Nuevos pedidos sin abono
        </p>
      </div>

      {/* 3. EN PLANCHA / TALLER */}
      <div className="bg-[#FAF5FF] border-2 border-black p-4 shadow-[4px_4px_0px_#0A0A0A] space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-purple-800">
            EN PRODUCCIÓN
          </span>
          <Flame className="h-4 w-4 text-[#581C87]" />
        </div>
        <div className="font-oswald text-3xl sm:text-4xl font-black text-[#581C87]">
          {inWorkshopOrders}
        </div>
        <p className="font-mono text-[11px] text-purple-700">
          Abonados y en máquinas
        </p>
      </div>

      {/* 4. LISTOS PARA ENTREGA */}
      <div className="bg-[#F0FDF4] border-2 border-black p-4 shadow-[4px_4px_0px_#0A0A0A] space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-emerald-800">
            LISTOS / EMPACADOS
          </span>
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="font-oswald text-3xl sm:text-4xl font-black text-emerald-900">
          {readyOrders}
        </div>
        <p className="font-mono text-[11px] text-emerald-700">
          Esperando retiro o envío
        </p>
      </div>
    </div>
  );
}
