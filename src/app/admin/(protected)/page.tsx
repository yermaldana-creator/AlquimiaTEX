import Link from "next/link";
import { ShieldCheck, ExternalLink } from "lucide-react";
import { RegistrationMark } from "@/components/public/landing/alchemy-graphics";
import { getSessionUser } from "@/actions/auth.actions";
import { getOrdersAdmin } from "@/actions/orders-admin.actions";
import { OrdersKpiBar } from "@/components/admin/orders-kpi-bar";
import { OrdersTable } from "@/components/admin/orders-table";

export const revalidate = 0; // Datos frescos en cada carga

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  const orders = await getOrdersAdmin();

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
            <span>Actualizado en tiempo real</span>
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

      {/* BLOQUE 2: TABLA INTERACTIVA DE PEDIDOS */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-oswald text-sm font-black uppercase tracking-wider text-black">
            [ 2. Cola de Pedidos en Vivo ]
          </h2>
          <span className="font-mono text-xs text-slate-600 bg-white px-2 py-0.5 border border-black">
            {orders.length} pedidos totales
          </span>
        </div>

        <OrdersTable initialOrders={orders} />
      </section>

      {/* PIE DE PÁGINA DEL PANEL */}
      <div className="pt-6 border-t border-dashed border-black flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-600">
        <p>© {new Date().getFullYear()} AlquimiaTex • Terminal de Control de Socios</p>
        <RegistrationMark label="ADMIN_ORDERS_V2_ACTIVE" />
      </div>
    </div>
  );
}
