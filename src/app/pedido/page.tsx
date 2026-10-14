"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { OrderStep1 } from "@/components/public/order-step-1";
import { OrderStep2 } from "@/components/public/order-step-2";
import { OrderStep3 } from "@/components/public/order-step-3";
import { OrderSuccessDialog } from "@/components/public/order-success-dialog";
import { Badge } from "@/components/ui/badge";
import type { OrderItem } from "@/lib/schemas";
import type { SubmitOrderResponse } from "@/actions/orders.actions";

const STEP_STORAGE_KEY = "alquimiatex_current_step";
const CART_STORAGE_KEY = "alquimiatex_cart_items";
const AI_ATTEMPTS_STORAGE_KEY = "alquimiatex_ai_attempts";

export default function PedidoPage() {
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [items, setItems] = React.useState<OrderItem[]>([]);
  const [globalAiAttempts, setGlobalAiAttempts] = React.useState<number>(0);
  const [orderResult, setOrderResult] = React.useState<SubmitOrderResponse | null>(null);

  // Cargar estado guardado en el navegador al montar
  React.useEffect(() => {
    try {
      const savedStep = localStorage.getItem(STEP_STORAGE_KEY);
      if (savedStep) {
        const stepNum = parseInt(savedStep, 10);
        if (stepNum >= 1 && stepNum <= 3) {
          setCurrentStep(stepNum);
        }
      }

      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }

      const savedAttempts = localStorage.getItem(AI_ATTEMPTS_STORAGE_KEY);
      if (savedAttempts) {
        setGlobalAiAttempts(parseInt(savedAttempts, 10) || 0);
      }
    } catch (e) {
      console.warn("Error al cargar estado del pedido:", e);
    }
  }, []);

  // Guardar items en localStorage al cambiar
  const handleItemsChange = React.useCallback((newItems: OrderItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
    } catch {}
  }, []);

  // Incrementar intento de IA
  const handleUseAiAttempt = React.useCallback(() => {
    setGlobalAiAttempts((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem(AI_ATTEMPTS_STORAGE_KEY, next.toString());
      } catch {}
      return next;
    });
  }, []);

  // Cambiar de paso con scroll automático
  const changeStep = (step: number) => {
    setCurrentStep(step);
    try {
      localStorage.setItem(STEP_STORAGE_KEY, step.toString());
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {}
  };

  // Manejar pedido exitoso
  const handleOrderSuccess = (result: SubmitOrderResponse) => {
    setOrderResult(result);
    // Limpiar localStorage del pedido completado
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(STEP_STORAGE_KEY);
      localStorage.removeItem(AI_ATTEMPTS_STORAGE_KEY);
    } catch {}
  };

  // Reiniciar para un nuevo pedido
  const handleResetOrder = () => {
    setOrderResult(null);
    setItems([]);
    setGlobalAiAttempts(0);
    setCurrentStep(1);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(STEP_STORAGE_KEY);
      localStorage.removeItem(AI_ATTEMPTS_STORAGE_KEY);
    } catch {}
  };

  const totalUnits = items.reduce((sum, it) => sum + (it.quantity || 0), 0);

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
              <span className="flex items-center gap-2 font-bold text-primary">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
                  {currentStep}
                </span>
                {currentStep === 1 && "Paso 1: Selección y Carrito de Artículos"}
                {currentStep === 2 && "Paso 2: Personalización y Diseño"}
                {currentStep === 3 && "Paso 3: Contacto, Fecha y Abono (30%)"}
              </span>

              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                {items.length > 0 && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">
                    {items.length} {items.length === 1 ? "artículo" : "artículos"} ({totalUnits} unid.)
                  </span>
                )}
                <span>Paso {currentStep} de 3</span>
              </div>
            </div>

            {/* Barra de progreso visual */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{
                  width:
                    currentStep === 1
                      ? "33.33%"
                      : currentStep === 2
                      ? "66.66%"
                      : "100%",
                }}
              />
            </div>
          </div>
        </header>

        {/* CONTENEDOR PRINCIPAL */}
        <main className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-7">
          {/* PASO 1: PRODUCTOS Y VARIANTES */}
          {currentStep === 1 && (
            <>
              <div className="mb-6 border-b border-border/60 pb-4">
                <h2 className="text-lg font-bold text-foreground sm:text-xl">
                  Arma tu pedido personalizado
                </h2>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Configura tus artículos, añade varios productos al pedido (hasta 10) y edítalos cuando quieras.
                </p>
              </div>
              <OrderStep1
                items={items}
                onItemsChange={handleItemsChange}
                onNext={() => changeStep(2)}
              />
            </>
          )}

          {/* PASO 2: DISEÑO, FOTOS E IA */}
          {currentStep === 2 && (
            <>
              <div className="mb-6 border-b border-border/60 pb-4">
                <h2 className="text-lg font-bold text-foreground sm:text-xl">
                  Personalización de tus artículos
                </h2>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Describe tu idea para cada producto, sube imágenes de referencia (hasta 5MB) o genera un concepto visual con IA (Abacus.AI / FLUX.1).
                </p>
              </div>
              <OrderStep2
                items={items}
                onItemsChange={handleItemsChange}
                onBack={() => changeStep(1)}
                onNext={() => changeStep(3)}
                globalAiAttempts={globalAiAttempts}
                onUseAiAttempt={handleUseAiAttempt}
              />
            </>
          )}

          {/* PASO 3: CONTACTO, ENTREGA Y PAGO */}
          {currentStep === 3 && (
            <>
              <div className="mb-6 border-b border-border/60 pb-4">
                <h2 className="text-lg font-bold text-foreground sm:text-xl">
                  Datos de entrega y confirmación
                </h2>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Revisa tu pedido completo, selecciona tu fecha estimada y revisa los datos para abonar el 30%.
                </p>
              </div>
              <OrderStep3
                items={items}
                onBack={() => changeStep(2)}
                onSuccess={handleOrderSuccess}
                onGoToStep1={() => changeStep(1)}
                onGoToStep2={() => changeStep(2)}
              />
            </>
          )}
        </main>

        {/* FOOTER INFORMATIVO */}
        <footer className="mt-8 space-y-2 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Sin pasarelas automáticas • Cotización directa y verificación manual por WhatsApp</span>
          </div>
          <p>© {new Date().getFullYear()} AlquimiaTex. Taller La Dolorita, Caracas, Venezuela.</p>
        </footer>
      </div>

      {/* DIÁLOGO DE ÉXITO CUANDO SE CONFIRMA EL PEDIDO */}
      {orderResult && (
        <OrderSuccessDialog
          orderCode={orderResult.orderCode}
          whatsappUrl={orderResult.whatsappUrl}
          onReset={handleResetOrder}
        />
      )}
    </div>
  );
}
