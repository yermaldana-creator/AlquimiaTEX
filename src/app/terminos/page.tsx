import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Scale, AlertTriangle, CheckCircle2 } from "lucide-react";
import { RegistrationMark } from "@/components/public/landing/alchemy-graphics";
import { SOCIAL_INFO } from "@/lib/landing-content";

export const metadata: Metadata = {
  title: "Términos y Condiciones de Servicio | AlquimiaTex",
  description:
    "Términos y condiciones legales para la confección y sublimación textil personalizada en el taller AlquimiaTex, Caracas, Venezuela.",
};

export default function TerminosPage() {
  const lastUpdated = "14 de Octubre de 2026";

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-black selection:bg-[#FACC15] selection:text-black font-sans pb-16">
      {/* HEADER STICKY DE NAVEGACIÓN */}
      <header className="sticky top-0 z-40 w-full border-b-2 border-black bg-[#F8F5EE]/95 backdrop-blur-md px-4 sm:px-6 md:px-8 py-3">
        <div className="container mx-auto flex max-w-4xl items-center justify-between gap-4">
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
            <span className="hidden sm:inline-block bg-[#FACC15] text-black text-[10px] font-mono font-bold px-2 py-0.5 border border-black uppercase shadow-[1.5px_1.5px_0px_#0A0A0A]">
              TALLER PETARE
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-black hover:text-[#F43F5E] px-3 py-1.5 border-2 border-black bg-white shadow-[2px_2px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver a la Tienda</span>
          </Link>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="container mx-auto max-w-3xl px-4 sm:px-6 pt-8 sm:pt-12 space-y-8">
        {/* BANNER DE TÍTULO */}
        <div className="space-y-3 border-b-2 border-black pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-[#581C87] text-[#FACC15] px-2.5 py-1 border-2 border-black font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#0A0A0A] -rotate-1">
              <Scale className="h-3.5 w-3.5" />
              <span>MARCO LEGAL OFICIAL</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-white text-slate-700 px-2.5 py-1 border border-black font-mono text-[11px] font-bold uppercase">
              <span>ACTUALIZADO: {lastUpdated}</span>
            </span>
          </div>

          <h1 className="font-oswald text-4xl sm:text-5xl font-black uppercase tracking-tight text-black leading-none">
            TÉRMINOS Y CONDICIONES <span className="text-[#F43F5E]">DE SERVICIO</span>
          </h1>

          <p className="font-mono text-xs sm:text-sm text-slate-700 leading-relaxed">
            Al realizar un pedido o cotización a través de nuestra plataforma web o canales de atención directa,
            el cliente acepta íntegramente las condiciones de confección, pagos, garantías y producción aquí descritas.
          </p>
        </div>

        {/* TARJETA DE CONTENIDO LEGAL */}
        <article className="bg-white border-2 border-black p-6 sm:p-10 shadow-[6px_6px_0px_#0A0A0A] space-y-8 text-sm sm:text-base leading-relaxed text-slate-900">
          {/* SECCIÓN 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black pb-2">
              <span className="bg-black text-[#FACC15] font-mono text-xs font-bold px-2 py-0.5">01</span>
              <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black">
                Identificación del Taller y Servicio
              </h2>
            </div>
            <p>
              <strong>AlquimiaTex</strong> es un taller artesanal dedicado a la sublimación, estampado de alta durabilidad y
              confección textil, con centro de operaciones en La Dolorita, Petare, Municipio Sucre, Caracas, República Bolivariana de Venezuela.
            </p>
            <p className="text-sm text-slate-700">
              Nuestro servicio comprende la personalización de franelas y camisetas (en telas Microdurazno, Jersey/Algodón, Algodón Peinado y Poliéster Deportivo),
              mousepads de alta densidad antideslizantes, rompecabezas sublimados y artículos promocionales corporativos o personales.
            </p>
          </section>

          {/* SECCIÓN 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black pb-2">
              <span className="bg-black text-[#FACC15] font-mono text-xs font-bold px-2 py-0.5">02</span>
              <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black">
                Proceso de Pedido y Confirmación
              </h2>
            </div>
            <ol className="list-decimal pl-5 space-y-2 text-sm sm:text-base">
              <li>
                <strong>Configuración Web:</strong> El cliente selecciona artículos, tallas, cortes, colores y telas en el configurador online (<code>/pedido</code>).
              </li>
              <li>
                <strong>Código Único:</strong> Al completar el formulario, el sistema genera automáticamente un código identificador amigable con el formato <code>#ALQ-XXXX</code>.
              </li>
              <li>
                <strong>Confirmación por WhatsApp:</strong> La orden se remite de manera inmediata a nuestro canal oficial de WhatsApp (<code>{SOCIAL_INFO.whatsappFormatted}</code>) para verificar resolución de artes, disponibilidad inmediata y coordinar el pago.
              </li>
            </ol>
            <p className="text-xs font-mono text-slate-600 bg-[#F8F5EE] p-3 border-l-4 border-[#06B6D4]">
              Ningún pedido entra a la cola de corte y confección hasta haber sido verificado en WhatsApp y confirmado el pago/abono correspondiente.
            </p>
          </section>

          {/* SECCIÓN 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black pb-2">
              <span className="bg-black text-[#FACC15] font-mono text-xs font-bold px-2 py-0.5">03</span>
              <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black">
                Condiciones de Pago
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 pt-1">
              <div className="bg-[#F8F5EE] border-2 border-black p-4 space-y-1.5 shadow-[2px_2px_0px_#0A0A0A]">
                <span className="font-oswald text-base font-bold text-black uppercase block">
                  Pedidos por Unidad (Al Detal)
                </span>
                <p className="font-mono text-xs text-slate-700">
                  Requieren la cancelación del <strong>100% anticipado</strong> de forma obligatoria antes de iniciar la impresión y estampado.
                </p>
              </div>

              <div className="bg-[#F8F5EE] border-2 border-black p-4 space-y-1.5 shadow-[2px_2px_0px_#0A0A0A]">
                <span className="font-oswald text-base font-bold text-black uppercase block">
                  Pedidos por Docena (Al Mayor)
                </span>
                <p className="font-mono text-xs text-slate-700">
                  A partir de 12 unidades, se requiere un <strong>50% de abono inicial</strong> para compra de insumos y corte, liquidando el <strong>50% restante contra entrega</strong>.
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 font-mono">
              <strong>Métodos aceptados:</strong> Pago Móvil (banca venezolana a tasa oficial BCV), transferencia bancaria nacional, Binance Pay (USDT) o Efectivo en taller.
            </p>
          </section>

          {/* SECCIÓN 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black pb-2">
              <span className="bg-black text-[#FACC15] font-mono text-xs font-bold px-2 py-0.5">04</span>
              <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black">
                Tiempos de Entrega y Producción
              </h2>
            </div>
            <p>
              El tiempo estándar de producción es de <strong>4 a 7 días hábiles</strong>, contados a partir del siguiente día hábil en que se confirme de forma efectiva el pago o abono y se apruebe el mockup final.
            </p>
            <p className="text-xs font-mono text-slate-600">
              * Los días hábiles comprenden de lunes a viernes, exceptuando feriados bancarios o nacionales. En pedidos de alto volumen (más de 100 unidades), el cronograma de entregas parciales o totales se acuerda por escrito en WhatsApp.
            </p>
          </section>

          {/* SECCIÓN 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black pb-2">
              <span className="bg-[#F43F5E] text-white font-mono text-xs font-bold px-2 py-0.5">05</span>
              <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black">
                Garantía y Política de No Cambio por Tallas
              </h2>
            </div>
            <div className="bg-[#FFE4E6] border-2 border-[#F43F5E] p-4 text-xs sm:text-sm font-mono text-[#881337] space-y-2">
              <div className="flex items-center gap-2 font-bold uppercase">
                <AlertTriangle className="h-4 w-4 shrink-0 text-[#E11D48]" />
                <span>ADVERTENCIA CRÍTICA SOBRE ELECCIÓN DE TALLAS</span>
              </div>
              <p>
                Al tratarse de prendas y artículos personalizados bajo pedido exclusivo, <strong>NO se realizan cambios, devoluciones ni reembolsos por errores en la elección de tallas, cortes, colores o telas</strong> por parte del cliente.
              </p>
            </div>
            <p className="text-sm text-slate-700">
              El cliente tiene la responsabilidad de consultar la guía de medidas antes de confirmar. AlquimiaTex responderá y repondrá la pieza únicamente ante defectos de confección comprobables en costura o fallas severas de sublimación atribuibles al taller.
            </p>
          </section>

          {/* SECCIÓN 6 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black pb-2">
              <span className="bg-black text-[#FACC15] font-mono text-xs font-bold px-2 py-0.5">06</span>
              <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black">
                Estampados Incluidos y Mockup Digital Gratuito
              </h2>
            </div>
            <ul className="space-y-2 text-sm text-slate-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Hasta 2 estampados por pieza:</strong> El costo base por prenda incluye hasta dos zonas sublimadas (por ejemplo: pecho + espalda, o delantero + manga).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Mockup digital previo gratis:</strong> Elaboramos una muestra digital (render) para que el cliente verifique proporciones, colores y posición del diseño antes de ingresar la tela a la plancha de sublimación.
                </span>
              </li>
            </ul>
          </section>

          {/* SECCIÓN 7 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black pb-2">
              <span className="bg-black text-[#FACC15] font-mono text-xs font-bold px-2 py-0.5">07</span>
              <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black">
                Propiedad Intelectual y Derechos del Diseño
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-800">
              El cliente declara y garantiza bajo su exclusiva responsabilidad que posee los derechos de uso, licencias, autorizaciones o permisos necesarios sobre todos los logotipos, marcas, ilustraciones, textos o imágenes que cargue o envíe para su confección.
            </p>
            <p className="text-xs font-mono text-slate-600">
              AlquimiaTex actúa estrictamente como prestador de servicios de manufactura y estampado y queda eximido de cualquier reclamo civil, administrativo o penal derivado de infracciones a derechos de autor o marcas registradas cometidas por el contratante.
            </p>
          </section>

          {/* SECCIÓN 8 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black pb-2">
              <span className="bg-black text-[#FACC15] font-mono text-xs font-bold px-2 py-0.5">08</span>
              <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black">
                Derecho de Exhibición en Portafolio y Redes Sociales
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-800">
              Como taller creativo y artesanal, AlquimiaTex se reserva el derecho de fotografiar, grabar en video y exhibir las prendas y productos finalizados en sus redes sociales (Instagram <code>@alquimia_tex</code>), catálogo digital y sitio web con fines estrictamente testimoniales y de portafolio, protegiendo siempre los datos personales y de contacto del cliente.
            </p>
            <p className="text-xs font-mono text-slate-600">
              Si un cliente requiere exclusividad absoluta o confidencialidad comercial temporal (ej. lanzamientos corporativos privados), deberá manifestarlo expresamente antes de iniciar la confección.
            </p>
          </section>

          {/* SECCIÓN 9 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black pb-2">
              <span className="bg-black text-[#FACC15] font-mono text-xs font-bold px-2 py-0.5">09</span>
              <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black">
                Ley Aplicable y Jurisdicción
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-800">
              Estos términos y condiciones se rigen e interpretan bajo el ordenamiento jurídico de la <strong>República Bolivariana de Venezuela</strong>.
              Cualquier discrepancia no resuelta de mutuo acuerdo será sometida a la jurisdicción de los tribunales competentes de la Circunscripción Judicial del Área Metropolitana de Caracas.
            </p>
          </section>

          {/* SELLO Y MARCA FINAL */}
          <div className="pt-6 border-t-2 border-dashed border-black flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-mono text-xs font-bold text-black uppercase">
                Taller Textil AlquimiaTex &bull; La Dolorita, Petare
              </p>
              <p className="font-mono text-[11px] text-slate-500">
                Atención al cliente vía WhatsApp: {SOCIAL_INFO.whatsappFormatted}
              </p>
            </div>
            <RegistrationMark label="TERMS_V1.0_APPROVED" />
          </div>
        </article>
      </main>
    </div>
  );
}
