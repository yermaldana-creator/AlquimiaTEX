import Link from "next/link";
import { Check, ArrowRight, AlertTriangle } from "lucide-react";
import {
  WHOLESALE_CATALOG_OFFERS,
  CATALOG_POLICIES,
  ORDER_PRICING_CONDITIONS,
} from "@/lib/constants";

export function LandingWholesaleOffers() {
  return (
    <section id="ofertas" className="py-16 md:py-24 bg-[#F3EFE6] border-b-2 border-black px-4 sm:px-6 md:px-10">
      <div className="container mx-auto max-w-6xl space-y-12">
        {/* ENCABEZADO DE TARIFAS */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-block bg-[#FACC15] text-black px-3 py-1 font-mono text-xs font-black uppercase border-2 border-black shadow-[3px_3px_0px_#0A0A0A] -rotate-1">
            ★ LISTA DE PRECIOS MAYORISTA
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-oswald font-black uppercase tracking-tight text-black leading-none">
            OFERTAS POR DOCENA <br className="hidden sm:inline" />
            <span className="text-[#F43F5E]">DEL CATÁLOGO OFICIAL</span>
          </h2>
          <p className="font-mono text-xs sm:text-sm text-slate-700">
            Ahorra a partir de 12 unidades en prendas con hasta 2 estampados incluidos (pecho y espalda).
          </p>
        </div>

        {/* LAS 3 TARJETAS BASE BRUTALISTAS */}
        <div className="grid gap-6 md:grid-cols-3">
          {WHOLESALE_CATALOG_OFFERS.map((offer, index) => {
            const isPopular = index === 0;
            return (
              <div
                key={offer.id}
                className={`relative flex flex-col justify-between bg-white border-3 border-black p-6 transition-all duration-300 ${
                  isPopular
                    ? "shadow-[8px_8px_0px_#F43F5E] -translate-y-1 bg-gradient-to-b from-[#FFFDF9] to-white"
                    : "shadow-[6px_6px_0px_#0A0A0A] hover:shadow-[8px_8px_0px_#06B6D4]"
                }`}
              >
                {/* STICKER POPULAR */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#F43F5E] text-white px-3 py-1 font-oswald uppercase text-xs font-black border-2 border-black shadow-[2px_2px_0px_#0A0A0A] tracking-wider z-10">
                    ★ MÁS SOLICITADA EN CARACAS
                  </div>
                )}

                <div className="space-y-4">
                  {/* CABECERA DE TARJETA */}
                  <div className="flex items-center justify-between border-b border-black pb-2 text-[10px] font-mono font-bold">
                    <span className="bg-black text-[#FACC15] px-1.5 py-0.5 uppercase">
                      {offer.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-oswald font-black uppercase text-black">
                      {offer.name}
                    </h3>
                    <p className="text-xs font-sans text-slate-600 mt-1 leading-relaxed">
                      {offer.description}
                    </p>
                  </div>

                  {/* CAJA DE PRECIO GIGANTE */}
                  <div className="bg-[#F8F5EE] border-2 border-black p-4 text-center space-y-1 shadow-[3px_3px_0px_#0A0A0A]">
                    <div className="flex items-baseline justify-center gap-1 font-oswald">
                      <span className="text-5xl font-black text-black">${offer.unitPrice}</span>
                      <span className="text-xs font-mono font-bold text-slate-600 uppercase">c/u al mayor</span>
                    </div>
                    <p className="font-mono text-xs font-black text-[#581C87] border-t border-slate-300 pt-1">
                      DOCENA COMPLETA: ${offer.dozenPrice} USD
                    </p>
                  </div>

                  {/* CARACTERÍSTICAS INCLUIDAS */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                      Especificaciones:
                    </span>
                    <ul className="space-y-1.5 text-xs font-sans">
                      {offer.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-800">
                          <Check className="h-4 w-4 shrink-0 text-emerald-600 font-black mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      <li className="flex items-start gap-2 text-slate-800 font-medium">
                        <Check className="h-4 w-4 shrink-0 text-emerald-600 font-black mt-0.5" />
                        <span>Mockup digital previo sin costo</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* BOTÓN DE ACCIÓN */}
                <div className="pt-6">
                  <Link
                    href="/pedido"
                    className={`w-full py-3 px-4 font-oswald uppercase text-sm font-black border-2 border-black flex items-center justify-center gap-2 transition-all ${
                      isPopular
                        ? "bg-[#FACC15] hover:bg-[#FFE600] text-black shadow-[3px_3px_0px_#0A0A0A]"
                        : "bg-white hover:bg-black hover:text-white text-black shadow-[3px_3px_0px_#0A0A0A]"
                    }`}
                  >
                    <span>Pedir {offer.name.split(" ")[0]}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* MODALIDADES DE PAGO (UNIDAD VS DOCENA) */}
        <div className="grid gap-6 md:grid-cols-2 pt-4">
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_#0A0A0A] space-y-2">
            <div className="flex items-center justify-between font-mono">
              <span className="text-xs font-black uppercase text-black">
                {ORDER_PRICING_CONDITIONS.unidad.title}
              </span>
              <span className="bg-black text-white text-[10px] font-bold px-1.5 py-0.5">
                {ORDER_PRICING_CONDITIONS.unidad.badge}
              </span>
            </div>
            <p className="font-oswald text-base font-black text-[#581C87] uppercase">
              {ORDER_PRICING_CONDITIONS.unidad.condition}
            </p>
            <p className="font-sans text-xs text-slate-600">
              {ORDER_PRICING_CONDITIONS.unidad.description}
            </p>
          </div>

          <div className="bg-[#FFFDF9] border-2 border-black p-5 shadow-[4px_4px_0px_#FACC15] space-y-2">
            <div className="flex items-center justify-between font-mono">
              <span className="text-xs font-black uppercase text-black">
                {ORDER_PRICING_CONDITIONS.docena.title}
              </span>
              <span className="bg-[#FACC15] text-black text-[10px] font-bold px-1.5 py-0.5 border border-black">
                {ORDER_PRICING_CONDITIONS.docena.badge}
              </span>
            </div>
            <p className="font-oswald text-base font-black text-[#581C87] uppercase">
              {ORDER_PRICING_CONDITIONS.docena.condition}
            </p>
            <p className="font-sans text-xs text-slate-600">
              {ORDER_PRICING_CONDITIONS.docena.description}
            </p>
          </div>
        </div>

        {/* POLÍTICAS Y REGLAS OFICIALES EN CAJA TIPO ADVERTENCIA DE TALLER */}
        <div className="border-3 border-black bg-[#FACC15] p-5 sm:p-6 shadow-[6px_6px_0px_#0A0A0A] text-black space-y-3">
          <div className="flex items-center gap-2 font-oswald text-lg font-black uppercase tracking-wide">
            <AlertTriangle className="h-5 w-5 text-black shrink-0" />
            <span>Condiciones Oficiales y Garantías AlquimiaTex</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 font-mono text-xs text-black border-t-2 border-black pt-3">
            <p>
              <strong>• TIEMPO DE ENTREGA:</strong> 4 a 7 días hábiles desde la confirmación del pago/abono.
            </p>
            <p>
              <strong>• ESTAMPADOS:</strong> Incluye hasta 2 estampados por pieza (delante y detrás).
            </p>
            <p>
              <strong>• EXCLUSIONES:</strong> {CATALOG_POLICIES.volumeExclusions}
            </p>
            <p>
              <strong>• GARANTÍA OFICIAL:</strong> {CATALOG_POLICIES.sizeGuarantee}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
