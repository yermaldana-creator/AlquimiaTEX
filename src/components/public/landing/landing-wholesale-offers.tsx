import Link from "next/link";
import { Check, ArrowRight, Info } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  WHOLESALE_CATALOG_OFFERS,
  CATALOG_POLICIES,
  ORDER_PRICING_CONDITIONS,
} from "@/lib/constants";

export function LandingWholesaleOffers() {
  return (
    <section id="ofertas" className="py-16 md:py-24 bg-muted/20 border-t border-border/40">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
        {/* ENCABEZADO DE OFERTAS */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="secondary" className="font-semibold text-xs text-primary">
            Precios al Mayor
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Ofertas por Docena del Catálogo Oficial
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Precios base diseñados para marcas, uniformes corporativos, eventos y revendedores.
            Ahorra con tarifas especiales a partir de 12 unidades.
          </p>
        </div>

        {/* TARJETAS DE OFERTAS */}
        <div className="grid gap-6 md:grid-cols-3">
          {WHOLESALE_CATALOG_OFFERS.map((offer, index) => {
            const isPopular = index === 0;
            return (
              <Card
                key={offer.id}
                className={`relative flex flex-col justify-between border transition-all duration-300 hover:shadow-xl ${
                  isPopular
                    ? "border-primary shadow-md bg-gradient-to-b from-primary/[0.04] to-card"
                    : "border-border/60 bg-card"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground font-bold text-[10px] px-3 py-0.5 shadow-sm">
                      MÁS SOLICITADA
                    </Badge>
                  </div>
                )}

                <CardHeader className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {offer.tag}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">
                      2 estampados inc.
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold mt-2">{offer.name}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {offer.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="rounded-xl bg-muted/40 p-4 border border-border/40 space-y-1 text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-black text-foreground">${offer.unitPrice}</span>
                      <span className="text-xs text-muted-foreground font-medium">c/u al mayor</span>
                    </div>
                    <p className="text-xs font-semibold text-primary">
                      Docena completa: ${offer.dozenPrice}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
                      Qué incluye esta oferta:
                    </p>
                    <ul className="space-y-1.5">
                      {offer.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                          <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <span>Mockup digital de confirmación sin costo</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Link
                    href="/pedido"
                    className={cn(
                      buttonVariants({ variant: isPopular ? "default" : "outline" }),
                      "w-full font-semibold shadow-sm gap-1.5"
                    )}
                  >
                    <span>Hacer Pedido de {offer.name.split(" ")[0]}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* CONDICIONES DE PAGO: UNIDAD VS DOCENA */}
        <div className="grid gap-6 md:grid-cols-2 pt-4">
          <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                {ORDER_PRICING_CONDITIONS.unidad.title}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {ORDER_PRICING_CONDITIONS.unidad.badge}
              </Badge>
            </div>
            <p className="text-xs font-bold text-primary">
              {ORDER_PRICING_CONDITIONS.unidad.condition}
            </p>
            <p className="text-xs text-muted-foreground">
              {ORDER_PRICING_CONDITIONS.unidad.description}
            </p>
          </div>

          <div className="rounded-2xl border border-primary/40 bg-primary/[0.03] p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                {ORDER_PRICING_CONDITIONS.docena.title}
              </span>
              <Badge className="text-[10px] bg-primary text-primary-foreground">
                {ORDER_PRICING_CONDITIONS.docena.badge}
              </Badge>
            </div>
            <p className="text-xs font-bold text-primary">
              {ORDER_PRICING_CONDITIONS.docena.condition}
            </p>
            <p className="text-xs text-muted-foreground">
              {ORDER_PRICING_CONDITIONS.docena.description}
            </p>
          </div>
        </div>

        {/* POLÍTICAS CLAVE DEL TALLER */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.05] p-5 text-xs text-foreground space-y-3">
          <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
            <Info className="h-4 w-4 shrink-0" />
            <span>Condiciones y Garantías Oficiales de AlquimiaTex</span>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2 text-muted-foreground pl-6 list-disc">
            <li>
              <strong>Estampados incluidos:</strong> Hasta 2 estampados por pieza (delante y detrás) en todas las ofertas.
            </li>
            <li>
              <strong>Exclusiones:</strong> {CATALOG_POLICIES.volumeExclusions}
            </li>
            <li>
              <strong>Diseño digital:</strong> {CATALOG_POLICIES.digitalMockup}
            </li>
            <li>
              <strong>Garantía oficial:</strong> {CATALOG_POLICIES.sizeGuarantee}
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
