"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { OrderStep1 } from "@/components/public/order-step-1";
import { OrderStep2 } from "@/components/public/order-step-2";
import { OrderStep3 } from "@/components/public/order-step-3";
import { OrderSuccessDialog } from "@/components/public/order-success-dialog";
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

  const stepsMeta = [
    { num: 1, short: "Productos", full: "Paso 1: Selección y Carrito de Artículos" },
    { num: 2, short: "Diseño", full: "Paso 2: Personalización y Diseño" },
    { num: 3, short: "Confirmar", full: "Paso 3: Contacto, Fecha y Confirmación" },
  ];

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#0A0A0A] selection:bg-[#F43F5E] selection:text-white px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* ENCABEZADO Y BRANDING NEO-BRUTALISTA */}
        <header className="mb-6 sm:mb-8 space-y-4">
          <div className="flex flex-col gap-3 border-b-2 border-black pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col items-center sm:items-start">
              <Link href="/" className="inline-flex items-center justify-center gap-2.5 sm:justify-start">
                <Image
                  src="/logo.png"
                  alt="AlquimiaTex"
                  width={150}
                  height={40}
                  priority
                  className="h-9 sm:h-10 w-auto object-contain"
                />
                <span className="inline-block bg-black text-[#FACC15] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase border border-black shadow-[2px_2px_0px_#06B6D4]">
                  Taller La Dolorita
                </span>
              </Link>
              <p className="mt-1.5 font-mono text-[11px] sm:text-xs text-slate-700 text-center sm:text-left">
                Sublimación y confección textil artesanal en Caracas, Venezuela
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 self-center sm:self-auto rounded-lg border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] transition-all hover:bg-[#FACC15] active:translate-x-0.5 active:translate-y-0.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Volver a la tienda</span>
            </Link>
          </div>

          {/* STEPPER MOBILE-FIRST NEO-BRUTALISTA */}
          <div className="space-y-3 pt-1">
            {/* 3 Cápsulas limpias que nunca se amontonan */}
            <div className="grid grid-cols-3 gap-2">
              {stepsMeta.map((step) => {
                const isActive = currentStep === step.num;
                const isCompleted = currentStep > step.num;
                return (
                  <div
                    key={step.num}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border-2 border-black px-2 py-2 text-center transition-all ${
                      isActive
                        ? "bg-[#FACC15] text-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] -translate-y-0.5"
                        : isCompleted
                        ? "bg-[#DCFCE7] text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]"
                        : "bg-white text-slate-600"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black font-mono text-[10px] font-black ${
                        isActive
                          ? "bg-black text-[#FACC15]"
                          : isCompleted
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isCompleted ? "✓" : step.num}
                    </span>
                    <span className="font-oswald text-xs sm:text-sm font-black uppercase tracking-wide truncate">
                      {step.short}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Sub-barra informativa del paso actual y carrito */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-mono font-bold text-[#0A0A0A]">
                {stepsMeta.find((s) => s.num === currentStep)?.full}
              </span>

              {items.length > 0 && (
                <span className="inline-flex items-center rounded-md border border-black bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-[#0A0A0A] shadow-[1px_1px_0px_#0A0A0A]">
                  {items.length} {items.length === 1 ? "artículo" : "artículos"} • {totalUnits} unid.
                </span>
              )}
            </div>

            {/* Barra de progreso visual brutalista */}
            <div className="h-2.5 w-full overflow-hidden rounded-full border-2 border-black bg-white shadow-[2px_2px_0px_#0A0A0A]">
              <div
                className="h-full bg-[#06B6D4] transition-all duration-500 ease-out"
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
        <main className="rounded-xl sm:rounded-2xl border-2 sm:border-3 border-black bg-[#FAF7F0] text-[#0A0A0A] p-4 shadow-[4px_4px_0px_#0A0A0A] sm:p-7 sm:shadow-[6px_6px_0px_#0A0A0A]">
          {/* PASO 1: PRODUCTOS Y VARIANTES */}
          {currentStep === 1 && (
            <>
              <div className="mb-6 border-b-2 border-black/15 pb-4">
                <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase tracking-tight text-[#0A0A0A]">
                  Arma tu pedido personalizado
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
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
              <div className="mb-6 border-b-2 border-black/15 pb-4">
                <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase tracking-tight text-[#0A0A0A]">
                  Personalización de tus artículos
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify sm:text-left">
                  Describe tu idea para cada producto y elige si deseas subir tu propia imagen de referencia o crear un concepto visual desde cero con Inteligencia Artificial.
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
              <div className="mb-6 border-b-2 border-black/15 pb-4">
                <h2 className="font-oswald text-xl sm:text-2xl font-black uppercase tracking-tight text-[#0A0A0A]">
                  Datos de entrega y confirmación
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify sm:text-left">
                  Revisa tu pedido completo, selecciona tu fecha estimada de entrega y confirma las condiciones de pago oficiales de AlquimiaTex.
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
        <footer className="mt-8 sm:mt-10 border-t-2 border-black/15 pt-6 text-center text-xs text-slate-700 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Image
              src="/logo.png"
              alt="AlquimiaTex"
              width={90}
              height={24}
              className="h-6 w-auto object-contain opacity-90"
            />
          </div>
          <div className="inline-flex items-center justify-center gap-2 rounded-lg border border-black bg-[#DCFCE7] px-3 py-1.5 font-mono text-[11px] font-bold text-emerald-950 shadow-[2px_2px_0px_#0A0A0A]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" />
            <span>Sin pasarelas automáticas • Cotización directa y verificación manual por WhatsApp</span>
          </div>
          <p className="font-mono text-[11px] text-slate-600">
            © {new Date().getFullYear()} AlquimiaTex. Taller La Dolorita, Petare, Caracas, Venezuela.
          </p>
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
