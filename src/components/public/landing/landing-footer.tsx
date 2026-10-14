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
    <footer id="contacto" className="border-t border-border/50 bg-card py-12 text-foreground">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* IDENTIDAD Y BRANDING */}
          <div className="space-y-3 sm:col-span-2">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="AlquimiaTex"
                width={170}
                height={48}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              Taller artesanal de confección y sublimación textil en Caracas, Venezuela.
              Especialistas en franelas microdurazno, tazas mágicas termosensibles, mugs corporativos,
              puzzles y mousepads de máxima fidelidad y resistencia.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Atención directa por artesanos del taller • Sin comisiones</span>
            </div>
          </div>

          {/* ENLACES RÁPIDOS */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/pedido" className="hover:text-foreground font-semibold text-primary transition-colors">
                  Cotizar / Pedido Online →
                </Link>
              </li>
              <li>
                <Link href="#trabajos" className="hover:text-foreground transition-colors">
                  Nuestros Trabajos y Muestras
                </Link>
              </li>
              <li>
                <Link href="#ofertas" className="hover:text-foreground transition-colors">
                  Ofertas por Docena
                </Link>
              </li>
              <li>
                <Link href="#instagram" className="hover:text-foreground transition-colors">
                  Instagram (@alquimia_tex)
                </Link>
              </li>
              <li>
                <Link href="#como-funciona" className="hover:text-foreground transition-colors">
                  Cómo Funciona el Proceso
                </Link>
              </li>
            </ul>
          </div>

          {/* UBICACIÓN Y CONTACTO */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Taller y Contacto</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>{SOCIAL_INFO.workshopLocation}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{SOCIAL_INFO.businessHours}</span>
              </li>
              <li className="pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp: {SOCIAL_INFO.whatsappFormatted}</span>
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-rose-500 hover:text-rose-600 hover:underline"
                >
                  <InstagramIcon className="h-4 w-4" />
                  <span>Instagram: {SOCIAL_INFO.instagramHandle}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="mt-10 border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground text-center sm:text-left">
          <p>© {new Date().getFullYear()} AlquimiaTex. Todos los derechos reservados.</p>
          <p className="flex items-center justify-center gap-1">
            <span>Confección y sublimación artesanal hecha en Caracas</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
