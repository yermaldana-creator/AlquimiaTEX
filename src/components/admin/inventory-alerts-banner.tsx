"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";
import type { InventoryItem } from "@/types";

interface InventoryAlertsBannerProps {
  lowStockItems: InventoryItem[];
  onFilterAlerts: () => void;
  isOnlyAlertsActive: boolean;
}

export function InventoryAlertsBanner({
  lowStockItems,
  onFilterAlerts,
  isOnlyAlertsActive,
}: InventoryAlertsBannerProps) {
  if (lowStockItems.length === 0) return null;

  return (
    <div className="bg-[#FFF1F2] border-2 border-[#E11D48] p-4 shadow-[4px_4px_0px_#0A0A0A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-2 bg-[#F43F5E] text-white border-2 border-black shrink-0">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-oswald text-base font-black uppercase text-[#9F1239] leading-tight">
            ¡Alerta de Reposición en Taller! ({lowStockItems.length} ítems bajo mínimo)
          </h4>
          <p className="font-mono text-xs text-[#BE123C] pt-0.5">
            Hay insumos o prendas cuya existencia actual está por debajo del stock mínimo fijado.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onFilterAlerts}
        className={`inline-flex items-center justify-center gap-1.5 font-mono text-xs font-bold uppercase px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5 shrink-0 ${
          isOnlyAlertsActive
            ? "bg-black text-[#FACC15]"
            : "bg-[#F43F5E] text-white hover:bg-[#E11D48]"
        }`}
      >
        <span>{isOnlyAlertsActive ? "Ver todos los ítems" : "Ver solo alertas"}</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
