"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { LogIn, AlertCircle, Loader2, KeyRound, Mail } from "lucide-react";
import { loginAction } from "@/actions/auth.actions";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set("redirectTo", redirectTo);

    startTransition(async () => {
      try {
        const result = await loginAction(formData);
        if (result && !result.success && result.error) {
          setErrorMessage(result.error);
        }
      } catch (err) {
        // En Next.js, redirect() lanza una excepción controlada (NEXT_REDIRECT) que no debe capturarse como error
        const isNextRedirect =
          err instanceof Error &&
          (err.message === "NEXT_REDIRECT" ||
            (err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"));

        if (!isNextRedirect) {
          setErrorMessage("Ocurrió un error inesperado al conectar. Por favor intenta de nuevo.");
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ALERTA DE ERROR */}
      {errorMessage && (
        <div className="bg-[#FEF2F2] border-2 border-[#F43F5E] p-3 text-xs font-mono text-[#991B1B] flex items-start gap-2 shadow-[2px_2px_0px_#0A0A0A] animate-shake">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#E11D48] mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* CAMPO: CORREO ELECTRÓNICO */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="flex items-center gap-1.5 font-oswald text-xs uppercase font-bold text-black tracking-wider"
        >
          <Mail className="h-3.5 w-3.5 text-[#581C87]" />
          <span>Correo de Socio</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="ej. socio@alquimiatex.com"
          disabled={isPending}
          className="w-full px-3 py-2.5 bg-[#F8F5EE] border-2 border-black font-mono text-sm text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-[2px_2px_0px_#0A0A0A] transition-all disabled:opacity-50"
        />
      </div>

      {/* CAMPO: CONTRASEÑA */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="flex items-center gap-1.5 font-oswald text-xs uppercase font-bold text-black tracking-wider"
        >
          <KeyRound className="h-3.5 w-3.5 text-[#F43F5E]" />
          <span>Contraseña</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          disabled={isPending}
          className="w-full px-3 py-2.5 bg-[#F8F5EE] border-2 border-black font-mono text-sm text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-[2px_2px_0px_#0A0A0A] transition-all disabled:opacity-50"
        />
      </div>

      {/* BOTÓN DE ACCESO */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#FACC15] hover:bg-[#EAB308] text-black font-oswald text-base sm:text-lg font-black uppercase py-3 border-2 border-black shadow-[3px_3px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-black" />
            <span>Verificando Credenciales...</span>
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4 text-black" />
            <span>Ingresar al Taller</span>
          </>
        )}
      </button>

      {/* INDICADOR TÉCNICO INFERIOR */}
      <p className="text-[11px] font-mono text-slate-500 text-center pt-2 border-t border-dashed border-slate-300">
        Sesión protegida por Supabase Auth con cifrado SSL / TLS
      </p>
    </form>
  );
}
