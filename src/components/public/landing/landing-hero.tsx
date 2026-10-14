import Image from "next/image";
import Link from "next/link";
import {
  Scissors,
  Clock,
  Palette,
  Layers,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LANDING_HERO, SOCIAL_INFO } from "@/lib/landing-content";

export function LandingHero() {
  const whatsappUrl = `https://wa.me/${SOCIAL_INFO.whatsappNumber}?text=${encodeURIComponent(
    "¡Hola AlquimiaTex! Vengo desde su página web y me gustaría cotizar un pedido para mi marca o evento."
  )}`;

  return (
    <section className="relative overflow-hidden border-b border-border/40 py-12 md:py-20 lg:py-24 bg-gradient-to-b from-muted/30 via-background to-background">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="space-y-6 text-center lg:text-left lg:col-span-7">
            {/* BADGE TALLER ARTESANAL */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Scissors className="h-3.5 w-3.5 text-amber-500" />
              <span>{LANDING_HERO.badge}</span>
            </div>

            {/* ESLOGAN OFICIAL */}
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground leading-[1.15]">
              {LANDING_HERO.slogan.split("estampado digital")[0]}
              <span className="bg-gradient-to-r from-primary via-purple-600 to-amber-500 bg-clip-text text-transparent">
                estampado digital
              </span>
            </h1>

            {/* TAGLINE */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {LANDING_HERO.tagline}
            </p>

            {/* BADGES DE CONFIANZA */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <Clock className="h-3.5 w-3.5" /> 4 a 7 días hábiles
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-1 font-medium text-amber-700 dark:text-amber-300 border border-amber-500/20">
                <Palette className="h-3.5 w-3.5 text-amber-600" /> Mockup digital gratis
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/10 px-2.5 py-1 font-medium text-purple-700 dark:text-purple-300 border border-purple-500/20">
                <Layers className="h-3.5 w-3.5" /> Hasta 2 estampados por pieza
              </span>
            </div>

            {/* BOTONES DE ACCIÓN PRINCIPALES */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-4">
              <Link
                href="/pedido"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto text-base font-semibold gap-2 shadow-md hover:shadow-lg transition-all"
                )}
              >
                <span>Configurar mi Pedido</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full sm:w-auto text-base font-semibold border-border hover:bg-muted gap-2"
                )}
              >
                <MessageCircle className="h-5 w-5 text-emerald-600" />
                <span>Hablar con el Taller</span>
              </a>
            </div>

            {/* NOTA DE CONFIANZA */}
            <p className="text-xs text-muted-foreground flex items-center justify-center lg:justify-start gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Sin pasarelas ni comisiones • Cotización y trato directo por WhatsApp</span>
            </p>
          </div>

          {/* SHOWCASE VISUAL DEL TALLER */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-foreground">Taller Activo</span>
                </div>
                <span className="text-xs text-muted-foreground">La Dolorita, Petare</span>
              </div>

              <div className="overflow-hidden rounded-xl bg-muted/40 p-5 border border-border/40 text-center space-y-3">
                <div className="relative mx-auto h-44 w-full max-w-[220px] flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="AlquimiaTex Logomark"
                    width={220}
                    height={160}
                    className="object-contain drop-shadow-lg"
                  />
                </div>
                <div className="text-left space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Franela & Mugs Sublimados</span>
                    <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">
                      Catálogo Oficial
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Sublimación indeleble de alta densidad que no se cuartea, no destiñe y resiste lavados continuos.
                  </p>
                </div>
              </div>

              {/* MODALIDADES CLAVE */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-lg bg-muted/30 p-2.5 border border-border/30">
                  <p className="text-muted-foreground text-[10px]">Unidad (Al detal)</p>
                  <p className="font-bold text-foreground">100% Anticipado</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-2.5 border border-primary/20">
                  <p className="text-primary text-[10px] font-semibold">Docena (Al mayor)</p>
                  <p className="font-bold text-primary">50% Abono inicial</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
