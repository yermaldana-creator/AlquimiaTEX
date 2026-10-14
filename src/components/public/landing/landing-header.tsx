import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, MessageCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SOCIAL_INFO } from "@/lib/landing-content";

export function LandingHeader() {
  const whatsappUrl = `https://wa.me/${SOCIAL_INFO.whatsappNumber}?text=${encodeURIComponent(
    "¡Hola AlquimiaTex! Vengo desde su página web y me gustaría hacer una consulta o cotización."
  )}`;

  return (
    <div className="w-full">
      {/* 1. BARRA SUPERIOR DE ANUNCIOS */}
      <div className="bg-primary/95 px-4 py-2 text-center text-xs font-medium text-primary-foreground">
        <div className="container mx-auto flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
          <span>¡Catálogo oficial disponible! Ofertas especiales por docena y diseño digital (mockup) gratuito.</span>
          <Link href="#ofertas" className="underline font-bold text-amber-300 hover:text-white transition-colors ml-1">
            Ver ofertas
          </Link>
        </div>
      </div>

      {/* 2. ENCABEZADO STICKY */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="AlquimiaTex Logo"
              width={160}
              height={44}
              priority
              className="h-10 w-auto object-contain"
            />
            <Badge
              variant="outline"
              className="hidden sm:inline-flex text-[11px] font-semibold text-primary border-primary/30"
            >
              Taller La Dolorita
            </Badge>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <Link
              href="#trabajos"
              className="text-xs sm:text-sm font-medium text-muted-foreground transition hover:text-foreground hidden md:inline-block"
            >
              Nuestros Trabajos
            </Link>
            <Link
              href="#ofertas"
              className="text-xs sm:text-sm font-medium text-muted-foreground transition hover:text-foreground hidden md:inline-block"
            >
              Ofertas por Docena
            </Link>
            <Link
              href="#instagram"
              className="text-xs sm:text-sm font-medium text-muted-foreground transition hover:text-foreground hidden lg:inline-block"
            >
              Instagram
            </Link>
            <Link
              href="#como-funciona"
              className="text-xs sm:text-sm font-medium text-muted-foreground transition hover:text-foreground hidden sm:inline-block"
            >
              Cómo Funciona
            </Link>

            {/* BOTÓN WHATSAPP RÁPIDO */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-emerald-600/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 font-semibold gap-1.5"
              )}
            >
              <MessageCircle className="h-4 w-4 fill-emerald-600/20 text-emerald-600" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* CTA HACER PEDIDO */}
            <Link
              href="/pedido"
              className={cn(buttonVariants({ size: "sm" }), "font-semibold shadow-sm gap-1.5")}
            >
              <span>Hacer Pedido</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>
    </div>
  );
}
