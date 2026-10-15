"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, ExternalLink, User } from "lucide-react";
import { logoutAction } from "@/actions/auth.actions";
import { useTransition } from "react";

interface AdminHeaderProps {
  userEmail: string;
}

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
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

          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 border border-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
            TALLER EN LÍNEA
          </span>
        </div>

        {/* ACCIONES Y DATOS DEL SOCIO */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* VER TIENDA PÚBLICA */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-slate-800 hover:text-black px-2.5 py-1.5 border border-black bg-white shadow-[1.5px_1.5px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
            title="Abrir tienda pública en una pestaña nueva"
          >
            <span>Tienda</span>
            <ExternalLink className="h-3 w-3" />
          </Link>

          {/* BADGE DEL SOCIO CONECTADO */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_#0A0A0A]">
            <User className="h-3.5 w-3.5 text-[#581C87]" />
            <div className="flex flex-col text-left">
              <span className="font-mono text-[11px] font-bold text-black max-w-[140px] sm:max-w-[200px] truncate">
                {userEmail}
              </span>
            </div>
          </div>

          {/* BOTÓN CERRAR SESIÓN */}
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-white bg-[#F43F5E] hover:bg-[#E11D48] px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
            title="Cerrar sesión de socio"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isPending ? "Saliendo..." : "Cerrar Sesión"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
