"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, Layers, Coffee } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <section id="trabajos" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
        {/* ENCABEZADO DE SECCIÓN */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge
            variant="outline"
            className="font-semibold text-xs text-primary border-primary/30"
          >
            Muestrario de Calidad
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Nuestros Trabajos y Acabados
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Conoce parte de nuestras piezas confeccionadas y sublimadas: franelas microdurazno,
            <strong> tazas mágicas termosensibles</strong>, mugs corporativos, puzzles y mousepads gaming.
          </p>
        </div>

        {/* SELECTOR DE CATEGORÍAS / FILTROS */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {GALLERY_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.id === "tazas" && <Coffee className="h-3.5 w-3.5 mr-1" />}
                {cat.id === "franelas" && <Layers className="h-3.5 w-3.5 mr-1" />}
                <span>{cat.label}</span>
              </Button>
            );
          })}
        </div>

        {/* GRILLA DE FOTOGRAFÍAS */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
            >
              {/* IMAGEN DE LA PIEZA */}
              <div className="relative aspect-square w-full overflow-hidden bg-muted">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                {/* BADGE DE TÉCNICA */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/20">
                    <Sparkles className="h-2.5 w-2.5 text-amber-400" />
                    {item.technique}
                  </span>
                </div>

                {/* CATEGORÍA FLOTANTE */}
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[11px] font-semibold text-amber-300 drop-shadow-sm uppercase tracking-wider">
                    {item.categoryLabel}
                  </span>
                  <h3 className="text-sm font-bold text-white drop-shadow-md line-clamp-1">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* DETALLES DE LA TARJETA */}
              <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Personalizable 100%
                  </span>
                  <Link
                    href="/pedido"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    <span>Pedir</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* NOTA PARA PERSONALIZACIÓN */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            ¿Tienes una idea o proyecto corporativo especial?{" "}
            <Link href="/pedido" className="text-primary font-bold hover:underline">
              Crea tu pedido en línea
            </Link>{" "}
            o solicita asesoría personalizada.
          </p>
        </div>
      </div>
    </section>
  );
}
