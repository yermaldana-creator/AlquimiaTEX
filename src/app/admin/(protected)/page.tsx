import Link from "next/link";
import { ShieldCheck, Package, Clock, CheckCircle2, ExternalLink } from "lucide-react";
import { RegistrationMark } from "@/components/public/landing/alchemy-graphics";
import { getSessionUser } from "@/actions/auth.actions";

export default async function AdminDashboardPage() {
  const user = await getSessionUser();

  return (
    <div className="space-y-8">
      {/* BANNER DE BIENVENIDA */}
      <div className="space-y-3 border-b-2 border-black pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-[#FACC15] text-black px-2.5 py-1 border-2 border-black font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#0A0A0A] -rotate-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>SESIÓN AUTENTICADA DE SOCIO</span>
          </span>
          <span className="inline-flex items-center gap-1 bg-white text-slate-700 px-2.5 py-1 border border-black font-mono text-[11px] font-bold uppercase">
            <span>TALLER LA DOLORITA • PETARE</span>
          </span>
        </div>

        <h1 className="font-oswald text-4xl sm:text-5xl font-black uppercase tracking-tight text-black leading-none">
          PANEL DE CONTROL <span className="text-[#F43F5E]">ALQUIMIATEX</span>
        </h1>

        <p className="font-mono text-xs sm:text-sm text-slate-700 max-w-2xl">
          Has ingresado correctamente como operador del taller con la cuenta:{" "}
          <strong className="text-black bg-white px-1.5 py-0.5 border border-black">{user?.email}</strong>.
          Las políticas de seguridad RLS de Supabase están activas y protegen los pedidos.
        </p>
      </div>

      {/* TARJETA DE ESTADO DE LA FASE 4 */}
      <div className="bg-white border-2 border-black p-6 sm:p-8 shadow-[6px_6px_0px_#0A0A0A] space-y-6">
        <div className="flex items-center justify-between border-b border-black pb-3">
          <div className="flex items-center gap-2">
            <span className="bg-[#06B6D4] text-black font-mono text-xs font-bold px-2 py-0.5 border border-black">
              SUB-MÓDULO 1 LISTO
            </span>
            <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black">
              Autenticación & Seguridad de Rutas
            </h2>
          </div>
          <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
        </div>

        <p className="text-sm text-slate-800 leading-relaxed">
          El vigilante de seguridad (Middleware) está activo en todas las rutas <code>/admin/*</code>. Solo los socios
          con credenciales verificadas en Supabase Auth tienen acceso a esta terminal de trabajo.
        </p>

        {/* PRÓXIMOS PASOS DEL ROADMAP */}
        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          {/* PASO 2 */}
          <div className="bg-[#F8F5EE] border-2 border-black p-4 space-y-2 shadow-[2px_2px_0px_#0A0A0A]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase bg-[#FACC15] text-black px-1.5 py-0.5 border border-black">
                SIGUIENTE
              </span>
              <Package className="h-4 w-4 text-[#581C87]" />
            </div>
            <h3 className="font-oswald text-lg font-black uppercase text-black">
              2. Lista de Pedidos
            </h3>
            <p className="font-mono text-xs text-slate-700">
              Tabla de pedidos entrantes con filtros por estado, búsqueda por código #ALQ y vista previa rápida.
            </p>
          </div>

          {/* PASO 3 */}
          <div className="bg-[#F8F5EE] border-2 border-black p-4 space-y-2 shadow-[2px_2px_0px_#0A0A0A] opacity-75">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase bg-slate-200 text-slate-700 px-1.5 py-0.5 border border-black">
                EN COLA
              </span>
              <Clock className="h-4 w-4 text-[#06B6D4]" />
            </div>
            <h3 className="font-oswald text-lg font-black uppercase text-black">
              3. Ficha Detallada
            </h3>
            <p className="font-mono text-xs text-slate-700">
              Ver artes de clientes, comprobantes de pago, cambiar estados y descargar archivos para sublimar.
            </p>
          </div>

          {/* PASO 4 */}
          <div className="bg-[#F8F5EE] border-2 border-black p-4 space-y-2 shadow-[2px_2px_0px_#0A0A0A] opacity-75">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase bg-slate-200 text-slate-700 px-1.5 py-0.5 border border-black">
                EN COLA
              </span>
              <ShieldCheck className="h-4 w-4 text-[#F43F5E]" />
            </div>
            <h3 className="font-oswald text-lg font-black uppercase text-black">
              4. Métricas Rápidas
            </h3>
            <p className="font-mono text-xs text-slate-700">
              Conteo de franelas y tazas pendientes por confeccionar y pedidos listos para entrega.
            </p>
          </div>
        </div>

        {/* BOTÓN DE ACCESO A LA TIENDA PÚBLICA */}
        <div className="pt-4 border-t border-dashed border-black flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-slate-600">
            ¿Deseas verificar cómo ve la tienda un cliente?
          </p>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 bg-black text-[#FACC15] hover:bg-slate-800 font-mono text-xs font-bold uppercase px-4 py-2 border-2 border-black shadow-[2px_2px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <span>Abrir Tienda Pública</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* MARCA DE REGISTRO INFERIOR */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-600">
        <p>© {new Date().getFullYear()} AlquimiaTex • Terminal de Control de Socios</p>
        <RegistrationMark label="ADMIN_V1.0_AUTH_OK" />
      </div>
    </div>
  );
}
