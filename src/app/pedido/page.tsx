"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { OrderStep1 } from "@/components/public/order-step-1";
import { OrderStep2 } from "@/components/public/order-step-2";
import { Badge } from "@/components/ui/badge";
import type { Step1ProductFormData } from "@/types";

const STEP_STORAGE_KEY = "alquimiatex_current_step";

export default function PedidoPage() {
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [step1Data, setStep1Data] = React.useState<Step1ProductFormData | null>(null);

  React.useEffect(() => {
    try {
      const savedStep = localStorage.getItem(STEP_STORAGE_KEY);
      if (savedStep) {
        const stepNum = parseInt(savedStep, 10);
        if (stepNum === 1 || stepNum === 2) setCurrentStep(stepNum);
      }
      const savedStep1 = localStorage.getItem("alquimiatex_order_step1");
      if (savedStep1) {
        setStep1Data(JSON.parse(savedStep1));
      }
    } catch {}
  }, []);

  const changeStep = (step: number) => {
    setCurrentStep(step);
    try {
      localStorage.setItem(STEP_STORAGE_KEY, step.toString());
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {}
  };

  const handleStep1Complete = (data: Step1ProductFormData) => {
    setStep1Data(data);
    changeStep(2);
  };

  const handleStep2Complete = () => {
    alert("¡Paso 2 completado con éxito! Tu diseño e imagen han sido validados.");
  };

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
                  {currentStep}
                </span>
                {currentStep === 1
                  ? "Paso 1: Producto y Variantes"
                  : currentStep === 2
                    ? "Paso 2: Tu Diseño e Idea"
                    : "Paso 3: Contacto y Entrega"}
              </span>
              <span className="text-muted-foreground">Paso {currentStep} de 3</span>
            </div>

            {/* Barra de progreso */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{
                  width: currentStep === 1 ? "33.33%" : currentStep === 2 ? "66.66%" : "100%",
                }}
              />
            </div>
          </div>
        </header>

        {/* CONTENEDOR PRINCIPAL */}
        <main className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-7">
          {currentStep === 1 && (
            <>
              <div className="mb-6 border-b border-border/60 pb-4">
                <h2 className="text-lg font-bold text-foreground sm:text-xl">
                  Personaliza tu pedido
                </h2>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Selecciona el artículo que deseas, sus características y la cantidad.
                </p>
              </div>
              <OrderStep1 onNext={handleStep1Complete} />
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="mb-6 border-b border-border/60 pb-4">
                <h2 className="text-lg font-bold text-foreground sm:text-xl">Tu Diseño e Idea</h2>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Explica qué deseas estampar, sube una imagen de referencia o genera una idea con
                  IA.
                </p>
              </div>
              <OrderStep2
                productType={step1Data?.product || "camisa"}
                onBack={() => changeStep(1)}
                onNext={handleStep2Complete}
              />
            </>
          )}
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
