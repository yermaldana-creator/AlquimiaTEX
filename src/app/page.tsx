import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingHeader } from "@/components/public/landing/landing-header";
import { LandingHero } from "@/components/public/landing/landing-hero";
import { LandingWorkGallery } from "@/components/public/landing/landing-work-gallery";
import { LandingWholesaleOffers } from "@/components/public/landing/landing-wholesale-offers";
import { LandingInstagramSection } from "@/components/public/landing/landing-instagram-section";
import { LandingOrderCta } from "@/components/public/landing/landing-order-cta";
import { LandingFooter } from "@/components/public/landing/landing-footer";
import { RegistrationMark } from "@/components/public/landing/alchemy-graphics";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#0A0A0A] flex flex-col selection:bg-[#F43F5E] selection:text-white">
      {/* 1. ENCABEZADO STREETWEAR CON LOGO Y CINTAS */}
      <LandingHeader />

      <main className="flex-1">
        {/* 2. HERO SECTION ASIMÉTRICO (COLLAGE STREETWEAR) */}
        <LandingHero />

        {/* 3. GALERÍA EXHIBICIÓN DE ARTE (TAZAS MÁGICAS, MUGS, FRANELAS, ETC.) */}
        <LandingWorkGallery />

        {/* 4. OFERTAS POR DOCENA Y POLÍTICAS DEL CATÁLOGO OFICIAL */}
        <LandingWholesaleOffers />

        {/* 5. SECCIÓN CÓMO FUNCIONA EL PROCESO (ESTILO FANZINE DE TALLER) */}
        <section id="como-funciona" className="py-16 md:py-24 bg-[#F8F5EE] border-b-2 border-black px-4 sm:px-6 md:px-10">
          <div className="container mx-auto max-w-6xl space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-block bg-black text-[#FACC15] px-3 py-1 font-mono text-xs font-black uppercase border border-black shadow-[2px_2px_0px_#F43F5E] rotate-1">
                ✦ PROCESO PASO A PASO
              </div>
              <h2 className="text-4xl sm:text-5xl font-oswald font-black uppercase tracking-tight text-black leading-none">
                CÓMO REALIZAR TU PEDIDO <br />
                <span className="text-[#06B6D4]">EN 3 PASOS DIRECTOS</span>
              </h2>
              <p className="font-mono text-xs sm:text-sm text-slate-700">
                Diseñado para ser rápido, intuitivo, en bolívares o dólares, y sin registros complicados.
              </p>
            </div>

            {/* LAS 3 ETAPAS BRUTALISTAS */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="relative bg-white border-3 border-black p-6 shadow-[6px_6px_0px_#0A0A0A] space-y-3 -rotate-1 transition-transform hover:rotate-0">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center bg-black text-[#FACC15] font-oswald text-xl font-black border-2 border-black shadow-[2px_2px_0px_#0A0A0A]">
                    01
                  </div>
                  <RegistrationMark label="STEP_SELECTION" />
                </div>
                <h3 className="text-xl font-oswald font-black uppercase text-black">
                  Selecciona tus Artículos
                </h3>
                <p className="font-sans text-xs text-slate-600 leading-relaxed">
                  Elige franelas (microdurazno, jersey, algodón), tazas mágicas termosensibles, mugs, puzzles o mousepads con sus tallas, colores y cantidades.
                </p>
              </div>

              <div className="relative bg-white border-3 border-black p-6 shadow-[6px_6px_0px_#F43F5E] space-y-3 rotate-1 transition-transform hover:rotate-0">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center bg-[#F43F5E] text-white font-oswald text-xl font-black border-2 border-black shadow-[2px_2px_0px_#0A0A0A]">
                    02
                  </div>
                  <RegistrationMark label="STEP_DESIGN_AI" />
                </div>
                <h3 className="text-xl font-oswald font-black uppercase text-black">
                  Personaliza o Crea con IA
                </h3>
                <p className="font-sans text-xs text-slate-600 leading-relaxed">
                  Sube tu propio diseño o logotipo terminado, o describe tu idea para que nuestra Inteligencia Artificial genere un preview exclusivo.
                </p>
              </div>

              <div className="relative bg-white border-3 border-black p-6 shadow-[6px_6px_0px_#06B6D4] space-y-3 -rotate-1 transition-transform hover:rotate-0">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center bg-[#06B6D4] text-black font-oswald text-xl font-black border-2 border-black shadow-[2px_2px_0px_#0A0A0A]">
                    03
                  </div>
                  <RegistrationMark label="STEP_WHATSAPP" />
                </div>
                <h3 className="text-xl font-oswald font-black uppercase text-black">
                  Envía directo a WhatsApp
                </h3>
                <p className="font-sans text-xs text-slate-600 leading-relaxed">
                  Elige tu fecha (4 a 7 días hábiles), condición de pago (100% unidad o 50% docena) y abre el chat oficial con el pedido ya redactado.
                </p>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/pedido"
                className="inline-flex items-center gap-2 bg-[#FACC15] hover:bg-[#FFE600] text-black font-oswald text-base font-black uppercase px-8 py-3.5 border-2 border-black shadow-[4px_4px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
              >
                <span>Comenzar mi Pedido Ahora</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 6. VITRINA SOCIAL INSTAGRAM (@alquimia_tex) */}
        <LandingInstagramSection />

        {/* 7. GRAN LLAMADO A LA ACCIÓN (CTA HACIA /PEDIDO Y WHATSAPP) */}
        <LandingOrderCta />
      </main>

      {/* 8. FOOTER OFICIAL CON TALLER Y REDES */}
      <LandingFooter />
    </div>
  );
}
