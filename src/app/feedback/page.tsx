import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FeedbackForm } from "@/components/public/feedback/feedback-form";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { APP_VERSION } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Cuestionario de Evaluación Beta | AlquimiaTex",
  description:
    "Formulario confidencial de retroalimentación para evaluadores beta del taller AlquimiaTex.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-[#F3EFE6] text-black selection:bg-[#FACC15] selection:text-black font-sans pb-16">
      {/* HEADER DE EVALUACIÓN */}
      <header className="sticky top-0 z-40 w-full border-b-2 border-black bg-[#F8F5EE]/95 backdrop-blur-md px-4 sm:px-6 md:px-8 py-3">
        <div className="container mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-2">
              <div className="p-1 bg-white border-2 border-black shadow-[2px_2px_0px_#0A0A0A] transition-transform group-hover:-rotate-1">
                <Image
                  src="/logo.png"
                  alt="AlquimiaTex Logo"
                  width={130}
                  height={34}
                  priority
                  className="h-8 w-auto object-contain"
                />
              </div>
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 bg-[#581C87] text-[#FACC15] px-2 py-0.5 border border-black font-mono text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#0A0A0A]">
              <span>BETA TESTERS</span>
              <span className="text-white">•</span>
              <span>{APP_VERSION}</span>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-black hover:text-[#F43F5E] px-2.5 py-1.5 border border-black bg-white shadow-[2px_2px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver a la Tienda</span>
          </Link>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="container mx-auto max-w-3xl px-4 sm:px-6 pt-8 sm:pt-12">
        {/* BANNER INTRODUCTORIO */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-[#FACC15] text-black px-2.5 py-1 border-2 border-black font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#0A0A0A] -rotate-1">
              <Sparkles className="h-3 w-3" />
              <span>CUESTIONARIO DE CONTROL DE CALIDAD</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-white text-slate-700 px-2.5 py-1 border border-black font-mono text-[11px] font-bold uppercase">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>RESPUESTAS PRIVADAS &bull; {APP_VERSION}</span>
            </span>
          </div>

          <h1 className="font-oswald text-4xl sm:text-5xl font-black uppercase tracking-tight text-black leading-none">
            EVALUACIÓN DE EXPERIENCIA <span className="text-[#F43F5E]">ALQUIMIATEX</span>
          </h1>

          <div className="bg-white border-2 border-dashed border-black p-4 text-xs sm:text-sm font-mono text-slate-800 leading-relaxed space-y-2">
            <p>
              ¡Hola! Gracias por ayudarnos a probar la plataforma de nuestro taller textil en Caracas.
              Tu evaluación honesta nos permitirá corregir errores, pulir el flujo de compra y asegurar que la experiencia sea intuitiva antes del lanzamiento oficial.
            </p>
            <p className="text-[11px] text-slate-500 font-bold uppercase">
              ⏱ Tiempo estimado: 2 a 3 minutos &bull; Guarda tus respuestas automáticamente mientras avanzas.
            </p>
          </div>
        </div>

        {/* COMPONENTE INTERACTIVO DEL FORMULARIO */}
        <FeedbackForm />
      </main>
    </div>
  );
}
