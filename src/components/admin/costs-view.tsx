"use client";

import { useState } from "react";
import {
  Layers,
  Calculator,
  Sparkles,
} from "lucide-react";
import { CostsKpis } from "./costs-kpis";
import { CostTemplatesList } from "./cost-templates-list";
import { CostComponentsManager } from "./cost-components-manager";
import { PriceCalculator } from "./price-calculator";
import { CostTemplateFormModal } from "./cost-template-form-modal";
import { CostTemplateDetailModal } from "./cost-template-detail-modal";
import type {
  CalculatedTemplatePricing,
  CostComponent,
  CostsKpiData,
  ProductCostTemplate,
} from "@/types";

interface CostsViewProps {
  initialTemplates: CalculatedTemplatePricing[];
  initialComponents: CostComponent[];
  initialKpis: CostsKpiData;
}

export function CostsView({
  initialTemplates,
  initialComponents,
  initialKpis,
}: CostsViewProps) {
  const [activeTab, setActiveTab] = useState<"recetas" | "simulador" | "insumos">("recetas");

  // Estados de modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProductCostTemplate | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailPricing, setDetailPricing] = useState<CalculatedTemplatePricing | null>(null);

  const [simulatorPreselectedId, setSimulatorPreselectedId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (template: ProductCostTemplate) => {
    setEditingTemplate(template);
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = (pricing: CalculatedTemplatePricing) => {
    setDetailPricing(pricing);
    setIsDetailModalOpen(true);
  };

  const handleSimulateFromRecipe = (pricing: CalculatedTemplatePricing) => {
    setSimulatorPreselectedId(pricing.template.id);
    setActiveTab("simulador");
  };

  const handleRefresh = () => {
    // Recargar página o dejar que Server Action revalide
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* ENCABEZADO DE PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black dark:border-zinc-700 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-3 w-3 bg-[#10B981] border border-black dark:border-zinc-700" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Sub-módulo 3
            </span>
          </div>
          <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-black dark:text-[#F5F5F5]">
            Costos y Precios de Venta
          </h1>
          <p className="font-mono text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
            Fórmulas de fabricación del taller, insumos base, margen de ganancia y simulador de volumen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold bg-[#FACC15] text-black px-3 py-1 border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000]">
            CÁLCULO AUTOMÁTICO EN VIVO
          </span>
        </div>
      </div>

      {/* KPIS FINANCIEROS Y DE PRODUCCIÓN */}
      <CostsKpis kpis={initialKpis} />

      {/* NAVEGACIÓN POR PESTAÑAS NEOBRUTALISTAS */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-black dark:border-zinc-700 pb-2">
        <button
          onClick={() => setActiveTab("recetas")}
          className={`inline-flex items-center gap-2 font-mono text-xs font-black uppercase px-4 py-2.5 border-2 border-black dark:border-zinc-700 transition-all ${
            activeTab === "recetas"
              ? "bg-[#FACC15] text-black shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] -translate-y-0.5"
              : "bg-white dark:bg-[#1E1E1E] text-black dark:text-[#F5F5F5] hover:bg-slate-50 dark:hover:bg-zinc-800"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Recetas de Productos ({initialTemplates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("simulador")}
          className={`inline-flex items-center gap-2 font-mono text-xs font-black uppercase px-4 py-2.5 border-2 border-black dark:border-zinc-700 transition-all ${
            activeTab === "simulador"
              ? "bg-[#06B6D4] text-black shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] -translate-y-0.5"
              : "bg-white dark:bg-[#1E1E1E] text-black dark:text-[#F5F5F5] hover:bg-slate-50 dark:hover:bg-zinc-800"
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span>Simulador de Pedidos</span>
        </button>

        <button
          onClick={() => setActiveTab("insumos")}
          className={`inline-flex items-center gap-2 font-mono text-xs font-black uppercase px-4 py-2.5 border-2 border-black dark:border-zinc-700 transition-all ${
            activeTab === "insumos"
              ? "bg-[#581C87] text-[#FACC15] shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] -translate-y-0.5"
              : "bg-white dark:bg-[#1E1E1E] text-black dark:text-[#F5F5F5] hover:bg-slate-50 dark:hover:bg-zinc-800"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Insumos y Costos Base ({initialComponents.length})</span>
        </button>
      </div>

      {/* CONTENIDO DE LA PESTAÑA ACTIVA */}
      {activeTab === "recetas" && (
        <CostTemplatesList
          templates={initialTemplates}
          onOpenCreate={handleOpenCreate}
          onOpenEdit={handleOpenEdit}
          onOpenDetail={handleOpenDetail}
          onSimulate={handleSimulateFromRecipe}
          onRefresh={handleRefresh}
        />
      )}

      {activeTab === "simulador" && (
        <PriceCalculator
          templates={initialTemplates}
          selectedTemplateId={simulatorPreselectedId}
        />
      )}

      {activeTab === "insumos" && (
        <CostComponentsManager
          initialComponents={initialComponents}
          onRefresh={handleRefresh}
        />
      )}

      {/* MODAL CREAR / EDITAR RECETA */}
      <CostTemplateFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleRefresh}
        allComponents={initialComponents}
        initialTemplate={editingTemplate}
        onGoToInsumos={() => setActiveTab("insumos")}
      />

      {/* MODAL FICHA TÉCNICA DETALLE */}
      <CostTemplateDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        pricing={detailPricing}
        onSimulate={handleSimulateFromRecipe}
      />
    </div>
  );
}
