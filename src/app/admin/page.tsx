import Link from "next/link";
import {
  ShieldCheck,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
  Eye,
  Calendar,
} from "lucide-react";
import { RegistrationMark } from "@/components/public/landing/alchemy-graphics";
import { getSessionUser } from "@/actions/auth.actions";
import { getOrders } from "@/actions/orders.actions";
import { OrdersKpiBar } from "@/components/admin/orders-kpi-bar";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";

export const revalidate = 0; // Datos frescos en cada carga

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  const { orders, totalCount } = await getOrders({ page: 1, limit: 6 });

  return (
    <div className="space-y-6">
      {/* BANNER DE BIENVENIDA Y ESTADO */}
      <div className="space-y-3 border-b-2 border-black pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-[#FACC15] text-black px-2.5 py-1 border-2 border-black font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#0A0A0A] -rotate-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>TERMINAL DE SOCIOS</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-white text-slate-700 px-2.5 py-1 border border-black font-mono text-[11px] font-bold uppercase">
              <span>TALLER LA DOLORITA • PETARE</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-slate-800 hover:text-black px-2.5 py-1 border border-black bg-white shadow-[1.5px_1.5px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <span>Tienda Pública</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pt-1">
          <div>
            <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-black leading-none">
              CONTROL DE PEDIDOS <span className="text-[#F43F5E]">ALQUIMIATEX</span>
            </h1>
            <p className="font-mono text-xs text-slate-600 pt-1">
              Operador activo:{" "}
              <strong className="text-black bg-white px-1 border border-black font-mono">
                {user?.email}
              </strong>
            </p>
          </div>

          <div className="text-right font-mono text-xs text-slate-500">
            <span>Terminal operativo v2.0</span>
          </div>
        </div>
      </div>

      {/* BLOQUE 1: KPIs MÉTRICOS */}
      <section className="space-y-2">
        <h2 className="font-oswald text-sm font-black uppercase tracking-wider text-black">
          [ 1. Salud del Taller & Producción ]
        </h2>
        <OrdersKpiBar orders={orders} />
      </section>

      {/* ACCESOS DIRECTOS A MÓDULOS ACTIVOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MÓDULO DE PEDIDOS */}
        <section className="bg-white border-2 border-black p-5 shadow-[5px_5px_0px_#0A0A0A] flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#581C87]" />
              <h3 className="font-oswald text-xl font-black uppercase text-black">
                Módulo de Pedidos
              </h3>
            </div>
            <p className="font-mono text-xs text-slate-600">
              6 estados oficiales, búsqueda en vivo, ficha técnica con WhatsApp y descarga de artes en ZIP.
            </p>
          </div>

          <Link
            href="/admin/pedidos"
            className="inline-flex items-center justify-center gap-2 font-mono text-xs font-black uppercase bg-[#FACC15] text-black border-2 border-black px-4 py-2.5 shadow-[3px_3px_0px_#0A0A0A] hover:bg-[#EAB308] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <span>Ver Pedidos ({totalCount})</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* MÓDULO DE INVENTARIO */}
        <section className="bg-white border-2 border-black p-5 shadow-[5px_5px_0px_#0A0A0A] flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#06B6D4] border border-black" />
              <h3 className="font-oswald text-xl font-black uppercase text-black">
                Módulo de Inventario
              </h3>
            </div>
            <p className="font-mono text-xs text-slate-600">
              Materiales, telas por metro, prendas terminadas y productos. Ajuste rápido +1 / -1 y alertas de stock bajo.
            </p>
          </div>

          <Link
            href="/admin/inventario"
            className="inline-flex items-center justify-center gap-2 font-mono text-xs font-black uppercase bg-[#06B6D4] text-black border-2 border-black px-4 py-2.5 shadow-[3px_3px_0px_#0A0A0A] hover:opacity-90 transition-all hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <span>Entrar a Inventario</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>

      {/* BLOQUE 2: ÚLTIMOS PEDIDOS REGISTRADOS */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-oswald text-sm font-black uppercase tracking-wider text-black">
            [ 2. Cola Reciente en Vivo ]
          </h2>
          <Link
            href="/admin/pedidos"
            className="font-mono text-xs text-slate-700 hover:text-black underline font-bold"
          >
            Ver todos los pedidos →
          </Link>
        </div>

        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#0A0A0A] overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <ShoppingBag className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="font-mono text-xs text-slate-600">
                Aún no hay pedidos en la base de datos de Supabase.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-[#F8F5EE] border-b-2 border-black font-oswald text-xs uppercase tracking-wider text-black">
                    <th className="p-3 border-r border-black">Código</th>
                    <th className="p-3 border-r border-black">Cliente</th>
                    <th className="p-3 border-r border-black">Prendas</th>
                    <th className="p-3 border-r border-black">Entrega</th>
                    <th className="p-3 border-r border-black">Estado</th>
                    <th className="p-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FFFDF7] transition-colors">
                      <td className="p-3 border-r border-black align-middle font-mono font-black">
                        <span className="bg-[#FACC15] text-black px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#0A0A0A]">
                          {order.order_code}
                        </span>
                      </td>
                      <td className="p-3 border-r border-black align-middle">
                        <div className="font-bold text-black">{order.customer_name}</div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {order.customer_phone}
                        </div>
                      </td>
                      <td className="p-3 border-r border-black align-middle font-mono text-[11px] text-slate-700">
                        {order.items?.length || 0} prendas
                      </td>
                      <td className="p-3 border-r border-black align-middle font-mono text-[11px]">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-500" />
                          <span>{order.delivery_date || "Por definir"}</span>
                        </span>
                      </td>
                      <td className="p-3 border-r border-black align-middle">
                        <OrderStatusBadge status={order.status} size="sm" />
                      </td>
                      <td className="p-3 align-middle text-center">
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase bg-white text-black border border-black px-2 py-0.5 shadow-[1.5px_1.5px_0px_#0A0A0A] hover:bg-[#FACC15] transition-all"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Ficha</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* PIE DE PÁGINA DEL PANEL */}
      <div className="pt-6 border-t border-dashed border-black flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-600">
        <p>© {new Date().getFullYear()} AlquimiaTex • Terminal de Control de Socios</p>
        <RegistrationMark label="ADMIN_ORDERS_V2_ACTIVE" />
      </div>
    </div>
  );
}
