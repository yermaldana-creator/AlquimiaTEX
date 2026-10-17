"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LogOut,
  ExternalLink,
  User,
  AlertTriangle,
  Loader2,
  HelpCircle,
  ChevronDown,
  Shield,
} from "lucide-react";
import { logoutAction } from "@/actions/auth.actions";
import { AdminHelpModal } from "./admin-help-modal";
import { OnboardingModal } from "./onboarding-modal";
import { ThemeSwitcher } from "./theme-switcher";

interface AdminHeaderProps {
  userEmail: string;
}

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [forceOnboarding, setForceOnboarding] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleConfirmLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b-2 border-black dark:border-zinc-800 bg-white/95 dark:bg-[#171717]/95 backdrop-blur-md px-4 sm:px-6 md:px-8 py-2.5 transition-colors duration-150">
        <div className="container mx-auto flex max-w-7xl items-center justify-between gap-3">
          {/* LOGO & BADGE DE TALLER */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="group flex items-center gap-2">
              <div className="p-1 bg-white dark:bg-[#262626] border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] transition-transform group-hover:-rotate-1">
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

          {/* ACCIONES DEL HEADER: TEMA, MENÚ DE USUARIO Y SALIR */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* SWITCHER DE TEMA (CLARO / OSCURO / AUTO) */}
            <ThemeSwitcher />

            {/* MENÚ DESPLEGABLE DEL USUARIO */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 bg-white dark:bg-[#262626] px-2.5 sm:px-3 py-1.5 border-2 border-black dark:border-zinc-700 font-mono text-xs font-bold text-black dark:text-[#F5F5F5] transition-all hover:bg-slate-50 dark:hover:bg-zinc-800 ${
                  isUserMenuOpen
                    ? "bg-[#FACC15] dark:bg-[#FACC15] text-black dark:text-black shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000]"
                    : "shadow-[1.5px_1.5px_0px_#0A0A0A] dark:shadow-[1.5px_1.5px_0px_#000000]"
                }`}
                title="Opciones de cuenta y taller"
                aria-expanded={isUserMenuOpen}
              >
                <div className="h-5 w-5 rounded-full bg-[#581C87] text-[#FACC15] flex items-center justify-center border border-black text-[10px] font-black shrink-0">
                  <User className="h-3 w-3" />
                </div>
                <span className="hidden md:inline max-w-[140px] truncate text-left">
                  {userEmail}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-150 ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* DROPDOWN FLOTANTE NEOBRUTALISTA */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[6px_6px_0px_#0A0A0A] dark:shadow-[6px_6px_0px_#000000] py-2 z-50 animate-in fade-in-50 zoom-in-95">
                  {/* CABECERA CON DETALLES DE USUARIO */}
                  <div className="px-3.5 py-2 border-b-2 border-black dark:border-zinc-700 bg-[#F8F5EE] dark:bg-[#262626]">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-zinc-400">
                      <Shield className="h-3 w-3 text-[#10B981]" />
                      <span>Socio Autorizado</span>
                    </div>
                    <p className="font-mono text-xs font-bold text-black dark:text-[#F5F5F5] truncate mt-0.5" title={userEmail}>
                      {userEmail}
                    </p>
                  </div>

                  {/* OPCIONES DEL MENÚ */}
                  <div className="py-1">
                    {/* AYUDA Y TUTORIAL */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setShowHelpModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-mono font-bold text-left text-black dark:text-[#F5F5F5] hover:bg-[#FACC15] hover:text-black dark:hover:bg-[#FACC15] dark:hover:text-black transition-colors"
                    >
                      <HelpCircle className="h-4 w-4 text-[#581C87] dark:text-purple-400 shrink-0" />
                      <span>¿Dudas del taller? / Ayuda</span>
                    </button>

                    {/* VER TIENDA PÚBLICA */}
                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2 text-xs font-mono font-bold text-black dark:text-[#F5F5F5] hover:bg-[#FACC15] hover:text-black dark:hover:bg-[#FACC15] dark:hover:text-black transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <ExternalLink className="h-4 w-4 text-[#2563EB] dark:text-blue-400 shrink-0" />
                        <span>Ver Tienda Pública</span>
                      </div>
                      <span className="font-mono text-[9px] bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 border border-black/30">
                        NUEVA PESTAÑA
                      </span>
                    </Link>

                    {/* SEPARADOR */}
                    <div className="my-1 border-t border-black/20 dark:border-zinc-700" />

                    {/* CERRAR SESIÓN */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setShowConfirmModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-mono font-black uppercase text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* BOTÓN SALIR DIRECTO */}
            <button
              onClick={() => setShowConfirmModal(true)}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-black uppercase text-white bg-[#F43F5E] hover:bg-[#E11D48] px-3 py-1.5 border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] transition-all hover:translate-x-0.5 hover:translate-y-0.5 shrink-0"
              title="Cerrar sesión de socio"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* MODAL DE AYUDA / DUDAS */}
      <AdminHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        onRestartTutorial={() => setForceOnboarding(true)}
      />

      {/* MODAL DE BIENVENIDA / TUTORIAL */}
      <OnboardingModal
        forceOpen={forceOnboarding}
        onClose={() => setForceOnboarding(false)}
      />

      {/* DIÁLOGO DE CONFIRMACIÓN DE SALIDA */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#F8F5EE] dark:bg-[#1E1E1E] text-black dark:text-[#F5F5F5] border-2 border-black dark:border-zinc-700 p-6 max-w-sm w-full shadow-[6px_6px_0px_#0A0A0A] dark:shadow-[6px_6px_0px_#000000] space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black dark:border-zinc-700 pb-2 text-[#F43F5E]">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h3 className="font-oswald text-lg font-black uppercase text-black dark:text-[#F5F5F5]">
                Confirmar Salida
              </h3>
            </div>

            <p className="font-mono text-xs text-slate-800 dark:text-zinc-300 leading-relaxed">
              ¿Seguro que quieres cerrar la sesión del taller?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-dashed border-slate-300 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isPending}
                className="font-mono text-xs font-bold uppercase px-3 py-1.5 bg-white dark:bg-[#262626] text-black dark:text-[#F5F5F5] border-2 border-black dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 shadow-[2px_2px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isPending}
                className="font-mono text-xs font-bold uppercase px-3.5 py-1.5 bg-[#F43F5E] text-white border-2 border-black dark:border-zinc-700 hover:bg-[#E11D48] shadow-[2px_2px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-1.5 disabled:opacity-50"
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
