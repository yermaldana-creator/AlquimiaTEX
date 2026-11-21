"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Copy,
  CreditCard,
  Info,
  Loader2,
  Phone,
  ShoppingBag,
  User,
  Wallet,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PAYMENT_INFO,
  SHIRT_CUT_LABELS,
  getShirtColorLabel,
  getShirtFabricLabel,
  getPrintPlacementLabel,
  MUG_TYPES,
} from "@/lib/constants";
import { step3ContactSchema, type Step3ContactFormData, type OrderItem } from "@/lib/schemas";
import { submitOrderAction, type SubmitOrderResponse } from "@/actions/orders.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface OrderStep3Props {
  items: OrderItem[];
  onBack: () => void;
  onSuccess: (result: SubmitOrderResponse) => void;
  onGoToStep1: () => void;
  onGoToStep2: () => void;
}

// Función para sumar días hábiles (omite sábados y domingos)
function getBusinessDate(businessDays: number): string {
  const date = new Date();
  let added = 0;
  while (added < businessDays) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) {
      added++;
    }
  }
  return date.toISOString().split("T")[0];
}

export function OrderStep3({
  items,
  onBack,
  onSuccess,
  onGoToStep1,
  onGoToStep2,
}: OrderStep3Props) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const totalUnits = React.useMemo(() => items.reduce((sum, it) => sum + (it.quantity || 0), 0), [items]);

  // Fechas hábiles mínimas y máximas (4 a 7 días hábiles desde la confirmación del abono)
  const minDeliveryDate = React.useMemo(() => getBusinessDate(4), []);
  const maxDeliveryDate = React.useMemo(() => getBusinessDate(7), []);

  const form = useForm<Step3ContactFormData>({
    resolver: zodResolver(step3ContactSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      deliveryDate: minDeliveryDate,
      orderPricingType: totalUnits >= 12 ? "docena" : "unidad",
      paymentMethod: "pago_movil",
      acceptTerms: false,
    },
  });

  const selectedPaymentMethod = form.watch("paymentMethod");
  const selectedPricingType = form.watch("orderPricingType");

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {}
  };

  const onSubmit = async (values: Step3ContactFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await submitOrderAction({
        items,
        contact: values,
      });

      if (!response.success) {
        setSubmitError(
          response.error || "Ocurrió un error al procesar el pedido. Por favor intenta de nuevo."
        );
        return;
      }

      onSuccess(response);
    } catch {
      setSubmitError("Error de conexión con el servidor. Verifica tu conexión a internet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-[#0A0A0A]">
      {/* 1. RESUMEN DEL PEDIDO */}
      <Card className="overflow-hidden rounded-xl border-2 border-black bg-white text-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]">
        <div className="border-b-2 border-black/15 bg-[#F3EFE6] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-black bg-[#FACC15] text-[#0A0A0A]">
                <ShoppingBag className="h-4 w-4" />
              </span>
              <h3 className="font-oswald font-black uppercase tracking-wide text-[#0A0A0A] text-sm sm:text-base">
                Resumen de tu pedido ({items.length} {items.length === 1 ? "artículo" : "artículos"} • {totalUnits} {totalUnits === 1 ? "unid." : "unids."})
              </h3>
            </div>
            <button
              type="button"
              onClick={onGoToStep1}
              className="rounded-md border border-black bg-white px-2.5 py-1 font-mono text-[11px] font-bold text-[#0A0A0A] shadow-[1px_1px_0px_#0A0A0A] hover:bg-[#FACC15] transition-colors"
            >
              Modificar artículos
            </button>
          </div>
        </div>

        <div className="divide-y divide-black/10 p-4 space-y-4">
          {items.map((item, idx) => (
            <div key={item.id} className="pt-3 first:pt-0">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black bg-black text-[#FACC15] font-mono text-[10px] font-black">
                      {idx + 1}
                    </span>
                    <span className="font-oswald font-black uppercase text-sm text-[#0A0A0A]">
                      {item.product === "camisa" && "Camisa / Franela"}
                      {item.product === "mousepad" && "Mousepad Personalizado"}
                      {item.product === "rompecabezas" && "Rompecabezas Sublimado"}
                      {item.product === "taza" && "Taza Sublimada"}
                      {item.product === "otro" && (item.customProductDetails || "Producto a cotizar")}
                    </span>
                    <span className="rounded border border-black bg-[#FAF7F0] px-1.5 py-0 font-mono text-[10px] font-bold text-[#0A0A0A]">
                      x{item.quantity} {item.quantity === 1 ? "unid." : "unids."}
                    </span>
                  </div>

                  {/* Variantes */}
                  <div className="text-xs text-slate-700 flex flex-wrap gap-x-2.5 gap-y-1 pl-7">
                    {item.product === "camisa" && (
                      <>
                        <span>Talla: <strong className="text-[#0A0A0A]">{item.shirtSize}</strong></span>
                        <span>•</span>
                        <span>Corte: <strong className="text-[#0A0A0A]">{SHIRT_CUT_LABELS[item.shirtCut || "unisex"] || item.shirtCut}</strong></span>
                        <span>•</span>
                        <span>Color: <strong className="text-[#0A0A0A]">{getShirtColorLabel(item.shirtColor)}</strong></span>
                        <span>•</span>
                        <span>Tela: <strong className="text-[#0A0A0A]">{getShirtFabricLabel(item.shirtFabric)}</strong></span>
                        <span>•</span>
                        <span>Estampado: <strong className="text-[#0A0A0A]">{getPrintPlacementLabel(item.printPlacement)}</strong></span>
                      </>
                    )}
                    {item.product === "mousepad" && (
                      <span>Medida: <strong className="capitalize text-[#0A0A0A]">{item.mousepadSize}</strong></span>
                    )}
                    {item.product === "rompecabezas" && (
                      <span>Formato: <strong className="uppercase text-[#0A0A0A]">{item.puzzlePieces}</strong></span>
                    )}
                    {item.product === "taza" && (
                      <span>Modelo: <strong className="text-[#0A0A0A]">{MUG_TYPES.find((m) => m.value === item.mugType)?.label || item.mugType || "Taza"}</strong></span>
                    )}
                  </div>

                  {/* Descripción de diseño */}
                  {item.description && (
                    <p className="text-xs text-slate-800 pl-7 italic leading-relaxed text-justify sm:text-left">
                      &ldquo;{item.description}&rdquo;
                    </p>
                  )}
                </div>

                {/* Miniaturas de imágenes si existen */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.referenceImage && (
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border-2 border-black bg-slate-100 shadow-[1px_1px_0px_#0A0A0A]" title="Imagen de referencia adjunta">
                      <Image
                        src={item.referenceImage}
                        alt="Referencia"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}
                  {(item.aiMockupImage || item.aiGeneratedImage) && (
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border-2 border-black bg-[#FFFBEB] shadow-[1px_1px_0px_#0A0A0A]" title="Concepto visual generado por IA">
                      <Image
                        src={item.aiMockupImage || item.aiGeneratedImage || ""}
                        alt="Concepto IA"
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-black/10 bg-[#FAF7F0] p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700">
          <span className="leading-relaxed text-justify sm:text-left">
            * Los precios finales y descuentos por volumen se confirmarán directamente en la cotización de WhatsApp.
          </span>
          <button
            type="button"
            onClick={onGoToStep2}
            className="self-start sm:self-auto font-mono font-bold text-[#0A0A0A] underline hover:text-[#0891B2] shrink-0"
          >
            Revisar diseños
          </button>
        </div>
      </Card>

      {/* 2. DATOS DE CONTACTO Y FECHA DE ENTREGA */}
      <div className="space-y-4">
        <div className="border-b-2 border-black/15 pb-2 space-y-1">
          <h3 className="font-oswald font-black uppercase tracking-wide text-[#0A0A0A] text-sm sm:text-base flex items-center gap-2">
            <User className="h-4 w-4 text-[#0891B2]" />
            Datos de contacto y entrega
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed text-justify sm:text-left">
            Necesitamos estos datos para identificar tu orden en nuestro taller y coordinar la entrega o envío en Caracas.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Nombre y apellido */}
          <div className="space-y-1.5">
            <Label htmlFor="customerName" className="text-xs font-bold text-[#0A0A0A]">
              Nombre y apellido <span className="text-rose-600">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                id="customerName"
                placeholder="Ej. Carlos Mendoza"
                className="pl-9 bg-white text-[#0A0A0A] placeholder:text-slate-400 border-2 border-black/30 focus-visible:border-black"
                {...form.register("customerName")}
              />
            </div>
            {form.formState.errors.customerName && (
              <p className="text-xs text-rose-600 font-semibold">
                {form.formState.errors.customerName.message}
              </p>
            )}
          </div>

          {/* Teléfono / WhatsApp */}
          <div className="space-y-1.5">
            <Label htmlFor="customerPhone" className="text-xs font-bold text-[#0A0A0A]">
              Teléfono / WhatsApp <span className="text-rose-600">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                id="customerPhone"
                type="tel"
                placeholder="Ej. 0412-1234567 o +58 412..."
                className="pl-9 bg-white text-[#0A0A0A] placeholder:text-slate-400 border-2 border-black/30 focus-visible:border-black"
                {...form.register("customerPhone")}
              />
            </div>
            {form.formState.errors.customerPhone && (
              <p className="text-xs text-rose-600 font-semibold">
                {form.formState.errors.customerPhone.message}
              </p>
            )}
          </div>
        </div>

        {/* Selector de fecha de entrega */}
        <div className="space-y-2.5 rounded-xl border-2 border-black bg-white p-4 shadow-[2px_2px_0px_#0A0A0A]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <Label htmlFor="deliveryDate" className="text-xs font-bold text-[#0A0A0A] flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#0891B2]" />
                Fecha estimada de entrega <span className="text-rose-600">*</span>
              </Label>
              <p className="text-xs text-emerald-800 font-semibold">
                ⏳ Tiempo estimado: 4 a 7 días hábiles desde la confirmación del abono
              </p>
            </div>

            <div className="w-full sm:w-auto">
              <Input
                id="deliveryDate"
                type="date"
                min={minDeliveryDate}
                max={maxDeliveryDate}
                className="w-full sm:w-44 text-sm bg-[#FAF7F0] text-[#0A0A0A] border-2 border-black/30 focus-visible:border-black font-mono"
                {...form.register("deliveryDate")}
              />
            </div>
          </div>
          {form.formState.errors.deliveryDate && (
            <p className="text-xs text-rose-600 font-semibold">
              {form.formState.errors.deliveryDate.message}
            </p>
          )}
          <p className="text-[11px] text-slate-600 leading-relaxed text-justify sm:text-left">
            Días hábiles de lunes a viernes en nuestro taller de La Dolorita. Pedidos urgentes especiales se coordinan directamente vía WhatsApp.
          </p>
        </div>
      </div>

      {/* 3. MODALIDAD DE PEDIDO (UNIDAD O DOCENA) */}
      <div className="space-y-4">
        <div className="border-b-2 border-black/15 pb-2 space-y-1">
          <h3 className="font-oswald font-black uppercase tracking-wide text-[#0A0A0A] text-sm sm:text-base flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-[#0891B2]" />
            ¿Tu pedido es por unidad o por docena?
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed text-justify sm:text-left">
            Selecciona la modalidad correspondiente a tu cantidad para aplicar las condiciones de pago oficiales de AlquimiaTex.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Opción Unidad */}
          <label
            className={cn(
              "flex cursor-pointer flex-col justify-between rounded-xl border-2 p-3.5 transition-all",
              selectedPricingType === "unidad"
                ? "border-black bg-[#CFFAFE] shadow-[3px_3px_0px_#0A0A0A]"
                : "border-black/25 bg-white hover:border-black"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-xs text-[#0A0A0A]">Por Unidad (Al detal)</span>
                <span className="rounded border border-black bg-white px-1.5 py-0 font-mono text-[10px] font-bold text-[#0A0A0A]">
                  1 a 11 unids.
                </span>
              </div>
              <input
                type="radio"
                value="unidad"
                className="sr-only"
                {...form.register("orderPricingType")}
              />
              <span
                className={cn(
                  "h-4 w-4 shrink-0 rounded-full border-2 border-black flex items-center justify-center",
                  selectedPricingType === "unidad" ? "bg-black" : "bg-white"
                )}
              >
                {selectedPricingType === "unidad" && <span className="h-1.5 w-1.5 rounded-full bg-[#FACC15]" />}
              </span>
            </div>
            <div className="mt-3 rounded-lg bg-white p-2.5 border border-black/20 space-y-1">
              <p className="text-xs font-bold text-[#0A0A0A]">
                Pago del 100% por anticipado de forma obligatoria
              </p>
              <p className="text-[11px] text-slate-700 leading-relaxed text-justify">
                Al ser confección personalizada al detal, la producción inicia inmediatamente tras confirmar el pago total.
              </p>
            </div>
          </label>

          {/* Opción Docena */}
          <label
            className={cn(
              "flex cursor-pointer flex-col justify-between rounded-xl border-2 p-3.5 transition-all",
              selectedPricingType === "docena"
                ? "border-black bg-[#DCFCE7] shadow-[3px_3px_0px_#0A0A0A]"
                : "border-black/25 bg-white hover:border-black"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-xs text-[#0A0A0A]">Por Docena (Al mayor)</span>
                <span className="rounded border border-black bg-[#FACC15] px-1.5 py-0 font-mono text-[10px] font-black text-[#0A0A0A]">
                  12+ unids.
                </span>
              </div>
              <input
                type="radio"
                value="docena"
                className="sr-only"
                {...form.register("orderPricingType")}
              />
              <span
                className={cn(
                  "h-4 w-4 shrink-0 rounded-full border-2 border-black flex items-center justify-center",
                  selectedPricingType === "docena" ? "bg-black" : "bg-white"
                )}
              >
                {selectedPricingType === "docena" && <span className="h-1.5 w-1.5 rounded-full bg-[#FACC15]" />}
              </span>
            </div>
            <div className="mt-3 rounded-lg bg-white p-2.5 border border-black/20 space-y-1">
              <p className="text-xs font-bold text-emerald-800">
                Abono del 50% por anticipado, 50% contra entrega
              </p>
              <p className="text-[11px] text-slate-700 leading-relaxed text-justify">
                50% inicial para compra de telas e insumos, y el 50% restante al retirar en taller o al momento de la entrega.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* 4. INSTRUCCIONES DE PAGO MANUALES */}
      <div className="space-y-4">
        <div className="border-b-2 border-black/15 pb-2 space-y-1">
          <h3 className="font-oswald font-black uppercase tracking-wide text-[#0A0A0A] text-sm sm:text-base flex items-center gap-2">
            <Wallet className="h-4 w-4 text-[#0891B2]" />
            Método de pago preferido
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed text-justify sm:text-left">
            {selectedPricingType === "docena"
              ? "Abono del 50% por anticipado, 50% contra entrega. Envíanos tu captura de comprobante por WhatsApp."
              : "Pago del 100% por anticipado de forma obligatoria. Envíanos tu captura de comprobante por WhatsApp."}
          </p>
        </div>

        {/* Opciones de pago */}
        <div className="grid gap-3 sm:grid-cols-3">
          <label
            className={cn(
              "flex cursor-pointer flex-col justify-between rounded-xl border-2 p-3.5 transition-all",
              selectedPaymentMethod === "pago_movil"
                ? "border-black bg-[#FACC15]/40 shadow-[3px_3px_0px_#0A0A0A]"
                : "border-black/25 bg-white hover:border-black"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#0A0A0A]">Pago Móvil</span>
              <input
                type="radio"
                value="pago_movil"
                className="sr-only"
                {...form.register("paymentMethod")}
              />
              <span
                className={cn(
                  "h-4 w-4 rounded-full border-2 border-black flex items-center justify-center",
                  selectedPaymentMethod === "pago_movil" ? "bg-black" : "bg-white"
                )}
              >
                {selectedPaymentMethod === "pago_movil" && <span className="h-1.5 w-1.5 rounded-full bg-[#FACC15]" />}
              </span>
            </div>
            <p className="text-[11px] text-slate-700 mt-2 leading-snug">
              Banesco o Venezuela en Bs al cambio oficial BCV.
            </p>
          </label>

          <label
            className={cn(
              "flex cursor-pointer flex-col justify-between rounded-xl border-2 p-3.5 transition-all",
              selectedPaymentMethod === "binance"
                ? "border-black bg-[#FACC15]/40 shadow-[3px_3px_0px_#0A0A0A]"
                : "border-black/25 bg-white hover:border-black"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#0A0A0A]">Binance USDT</span>
              <input
                type="radio"
                value="binance"
                className="sr-only"
                {...form.register("paymentMethod")}
              />
              <span
                className={cn(
                  "h-4 w-4 rounded-full border-2 border-black flex items-center justify-center",
                  selectedPaymentMethod === "binance" ? "bg-black" : "bg-white"
                )}
              >
                {selectedPaymentMethod === "binance" && <span className="h-1.5 w-1.5 rounded-full bg-[#FACC15]" />}
              </span>
            </div>
            <p className="text-[11px] text-slate-700 mt-2 leading-snug">
              Binance Pay ID o transferencia USDT directa.
            </p>
          </label>

          <label
            className={cn(
              "flex cursor-pointer flex-col justify-between rounded-xl border-2 p-3.5 transition-all",
              selectedPaymentMethod === "efectivo"
                ? "border-black bg-[#FACC15]/40 shadow-[3px_3px_0px_#0A0A0A]"
                : "border-black/25 bg-white hover:border-black"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#0A0A0A]">Efectivo en Taller</span>
              <input
                type="radio"
                value="efectivo"
                className="sr-only"
                {...form.register("paymentMethod")}
              />
              <span
                className={cn(
                  "h-4 w-4 rounded-full border-2 border-black flex items-center justify-center",
                  selectedPaymentMethod === "efectivo" ? "bg-black" : "bg-white"
                )}
              >
                {selectedPaymentMethod === "efectivo" && <span className="h-1.5 w-1.5 rounded-full bg-[#FACC15]" />}
              </span>
            </div>
            <p className="text-[11px] text-slate-700 mt-2 leading-snug">
              Dólares o bolívares directamente en La Dolorita.
            </p>
          </label>
        </div>

        {/* Caja de detalles de la cuenta seleccionada */}
        <Card className="rounded-xl border-2 border-black bg-[#F3EFE6] text-[#0A0A0A] p-4 space-y-3 shadow-[3px_3px_0px_#0A0A0A]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black/10 pb-2">
            <span className="text-xs font-bold text-[#0A0A0A] flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-[#0891B2] shrink-0" />
              <span>
                {selectedPricingType === "docena"
                  ? "Datos para realizar tu abono del 50% (50% contra entrega):"
                  : "Datos para realizar tu pago del 100% por anticipado:"}
              </span>
            </span>
            <span className="rounded border border-black bg-black px-2 py-0.5 font-mono text-[10px] font-black text-[#FACC15]">
              Taller La Dolorita
            </span>
          </div>

          {selectedPaymentMethod === "pago_movil" && (
            <div className="grid gap-2 text-xs sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border-2 border-black/20">
                <div>
                  <span className="text-slate-600 block text-[10px] font-mono uppercase">Banco:</span>
                  <span className="font-bold text-[#0A0A0A]">{PAYMENT_INFO.pagoMovil.bank}</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border-2 border-black/20">
                <div>
                  <span className="text-slate-600 block text-[10px] font-mono uppercase">Teléfono Pago Móvil:</span>
                  <span className="font-bold text-[#0A0A0A]">
                    {PAYMENT_INFO.pagoMovil.phone || "Se envía al confirmar por WhatsApp"}
                  </span>
                </div>
                {PAYMENT_INFO.pagoMovil.phone && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-700 hover:bg-[#FACC15] hover:text-black"
                    onClick={() => copyToClipboard(PAYMENT_INFO.pagoMovil.phone, "pm_phone")}
                  >
                    {copiedField === "pm_phone" ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border-2 border-black/20">
                <div>
                  <span className="text-slate-600 block text-[10px] font-mono uppercase">Cédula / RIF:</span>
                  {PAYMENT_INFO.pagoMovil.idNumber ? (
                    <span className="font-bold text-[#0A0A0A]">{PAYMENT_INFO.pagoMovil.idNumber}</span>
                  ) : (
                    <span className="font-semibold text-slate-700 text-[11px]">
                      Se confirma por WhatsApp al validar tu orden
                    </span>
                  )}
                </div>
                {PAYMENT_INFO.pagoMovil.idNumber && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-700 hover:bg-[#FACC15] hover:text-black"
                    onClick={() => copyToClipboard(PAYMENT_INFO.pagoMovil.idNumber, "pm_id")}
                  >
                    {copiedField === "pm_id" ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border-2 border-black/20">
                <div>
                  <span className="text-slate-600 block text-[10px] font-mono uppercase">Titular:</span>
                  <span className="font-bold text-[#0A0A0A]">{PAYMENT_INFO.pagoMovil.beneficiary}</span>
                </div>
              </div>
            </div>
          )}

          {selectedPaymentMethod === "binance" && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-white p-3 border-2 border-black/20">
                <div>
                  <span className="text-slate-600 block text-[10px] font-mono uppercase">Binance Pay ID:</span>
                  {PAYMENT_INFO.binance.payId ? (
                    <span className="font-bold text-[#0A0A0A] text-sm tracking-wide">{PAYMENT_INFO.binance.payId}</span>
                  ) : (
                    <span className="font-semibold text-slate-700 text-xs">
                      Te enviamos nuestro Binance Pay ID y código QR por WhatsApp al confirmar
                    </span>
                  )}
                </div>
                {PAYMENT_INFO.binance.payId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-700 hover:bg-[#FACC15] hover:text-black"
                    onClick={() => copyToClipboard(PAYMENT_INFO.binance.payId, "binance_id")}
                  >
                    {copiedField === "binance_id" ? <Check className="h-4 w-4 text-emerald-700" /> : <Copy className="h-4 w-4" />}
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed text-justify sm:text-left">
                Red: <strong className="text-[#0A0A0A]">{PAYMENT_INFO.binance.network}</strong>. Puedes pagar escaneando el código QR que te enviaremos por WhatsApp o directamente con el Pay ID.
              </p>
            </div>
          )}

          {selectedPaymentMethod === "efectivo" && (
            <div className="rounded-lg bg-white p-3 border-2 border-black/20 text-xs space-y-1.5">
              <p className="font-bold text-[#0A0A0A]">
                📍 {PAYMENT_INFO.cash.location}
              </p>
              <p className="text-slate-700 text-[11px] leading-relaxed text-justify sm:text-left">
                {PAYMENT_INFO.cash.currency}. {selectedPricingType === "docena" ? "Se entrega recibo físico en mano al dejar el 50% de abono inicial." : "Se entrega recibo físico en mano al realizar el pago del 100%."}
              </p>
            </div>
          )}

          <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-700 leading-relaxed text-justify sm:text-left">
            <Info className="h-4 w-4 text-[#0891B2] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[#0A0A0A]">Paso final:</strong> Al pulsar el botón de abajo, tu pedido quedará registrado con su código único y serás redirigido a WhatsApp para coordinar tu cotización y comprobante con los socios del taller.
            </span>
          </div>
        </Card>
      </div>

      {/* 5. ACEPTACIÓN DE TÉRMINOS Y GARANTÍA */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer rounded-xl border-2 border-black bg-white p-4 shadow-[2px_2px_0px_#0A0A0A] hover:bg-[#FAF7F0] transition-colors">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-2 border-black accent-black shrink-0"
            {...form.register("acceptTerms")}
          />
          <div className="text-xs text-[#0A0A0A] space-y-1.5">
            <span className="font-bold block">
              Acepto las condiciones de confección y pago de AlquimiaTex <span className="text-rose-600">*</span>
            </span>
            <p className="text-slate-700 text-[11px] leading-relaxed text-justify">
              {selectedPricingType === "docena"
                ? "Entiendo que el estampado y confección inician tras confirmar el 50% de abono inicial, liquidando el 50% restante contra entrega en un plazo estimado de 4 a 7 días hábiles."
                : "Entiendo que el estampado y confección inician tras confirmar el pago del 100% por anticipado, en un plazo estimado de 4 a 7 días hábiles."}
            </p>
            <p className="text-[11px] font-bold text-amber-800">
              🛡️ Garantía oficial: No se realizan cambios por errores en la elección de tallas.
            </p>
            <p className="text-[11px] text-slate-700 pt-0.5 leading-relaxed">
              He leído y acepto los{" "}
              <Link
                href="/terminos"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-bold underline text-[#0A0A0A] hover:text-[#0891B2]"
              >
                Términos y Condiciones
              </Link>{" "}
              y la{" "}
              <Link
                href="/privacidad"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-bold underline text-[#0A0A0A] hover:text-[#0891B2]"
              >
                Política de Privacidad
              </Link>
              .
            </p>
          </div>
        </label>
        {form.formState.errors.acceptTerms && (
          <p className="text-xs text-rose-600 font-semibold">
            {form.formState.errors.acceptTerms.message}
          </p>
        )}
      </div>

      {/* MENSAJE DE ERROR GLOBAL */}
      {submitError && (
        <div className="rounded-xl border-2 border-rose-600 bg-rose-50 p-3.5 text-xs text-rose-800 font-semibold flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* BOTONES DE NAVEGACIÓN */}
      <div className="flex flex-col-reverse gap-3 pt-4 border-t-2 border-black/15 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full sm:w-auto h-11 px-4 rounded-xl border-2 border-black bg-white text-[#0A0A0A] hover:bg-[#FAF7F0] font-bold text-xs sm:text-sm gap-2 shadow-[2px_2px_0px_#0A0A0A]"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Volver a Diseños</span>
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto min-w-[240px] h-12 px-6 rounded-xl border-2 border-black bg-emerald-600 hover:bg-emerald-700 text-white font-oswald text-base sm:text-lg font-black uppercase tracking-wide gap-2 shadow-[4px_4px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              <span>Guardando y abriendo WhatsApp...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>Confirmar y Enviar Pedido</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
