import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import {
  StampSeal,
  AlchemistFlask,
  RegistrationMark,
} from "./alchemy-graphics";
import { LANDING_HERO, SOCIAL_INFO } from "@/lib/landing-content";

export function LandingHero() {
  const whatsappUrl = `https://wa.me/${SOCIAL_INFO.whatsappNumber}?text=${encodeURIComponent(
    "¡Hola AlquimiaTex! Vengo desde su página web y me gustaría cotizar un pedido para mi marca o evento."
  )}`;

  const { photos } = LANDING_HERO;

  return (
    <section className="relative overflow-hidden bg-[#F3EFE6] px-4 sm:px-6 md:px-10 py-10 sm:py-16 md:py-20 border-b-2 border-black">
      {/* 1. MATRAZ ALQUÍMICO COMO MARCA DE AGUA */}
      <AlchemistFlask className="absolute right-[-20px] bottom-[-30px] md:right-4 md:bottom-[-20px] w-72 h-72 md:w-96 md:h-96 text-black/[0.04]" />

      {/* 2. SELLO DE CAUCHO ROTADO */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-10 z-20 pointer-events-none hidden sm:block">
        <StampSeal
          text="100% INDELEBLE"
          subtext="PRENSA 180°C"
          city="★ CARACAS ★"
        />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* COLUMNA IZQUIERDA: TIPOGRAFÍA DE GRAN IMPACTO */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* STICKER INFORMATIVO */}
            <div className="inline-flex items-center gap-2 bg-black text-white px-3.5 py-1 font-mono text-xs font-bold border border-black shadow-[3px_3px_0px_#FACC15]">
              <span className="text-[#F43F5E]">✦</span>
              <span>CATÁLOGO OFICIAL • LA DOLORITA, PETARE</span>
            </div>

            {/* TITULAR ASIMÉTRICO */}
            <div className="space-y-1">
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-oswald font-black uppercase tracking-tight leading-[0.9] text-black">
                ESTAMPADO <br />
                <span className="inline-block bg-[#F43F5E] text-white px-3 py-1 transform -rotate-1 shadow-[4px_4px_0px_#0A0A0A]">
                  QUE HACE
                </span>{" "}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-900 via-black to-[#06B6D4]">
                  MAGIA.
                </span>
              </h1>
            </div>

            {/* ESLOGAN Y DESCRIPCIÓN */}
            <div className="border-l-4 border-black pl-4 py-1 space-y-2">
              <p className="font-mono text-xs sm:text-sm font-bold text-black uppercase tracking-wide">
                &ldquo;{LANDING_HERO.slogan}&rdquo;
              </p>
              <p className="font-sans text-xs sm:text-sm text-slate-700 leading-relaxed max-w-xl">
                {LANDING_HERO.tagline}
              </p>
            </div>

            {/* BADGES TÉCNICOS EN FORMATO TICKET */}
            <div className="flex flex-wrap gap-2 text-xs font-mono font-bold pt-1">
              <span className="bg-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_#0A0A0A]">
                ⏳ 4 A 7 DÍAS HÁBILES
              </span>
              <span className="bg-[#06B6D4] text-black border-2 border-black px-3 py-1 shadow-[2px_2px_0px_#0A0A0A]">
                🎨 MOCKUP DIGITAL GRATIS
              </span>
            </div>

            {/* BOTONES DE LLAMADO A LA ACCIÓN */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/pedido"
                className="bg-black hover:bg-[#581C87] text-[#FACC15] hover:text-white font-oswald text-base md:text-lg font-black uppercase px-7 py-3.5 border-2 border-black shadow-[5px_5px_0px_#F43F5E] text-center transition-all hover:translate-x-0.5 hover:translate-y-0.5 inline-flex items-center justify-center gap-2"
              >
                <span>Configurar Mi Pedido</span>
                <ArrowRight className="h-5 w-5" />
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-slate-100 text-black font-oswald text-base md:text-lg font-black uppercase px-6 py-3.5 border-2 border-black shadow-[5px_5px_0px_#0A0A0A] text-center transition-all hover:translate-x-0.5 hover:translate-y-0.5 inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-5 w-5 text-emerald-600" />
                <span>Hablar con el Taller</span>
              </a>
            </div>
          </div>

          {/* COLUMNA DERECHA: COLLAGE DE PIEZAS DE TALLER */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            {/* MARCA DE CORTE SUPERIOR */}
            <RegistrationMark label="REG_CARACAS_01" className="absolute -top-6 -left-2" />

            {/* TARJETA PRINCIPAL EN ÁNGULO (MICRODURAZNO) */}
            <div className="relative bg-white border-3 border-black p-4 shadow-[8px_8px_0px_#0A0A0A] -rotate-1 transition-transform hover:rotate-0 duration-300">
              {/* FOTOGRAFÍA PRINCIPAL */}
              <div className="aspect-[4/3] bg-slate-900 border-2 border-black overflow-hidden relative group">
                <Image
                  src={photos.mainProduct}
                  alt="Franela Microdurazno AlquimiaTex"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-purple-950/20 mix-blend-multiply pointer-events-none" />

                {/* OVERLAY TÉCNICO INFERIOR */}
                <div className="absolute bottom-2 left-2 right-2 bg-black/85 text-white p-2 text-[10px] font-mono border border-white/20 flex justify-between items-center">
                  <span>{photos.mainProductTitle}</span>
                  <span className="text-[#06B6D4] font-bold">{photos.mainProductBadge}</span>
                </div>
              </div>

              <div className="mt-3 text-xs font-mono font-bold">
                <span>TELAS: 180G POLIÉSTER</span>
              </div>
            </div>

            {/* TARJETA SECUNDARIA SUPERPUESTA (TAZA MÁGICA) */}
            <div className="absolute -bottom-8 -left-4 sm:-left-8 w-48 sm:w-56 bg-[#F8F5EE] border-2 border-black p-3 shadow-[6px_6px_0px_#06B6D4] rotate-2 transition-transform hover:rotate-0 duration-300 z-10">
              <div className="flex items-center justify-between text-[9px] font-mono font-black mb-1.5">
                <span className="bg-black text-[#FACC15] px-1.5 py-0.5">EFECTO CALOR</span>
                <span className="text-slate-600">{photos.secondaryProductTag}</span>
              </div>
              <div className="aspect-square bg-slate-800 border border-black overflow-hidden relative">
                <Image
                  src={photos.secondaryProduct}
                  alt={photos.secondaryProductTitle}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              </div>
              <p className="mt-1.5 text-xs font-oswald uppercase font-black text-black truncate">
                {photos.secondaryProductTitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
