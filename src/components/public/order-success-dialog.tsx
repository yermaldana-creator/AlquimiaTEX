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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <Card className="max-w-lg w-full p-6 sm:p-8 space-y-6 text-center border-2 border-black shadow-[6px_6px_0px_#0A0A0A] bg-[#FAF7F0] text-[#0A0A0A] rounded-2xl relative overflow-hidden">
        {/* Icono de éxito */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-[#DCFCE7] text-emerald-700 shadow-[3px_3px_0px_#0A0A0A]">
          <CheckCircle2 className="h-9 w-9" />
        </div>

        {/* Título y código de orden */}
        <div className="space-y-2">
          <h2 className="font-oswald text-2xl font-black uppercase tracking-tight text-[#0A0A0A] sm:text-3xl">
            ¡Pedido Registrado con Éxito!
          </h2>
          <p className="text-xs text-slate-700 sm:text-sm">
            Tu solicitud está guardada en el sistema del taller AlquimiaTex.
          </p>

          <div className="pt-2 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 border-2 border-black shadow-[2px_2px_0px_#0A0A0A]">
            <span className="text-xs text-slate-600 font-semibold">Código de pedido:</span>
            <span className="font-mono text-base font-black text-[#0A0A0A]">{orderCode}</span>
            <button
              type="button"
              onClick={handleCopyCode}
              title="Copiar código"
              className="ml-1 text-slate-700 hover:text-black transition-colors p-1"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" />
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
            className="w-full h-auto min-h-12 bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-sm sm:text-base border-2 border-black shadow-[4px_4px_0px_#0A0A0A] py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 whitespace-normal leading-snug text-center"
          >
            <MessageCircle className="h-5 w-5 fill-current shrink-0" />
            <span>Enviar Comprobante por WhatsApp</span>
            <ExternalLink className="h-4 w-4 opacity-90 shrink-0" />
          </Button>

          <p className="text-[11px] text-slate-600">
            Si no se abrió automáticamente el chat, pulsa el botón verde para continuar.
          </p>
        </div>

        {/* Pasos siguientes */}
        <div className="text-left rounded-xl border-2 border-black bg-white p-4 space-y-2.5 text-xs shadow-[2px_2px_0px_#0A0A0A]">
          <span className="font-bold text-[#0A0A0A] block">
            Próximos pasos para iniciar la producción:
          </span>
          <ol className="space-y-2 text-slate-700 list-decimal list-inside leading-relaxed">
            <li>
              En el chat de WhatsApp verás el <strong className="text-[#0A0A0A]">resumen completo</strong> de tus artículos.
            </li>
            <li>
              Envía la <strong className="text-[#0A0A0A]">captura de tu pago o abono</strong> (Pago Móvil, Binance o acuerdo en efectivo).
            </li>
            <li>
              Los socios de AlquimiaTex verificarán tu pago y pasarán tus piezas al taller de confección y estampado.
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
