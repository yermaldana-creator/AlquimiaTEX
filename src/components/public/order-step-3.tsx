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
import { PAYMENT_INFO, SHIRT_CUT_LABELS, SHIRT_FABRICS, MUG_TYPES } from "@/lib/constants";
import { step3ContactSchema, type Step3ContactFormData, type OrderItem } from "@/lib/schemas";
import { submitOrderAction, type SubmitOrderResponse } from "@/actions/orders.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* 1. RESUMEN DEL PEDIDO */}
      <Card className="overflow-hidden border-border/80 bg-muted/20">
        <div className="border-b border-border/60 bg-muted/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground text-sm sm:text-base">
                Resumen de tu pedido ({items.length} {items.length === 1 ? "artículo" : "artículos"} • {totalUnits} {totalUnits === 1 ? "unidad" : "unidades"})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onGoToStep1}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Modificar artículos
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border/40 p-4 space-y-4">
          {items.map((item, idx) => (
            <div key={item.id} className="pt-3 first:pt-0">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-sm capitalize text-foreground">
                      {item.product === "camisa" && "Camisa / Franela"}
                      {item.product === "mousepad" && "Mousepad Personalizado"}
                      {item.product === "rompecabezas" && "Rompecabezas Sublimado"}
                      {item.product === "taza" && "Taza Sublimada"}
                      {item.product === "otro" && (item.customProductDetails || "Producto a cotizar")}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {item.quantity} {item.quantity === 1 ? "unidad" : "unidades"}
                    </Badge>
                  </div>

                  {/* Variantes */}
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 pl-7">
                    {item.product === "camisa" && (
                      <>
                        <span>Talla: <strong>{item.shirtSize}</strong></span>
                        <span>•</span>
                        <span>Corte: <strong>{SHIRT_CUT_LABELS[item.shirtCut || "unisex"] || item.shirtCut}</strong></span>
                        <span>•</span>
                        <span>Color: <strong>{item.shirtColor === "gris_jaspeado" ? "Gris Jaspeado" : "Blanco"}</strong></span>
                        <span>•</span>
                        <span>Tela: <strong>{SHIRT_FABRICS.find(f => f.value === item.shirtFabric)?.label || item.shirtFabric || "Microdurazno"}</strong></span>
                      </>
                    )}
                    {item.product === "mousepad" && (
                      <span>Medida: <strong className="capitalize">{item.mousepadSize}</strong></span>
                    )}
                    {item.product === "rompecabezas" && (
                      <span>Formato: <strong className="uppercase">{item.puzzlePieces}</strong></span>
                    )}
                    {item.product === "taza" && (
                      <span>Modelo: <strong>{MUG_TYPES.find(m => m.value === item.mugType)?.label || item.mugType || "Taza"}</strong></span>
                    )}
                  </div>

                  {/* Descripción de diseño */}
                  {item.description && (
                    <p className="text-xs text-foreground/80 pl-7 italic line-clamp-2">
                      &ldquo;{item.description}&rdquo;
                    </p>
                  )}
                </div>

                {/* Miniaturas de imágenes si existen */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.referenceImage && (
                    <div className="relative h-11 w-11 rounded-md overflow-hidden border bg-muted shadow-xs" title="Imagen de referencia adjunta">
                      <Image
                        src={item.referenceImage}
                        alt="Referencia"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}
                  {item.aiGeneratedImage && (
                    <div className="relative h-11 w-11 rounded-md overflow-hidden border border-primary/40 bg-primary/5 shadow-xs" title="Concepto visual generado por IA">
                      <Image
                        src={item.aiGeneratedImage}
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

        <div className="border-t border-border/60 bg-muted/10 p-3 px-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>* Los precios finales y descuentos por volumen se confirmarán en la cotización de WhatsApp.</span>
          <button
            type="button"
            onClick={onGoToStep2}
            className="font-semibold text-primary hover:underline shrink-0"
          >
            Revisar diseños
          </button>
        </div>
      </Card>

      {/* 2. DATOS DE CONTACTO Y FECHA DE ENTREGA */}
      <div className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Datos de contacto y entrega
          </h3>
          <p className="text-xs text-muted-foreground">
            Necesitamos estos datos para identificar tu orden y coordinar la entrega en Caracas.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Nombre y apellido */}
          <div className="space-y-1.5">
            <Label htmlFor="customerName" className="text-xs font-semibold">
              Nombre y apellido <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="customerName"
                placeholder="Ej. Carlos Mendoza"
                className="pl-9"
                {...form.register("customerName")}
              />
            </div>
            {form.formState.errors.customerName && (
              <p className="text-xs text-destructive">
                {form.formState.errors.customerName.message}
              </p>
            )}
          </div>

          {/* Teléfono / WhatsApp */}
          <div className="space-y-1.5">
            <Label htmlFor="customerPhone" className="text-xs font-semibold">
              Teléfono / WhatsApp <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="customerPhone"
                type="tel"
                placeholder="Ej. 0412-1234567 o +58 412..."
                className="pl-9"
                {...form.register("customerPhone")}
              />
            </div>
            {form.formState.errors.customerPhone && (
              <p className="text-xs text-destructive">
                {form.formState.errors.customerPhone.message}
              </p>
            )}
          </div>
        </div>

        {/* Selector de fecha de entrega */}
        <div className="space-y-2 rounded-xl border border-border/80 bg-background p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <Label htmlFor="deliveryDate" className="text-xs font-bold flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                Fecha estimada de entrega <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                ⏳ Tiempo estimado: 4 a 7 días hábiles desde la confirmación del abono
              </p>
            </div>

            <div className="w-full sm:w-auto">
              <Input
                id="deliveryDate"
                type="date"
                min={minDeliveryDate}
                max={maxDeliveryDate}
                className="w-full sm:w-44 text-sm"
                {...form.register("deliveryDate")}
              />
            </div>
          </div>
          {form.formState.errors.deliveryDate && (
            <p className="text-xs text-destructive">
              {form.formState.errors.deliveryDate.message}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Días hábiles de lunes a viernes en nuestro taller de La Dolorita. Pedidos urgentes especiales se coordinan vía WhatsApp.
          </p>
        </div>
      </div>

      {/* 3. MODALIDAD DE PEDIDO (UNIDAD O DOCENA) */}
      <div className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            ¿Tu pedido es por unidad o por docena?
          </h3>
          <p className="text-xs text-muted-foreground">
            Selecciona la modalidad para aplicar las condiciones de pago oficiales de AlquimiaTex.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Opción Unidad */}
          <label
            className={cn(
              "flex cursor-pointer flex-col justify-between rounded-xl border-2 p-3.5 transition-all bg-card",
              selectedPricingType === "unidad"
                ? "border-primary bg-primary/10 shadow-xs"
                : "border-border/70 hover:border-primary/40"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-foreground">Por Unidad (Al detal)</span>
                <Badge variant="outline" className="text-[10px]">1 a 11 unidades</Badge>
              </div>
              <input
                type="radio"
                value="unidad"
                className="sr-only"
                {...form.register("orderPricingType")}
              />
              <span className={cn(
                "h-4 w-4 rounded-full border flex items-center justify-center",
                selectedPricingType === "unidad" ? "border-primary bg-primary" : "border-muted-foreground"
              )}>
                {selectedPricingType === "unidad" && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
              </span>
            </div>
            <div className="mt-2.5 rounded-md bg-background/80 p-2.5 border border-border/60">
              <p className="text-xs font-bold text-primary">
                Pago del 100% por anticipado de forma obligatoria
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Al ser confección personalizada al detal, la producción inicia tras confirmar el pago total.
              </p>
            </div>
          </label>

          {/* Opción Docena */}
          <label
            className={cn(
              "flex cursor-pointer flex-col justify-between rounded-xl border-2 p-3.5 transition-all bg-card",
              selectedPricingType === "docena"
                ? "border-primary bg-primary/10 shadow-xs"
                : "border-border/70 hover:border-primary/40"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-foreground">Por Docena (Al mayor)</span>
                <Badge variant="accent" className="text-[10px]">12+ unidades</Badge>
              </div>
              <input
                type="radio"
                value="docena"
                className="sr-only"
                {...form.register("orderPricingType")}
              />
              <span className={cn(
                "h-4 w-4 rounded-full border flex items-center justify-center",
                selectedPricingType === "docena" ? "border-primary bg-primary" : "border-muted-foreground"
              )}>
                {selectedPricingType === "docena" && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
              </span>
            </div>
            <div className="mt-2.5 rounded-md bg-background/80 p-2.5 border border-border/60">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Abono del 50% por anticipado, 50% contra entrega
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                50% para compra de telas e insumos, y el 50% restante al retirar en taller o entrega.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* 4. INSTRUCCIONES DE PAGO MANUALES */}
      <div className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            Método de pago preferido
          </h3>
          <p className="text-xs text-muted-foreground">
            {selectedPricingType === "docena"
              ? "Abono del 50% por anticipado, 50% contra entrega. Envíanos tu captura por WhatsApp."
              : "Pago del 100% por anticipado de forma obligatoria. Envíanos tu captura por WhatsApp."}
          </p>
        </div>

        {/* Opciones de pago */}
        <div className="grid gap-3 sm:grid-cols-3">
          <label
            className={cn(
              "flex cursor-pointer flex-col justify-between rounded-xl border-2 p-3.5 transition-all",
              selectedPaymentMethod === "pago_movil"
                ? "border-primary bg-primary/5 shadow-xs"
                : "border-border/70 hover:border-primary/40 bg-card"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">Pago Móvil</span>
              <input
                type="radio"
                value="pago_movil"
                className="sr-only"
                {...form.register("paymentMethod")}
              />
              <span className={cn(
                "h-4 w-4 rounded-full border flex items-center justify-center",
                selectedPaymentMethod === "pago_movil" ? "border-primary bg-primary" : "border-muted-foreground"
              )}>
                {selectedPaymentMethod === "pago_movil" && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Banesco o Venezuela en Bs al cambio oficial BCV.
            </p>
          </label>

          <label
            className={cn(
              "flex cursor-pointer flex-col justify-between rounded-xl border-2 p-3.5 transition-all",
              selectedPaymentMethod === "binance"
                ? "border-primary bg-primary/5 shadow-xs"
                : "border-border/70 hover:border-primary/40 bg-card"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">Binance USDT</span>
              <input
                type="radio"
                value="binance"
                className="sr-only"
                {...form.register("paymentMethod")}
              />
              <span className={cn(
                "h-4 w-4 rounded-full border flex items-center justify-center",
                selectedPaymentMethod === "binance" ? "border-primary bg-primary" : "border-muted-foreground"
              )}>
                {selectedPaymentMethod === "binance" && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Binance Pay ID o transferencia USDT directa.
            </p>
          </label>

          <label
            className={cn(
              "flex cursor-pointer flex-col justify-between rounded-xl border-2 p-3.5 transition-all",
              selectedPaymentMethod === "efectivo"
                ? "border-primary bg-primary/5 shadow-xs"
                : "border-border/70 hover:border-primary/40 bg-card"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">Efectivo en Taller</span>
              <input
                type="radio"
                value="efectivo"
                className="sr-only"
                {...form.register("paymentMethod")}
              />
              <span className={cn(
                "h-4 w-4 rounded-full border flex items-center justify-center",
                selectedPaymentMethod === "efectivo" ? "border-primary bg-primary" : "border-muted-foreground"
              )}>
                {selectedPaymentMethod === "efectivo" && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Dólares o bolívares directamente en La Dolorita.
            </p>
          </label>
        </div>

        {/* Caja de detalles de la cuenta seleccionada */}
        <Card className="border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-primary/10 pb-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-primary" />
              {selectedPricingType === "docena"
                ? "Datos para realizar tu abono del 50% (50% contra entrega):"
                : "Datos para realizar tu pago del 100% por anticipado:"}
            </span>
            <Badge variant="accent" className="text-[10px]">
              Taller La Dolorita
            </Badge>
          </div>

          {selectedPaymentMethod === "pago_movil" && (
            <div className="grid gap-2 text-xs sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg bg-background p-2.5 border">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Banco:</span>
                  <span className="font-semibold text-foreground">{PAYMENT_INFO.pagoMovil.bank}</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-background p-2.5 border">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Teléfono Pago Móvil:</span>
                  <span className="font-semibold text-foreground">{PAYMENT_INFO.pagoMovil.phone}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => copyToClipboard(PAYMENT_INFO.pagoMovil.phone, "pm_phone")}
                >
                  {copiedField === "pm_phone" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-background p-2.5 border">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Cédula / RIF:</span>
                  <span className="font-semibold text-foreground">{PAYMENT_INFO.pagoMovil.idNumber}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => copyToClipboard(PAYMENT_INFO.pagoMovil.idNumber, "pm_id")}
                >
                  {copiedField === "pm_id" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-background p-2.5 border">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Titular:</span>
                  <span className="font-semibold text-foreground">{PAYMENT_INFO.pagoMovil.beneficiary}</span>
                </div>
              </div>
            </div>
          )}

          {selectedPaymentMethod === "binance" && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-background p-3 border">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Binance Pay ID:</span>
                  <span className="font-bold text-foreground text-sm tracking-wide">{PAYMENT_INFO.binance.payId}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(PAYMENT_INFO.binance.payId, "binance_id")}
                >
                  {copiedField === "binance_id" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Red: <strong>{PAYMENT_INFO.binance.network}</strong>. Puedes pagar escaneando el código QR que te enviaremos por WhatsApp o directamente con el Pay ID.
              </p>
            </div>
          )}

          {selectedPaymentMethod === "efectivo" && (
            <div className="rounded-lg bg-background p-3 border text-xs space-y-1.5">
              <p className="font-semibold text-foreground">
                📍 {PAYMENT_INFO.cash.location}
              </p>
              <p className="text-muted-foreground text-[11px]">
                {PAYMENT_INFO.cash.currency}. {selectedPricingType === "docena" ? "Se entrega recibo físico en mano al dejar el 50% de abono inicial." : "Se entrega recibo físico en mano al realizar el pago del 100%."}
              </p>
            </div>
          )}

          <div className="flex items-start gap-2 pt-1 text-[11px] text-muted-foreground">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>
              <strong>Paso final:</strong> Al pulsar el botón de abajo, tu pedido quedará registrado con su código único y serás redirigido a WhatsApp para enviar el comprobante de pago a los socios del taller.
            </span>
          </div>
        </Card>
      </div>

      {/* 5. ACEPTACIÓN DE TÉRMINOS Y GARANTÍA */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-border/80 bg-card p-3.5 hover:bg-muted/30 transition-colors">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            {...form.register("acceptTerms")}
          />
          <div className="text-xs text-foreground/90 space-y-1">
            <span className="font-semibold block">
              Acepto las condiciones de confección y pago de AlquimiaTex <span className="text-destructive">*</span>
            </span>
            <p className="text-muted-foreground text-[11px]">
              {selectedPricingType === "docena"
                ? "Entiendo que el estampado y confección inician tras confirmar el 50% de abono inicial, liquidando el 50% restante contra entrega en un plazo estimado de 4 a 7 días hábiles."
                : "Entiendo que el estampado y confección inician tras confirmar el pago del 100% por anticipado, en un plazo estimado de 4 a 7 días hábiles."}
            </p>
            <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              🛡️ Garantía oficial: No se realizan cambios por errores en la elección de tallas.
            </p>
            <p className="text-[11px] text-muted-foreground pt-0.5">
              He leído y acepto los{" "}
              <Link
                href="/terminos"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-bold underline text-foreground hover:text-primary"
              >
                Términos y Condiciones
              </Link>{" "}
              y la{" "}
              <Link
                href="/privacidad"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-bold underline text-foreground hover:text-primary"
              >
                Política de Privacidad
              </Link>
              .
            </p>
          </div>
        </label>
        {form.formState.errors.acceptTerms && (
          <p className="text-xs text-destructive">
            {form.formState.errors.acceptTerms.message}
          </p>
        )}
      </div>

      {/* MENSAJE DE ERROR GLOBAL */}
      {submitError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* BOTONES DE NAVEGACIÓN */}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Diseños
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto min-w-[240px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando y abriendo WhatsApp...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirmar y Enviar Pedido
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
