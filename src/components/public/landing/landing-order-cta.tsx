import Link from "next/link";
import { ArrowRight, MessageCircle, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { RegistrationMark } from "./alchemy-graphics";
import { SOCIAL_INFO, ORDER_CTA_CONTENT } from "@/lib/landing-content";

export function LandingOrderCta() {
  const whatsappUrl = `https://wa.me/${SOCIAL_INFO.whatsappNumber}?text=${encodeURIComponent(
    "¡Hola AlquimiaTex! Quiero realizar un pedido personalizado para mi marca o evento. ¿Podrían orientarme?"
  )}`;

  return (
    <section className="relative overflow-hidden bg-black text-white py-16 md:py-24 border-b-2 border-black px-4 sm:px-6 md:px-10">
      {/* CINTA DECORATIVA DIAGONAL DE FONDO */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#581C87] rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#F43F5E] rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="container relative mx-auto max-w-4xl text-center space-y-8 z-10">
        <div className="inline-flex items-center gap-2 bg-[#FACC15] text-black px-3.5 py-1 font-mono text-xs font-black uppercase border-2 border-black shadow-[3px_3px_0px_#F43F5E] -rotate-1">
          <Sparkles className="h-3.5 w-3.5 text-black" />
          <span>TALLER LA DOLORITA • CARACAS</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-oswald font-black uppercase tracking-tight text-white leading-[0.9]">
            ¿LISTO PARA <br />
            <span className="text-[#FACC15]">MATERIALIZAR</span> TUS IDEAS?
          </h2>
          <p className="font-mono text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            {ORDER_CTA_CONTENT.subtitle}
          </p>
        </div>

        {/* BOTONES GIGANTES DE ACCIÓN */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-4">
          <Link
            href="/pedido"
            className="bg-[#FACC15] hover:bg-[#FFE600] text-black font-oswald text-base sm:text-lg font-black uppercase px-8 py-4 border-2 border-black shadow-[5px_5px_0px_#F43F5E] transition-all hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2"
          >
            <span>{ORDER_CTA_CONTENT.buttonOrder}</span>
            <ArrowRight className="h-5 w-5" />
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white hover:bg-slate-100 text-black font-oswald text-base sm:text-lg font-black uppercase px-8 py-4 border-2 border-black shadow-[5px_5px_0px_#06B6D4] transition-all hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-5 w-5 text-emerald-600" />
            <span>{ORDER_CTA_CONTENT.buttonWhatsapp}</span>
          </a>
        </div>

        {/* BENEFICIOS DE TALLER */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 font-mono text-xs text-slate-300 border-t border-white/20">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#FACC15]" />
            <span>Previsualización digital previa sin costo</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#FACC15]" />
            <span>Entregas de 4 a 7 días hábiles</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#06B6D4]" />
            <span>Pago Móvil, Efectivo y Binance USDT</span>
          </span>
        </div>

        <RegistrationMark label="CLOSING_CTA_LAB" className="text-white/40 justify-center pt-2" />
      </div>
    </section>
  );
}
