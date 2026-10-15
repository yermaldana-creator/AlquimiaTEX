"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import type { OrderStatus } from "@/types";
import { updateOrderStatusAction } from "@/actions/orders-admin.actions";

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; shortLabel: string; bg: string; text: string; border: string; dotColor: string }
> = {
  pendiente_contacto: {
    label: "🟡 Pendiente de Contacto",
    shortLabel: "Pendiente",
    bg: "bg-[#FEF9C3]",
    text: "text-[#854D0E]",
    border: "border-[#CA8A04]",
    dotColor: "bg-amber-500",
  },
  abonado: {
    label: "🔵 Pago Abonado (50% / 100%)",
    shortLabel: "Abonado",
    bg: "bg-[#E0F2FE]",
    text: "text-[#0369A1]",
    border: "border-[#0284C7]",
    dotColor: "bg-sky-500",
  },
  en_confeccion: {
    label: "🟣 En Plancha / Confección",
    shortLabel: "En Plancha",
    bg: "bg-[#F3E8FF]",
    text: "text-[#6B21A8]",
    border: "border-[#9333EA]",
    dotColor: "bg-purple-600",
  },
  listo: {
    label: "🟢 Listo para Entrega",
    shortLabel: "Listo",
    bg: "bg-[#DCFCE7]",
    text: "text-[#166534]",
    border: "border-[#16A34A]",
    dotColor: "bg-emerald-600",
  },
  entregado: {
    label: "⚪ Entregado al Cliente",
    shortLabel: "Entregado",
    bg: "bg-[#F1F5F9]",
    text: "text-[#334155]",
    border: "border-[#64748B]",
    dotColor: "bg-slate-500",
  },
};

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  size?: "sm" | "md";
}

export function OrderStatusBadge({ status, size = "md" }: OrderStatusBadgeProps) {
  const normalizedStatus = (status as OrderStatus) in ORDER_STATUS_CONFIG
    ? (status as OrderStatus)
    : "pendiente_contacto";

  const config = ORDER_STATUS_CONFIG[normalizedStatus];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-bold uppercase rounded-none border-2 border-black shadow-[2px_2px_0px_#0A0A0A] ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      } ${config.bg} ${config.text}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dotColor} shrink-0`} />
      <span>{config.shortLabel}</span>
    </span>
  );
}

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus | string;
  onStatusUpdated?: (newStatus: OrderStatus) => void;
}

export function OrderStatusSelect({
  orderId,
  currentStatus,
  onStatusUpdated,
}: OrderStatusSelectProps) {
  const [status, setStatus] = useState<OrderStatus>(
    (currentStatus as OrderStatus) in ORDER_STATUS_CONFIG
      ? (currentStatus as OrderStatus)
      : "pendiente_contacto"
  );
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as OrderStatus;
    setStatus(nextStatus);

    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, nextStatus);
      if (res.success) {
        if (onStatusUpdated) onStatusUpdated(nextStatus);
      } else {
        // Revertir si falló
        setStatus(currentStatus as OrderStatus);
        alert(`Error al actualizar estado: ${res.error || "Intenta nuevamente"}`);
      }
    });
  };

  const currentConfig = ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG.pendiente_contacto;

  return (
    <div className="relative inline-flex items-center">
      <select
        value={status}
        onChange={handleChange}
        disabled={isPending}
        className={`font-mono text-xs font-bold uppercase py-1 px-2.5 pr-7 border-2 border-black shadow-[2px_2px_0px_#0A0A0A] cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all disabled:opacity-50 ${currentConfig.bg} ${currentConfig.text}`}
      >
        {Object.entries(ORDER_STATUS_CONFIG).map(([key, item]) => (
          <option key={key} value={key} className="bg-white text-black py-1">
            {item.label}
          </option>
        ))}
      </select>

      <div className="absolute right-2 pointer-events-none flex items-center text-black">
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
        ) : (
          <span className="text-[10px] font-mono">▼</span>
        )}
      </div>
    </div>
  );
}
