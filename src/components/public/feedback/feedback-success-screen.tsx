"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ArrowRight, Sparkles } from "lucide-react";
import { StampSeal } from "@/components/public/landing/alchemy-graphics";

export function FeedbackSuccessScreen() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "https://alquimiatex.vercel.app/feedback";
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="bg-white border-3 border-black p-6 sm:p-10 shadow-[8px_8px_0px_#0A0A0A] text-center space-y-6 max-w-2xl mx-auto my-8">
      {/* SELLO DE TALLER */}
      <div className="flex justify-center">
        <StampSeal
          text="RESPUESTA REGISTRADA"
          subtext="CARACAS 2026"
          city="★ ALQUIMIATEX ★"
          className="w-28 h-28"
        />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-[#FACC15] text-black px-3 py-0.5 font-mono text-xs font-black uppercase border border-black shadow-[2px_2px_0px_#0A0A0A] -rotate-1">
          <Sparkles className="h-3 w-3" />
          <span>EVALUACIÓN COMPLETADA CON ÉXITO</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-oswald font-black uppercase tracking-tight text-black leading-tight">
          ¡GRACIAS POR TU <span className="text-[#F43F5E]">FEEDBACK!</span>
        </h2>
        <p className="font-mono text-xs sm:text-sm text-slate-700 max-w-lg mx-auto leading-relaxed">
          Tus respuestas han sido almacenadas en nuestro servidor y serán revisadas por los socios del taller para afinar los detalles de producción, telas y experiencia web.
        </p>
      </div>

      {/* BOTÓN PARA COMPARTIR EL ENLACE CON OTROS TESTERS */}
      <div className="bg-[#F8F5EE] border-2 border-dashed border-black p-5 space-y-3">
        <p className="font-mono text-xs font-bold text-black">
          ¿Conoces a alguien más que pueda probar la web y darnos su opinión sincera?
        </p>
        <button
          onClick={handleCopyLink}
          className="w-full sm:w-auto px-6 py-3 bg-[#06B6D4] hover:bg-[#0891B2] text-black font-oswald text-sm font-black uppercase border-2 border-black shadow-[3px_3px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2 mx-auto"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-800 stroke-[3]" />
              <span>¡Enlace copiado al portapapeles!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Compartir este link con otra persona</span>
            </>
          )}
        </button>
      </div>

      {/* BOTÓN REGRESAR A LA TIENDA */}
      <div className="pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-black hover:bg-[#581C87] text-[#FACC15] hover:text-white font-oswald text-base font-black uppercase px-8 py-3.5 border-2 border-black shadow-[4px_4px_0px_#F43F5E] transition-all"
        >
          <span>Ir a la Página Principal</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
