"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { feedbackSchema, type FeedbackFormData } from "@/lib/feedback-schema";
import { submitFeedbackAction } from "@/actions/feedback.actions";
import { FeedbackProgressBar } from "./feedback-progress-bar";
import { FeedbackSuccessScreen } from "./feedback-success-screen";
import { APP_VERSION } from "@/lib/constants";
import {
  AlertCircle,
  Loader2,
  Send,
  Smartphone,
  Laptop,
  Star,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

const STORAGE_KEY = "alquimiatex_feedback_draft";

const DEVICE_OPTIONS = [
  { value: "movil_android", label: "Celular Android", icon: Smartphone },
  { value: "movil_iphone", label: "iPhone (iOS)", icon: Smartphone },
  { value: "computadora_pc", label: "Computadora PC / Laptop", icon: Laptop },
  { value: "tablet", label: "Tablet / iPad", icon: Smartphone },
] as const;

const BROWSER_OPTIONS = [
  { value: "chrome", label: "Google Chrome" },
  { value: "safari", label: "Safari" },
  { value: "opera", label: "Opera" },
  { value: "edge", label: "Microsoft Edge" },
  { value: "otro", label: "Otro navegador" },
] as const;

const STYLE_CLARITY_OPTIONS = [
  {
    value: "muy_original_claro",
    label: "Muy original y claro",
    sublabel: "Estilo distintivo y fácil de entender",
  },
  {
    value: "llamativo_aceptable",
    label: "Llamativo y agradable",
    sublabel: "Se ve moderno y dinámico",
  },
  {
    value: "un_poco_confuso",
    label: "Un poco confuso",
    sublabel: "Mucha información o contraste visual",
  },
  {
    value: "dificil_de_leer",
    label: "Difícil de leer / Saturado",
    sublabel: "Preferiría un diseño más plano y minimalista",
  },
] as const;

const STEP1_OPTIONS = [
  { value: "rapida_sin_trabas", label: "Rápida y sin trabas (Muy fluida)" },
  { value: "normal", label: "Normal (Todo entendible)" },
  { value: "complicada", label: "Se me complicó elegir tallas o colores" },
  { value: "no_entendi", label: "No entendí bien el funcionamiento" },
] as const;

const AI_OPTIONS = [
  {
    value: "sorprendente_buena",
    label: "Sorprendente y rápida",
    sublabel: "La imagen generada fue genial para el mockup",
  },
  {
    value: "tardo_pero_sirvio",
    label: "Tardó un poco pero sirvió",
    sublabel: "Cumplió el propósito aunque tardó varios segundos",
  },
  {
    value: "no_me_gusto",
    label: "No me gustó la imagen",
    sublabel: "La IA generó algo diferente a lo que esperaba",
  },
  {
    value: "dio_error",
    label: "Me dio error al generar",
    sublabel: "Falló la conexión o superó los intentos",
  },
  {
    value: "no_la_probe",
    label: "No la probé",
    sublabel: "Solo miré el formulario o subí foto directa",
  },
] as const;

const IMAGE_UPLOAD_OPTIONS = [
  {
    value: "perfecta_rapida",
    label: "Subió perfecta y rápida",
    sublabel: "Cargó la foto sin ningún inconveniente",
  },
  {
    value: "normal",
    label: "Normal",
    sublabel: "Subió en un tiempo aceptable",
  },
  {
    value: "lenta",
    label: "Tardó bastante",
    sublabel: "La carga fue pesada o se demoró",
  },
  {
    value: "dio_error",
    label: "Me dio error al subir",
    sublabel: "Rechazó la imagen o se canceló",
  },
  {
    value: "no_subi_foto",
    label: "No subí foto propia",
    sublabel: "Probé con la IA o no añadí imagen de referencia",
  },
] as const;

const PRICING_POLICY_OPTIONS = [
  {
    value: "totalmente_claras",
    label: "Totalmente claras",
    sublabel: "Entendí el 100% al detal y el 50% abono por docena",
  },
  {
    value: "faciles_de_entender",
    label: "Fáciles de entender",
    sublabel: "Las condiciones se explican bien",
  },
  {
    value: "algo_confusas",
    label: "Algo confusas",
    sublabel: "Tuve dudas sobre los tiempos (4 a 7 días) o pagos",
  },
  {
    value: "no_las_lei",
    label: "No las leí / Pasé de largo",
    sublabel: "Fui directo al botón final",
  },
] as const;

const WHATSAPP_REDIRECT_OPTIONS = [
  {
    value: "si_perfecto_con_todo",
    label: "Sí, perfecto con todo listo",
    sublabel: "Abrió WhatsApp con el código #ALQ-XXXX y resumen completo",
  },
  {
    value: "abrio_faltaron_datos",
    label: "Abrió pero faltaban datos",
    sublabel: "Faltó algún detalle o producto en el mensaje",
  },
  {
    value: "no_abrio_whatsapp",
    label: "No me abrió la aplicación",
    sublabel: "El botón no respondió o se quedó cargando",
  },
  {
    value: "no_llegue_al_final",
    label: "No llegué hasta el final",
    sublabel: "Solo evalué el diseño y los primeros pasos",
  },
] as const;

export function FeedbackForm() {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [draftRestored, setDraftRestored] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(feedbackSchema) as any,
    defaultValues: {
      tester_name: "",
      device_used: undefined,
      browser_used: undefined,
      first_impression_rating: undefined,
      style_clarity: undefined,
      brand_trust: undefined,
      order_flow_rating: undefined,
      step1_experience: undefined,
      ai_generation_experience: undefined,
      image_upload_experience: undefined,
      pricing_policy_clarity: undefined,
      whatsapp_redirect_rating: undefined,
      errors_found: "",
      most_liked_feature: "",
      least_liked_feature: "",
      nps_recommendation: undefined,
      version_tested: APP_VERSION,
      website_url: "",
    },
  });

  const watchedValues = watch();

  // 1. Restaurar borrador de localStorage al cargar
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        reset(parsed);
        setDraftRestored(true);
        setTimeout(() => setDraftRestored(false), 5000);
      }
    } catch {
      // Ignorar errores de parsing
    }
  }, [reset]);

  // 2. Guardar borrador en localStorage automáticamente en cada cambio
  useEffect(() => {
    if (typeof window === "undefined" || isSubmitted) return;
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedValues));
      } catch {
        // Ignorar límites de almacenamiento
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [watchedValues, isSubmitted]);

  // 3. Cálculo de preguntas respondidas para la barra de progreso
  const calculateCompletedCount = (): number => {
    let count = 0;
    if (watchedValues.tester_name?.trim()) count++;
    if (watchedValues.device_used) count++;
    if (watchedValues.browser_used) count++;
    if (watchedValues.first_impression_rating) count++;
    if (watchedValues.style_clarity) count++;
    if (watchedValues.brand_trust) count++;
    if (watchedValues.order_flow_rating) count++;
    if (watchedValues.step1_experience) count++;
    if (watchedValues.ai_generation_experience) count++;
    if (watchedValues.image_upload_experience) count++;
    if (watchedValues.pricing_policy_clarity) count++;
    if (watchedValues.whatsapp_redirect_rating) count++;
    if (watchedValues.errors_found !== undefined) count++; // Opcional pero cuenta
    if (watchedValues.most_liked_feature?.trim()) count++;
    if (watchedValues.least_liked_feature?.trim()) count++;
    if (watchedValues.nps_recommendation) count++;
    return count;
  };

  const completedCount = calculateCompletedCount();

  // Manejar envío
  const onSubmit = (data: FeedbackFormData) => {
    setSubmitError(null);

    startTransition(async () => {
      const res = await submitFeedbackAction(data);
      if (res.success) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEY);
        }
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSubmitError(
          res.error || "Ocurrió un error inesperado al registrar tu evaluación."
        );
      }
    });
  };

  if (isSubmitted) {
    return <FeedbackSuccessScreen />;
  }

  return (
    <div className="space-y-8">
      {/* BARRA DE PROGRESO FLOTANTE / TOP */}
      <div className="sticky top-16 z-30 pt-2 pb-1">
        <FeedbackProgressBar
          completedCount={completedCount}
          totalCount={16}
        />
      </div>

      {/* AVISO DE BORRADOR RESTAURADO */}
      {draftRestored && (
        <div className="bg-[#FEF08A] border-2 border-black p-3 shadow-[3px_3px_0px_#0A0A0A] flex items-center justify-between gap-3 text-xs font-mono font-bold text-black animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-purple-900" />
            <span>
              ¡Borrador recuperado! Restauramos tus respuestas anteriores para que continúes sin perder nada.
            </span>
          </div>
          <button
            onClick={() => setDraftRestored(false)}
            className="text-black hover:underline uppercase text-[10px] px-1 py-0.5 bg-white border border-black"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* FORMULARIO PRINCIPAL */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* HONEYPOT ANTI-SPAM (Invisible para usuarios humanos) */}
        <div style={{ display: "none" }} aria-hidden="true">
          <label htmlFor="website_url">No llenar este campo:</label>
          <input
            id="website_url"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("website_url")}
          />
        </div>

        {/* =========================================================================
            BLOQUE 1: PERFIL DEL EVALUADOR
           ========================================================================= */}
        <section className="bg-white border-2 border-black p-5 sm:p-7 shadow-[5px_5px_0px_#0A0A0A] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <span className="bg-[#581C87] text-[#FACC15] font-mono text-xs font-black px-2 py-0.5 border border-black">
                BLOQUE 01
              </span>
              <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                Perfil del Evaluador
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-500 font-bold hidden sm:inline-block">
              PREGUNTAS 1 - 3
            </span>
          </div>

          {/* Pregunta 1: Nombre */}
          <div className="space-y-2">
            <label className="block font-mono text-xs sm:text-sm font-bold text-black uppercase">
              1. ¿Cuál es tu nombre o apodo? <span className="text-[#F43F5E]">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Carlos Mendoza / @carlos_design"
              className="w-full bg-[#F8F5EE] border-2 border-black px-4 py-3 font-mono text-sm text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              {...register("tester_name")}
            />
            {errors.tester_name && (
              <p className="font-mono text-xs text-[#F43F5E] font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.tester_name.message}</span>
              </p>
            )}
          </div>

          {/* Pregunta 2: Dispositivo */}
          <div className="space-y-2">
            <label className="block font-mono text-xs sm:text-sm font-bold text-black uppercase">
              2. ¿Desde qué dispositivo navegaste por la web? <span className="text-[#F43F5E]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEVICE_OPTIONS.map((opt) => {
                const isSelected = watchedValues.device_used === opt.value;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setValue("device_used", opt.value, { shouldValidate: true })
                    }
                    className={`p-3.5 border-2 text-left transition-all flex items-center gap-3 ${
                      isSelected
                        ? "bg-black text-[#FACC15] border-black shadow-[3px_3px_0px_#F43F5E] -translate-y-0.5"
                        : "bg-[#F8F5EE] text-black border-black hover:bg-amber-50"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isSelected ? "text-[#FACC15]" : "text-slate-700"}`} />
                    <span className="font-mono text-xs sm:text-sm font-bold uppercase">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.device_used && (
              <p className="font-mono text-xs text-[#F43F5E] font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.device_used.message}</span>
              </p>
            )}
          </div>

          {/* Pregunta 3: Navegador */}
          <div className="space-y-2">
            <label className="block font-mono text-xs sm:text-sm font-bold text-black uppercase">
              3. ¿Qué navegador utilizaste? <span className="text-[#F43F5E]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {BROWSER_OPTIONS.map((opt) => {
                const isSelected = watchedValues.browser_used === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setValue("browser_used", opt.value, { shouldValidate: true })
                    }
                    className={`p-2.5 border-2 text-center transition-all ${
                      isSelected
                        ? "bg-black text-[#FACC15] border-black shadow-[2px_2px_0px_#F43F5E]"
                        : "bg-[#F8F5EE] text-black border-black hover:bg-amber-50"
                    }`}
                  >
                    <span className="font-mono text-xs font-bold uppercase">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.browser_used && (
              <p className="font-mono text-xs text-[#F43F5E] font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.browser_used.message}</span>
              </p>
            )}
          </div>
        </section>

        {/* =========================================================================
            BLOQUE 2: PRIMERA IMPRESIÓN Y DISEÑO VISUAL
           ========================================================================= */}
        <section className="bg-white border-2 border-black p-5 sm:p-7 shadow-[5px_5px_0px_#0A0A0A] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <span className="bg-[#06B6D4] text-black font-mono text-xs font-black px-2 py-0.5 border border-black">
                BLOQUE 02
              </span>
              <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                Primera Impresión y Estética
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-500 font-bold hidden sm:inline-block">
              PREGUNTAS 4 - 6
            </span>
          </div>

          {/* Pregunta 4: Calificación Landing 1 a 5 */}
          <div className="space-y-3">
            <label className="block font-mono text-xs sm:text-sm font-bold text-black uppercase">
              4. Del 1 al 5, ¿qué tan atractiva, moderna y profesional te pareció la página principal?{" "}
              <span className="text-[#F43F5E]">*</span>
            </label>
            <div className="flex items-center gap-2 sm:gap-4">
              {[1, 2, 3, 4, 5].map((val) => {
                const isSelected = watchedValues.first_impression_rating === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setValue("first_impression_rating", val, {
                        shouldValidate: true,
                      })
                    }
                    className={`flex-1 py-3 border-2 font-oswald text-lg font-black transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? "bg-black text-[#FACC15] border-black shadow-[3px_3px_0px_#F43F5E] scale-105"
                        : "bg-[#F8F5EE] text-black border-black hover:bg-amber-50"
                    }`}
                  >
                    <span>{val}</span>
                    <Star
                      className={`h-3 w-3 ${
                        isSelected ? "fill-[#FACC15] text-[#FACC15]" : "text-slate-400"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between font-mono text-[10px] text-slate-500 uppercase font-bold">
              <span>1 = Muy floja / Desordenada</span>
              <span>5 = Espectacular / Streetwear top</span>
            </div>
            {errors.first_impression_rating && (
              <p className="font-mono text-xs text-[#F43F5E] font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.first_impression_rating.message}</span>
              </p>
            )}
          </div>

          {/* Pregunta 5: Claridad de estilo */}
          <div className="space-y-2">
            <label className="block font-mono text-xs sm:text-sm font-bold text-black uppercase">
              5. El estilo visual &quot;Taller Experimental&quot; (papel crema, sellos, texturas y contrastes), ¿cómo te pareció?{" "}
              <span className="text-[#F43F5E]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STYLE_CLARITY_OPTIONS.map((opt) => {
                const isSelected = watchedValues.style_clarity === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setValue("style_clarity", opt.value, { shouldValidate: true })
                    }
                    className={`p-3.5 border-2 text-left transition-all ${
                      isSelected
                        ? "bg-black text-white border-black shadow-[3px_3px_0px_#06B6D4] -translate-y-0.5"
                        : "bg-[#F8F5EE] text-black border-black hover:bg-amber-50"
                    }`}
                  >
                    <div className="font-mono text-xs sm:text-sm font-bold uppercase text-[#FACC15]">
                      {opt.label}
                    </div>
                    <div className="font-mono text-[11px] text-slate-300 mt-0.5">
                      {opt.sublabel}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.style_clarity && (
              <p className="font-mono text-xs text-[#F43F5E] font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.style_clarity.message}</span>
              </p>
            )}
          </div>

          {/* Pregunta 6: Confianza de marca 1 a 5 */}
          <div className="space-y-3">
            <label className="block font-mono text-xs sm:text-sm font-bold text-black uppercase">
              6. Del 1 al 5, ¿la web te transmitió confianza y seriedad para ordenar productos textiles o promocionales?{" "}
              <span className="text-[#F43F5E]">*</span>
            </label>
            <div className="flex items-center gap-2 sm:gap-4">
              {[1, 2, 3, 4, 5].map((val) => {
                const isSelected = watchedValues.brand_trust === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setValue("brand_trust", val, { shouldValidate: true })
                    }
                    className={`flex-1 py-3 border-2 font-oswald text-lg font-black transition-all ${
                      isSelected
                        ? "bg-black text-[#FACC15] border-black shadow-[3px_3px_0px_#06B6D4] scale-105"
                        : "bg-[#F8F5EE] text-black border-black hover:bg-amber-50"
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between font-mono text-[10px] text-slate-500 uppercase font-bold">
              <span>1 = Poca credibilidad</span>
              <span>5 = Totalmente confiable / Profesional</span>
            </div>
            {errors.brand_trust && (
              <p className="font-mono text-xs text-[#F43F5E] font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.brand_trust.message}</span>
              </p>
            )}
          </div>
        </section>

        {/* =========================================================================
            BLOQUE 3: USABILIDAD DEL FLUJO DE PEDIDO (/pedido)
           ========================================================================= */}
        <section className="bg-white border-2 border-black p-5 sm:p-7 shadow-[5px_5px_0px_#0A0A0A] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <span className="bg-[#FACC15] text-black font-mono text-xs font-black px-2 py-0.5 border border-black">
                BLOQUE 03
              </span>
              <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                Flujo de Pedido (/pedido)
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-500 font-bold hidden sm:inline-block">
              PREGUNTAS 7 - 10
            </span>
          </div>

          {/* Pregunta 7: Calificación general del flujo 1 a 5 */}
          <div className="space-y-3">
            <label className="block font-mono text-xs sm:text-sm font-bold text-black uppercase">
              7. Del 1 al 5, ¿qué tan fácil e intuitivo te pareció armar el pedido en 3 pasos?{" "}
              <span className="text-[#F43F5E]">*</span>
            </label>
            <div className="flex items-center gap-2 sm:gap-4">
              {[1, 2, 3, 4, 5].map((val) => {
                const isSelected = watchedValues.order_flow_rating === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setValue("order_flow_rating", val, { shouldValidate: true })
                    }
                    className={`flex-1 py-3 border-2 font-oswald text-lg font-black transition-all ${
                      isSelected
                        ? "bg-black text-[#FACC15] border-black shadow-[3px_3px_0px_#FACC15] scale-105"
                        : "bg-[#F8F5EE] text-black border-black hover:bg-amber-50"
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between font-mono text-[10px] text-slate-500 uppercase font-bold">
              <span>1 = Muy enredado</span>
              <span>5 = Muy fluido y claro</span>
            </div>
            {errors.order_flow_rating && (
              <p className="font-mono text-xs text-[#F43F5E] font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.order_flow_rating.message}</span>
              </p>
            )}
          </div>

          {/* Pregunta 8: Experiencia Paso 1 (Productos) */}
          <div className="space-y-2">
            <label className="block font-mono text-xs sm:text-sm font-bold text-black uppercase">
              8. En el Paso 1 (Selección de artículos, tallas, colores y cantidades):{" "}
              <span className="text-[#F43F5E]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STEP1_OPTIONS.map((opt) => {
                const isSelected = watchedValues.step1_experience === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setValue("step1_experience", opt.value, {
                        shouldValidate: true,
                      })
                    }
                    className={`p-3 border-2 text-left font-mono text-xs sm:text-sm font-bold uppercase transition-all ${
                      isSelected
                        ? "bg-black text-[#FACC15] border-black shadow-[2px_2px_0px_#0A0A0A]"
                        : "bg-[#F8F5EE] text-black border-black hover:bg-amber-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {errors.step1_experience && (
              <p className="font-mono text-xs text-[#F43F5E] font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.step1_experience.message}</span>
              </p>
            )}
          </div>

          {/* Pregunta 9: Generación con IA */}
          <div className="space-y-2">
            <label className="block font-mono text-xs sm:text-sm font-bold text-black uppercase">
              9. En el Paso 2 (Diseño), si probaste el botón de Generación con Inteligencia Artificial:{" "}
              <span className="text-[#F43F5E]">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {AI_OPTIONS.map((opt) => {
                const isSelected = watchedValues.ai_generation_experience === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setValue("ai_generation_experience", opt.value, {
                        shouldValidate: true,
                      })
                    }
                    className={`p-3 border-2 text-left transition-all ${
                      isSelected
                        ? "bg-black text-[#FACC15] border-black shadow-[2px_2px_0px_#F43F5E]"
                        : "bg-[#F8F5EE] text-black border-black hover:bg-amber-50"
                    }`}
                  >
                    <div className="font-mono text-xs sm:text-sm font-bold uppercase">
                      {opt.label}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                      {opt.sublabel}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.ai_generation_experience && (
              <p className="font-mono text-xs text-[#F43F5E] font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.ai_generation_experience.message}</span>
              </p>
            )}
          </div>

          {/* Pregunta 10: Subida de foto de referencia */}
          <div className="space-y-2">
            <label className="block font-mono text-xs sm:text-sm font-bold text-black uppercase">
              10. Si subiste una imagen o foto de referencia propia:{" "}
              <span className="text-[#F43F5E]">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {IMAGE_UPLOAD_OPTIONS.map((opt) => {
                const isSelected = watchedValues.image_upload_experience === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setValue("image_upload_experience", opt.value, {
                        shouldValidate: true,
                      })
                    }
                    className={`p-3 border-2 text-left transition-all ${
                      isSelected
                        ? "bg-black text-[#06B6D4] border-black shadow-[2px_2px_0px_#0A0A0A]"
                        : "bg-[#F8F5EE] text-black border-black hover:bg-amber-50"
                    }`}
                  >
                    <div className="font-mono text-xs sm:text-sm font-bold uppercase">
                      {opt.label}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                      {opt.sublabel}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.image_upload_experience && (
              <p className="font-mono text-xs text-[#F43F5E] font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.image_upload_experience.message}</span>
              </p>
            )}
          </div>
        </section>

        {/* =========================================================================
            BLOQUE 4: POLÍTICAS Y WHATSAPP
           ========================================================================= */}
        <section className="bg-white border-2 border-black p-5 sm:p-7 shadow-[5px_5px_0px_#0A0A0A] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <span className="bg-[#F43F5E] text-white font-mono text-xs font-black px-2 py-0.5 border border-black">
                BLOQUE 04
              </span>
              <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                Políticas, Precios y WhatsApp
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-500 font-bold hidden sm:inline-block">
              PREGUNTAS 11 - 12
            </span>
          </div>

          {/* Pregunta 11: Claridad de políticas */}
          <div className="space-y-2">
            <label className="block font-mono text-xs sm:text-sm font-bold text-black uppercase">
              11. Las condiciones de pago (100% al detal / 50% abono al mayor) y tiempos de entrega (4 a 7 días):{" "}
              <span className="text-[#F43F5E]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRICING_POLICY_OPTIONS.map((opt) => {
                const isSelected = watchedValues.pricing_policy_clarity === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setValue("pricing_policy_clarity", opt.value, {
                        shouldValidate: true,
                      })
                    }
                    className={`p-3 border-2 text-left transition-all ${
                      isSelected
                        ? "bg-black text-[#FACC15] border-black shadow-[2px_2px_0px_#F43F5E]"
                        : "bg-[#F8F5EE] text-black border-black hover:bg-amber-50"
                    }`}
                  >
                    <div className="font-mono text-xs sm:text-sm font-bold uppercase">
                      {opt.label}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                      {opt.sublabel}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.pricing_policy_clarity && (
              <p className="font-mono text-xs text-[#F43F5E] font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.pricing_policy_clarity.message}</span>
              </p>
            )}
          </div>

          {/* Pregunta 12: Redirección WhatsApp */}
          <div className="space-y-2">
            <label className="block font-mono text-xs sm:text-sm font-bold text-black uppercase">
              12. Al finalizar el Paso 3, ¿el enlace de WhatsApp te abrió el chat con el código #ALQ-XXXX y el mensaje listo?{" "}
              <span className="text-[#F43F5E]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {WHATSAPP_REDIRECT_OPTIONS.map((opt) => {
                const isSelected = watchedValues.whatsapp_redirect_rating === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setValue("whatsapp_redirect_rating", opt.value, {
                        shouldValidate: true,
                      })
                    }
                    className={`p-3 border-2 text-left transition-all ${
                      isSelected
                        ? "bg-black text-[#22C55E] border-black shadow-[2px_2px_0px_#0A0A0A]"
                        : "bg-[#F8F5EE] text-black border-black hover:bg-amber-50"
                    }`}
                  >
                    <div className="font-mono text-xs sm:text-sm font-bold uppercase">
                      {opt.label}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                      {opt.sublabel}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.whatsapp_redirect_rating && (
              <p className="font-mono text-xs text-[#F43F5E] font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.whatsapp_redirect_rating.message}</span>
              </p>
            )}
          </div>
        </section>

        {/* =========================================================================
            BLOQUE 5: DIAGNÓSTICO CRÍTICO Y NPS
           ========================================================================= */}
        <section className="bg-white border-2 border-black p-5 sm:p-7 shadow-[5px_5px_0px_#0A0A0A] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <span className="bg-[#22C55E] text-black font-mono text-xs font-black px-2 py-0.5 border border-black">
                BLOQUE 05
              </span>
              <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                Diagnóstico Crítico y Recomendación
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-500 font-bold hidden sm:inline-block">
              PREGUNTAS 13 - 16
            </span>
          </div>

          {/* Pregunta 13: Errores encontrados */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-mono text-xs sm:text-sm font-bold text-black uppercase">
                13. ¿Tuviste algún error, botón trabado, imagen que no cargó o pantalla en blanco?
              </label>
              <span className="font-mono text-[10px] text-slate-500 uppercase font-bold">
                (Opcional)
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Si todo funcionó bien puedes dejarlo vacío o poner 'Ninguno'. Si viste algún bug, cuéntanos con detalle."
              className="w-full bg-[#F8F5EE] border-2 border-black p-3 font-mono text-xs sm:text-sm text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              {...register("errors_found")}
            />
          </div>

          {/* Pregunta 14: Lo que más gustó */}
          <div className="space-y-2">
            <label className="block font-mono text-xs sm:text-sm font-bold text-black uppercase">
              14. ¿Qué fue lo que MÁS te gustó de la plataforma o taller? <span className="text-[#F43F5E]">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ej. El diseño streetwear, la facilidad para cotizar por docenas, el generador de IA..."
              className="w-full bg-[#F8F5EE] border-2 border-black p-3 font-mono text-xs sm:text-sm text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              {...register("most_liked_feature")}
            />
            {errors.most_liked_feature && (
              <p className="font-mono text-xs text-[#F43F5E] font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.most_liked_feature.message}</span>
              </p>
            )}
          </div>

          {/* Pregunta 15: Lo que menos gustó */}
          <div className="space-y-2">
            <label className="block font-mono text-xs sm:text-sm font-bold text-black uppercase">
              15. ¿Qué fue lo que MENOS te gustó o qué cambiarías inmediatamente? <span className="text-[#F43F5E]">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ej. El tamaño de los textos en móvil, me gustaría ver más fotos reales, etc."
              className="w-full bg-[#F8F5EE] border-2 border-black p-3 font-mono text-xs sm:text-sm text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              {...register("least_liked_feature")}
            />
            {errors.least_liked_feature && (
              <p className="font-mono text-xs text-[#F43F5E] font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.least_liked_feature.message}</span>
              </p>
            )}
          </div>

          {/* Pregunta 16: NPS (1 al 10) */}
          <div className="space-y-3">
            <label className="block font-mono text-xs sm:text-sm font-bold text-black uppercase">
              16. Del 1 al 10, ¿qué tan probable es que recomiendes AlquimiaTex a un amigo, marca o empresa?{" "}
              <span className="text-[#F43F5E]">*</span>
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
                const isSelected = watchedValues.nps_recommendation === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setValue("nps_recommendation", val, { shouldValidate: true })
                    }
                    className={`py-3 sm:py-3.5 border-2 font-oswald text-base sm:text-lg font-black transition-all ${
                      isSelected
                        ? "bg-black text-[#FACC15] border-black shadow-[3px_3px_0px_#22C55E] scale-105"
                        : "bg-[#F8F5EE] text-black border-black hover:bg-amber-50"
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between font-mono text-[10px] text-slate-500 uppercase font-bold">
              <span>1 = Nada probable</span>
              <span>10 = Definitivamente sí</span>
            </div>
            {errors.nps_recommendation && (
              <p className="font-mono text-xs text-[#F43F5E] font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.nps_recommendation.message}</span>
              </p>
            )}
          </div>
        </section>

        {/* MENSAJE DE ERROR GLOBAL EN CASO DE FALLO */}
        {submitError && (
          <div className="bg-[#FFE4E6] border-2 border-[#F43F5E] p-4 shadow-[4px_4px_0px_#0A0A0A] flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#F43F5E] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-mono text-xs font-bold uppercase text-[#9F1239]">
                Error al procesar el envío
              </p>
              <p className="font-mono text-xs text-slate-800">{submitError}</p>
            </div>
          </div>
        )}

        {/* BOTÓN DE ACCIÓN FINAL */}
        <div className="pt-4 pb-12 flex flex-col items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className={`w-full sm:w-auto min-w-[280px] px-8 py-4 bg-[#FACC15] hover:bg-[#FDE047] text-black font-oswald text-lg font-black uppercase border-3 border-black shadow-[6px_6px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-3 ${
              isPending ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-black" />
                <span>ENVIANDO EVALUACIÓN...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5 text-black" />
                <span>ENVIAR MI EVALUACIÓN AL TALLER</span>
              </>
            )}
          </button>
          <p className="font-mono text-[11px] text-slate-500 uppercase tracking-wider text-center">
            Tus respuestas son confidenciales y nos ayudarán a perfeccionar AlquimiaTex.
          </p>
        </div>
      </form>
    </div>
  );
}
