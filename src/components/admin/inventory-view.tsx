"use client";

import { useState, useCallback } from "react";
import { Boxes } from "lucide-react";
import { InventoryKpis } from "./inventory-kpis";
import { InventoryTable } from "./inventory-table";
import type { InventoryItem, InventoryKpiData } from "@/types";

interface InventoryViewProps {
  initialItems: InventoryItem[];
  initialKpis: InventoryKpiData;
  initialCountsByCategory: Record<string, number>;
}

export function InventoryView({
  initialItems,
  initialKpis,
  initialCountsByCategory,
}: InventoryViewProps) {
  const [kpis, setKpis] = useState<InventoryKpiData>(initialKpis);
  const [countsByCategory, setCountsByCategory] = useState<Record<string, number>>(
    initialCountsByCategory
  );

  const handleDataSynced = useCallback(
    (nextKpis: InventoryKpiData, nextCounts: Record<string, number>) => {
      setKpis(nextKpis);
      setCountsByCategory(nextCounts);
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* BLOQUE 1: KPIs DE INVENTARIO (SINCRONIZADOS EN VIVO) */}
      <section className="space-y-2">
        <h2 className="font-oswald text-sm font-black uppercase tracking-wider text-black dark:text-zinc-200">
          [ 1. Resumen de Existencias &amp; Capital ]
        </h2>
        <InventoryKpis kpis={kpis} />
      </section>

      {/* BLOQUE 2: TABLA INTERACTIVA DE INVENTARIO */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-oswald text-sm font-black uppercase tracking-wider text-black dark:text-zinc-200 flex items-center gap-1.5">
            <Boxes className="h-4 w-4 text-black dark:text-white" />
            <span>[ 2. Almacén del Taller en Vivo ]</span>
          </h2>
        </div>

        <InventoryTable
          initialItems={initialItems}
          countsByCategory={countsByCategory}
          onDataSynced={handleDataSynced}
        />
      </section>
    </div>
  );
}
