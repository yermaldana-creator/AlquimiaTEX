import Link from "next/link";
import {
  ShieldCheck,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
  Eye,
  Calendar,
  Calculator,
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
      <div className="space-y-3 border-b-2 border-black dark:border-zinc-800 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-[#FACC15] text-black px-2.5 py-1 border-2 border-black dark:border-zinc-700 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] -rotate-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>TERMINAL DE SOCIOS</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-white dark:bg-[#262626] text-slate-700 dark:text-zinc-300 px-2.5 py-1 border border-black dark:border-zinc-700 font-mono text-[11px] font-bold uppercase">
              <span>TALLER LA DOLORITA • PETARE</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-slate-800 dark:text-zinc-200 hover:text-black dark:hover:text-white px-2.5 py-1 border border-black dark:border-zinc-700 bg-white dark:bg-[#262626] shadow-[1.5px_1.5px_0px_#0A0A0A] dark:shadow-[1.5px_1.5px_0px_#000000] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <span>Tienda Pública</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pt-1">
          <div>
            <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-black dark:text-[#F5F5F5] leading-none">
              CONTROL DE PEDIDOS <span className="text-[#F43F5E]">ALQUIMIATEX</span>
            </h1>
            <p className="font-mono text-xs text-slate-600 dark:text-zinc-400 pt-1">
              Operador activo:{" "}
              <strong className="text-black dark:text-[#F5F5F5] bg-white dark:bg-[#262626] px-1 border border-black dark:border-zinc-700 font-mono">
                {user?.email}
              </strong>
            </p>
          </div>

          <div className="text-right font-mono text-xs text-slate-500 dark:text-zinc-400">
            <span>Terminal operativo v2.0</span>
          </div>
        </div>
      </div>

      {/* BLOQUE 1: KPIs MÉTRICOS */}
      <section className="space-y-2">
        <h2 className="font-oswald text-sm font-black uppercase tracking-wider text-black dark:text-[#F5F5F5]">
          [ 1. Salud del Taller & Producción ]
        </h2>
        <OrdersKpiBar orders={orders} />
      </section>

      {/* ACCESOS DIRECTOS A MÓDULOS ACTIVOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MÓDULO DE PEDIDOS */}
        <section className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-5 shadow-[5px_5px_0px_#0A0A0A] dark:shadow-[5px_5px_0px_#000000] flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#581C87] dark:text-purple-400" />
              <h3 className="font-oswald text-xl font-black uppercase text-black dark:text-[#F5F5F5]">
                Módulo de Pedidos
              </h3>
            </div>
            <p className="font-mono text-xs text-slate-600 dark:text-zinc-400">
              6 estados oficiales, búsqueda en vivo, ficha técnica con WhatsApp y descarga de artes en ZIP.
            </p>
          </div>

          <Link
            href="/admin/pedidos"
            className="inline-flex items-center justify-center gap-2 font-mono text-xs font-black uppercase bg-[#FACC15] text-black border-2 border-black dark:border-zinc-700 px-4 py-2.5 shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] hover:bg-[#EAB308] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <span>Ver Pedidos ({totalCount})</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* MÓDULO DE INVENTARIO */}
        <section className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-5 shadow-[5px_5px_0px_#0A0A0A] dark:shadow-[5px_5px_0px_#000000] flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#06B6D4] border border-black dark:border-zinc-700" />
              <h3 className="font-oswald text-xl font-black uppercase text-black dark:text-[#F5F5F5]">
                Módulo de Inventario
              </h3>
            </div>
            <p className="font-mono text-xs text-slate-600 dark:text-zinc-400">
              Materiales, telas por metro, prendas terminadas y productos. Ajuste rápido +1 / -1 y alertas de stock bajo.
            </p>
          </div>

          <Link
            href="/admin/inventario"
            className="inline-flex items-center justify-center gap-2 font-mono text-xs font-black uppercase bg-[#06B6D4] text-black border-2 border-black dark:border-zinc-700 px-4 py-2.5 shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] hover:opacity-90 transition-all hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <span>Entrar a Inventario</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* MÓDULO DE COSTOS Y PRECIOS */}
        <section className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-5 shadow-[5px_5px_0px_#0A0A0A] dark:shadow-[5px_5px_0px_#000000] flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[#10B981] dark:text-emerald-400" />
              <h3 className="font-oswald text-xl font-black uppercase text-black dark:text-[#F5F5F5]">
                Costos y Precios
              </h3>
            </div>
            <p className="font-mono text-xs text-slate-600 dark:text-zinc-400">
              Insumos, recetas de producto, cálculo automático de margen en 3 modos y simulador de volumen.
            </p>
          </div>

          <Link
            href="/admin/costos"
            className="inline-flex items-center justify-center gap-2 font-mono text-xs font-black uppercase bg-[#10B981] text-white border-2 border-black dark:border-zinc-700 px-4 py-2.5 shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] hover:bg-[#059669] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <span>Ver Costos y Precios</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>

      {/* BLOQUE 2: ÚLTIMOS PEDIDOS REGISTRADOS */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-oswald text-sm font-black uppercase tracking-wider text-black dark:text-[#F5F5F5]">
            [ 2. Cola Reciente en Vivo ]
          </h2>
          <Link
            href="/admin/pedidos"
            className="font-mono text-xs text-slate-700 dark:text-zinc-300 hover:text-black dark:hover:text-white underline font-bold"
          >
            Ver todos los pedidos →
          </Link>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[6px_6px_0px_#0A0A0A] dark:shadow-[6px_6px_0px_#000000] overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <ShoppingBag className="h-8 w-8 text-slate-400 dark:text-zinc-500 mx-auto" />
              <p className="font-mono text-xs text-slate-600 dark:text-zinc-400">
                Aún no hay pedidos en la base de datos de Supabase.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-[#F8F5EE] dark:bg-[#262626] border-b-2 border-black dark:border-zinc-700 font-oswald text-xs uppercase tracking-wider text-black dark:text-[#F5F5F5]">
                    <th className="p-3 border-r border-black dark:border-zinc-700">Código</th>
                    <th className="p-3 border-r border-black dark:border-zinc-700">Cliente</th>
                    <th className="p-3 border-r border-black dark:border-zinc-700">Prendas</th>
                    <th className="p-3 border-r border-black dark:border-zinc-700">Entrega</th>
                    <th className="p-3 border-r border-black dark:border-zinc-700">Estado</th>
                    <th className="p-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black dark:divide-zinc-700">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FFFDF7] dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="p-3 border-r border-black dark:border-zinc-700 align-middle font-mono font-black">
                        <span className="bg-[#FACC15] text-black px-1.5 py-0.5 border border-black dark:border-zinc-700 shadow-[1px_1px_0px_#0A0A0A] dark:shadow-[1px_1px_0px_#000000]">
                          {order.order_code}
                        </span>
                      </td>
                      <td className="p-3 border-r border-black dark:border-zinc-700 align-middle">
                        <div className="font-bold text-black dark:text-[#F5F5F5]">{order.customer_name}</div>
                        <div className="font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                          {order.customer_phone}
                        </div>
                      </td>
                      <td className="p-3 border-r border-black dark:border-zinc-700 align-middle font-mono text-[11px] text-slate-700 dark:text-zinc-300">
                        {order.items?.length || 0} prendas
                      </td>
                      <td className="p-3 border-r border-black dark:border-zinc-700 align-middle font-mono text-[11px] text-slate-800 dark:text-zinc-200">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-500 dark:text-zinc-400" />
                          <span>{order.delivery_date || "Por definir"}</span>
                        </span>
                      </td>
                      <td className="p-3 border-r border-black dark:border-zinc-700 align-middle">
                        <OrderStatusBadge status={order.status} size="sm" />
                      </td>
                      <td className="p-3 align-middle text-center">
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase bg-white dark:bg-[#262626] text-black dark:text-[#F5F5F5] border border-black dark:border-zinc-700 px-2 py-0.5 shadow-[1.5px_1.5px_0px_#0A0A0A] dark:shadow-[1.5px_1.5px_0px_#000000] hover:bg-[#FACC15] dark:hover:bg-[#FACC15] dark:hover:text-black transition-all"
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
      <div className="pt-6 border-t border-dashed border-black dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-600 dark:text-zinc-400">
        <p>© {new Date().getFullYear()} AlquimiaTex • Terminal de Control de Socios</p>
        <RegistrationMark label="ADMIN_ORDERS_V2_ACTIVE" />
      </div>
    </div>
  );
}
