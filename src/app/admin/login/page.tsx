import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Shield, Lock } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { RegistrationMark } from "@/components/public/landing/alchemy-graphics";

export const metadata: Metadata = {
  title: "Acceso de Socios | AlquimiaTex",
  description: "Inicio de sesión exclusivo para los socios del taller AlquimiaTex.",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#F3EFE6] dark:bg-[#0F0F0F] text-black dark:text-zinc-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 selection:bg-[#FACC15] selection:text-black">
      {/* BARRA SUPERIOR DE RETORNO */}
      <div className="container mx-auto max-w-md flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-black dark:text-zinc-100 hover:text-[#F43F5E] px-3 py-1.5 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Volver a la Tienda</span>
        </Link>

        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 px-2 py-1 border border-black dark:border-zinc-700">
          <Shield className="h-3 w-3 text-[#06B6D4]" />
          <span>V1.0 AUTH</span>
        </span>
      </div>

      {/* TARJETA PRINCIPAL DE LOGIN */}
      <div className="container mx-auto max-w-md my-auto py-8">
        <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-6 sm:p-8 shadow-[6px_6px_0px_#0A0A0A] dark:shadow-[6px_6px_0px_#000000] space-y-6">
          {/* ENCABEZADO CON LOGO */}
          <div className="text-center space-y-3">
            <div className="inline-block p-1.5 bg-[#F8F5EE] dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] -rotate-1">
              <Image
                src="/logo.png"
                alt="AlquimiaTex"
                width={150}
                height={40}
                priority
                className="h-9 w-auto object-contain mx-auto"
              />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-[#581C87] text-[#FACC15] font-mono text-[10px] font-black uppercase px-2 py-0.5 border border-black shadow-[1.5px_1.5px_0px_#0A0A0A]">
                <Lock className="h-3 w-3" />
                <span>ACCESO RESTRINGIDO A 3 SOCIOS</span>
              </div>
              <h1 className="font-oswald text-2xl sm:text-3xl font-black uppercase tracking-tight text-black dark:text-white">
                CONTROL DE TALLER
              </h1>
              <p className="font-mono text-xs text-slate-600 dark:text-zinc-400">
                La Dolorita • Petare • Caracas
              </p>
            </div>
          </div>

          {/* FORMULARIO DE ACCESO (DENTRO DE SUSPENSE) */}
          <Suspense
            fallback={
              <div className="py-8 text-center font-mono text-xs text-slate-500 animate-pulse">
                Cargando terminal de acceso...
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>

      {/* PIE DE PÁGINA */}
      <div className="container mx-auto max-w-md pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px] text-slate-600 dark:text-zinc-400">
        <span>AlquimiaTex © {new Date().getFullYear()}</span>
        <RegistrationMark label="SECURITY_GATEWAY_V1" />
      </div>
    </div>
  );
}
