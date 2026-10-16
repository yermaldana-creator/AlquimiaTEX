"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { ORDER_STATUS_CONFIG, ORDER_STATUSES, normalizeOrderStatus } from "@/lib/constants";
import { updateOrderStatus } from "@/actions/orders.actions";
import type { OrderStatus } from "@/types";

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus | string;
  onStatusUpdated?: (newStatus: OrderStatus) => void;
  size?: "sm" | "md";
}

export function OrderStatusSelect({
  orderId,
  currentStatus,
  onStatusUpdated,
  size = "md",
}: OrderStatusSelectProps) {
  const normalizedInitial = normalizeOrderStatus(currentStatus);
  const [status, setStatus] = useState<OrderStatus>(normalizedInitial);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as OrderStatus;
    const prevStatus = status;
    setStatus(nextStatus);

    startTransition(async () => {
      const res = await updateOrderStatus(orderId, nextStatus);
      if (res.success) {
        if (onStatusUpdated) {
          onStatusUpdated(nextStatus);
        }
      } else {
        // Revertir en caso de error
        setStatus(prevStatus);
        alert(`Error al actualizar estado: ${res.error || "Intenta nuevamente"}`);
      }
    });
  };

  const currentConfig = ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG.pendiente_contacto;

  const sizeClasses = {
    sm: "py-1 px-2 pr-6 text-[10px]",
    md: "py-1.5 px-3 pr-7 text-xs",
  }[size];

  return (
    <div className="relative inline-flex items-center">
      <select
        value={status}
        onChange={handleChange}
        disabled={isPending}
        className={`font-mono font-bold uppercase border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-[#FACC15] transition-all disabled:opacity-60 ${sizeClasses} ${currentConfig.bg} ${currentConfig.text}`}
        title="Cambiar estado del pedido"
      >
        {ORDER_STATUSES.map((statusKey) => {
          const item = ORDER_STATUS_CONFIG[statusKey];
          return (
            <option key={statusKey} value={statusKey} className="bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 py-1">
              {item.label}
            </option>
          );
        })}
      </select>

      <div className="absolute right-2 pointer-events-none flex items-center text-black">
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
        ) : (
          <span className="text-[10px] font-mono select-none">▼</span>
        )}
      </div>
    </div>
  );
}
