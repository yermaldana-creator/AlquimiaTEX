import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SOCIAL_INFO, ORDER_CTA_CONTENT } from "@/lib/landing-content";

export function LandingOrderCta() {
  const whatsappUrl = `https://wa.me/${SOCIAL_INFO.whatsappNumber}?text=${encodeURIComponent(
    "¡Hola AlquimiaTex! Quiero realizar un pedido personalizado para mi marca o evento. ¿Podrían orientarme?"
  )}`;

  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-primary/95 via-purple-900 to-indigo-950 text-white">
      {/* DESTELLOS DECORATIVOS DE FONDO */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

      <div className="container relative mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md border border-white/20 text-amber-300">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Atención Directa en La Dolorita, Caracas</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-black tracking-tight sm:text-5xl text-white">
            {ORDER_CTA_CONTENT.title}
          </h2>
          <p className="text-base sm:text-lg text-purple-100/90 max-w-2xl mx-auto leading-relaxed">
            {ORDER_CTA_CONTENT.subtitle}
          </p>
        </div>

        {/* BOTONES GRANDES DE LLAMADO A LA ACCIÓN */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/pedido"
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full sm:w-auto h-12 px-8 text-base font-bold bg-white text-purple-950 hover:bg-amber-300 hover:text-purple-950 shadow-xl transition-all gap-2"
            )}
          >
            <span>{ORDER_CTA_CONTENT.buttonOrder}</span>
            <ArrowRight className="h-5 w-5" />
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full sm:w-auto h-12 px-8 text-base font-bold border-white/40 text-white hover:bg-white/10 hover:border-white transition-all gap-2"
            )}
          >
            <MessageCircle className="h-5 w-5 text-emerald-400" />
            <span>{ORDER_CTA_CONTENT.buttonWhatsapp} ({SOCIAL_INFO.whatsappFormatted})</span>
          </a>
        </div>

        {/* BENEFICIOS RÁPIDOS */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-purple-200">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-amber-300" />
            <span>Previsualización digital previa sin costo</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-amber-300" />
            <span>Entregas de 4 a 7 días hábiles</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-amber-300" />
            <span>Pago Móvil, Efectivo y Binance USDT</span>
          </span>
        </div>
      </div>
    </section>
  );
}
