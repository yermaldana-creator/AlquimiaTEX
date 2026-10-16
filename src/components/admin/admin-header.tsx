"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  ExternalLink,
  User,
  AlertTriangle,
  Loader2,
  LayoutDashboard,
  ShoppingBag,
} from "lucide-react";
import { logoutAction } from "@/actions/auth.actions";

interface AdminHeaderProps {
  userEmail: string;
}

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  const pathname = usePathname();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirmLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b-2 border-black bg-[#F8F5EE]/95 backdrop-blur-md px-4 sm:px-6 md:px-8 py-3">
        <div className="container mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* LOGO & BADGE DE TALLER */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="group flex items-center gap-2">
              <div className="p-1 bg-white border-2 border-black shadow-[2px_2px_0px_#0A0A0A] transition-transform group-hover:-rotate-1">
                <Image
                  src="/logo.png"
                  alt="AlquimiaTex"
                  width={120}
                  height={32}
                  priority
                  className="h-7 w-auto object-contain"
                />
              </div>
              <span className="hidden sm:inline-block bg-[#FACC15] text-black text-[10px] font-mono font-bold px-2 py-0.5 border border-black uppercase shadow-[1.5px_1.5px_0px_#0A0A0A]">
                PANEL DE SOCIOS
              </span>
            </Link>
          </div>

          {/* ENLACES DE NAVEGACIÓN ADMIN */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/admin"
              className={`inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase px-2.5 py-1.5 border-2 border-black transition-all ${
                pathname === "/admin"
                  ? "bg-black text-[#FACC15] shadow-[2px_2px_0px_#0A0A0A] -translate-y-0.5"
                  : "bg-white text-black hover:bg-slate-100 shadow-[1.5px_1.5px_0px_#0A0A0A]"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <Link
              href="/admin/pedidos"
              className={`inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase px-2.5 py-1.5 border-2 border-black transition-all ${
                pathname.startsWith("/admin/pedidos")
                  ? "bg-black text-[#FACC15] shadow-[2px_2px_0px_#0A0A0A] -translate-y-0.5"
                  : "bg-white text-black hover:bg-slate-100 shadow-[1.5px_1.5px_0px_#0A0A0A]"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Pedidos</span>
            </Link>
          </nav>

          {/* ACCIONES Y DATOS DEL SOCIO */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* VER TIENDA PÚBLICA */}
            <Link
              href="/"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-slate-800 hover:text-black px-2.5 py-1.5 border border-black bg-white shadow-[1.5px_1.5px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
              title="Abrir tienda pública en una pestaña nueva"
            >
              <span>Tienda</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            {/* BADGE DEL SOCIO CONECTADO */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_#0A0A0A]">
              <User className="h-3.5 w-3.5 text-[#581C87]" />
              <div className="flex flex-col text-left">
                <span className="font-mono text-[11px] font-bold text-black max-w-[120px] md:max-w-[180px] truncate">
                  {userEmail}
                </span>
              </div>
            </div>

            {/* BOTÓN CERRAR SESIÓN */}
            <button
              onClick={() => setShowConfirmModal(true)}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-white bg-[#F43F5E] hover:bg-[#E11D48] px-2.5 sm:px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
              title="Cerrar sesión de socio"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* DIÁLOGO / MODAL DE CONFIRMACIÓN DE CIERRE DE SESIÓN */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#F8F5EE] border-2 border-black p-6 max-w-sm w-full shadow-[6px_6px_0px_#0A0A0A] space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-2 text-[#F43F5E]">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h3 className="font-oswald text-lg font-black uppercase text-black">
                Confirmar Salida
              </h3>
            </div>

            <p className="font-mono text-xs text-slate-800 leading-relaxed">
              ¿Seguro que quieres cerrar la sesión del taller?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-dashed border-slate-300">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isPending}
                className="font-mono text-xs font-bold uppercase px-3 py-1.5 bg-white text-black border-2 border-black hover:bg-slate-100 shadow-[2px_2px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isPending}
                className="font-mono text-xs font-bold uppercase px-3.5 py-1.5 bg-[#F43F5E] text-white border-2 border-black hover:bg-[#E11D48] shadow-[2px_2px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saliendo...</span>
                  </>
                ) : (
                  <span>Sí, cerrar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
