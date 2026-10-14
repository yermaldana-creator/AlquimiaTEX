import { LandingHeader } from "@/components/public/landing/landing-header";
import { LandingHero } from "@/components/public/landing/landing-hero";
import { LandingWorkGallery } from "@/components/public/landing/landing-work-gallery";
import { LandingWholesaleOffers } from "@/components/public/landing/landing-wholesale-offers";
import { LandingInstagramSection } from "@/components/public/landing/landing-instagram-section";
import { LandingOrderCta } from "@/components/public/landing/landing-order-cta";
import { LandingFooter } from "@/components/public/landing/landing-footer";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* 1. ENCABEZADO Y ANUNCIOS */}
      <LandingHeader />

      {/* 2. HERO PRINCIPAL */}
      <main className="flex-1">
        <LandingHero />

        {/* 3. GALERÍA NUESTROS TRABAJOS (INCLUYE TAZAS MÁGICAS, MUGS, FRANELAS, ETC.) */}
        <LandingWorkGallery />

        {/* 4. OFERTAS POR DOCENA Y POLÍTICAS DEL CATÁLOGO */}
        <LandingWholesaleOffers />

        {/* 5. CÓMO FUNCIONA EL PROCESO */}
        <section id="como-funciona" className="py-16 md:py-24 bg-muted/10 border-t border-border/40">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <Badge variant="secondary" className="font-semibold text-xs text-primary">
                Paso a Paso
              </Badge>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
                Cómo realizar tu pedido en 3 pasos
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Diseñado para ser rápido, intuitivo y sin registro obligatorio.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-sm">
                  1
                </div>
                <h3 className="text-base font-bold text-foreground">Selecciona tus Artículos</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Escoge franelas (microdurazno, jersey, algodón), tazas mágicas, mugs, puzzles o mousepads con sus tallas y cantidades.
                </p>
              </div>

              <div className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-sm">
                  2
                </div>
                <h3 className="text-base font-bold text-foreground">Personaliza o Genera con IA</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sube tu propio logotipo o diseño, o escribe una descripción para que nuestra Inteligencia Artificial genere un preview exclusivo.
                </p>
              </div>

              <div className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-sm">
                  3
                </div>
                <h3 className="text-base font-bold text-foreground">Envía directo a WhatsApp</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Elige tu fecha de entrega (4 a 7 días hábiles), condición de pago (unidad o docena) y abre el chat oficial con el pedido ya redactado.
                </p>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/pedido"
                className={cn(buttonVariants({ size: "lg" }), "font-semibold gap-2 shadow-md")}
              >
                <span>Comenzar mi Pedido Ahora</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 6. SECCIÓN INSTAGRAM OFICIAL (@alquimia_tex) */}
        <LandingInstagramSection />

        {/* 7. GRAN LLAMADO A LA ACCIÓN (CTA HACIA /PEDIDO Y WHATSAPP) */}
        <LandingOrderCta />
      </main>

      {/* 8. FOOTER OFICIAL CON REDES Y TALLER */}
      <LandingFooter />
    </div>
  );
}
