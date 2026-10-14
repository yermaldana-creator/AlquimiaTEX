"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface OrderSuccessDialogProps {
  orderCode: string;
  whatsappUrl: string;
  onReset: () => void;
}

export function OrderSuccessDialog({
  orderCode,
  whatsappUrl,
  onReset,
}: OrderSuccessDialogProps) {
  const [copied, setCopied] = React.useState(false);

  // Redirigir a WhatsApp de forma directa (evita que el navegador lo bloquee como pop-up)
  React.useEffect(() => {
    if (whatsappUrl) {
      const timer = setTimeout(() => {
        window.location.href = whatsappUrl;
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [whatsappUrl]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(orderCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleOpenWhatsApp = () => {
    if (whatsappUrl) {
      window.location.href = whatsappUrl;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <Card className="max-w-lg w-full p-6 sm:p-8 space-y-6 text-center border-border shadow-2xl bg-card rounded-2xl relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute -top-12 -right-12 h-40 w-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        {/* Icono de éxito */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-500/5">
          <CheckCircle2 className="h-9 w-9" />
        </div>

        {/* Título y código de orden */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            ¡Pedido Registrado con Éxito!
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Tu solicitud está guardada en el sistema del taller AlquimiaTex.
          </p>

          <div className="pt-2 inline-flex items-center gap-2 rounded-xl bg-muted/60 px-4 py-2 border border-border">
            <span className="text-xs text-muted-foreground">Código de pedido:</span>
            <span className="font-mono text-base font-black text-primary">{orderCode}</span>
            <button
              type="button"
              onClick={handleCopyCode}
              title="Copiar código"
              className="ml-1 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Botón principal de WhatsApp */}
        <div className="space-y-3 pt-2">
          <Button
            type="button"
            size="lg"
            onClick={handleOpenWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-base shadow-lg shadow-emerald-500/20 py-6 rounded-xl flex items-center justify-center gap-2.5"
          >
            <MessageCircle className="h-5 w-5 fill-current" />
            <span>Abrir WhatsApp y Enviar Comprobante</span>
            <ExternalLink className="h-4 w-4 opacity-80" />
          </Button>

          <p className="text-[11px] text-muted-foreground">
            Si no se abrió automáticamente el chat, pulsa el botón verde para continuar.
          </p>
        </div>

        {/* Pasos siguientes */}
        <div className="text-left rounded-xl border border-border/80 bg-muted/30 p-4 space-y-2.5 text-xs">
          <span className="font-bold text-foreground block">
            Próximos pasos para iniciar la producción:
          </span>
          <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
            <li>
              En el chat de WhatsApp verás el <strong>resumen completo</strong> de tus artículos.
            </li>
            <li>
              Envía la <strong>captura de tu pago del 30%</strong> (Pago Móvil, Binance o acuerdo en efectivo).
            </li>
            <li>
              Los socios de AlquimiaTex verificarán el abono y pasarán tus piezas al taller de estampado.
            </li>
          </ol>
        </div>

        {/* Acciones secundarias */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
            Realizar otro pedido
          </Button>

          <Link
            href="/"
            className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
          >
            <span>Volver a la tienda</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
