import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Database, Trash2, CheckCircle2, EyeOff, UserCheck, MessageCircle } from "lucide-react";
import { RegistrationMark } from "@/components/public/landing/alchemy-graphics";
import { SOCIAL_INFO } from "@/lib/landing-content";

export const metadata: Metadata = {
  title: "Política de Privacidad y Protección de Datos | AlquimiaTex",
  description:
    "Conoce cómo AlquimiaTex protege, almacena y gestiona tus datos personales y diseños para la confección textil en Caracas, Venezuela.",
};

export default function PrivacidadPage() {
  const lastUpdated = "14 de Octubre de 2026";
  const whatsappUrl = `https://wa.me/${SOCIAL_INFO.whatsappNumber}?text=${encodeURIComponent(
    "Hola AlquimiaTex, deseo ejercer mis derechos de privacidad y solicitar la gestión/eliminación de mis datos personales."
  )}`;

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-black selection:bg-[#06B6D4] selection:text-black font-sans pb-16">
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
            <span className="hidden sm:inline-block bg-[#06B6D4] text-black text-[10px] font-mono font-bold px-2 py-0.5 border border-black uppercase shadow-[1.5px_1.5px_0px_#0A0A0A]">
              DATOS PROTEGIDOS
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-black hover:text-[#06B6D4] px-3 py-1.5 border-2 border-black bg-white shadow-[2px_2px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
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
            <span className="inline-flex items-center gap-1.5 bg-[#06B6D4] text-black px-2.5 py-1 border-2 border-black font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#0A0A0A] -rotate-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>PRIVACIDAD & SEGURIDAD</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-white text-slate-700 px-2.5 py-1 border border-black font-mono text-[11px] font-bold uppercase">
              <span>ACTUALIZADO: {lastUpdated}</span>
            </span>
          </div>

          <h1 className="font-oswald text-4xl sm:text-5xl font-black uppercase tracking-tight text-black leading-none">
            POLÍTICA DE PRIVACIDAD <span className="text-[#06B6D4]">Y DATOS</span>
          </h1>

          <p className="font-mono text-xs sm:text-sm text-slate-700 leading-relaxed">
            En AlquimiaTex nos tomamos muy en serio la confianza de nuestros clientes. Aquí te explicamos con
            total transparencia qué información recopilamos, cómo la protegemos con tecnología de primer nivel
            y cuáles son tus derechos.
          </p>
        </div>

        {/* TARJETA DE CONTENIDO LEGAL */}
        <article className="bg-white border-2 border-black p-6 sm:p-10 shadow-[6px_6px_0px_#0A0A0A] space-y-8 text-sm sm:text-base leading-relaxed text-slate-900">
          {/* SECCIÓN 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black pb-2">
              <span className="bg-black text-[#FACC15] font-mono text-xs font-bold px-2 py-0.5">01</span>
              <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black">
                Responsable del Tratamiento
              </h2>
            </div>
            <p>
              El responsable de la recolección, resguardo y tratamiento de tus datos es el taller artesanal{" "}
              <strong>AlquimiaTex</strong>, domiciliado en el sector La Dolorita, Petare, Municipio Sucre, Caracas,
              República Bolivariana de Venezuela.
            </p>
            <p className="text-sm text-slate-700">
              Canal oficial de atención para asuntos de privacidad: WhatsApp{" "}
              <strong>{SOCIAL_INFO.whatsappFormatted}</strong>.
            </p>
          </section>

          {/* SECCIÓN 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black pb-2">
              <span className="bg-black text-[#FACC15] font-mono text-xs font-bold px-2 py-0.5">02</span>
              <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black">
                Datos que Recopilamos
              </h2>
            </div>
            <p>
              Para configurar y procesar tus piezas textiles y artículos personalizados en nuestro configurador web,
              solicitamos únicamente los datos indispensables:
            </p>
            <div className="grid gap-3 sm:grid-cols-2 pt-1">
              <div className="bg-[#F8F5EE] border-2 border-black p-4 space-y-1 shadow-[2px_2px_0px_#0A0A0A]">
                <div className="flex items-center gap-2 font-oswald text-base font-bold text-black uppercase">
                  <UserCheck className="h-4 w-4 text-[#581C87]" />
                  <span>Datos de Contacto</span>
                </div>
                <p className="font-mono text-xs text-slate-700">
                  Nombre completo y número telefónico con prefijo internacional para canalizar la orden por WhatsApp.
                </p>
              </div>

              <div className="bg-[#F8F5EE] border-2 border-black p-4 space-y-1 shadow-[2px_2px_0px_#0A0A0A]">
                <div className="flex items-center gap-2 font-oswald text-base font-bold text-black uppercase">
                  <Lock className="h-4 w-4 text-[#F43F5E]" />
                  <span>Artes y Diseños</span>
                </div>
                <p className="font-mono text-xs text-slate-700">
                  Imágenes de referencia, logotipos, ideas visuales o conceptos generados por IA que subes para estampar.
                </p>
              </div>

              <div className="bg-[#F8F5EE] border-2 border-black p-4 space-y-1 sm:col-span-2 shadow-[2px_2px_0px_#0A0A0A]">
                <div className="flex items-center gap-2 font-oswald text-base font-bold text-black uppercase">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Información de Pago</span>
                </div>
                <p className="font-mono text-xs text-slate-700">
                  Número de referencia del pago bancario, captura de comprobante de Pago Móvil, transferencia o Binance Pay.{" "}
                  <strong>No almacenamos datos sensibles de tarjetas de crédito o contraseñas bancarias.</strong>
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black pb-2">
              <span className="bg-black text-[#FACC15] font-mono text-xs font-bold px-2 py-0.5">03</span>
              <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black">
                Uso y Finalidad de los Datos
              </h2>
            </div>
            <p>
              Toda la información recolectada se utiliza de forma exclusiva y estricta para:
            </p>
            <ul className="space-y-2 text-sm text-slate-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Gestión de tu pedido:</strong> Identificar tus prendas, confeccionar tallas y aplicar los estampados acordados.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Comunicación directa por WhatsApp:</strong> Enviarte la confirmación del pedido (código <code>#ALQ-XXXX</code>), compartir el mockup digital para tu aprobación y coordinar la entrega o envío.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Verificación del pago:</strong> Conciliar el abono inicial o pago total antes de corte y estampado.
                </span>
              </li>
            </ul>
            <p className="text-xs font-mono text-slate-600 bg-[#F8F5EE] p-3 border-l-4 border-[#FACC15]">
              No utilizamos tu teléfono para campañas de spam invasivas ni publicidad no solicitada.
            </p>
          </section>

          {/* SECCIÓN 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black pb-2">
              <span className="bg-black text-[#FACC15] font-mono text-xs font-bold px-2 py-0.5">04</span>
              <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black">
                Almacenamiento y Seguridad (Supabase)
              </h2>
            </div>
            <p>
              Tus pedidos y archivos se almacenan en una infraestructura de base de datos segura provista por{" "}
              <strong>Supabase</strong> (PostgreSQL de grado empresarial), la cual cuenta con:
            </p>
            <div className="space-y-2 text-sm text-slate-800">
              <div className="flex items-start gap-2 bg-[#F8F5EE] p-3 border border-black">
                <Database className="h-4 w-4 text-[#06B6D4] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-mono text-xs uppercase text-black">Cifrado de Extremo a Extremo</strong>
                  <span className="text-xs font-mono text-slate-700">
                    Cifrado en tránsito mediante protocolos HTTPS / TLS 1.3 y cifrado en reposo (AES-256) en los servidores de base de datos y buckets de almacenamiento.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-[#F8F5EE] p-3 border border-black">
                <Lock className="h-4 w-4 text-[#581C87] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-mono text-xs uppercase text-black">Políticas de Acceso RLS (Row Level Security)</strong>
                  <span className="text-xs font-mono text-slate-700">
                    Mecanismos de control estricto que garantizan que solo el personal autorizado del taller puede consultar las órdenes registradas para fines de confección.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black pb-2">
              <span className="bg-black text-[#FACC15] font-mono text-xs font-bold px-2 py-0.5">05</span>
              <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black">
                No Compartición con Terceros
              </h2>
            </div>
            <div className="flex items-start gap-3 bg-[#FEF2F2] border-2 border-[#F43F5E] p-4 text-xs sm:text-sm font-mono text-[#991B1B]">
              <EyeOff className="h-5 w-5 shrink-0 text-[#E11D48]" />
              <p>
                <strong>Compromiso inquebrantable:</strong> AlquimiaTex jamás venderá, alquilará, intercambiará ni
                transferirá tus datos personales, números de contacto o imágenes de diseño a empresas de publicidad,
                agencias de marketing ni terceras entidades.
              </p>
            </div>
          </section>

          {/* SECCIÓN 6 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black pb-2">
              <span className="bg-black text-[#FACC15] font-mono text-xs font-bold px-2 py-0.5">06</span>
              <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black">
                Tiempo de Retención de la Información
              </h2>
            </div>
            <p>
              Mantenemos los registros de tus pedidos y archivos gráficos durante un período máximo de{" "}
              <strong>un (1) año</strong> a partir de la fecha de entrega de la orden.
            </p>
            <p className="text-xs font-mono text-slate-600">
              Este plazo nos permite dar soporte a garantías, agilizar reimpresiones exactas que el cliente solicite en el
              futuro y mantener la contabilidad interna del taller. Transcurrido este período, los registros se eliminan
              de forma periódica y segura de nuestras bases de datos.
            </p>
          </section>

          {/* SECCIÓN 7 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black pb-2">
              <span className="bg-black text-[#FACC15] font-mono text-xs font-bold px-2 py-0.5">07</span>
              <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black">
                Derechos del Usuario y Eliminación de Datos
              </h2>
            </div>
            <p>
              Como titular de tus datos, tienes derecho a solicitar en cualquier momento la consulta, actualización o
              <strong> eliminación definitiva</strong> de tus registros, teléfonos e imágenes de nuestros servidores.
            </p>
            <div className="bg-[#F8F5EE] border-2 border-black p-4 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-black">
                <Trash2 className="h-4 w-4 text-[#F43F5E]" />
                <span>¿Cómo solicitar el borrado de tus datos?</span>
              </div>
              <p className="text-xs text-slate-700 font-mono">
                Basta con escribir a nuestro WhatsApp oficial indicando tu nombre y tu código de pedido (ej. <code>#ALQ-XXXX</code>) con la frase: <em>&quot;Deseo eliminar mis datos personales&quot;</em>. Procederemos a la baja de tus registros en un plazo no mayor a 48 horas laborables.
              </p>
              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-white text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 border-2 border-black font-mono text-xs font-bold shadow-[2px_2px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Contactar a WhatsApp para Privacidad</span>
                </a>
              </div>
            </div>
          </section>

          {/* SECCIÓN 8 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black pb-2">
              <span className="bg-black text-[#FACC15] font-mono text-xs font-bold px-2 py-0.5">08</span>
              <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black">
                Legislación Aplicable
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-800">
              Esta política se rige por las leyes vigentes de la <strong>República Bolivariana de Venezuela</strong>,
              en particular por la Constitución Nacional en materia de derecho al honor y la intimidad, así como las
              normativas sobre mensajes de datos y comercio electrónico.
            </p>
          </section>

          {/* SELLO Y MARCA FINAL */}
          <div className="pt-6 border-t-2 border-dashed border-black flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-mono text-xs font-bold text-black uppercase">
                Taller Textil AlquimiaTex &bull; La Dolorita, Petare
              </p>
              <p className="font-mono text-[11px] text-slate-500">
                Atención y privacidad vía WhatsApp: {SOCIAL_INFO.whatsappFormatted}
              </p>
            </div>
            <RegistrationMark label="PRIVACY_V1.0_SECURE" />
          </div>
        </article>
      </main>
    </div>
  );
}
