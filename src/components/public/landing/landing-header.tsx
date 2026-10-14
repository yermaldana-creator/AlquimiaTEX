import Image from "next/image";
import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";
import { IndustrialTapeBanner } from "./alchemy-graphics";
import { SOCIAL_INFO } from "@/lib/landing-content";

export function LandingHeader() {
  const whatsappUrl = `https://wa.me/${SOCIAL_INFO.whatsappNumber}?text=${encodeURIComponent(
    "¡Hola AlquimiaTex! Vengo desde su página web y me gustaría hacer una consulta o cotización."
  )}`;

  return (
    <div className="w-full sticky top-0 z-50">
      {/* 1. CINTA DE PRENSA / TICKER INDUSTRIAL (INCLUYE MOCKUP DIGITAL GRATIS) */}
      <IndustrialTapeBanner />

      {/* 2. ENCABEZADO STREETWEAR / COLLAGE */}
      <header className="w-full border-b-2 border-black bg-[#F8F5EE]/95 backdrop-blur-md px-4 sm:px-6 md:px-8 py-3">
        <div className="container mx-auto flex max-w-6xl items-center justify-between gap-4">
          {/* LOGO OFICIAL */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative p-1 bg-white border-2 border-black shadow-[2px_2px_0px_#0A0A0A] transition-transform group-hover:-rotate-1">
              <Image
                src="/logo.png"
                alt="AlquimiaTex Logo"
                width={150}
                height={40}
                priority
                className="h-9 sm:h-10 w-auto object-contain"
              />
            </div>
            <span className="hidden sm:inline-block bg-[#06B6D4] text-black text-[10px] font-mono font-bold px-2 py-0.5 border border-black uppercase shadow-[1.5px_1.5px_0px_#0A0A0A]">
              TALLER PETARE
            </span>
          </Link>

          {/* NAVEGACIÓN ANCLAS */}
          <nav className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <Link
              href="#trabajos"
              className="font-mono text-xs font-bold uppercase tracking-wider text-black hover:text-[#F43F5E] transition-colors hidden md:inline-block"
            >
              [Trabajos]
            </Link>
            <Link
              href="#ofertas"
              className="font-mono text-xs font-bold uppercase tracking-wider text-black hover:text-[#F43F5E] transition-colors hidden md:inline-block"
            >
              [Docenas]
            </Link>
            <Link
              href="#instagram"
              className="font-mono text-xs font-bold uppercase tracking-wider text-black hover:text-[#F43F5E] transition-colors hidden lg:inline-block"
            >
              [@alquimia_tex]
            </Link>
            <Link
              href="#como-funciona"
              className="font-mono text-xs font-bold uppercase tracking-wider text-black hover:text-[#F43F5E] transition-colors hidden sm:inline-block"
            >
              [Proceso]
            </Link>

            {/* BOTÓN WHATSAPP OFICIAL */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hablar por WhatsApp"
              className="hidden sm:inline-flex items-center gap-1.5 bg-white text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 border-2 border-black font-mono text-xs font-bold shadow-[2px_2px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A0A0A]"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            {/* CTA HACER PEDIDO BRUTALISTA */}
            <Link
              href="/pedido"
              className="inline-flex items-center gap-1.5 bg-[#FACC15] hover:bg-[#FFE600] text-black font-oswald uppercase text-xs sm:text-sm font-black px-4 py-2 border-2 border-black shadow-[3px_3px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A0A0A]"
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
