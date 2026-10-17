import Image from "next/image";
import Link from "next/link";
import { MessageCircle, MapPin, Clock, ShieldCheck } from "lucide-react";
import { InstagramIcon } from "@/components/ui/instagram-icon";
import { SOCIAL_INFO } from "@/lib/landing-content";

export function LandingFooter() {
  const whatsappUrl = `https://wa.me/${SOCIAL_INFO.whatsappNumber}?text=${encodeURIComponent(
    "¡Hola AlquimiaTex! Vengo desde su página web y me gustaría hacer una consulta."
  )}`;

  return (
    <footer id="contacto" className="bg-[#F8F5EE] border-t-2 border-black py-12 px-4 sm:px-6 md:px-10 text-black">
      <div className="container mx-auto max-w-6xl space-y-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* BRANDING Y IDENTIDAD */}
          <div className="space-y-4 sm:col-span-2">
            <Link href="/" className="inline-block group">
              <div className="p-1.5 bg-white border-2 border-black shadow-[3px_3px_0px_#0A0A0A] inline-block transition-transform group-hover:-rotate-1">
                <Image
                  src="/logo.png"
                  alt="AlquimiaTex"
                  width={160}
                  height={44}
                  className="h-10 w-auto object-contain"
                />
              </div>
            </Link>

            <p className="font-mono text-xs text-slate-700 max-w-sm leading-relaxed">
              Taller artesanal de sublimación y confección textil en Caracas, Venezuela.
              Especialistas en franelas microdurazno, tazas mágicas termosensibles, mugs corporativos,
              puzzles y mousepads de alta densidad y cero desprendimiento.
            </p>

            <div className="inline-flex items-center gap-2 bg-[#FACC15] text-black px-2.5 py-1 text-xs font-mono font-bold border border-black shadow-[2px_2px_0px_#0A0A0A]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Trato directo con el taller • Sin comisiones</span>
            </div>
          </div>

          {/* ENLACES RÁPIDOS */}
          <div className="space-y-3">
            <h4 className="font-oswald text-sm font-black uppercase tracking-wider text-black border-b border-black pb-1">
              [ Enlaces Rápidos ]
            </h4>
            <ul className="space-y-2 font-mono text-xs">
              <li>
                <Link href="/pedido" className="font-bold text-[#581C87] hover:underline flex items-center gap-1">
                  <span>→ Cotizar / Pedido Online</span>
                </Link>
              </li>
              <li>
                <Link href="#trabajos" className="text-slate-800 hover:text-black transition-colors">
                  → Trabajos y Muestras
                </Link>
              </li>
              <li>
                <Link href="#ofertas" className="text-slate-800 hover:text-black transition-colors">
                  → Ofertas por Docena
                </Link>
              </li>
              <li>
                <Link href="#instagram" className="text-slate-800 hover:text-black transition-colors">
                  → Instagram (@alquimia_tex)
                </Link>
              </li>
              <li>
                <Link href="#como-funciona" className="text-slate-800 hover:text-black transition-colors">
                  → Cómo Funciona el Proceso
                </Link>
              </li>
              <li className="pt-1 border-t border-dashed border-slate-300">
                <Link href="/terminos" className="text-slate-800 hover:text-black hover:underline transition-colors">
                  → Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-slate-800 hover:text-black hover:underline transition-colors">
                  → Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>

          {/* TALLER Y CONTACTO */}
          <div className="space-y-3">
            <h4 className="font-oswald text-sm font-black uppercase tracking-wider text-black border-b border-black pb-1">
              [ Taller & Contacto ]
            </h4>
            <ul className="space-y-2.5 font-mono text-xs text-slate-800">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#F43F5E] shrink-0 mt-0.5" />
                <span>{SOCIAL_INFO.workshopLocation}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#06B6D4] shrink-0" />
                <span>{SOCIAL_INFO.businessHours}</span>
              </li>
              <li className="pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-white text-emerald-700 hover:bg-emerald-50 px-2.5 py-1 border-2 border-black font-bold shadow-[2px_2px_0px_#0A0A0A] transition-all"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>WhatsApp: {SOCIAL_INFO.whatsappFormatted}</span>
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-[#F43F5E] hover:underline"
                >
                  <InstagramIcon className="h-4 w-4" />
                  <span>{SOCIAL_INFO.instagramHandle}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT & MARCAS DE IMPRENTA */}
        <div className="border-t-2 border-black pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <p>© {new Date().getFullYear()} AlquimiaTex. Taller La Dolorita, Caracas, Venezuela.</p>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <Link href="/terminos" className="hover:underline hover:text-black text-slate-800">
                Términos
              </Link>
              <span>•</span>
              <Link href="/privacidad" className="hover:underline hover:text-black text-slate-800">
                Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
