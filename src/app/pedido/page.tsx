"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { OrderStep1 } from "@/components/public/order-step-1";
import { Badge } from "@/components/ui/badge";

export default function PedidoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* ENCABEZADO Y BRANDING */}
        <header className="mb-8 space-y-4 text-center sm:text-left">
          <div className="flex flex-col gap-3 border-b border-border/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
                  AT
                </span>
                <h1 className="text-2xl font-black tracking-tight text-foreground">
                  Alquimia<span className="text-primary">Tex</span>
                </h1>
                <Badge variant="accent" className="text-[10px] font-semibold">
                  Taller La Dolorita
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Sublimación y personalización textil en Caracas, Venezuela
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Volver a la tienda</span>
            </Link>
          </div>

          {/* INDICADOR DE PROGRESO */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-primary">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
                  1
                </span>
                Paso 1: Producto y Variantes
              </span>
              <span className="text-muted-foreground">Paso 1 de 3</span>
            </div>

            {/* Barra de progreso */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: "33.33%" }}
              />
            </div>
          </div>
        </header>

        {/* CONTENEDOR DEL FORMULARIO PASO 1 */}
        <main className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-7">
          <div className="mb-6 border-b border-border/60 pb-4">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">Personaliza tu pedido</h2>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Selecciona el artículo que deseas, sus características y la cantidad.
            </p>
          </div>

          <OrderStep1 />
        </main>

        {/* FOOTER INFORMATIVO */}
        <footer className="mt-8 space-y-2 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Precios transparentes a cotizar • Sin pasarelas de pago externas</span>
          </div>
          <p>© {new Date().getFullYear()} AlquimiaTex. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
}
