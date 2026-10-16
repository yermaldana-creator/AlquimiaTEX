import { ORDER_STATUS_CONFIG, normalizeOrderStatus } from "@/lib/constants";
import type { OrderStatus } from "@/types";

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
  className?: string;
}

export function OrderStatusBadge({
  status,
  size = "md",
  showDot = true,
  className = "",
}: OrderStatusBadgeProps) {
  const normalizedKey = normalizeOrderStatus(status);
  const config = ORDER_STATUS_CONFIG[normalizedKey] || ORDER_STATUS_CONFIG.pendiente_contacto;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-bold uppercase rounded-none border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] ${sizeClasses} ${config.bg} ${config.text} ${className}`}
      title={config.description}
    >
      {showDot && (
        <span
          className={`h-2 w-2 rounded-full shrink-0 border border-black/30 ${config.dotColor}`}
        />
      )}
      <span>{config.shortLabel}</span>
    </span>
  );
}
