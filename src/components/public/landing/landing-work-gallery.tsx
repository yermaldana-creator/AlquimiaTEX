"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Coffee, Layers, Puzzle } from "lucide-react";
import { RegistrationMark } from "./alchemy-graphics";
import {
  GALLERY_CATEGORIES,
  GALLERY_ITEMS,
  GalleryItem,
} from "@/lib/landing-content";

export function LandingWorkGallery() {
  const [activeCategory, setActiveCategory] = useState<string>("todas");

  const filteredItems: GalleryItem[] =
    activeCategory === "todas"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <section id="trabajos" className="py-16 md:py-24 bg-[#ECE7DC] border-b-2 border-black px-4 sm:px-6 md:px-10">
      <div className="container mx-auto max-w-6xl space-y-10">
        {/* ENCABEZADO DE EXPOSICIÓN */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-black pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#06B6D4] text-black px-3 py-0.5 font-mono text-xs font-black uppercase border border-black shadow-[2px_2px_0px_#0A0A0A]">
              <span>MUESTRARIO OFICIAL 2026</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-oswald font-black uppercase tracking-tight text-black leading-none">
              NUESTROS TRABAJOS COMO <span className="bg-[#FACC15] px-2">OBRAS DE ARTE</span>
            </h2>
            <p className="font-mono text-xs sm:text-sm text-slate-700 max-w-xl">
              Cada pieza pasa por control térmico en La Dolorita. Especialistas en <strong>tazas mágicas</strong>, Mousepads y mucho más.
            </p>
          </div>

          <div className="font-mono text-xs font-bold text-right hidden sm:block">
            <span>[ GALERÍA DE TALLER ]</span> <br />
            <span className="text-[#F43F5E]">DISEÑOS PERSONALIZADOS</span>
          </div>
        </div>

        {/* SELECTOR DE CATEGORÍAS TIPO BOTONES DE PRENSA */}
        <div className="flex flex-wrap items-center gap-2">
          {GALLERY_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 border-2 border-black font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-black text-[#FACC15] shadow-[3px_3px_0px_#F43F5E] -translate-y-0.5"
                    : "bg-white text-black hover:bg-slate-100 shadow-[2px_2px_0px_#0A0A0A]"
                }`}
              >
                {cat.id === "tazas" && <Coffee className="h-3.5 w-3.5 text-[#F43F5E]" />}
                {cat.id === "franelas" && <Layers className="h-3.5 w-3.5 text-[#06B6D4]" />}
                {cat.id === "rompecabezas" && <Puzzle className="h-3.5 w-3.5 text-[#F59E0B]" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* GRILLA DE OBRAS DE ARTE / EXHIBICIÓN */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              className="group relative flex flex-col bg-white border-2 border-black shadow-[5px_5px_0px_#0A0A0A] hover:shadow-[7px_7px_0px_#F43F5E] transition-all duration-300 hover:-translate-y-1"
            >
              {/* ENCABEZADO DE FICHA TÉCNICA */}
              <div className="flex items-center justify-between border-b border-black px-3 py-1.5 bg-[#F8F5EE] text-[10px] font-mono font-bold">
                <RegistrationMark label={`OBRA_0${idx + 1}`} />
                <span className="text-[#F43F5E] uppercase">{item.category}</span>
              </div>

              {/* IMAGEN O VIDEO DE LA OBRA */}
              <div className="relative aspect-square w-full overflow-hidden bg-slate-900 border-b-2 border-black">
                {item.mediaType === "video" ||
                (item.videoUrl &&
                  (item.videoUrl.endsWith(".mp4") || item.videoUrl.endsWith(".webm"))) ||
                (item.imageUrl &&
                  (item.imageUrl.endsWith(".mp4") || item.imageUrl.endsWith(".webm"))) ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  >
                    <source
                      src={item.videoUrl || item.imageUrl}
                      type={(item.videoUrl || item.imageUrl).endsWith(".webm") ? "video/webm" : "video/mp4"}
                    />
                    Tu navegador no soporta video HTML5.
                  </video>
                ) : (
                  <Image
                    src={item.videoUrl || item.imageUrl}
                    alt={item.title}
                    fill
                    unoptimized={(item.videoUrl || item.imageUrl).toLowerCase().endsWith(".gif")}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}

                {/* BADGE DE TÉCNICA FLOTANTE */}
                <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                  <span className="inline-flex items-center gap-1 bg-black/90 text-white px-2 py-0.5 text-[10px] font-mono font-bold border border-white/30 backdrop-blur-sm">
                    <Sparkles className="h-2.5 w-2.5 text-[#FACC15]" />
                    {item.technique}
                  </span>
                </div>
              </div>

              {/* CUERPO DE LA FICHA DE MUSEO */}
              <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                    {item.categoryLabel}
                  </span>
                  <h3 className="text-base font-oswald font-black uppercase text-black line-clamp-1 group-hover:text-[#581C87] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs font-sans text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 border border-emerald-300">
                    DISPONIBLE
                  </span>
                  <Link
                    href="/pedido"
                    className="inline-flex items-center gap-1 font-oswald text-xs font-black uppercase text-black hover:text-[#F43F5E] transition-colors"
                  >
                    <span>Cotizar esta pieza</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* NOTA AL PIE DE LA EXPOSICIÓN */}
        <div className="border-2 border-dashed border-black bg-white p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-lg">✦</span>
            <span>
              <strong>¿Buscas una técnica especial?</strong> Realizamos transfer térmico, vinil textil y sublimación en cualquier formato.
            </span>
          </div>
          <Link
            href="/pedido"
            className="bg-black text-[#FACC15] hover:bg-[#581C87] px-4 py-2 font-oswald uppercase font-black tracking-wider border border-black shrink-0 transition-all shadow-[2px_2px_0px_#FACC15]"
          >
            Hacer Pedido Personalizado [→]
          </Link>
        </div>
      </div>
    </section>
  );
}
