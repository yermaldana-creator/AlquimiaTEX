"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCachedSupabaseClient } from "@/lib/supabase/cached-client";
import { getSessionUser } from "@/actions/auth.actions";
import type {
  CostComponent,
  CostComponentFormData,
  CostMarginType,
  ProductCostTemplate,
  ProductCostTemplateFormData,
  CalculatedTemplatePricing,
  HydratedCostTemplateItem,
  CostSimulationResult,
  CostsKpiData,
  ProfitabilityLevel,
} from "@/types";

// ============================================================================
// FUNCIONES PURAS DE CÁLCULO FINANCIERO (PRECIOS Y MÁRGENES)
// ============================================================================

/**
 * Redondeo financiero seguro a N decimales
 */
function roundTo(num: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

/**
 * Determina el nivel de rentabilidad de acuerdo a los umbrales del taller:
 * - Pérdida: Ganancia negativa
 * - Alta: Margen >= 40%
 * - Media: Margen 20% - 40%
 * - Baja: Margen < 20%
 */
export async function determineProfitabilityLevel(
  marginPercentage: number,
  profit: number
): Promise<ProfitabilityLevel> {
  if (profit < 0) return "loss";
  if (marginPercentage >= 40) return "high";
  if (marginPercentage >= 20) return "medium";
  return "low";
}

/**
 * Calcula el precio de venta y la ganancia según los 3 modos oficiales:
 * 1. 'fixed': Ganancia fija en $ (Precio = Costo + Ganancia fija)
 * 2. 'percentage': Recargo porcentual sobre costo (Precio = Costo * (1 + %/100))
 * 3. 'target_price': Precio de venta deseado en $ (Ganancia = Precio deseado - Costo)
 */
export async function calculatePricing(
  unitCost: number,
  marginType: CostMarginType,
  marginValue: number
): Promise<{
  salePrice: number;
  profit: number;
  marginPercentage: number;
  profitabilityLevel: ProfitabilityLevel;
}> {
  let salePrice = 0;
  let profit = 0;
  let marginPercentage = 0;

  const cost = Math.max(0, unitCost);
  const val = Number(marginValue) || 0;

  switch (marginType) {
    case "fixed":
      profit = roundTo(val, 2);
      salePrice = roundTo(cost + profit, 2);
      marginPercentage = cost > 0 ? roundTo((profit / cost) * 100, 1) : 0;
      break;

    case "percentage":
      marginPercentage = roundTo(val, 1);
      profit = roundTo(cost * (marginPercentage / 100), 2);
      salePrice = roundTo(cost + profit, 2);
      break;

    case "target_price":
      salePrice = roundTo(val, 2);
      profit = roundTo(salePrice - cost, 2);
      marginPercentage = cost > 0 ? roundTo((profit / cost) * 100, 1) : 0;
      break;

    default:
      salePrice = roundTo(cost, 2);
      profit = 0;
      marginPercentage = 0;
  }

  const profitabilityLevel = await determineProfitabilityLevel(marginPercentage, profit);

  return {
    salePrice,
    profit,
    marginPercentage,
    profitabilityLevel,
  };
}

/**
 * Hidrata una receta con los costos unitarios actuales de sus componentes.
 * Si el precio de un insumo cambió en el mercado, la receta refleja el nuevo costo en vivo.
 */
export async function hydrateTemplateItem(
  template: ProductCostTemplate,
  componentsMap: Map<string, CostComponent>
): Promise<CalculatedTemplatePricing> {
  let totalUnitCost = 0;
  const hydratedComponents: HydratedCostTemplateItem[] = [];

  const items = Array.isArray(template.components) ? template.components : [];

  for (const item of items) {
    const comp = componentsMap.get(item.component_id);
    const quantity = Number(item.quantity) || 0;
    const costPerUnit = comp ? Number(comp.cost_per_unit) || 0 : 0;
    const subtotal = roundTo(quantity * costPerUnit, 4);

    totalUnitCost += subtotal;

    hydratedComponents.push({
      component_id: item.component_id,
      quantity,
      unit: item.unit || comp?.unit || "unidad",
      component_name: comp?.name || "Componente no encontrado",
      component_category: comp?.category || "otro",
      cost_per_unit: costPerUnit,
      subtotal: roundTo(subtotal, 2),
    });
  }

  const unitCost = roundTo(totalUnitCost, 2);

  const pricing = await calculatePricing(
    unitCost,
    template.margin_type,
    template.margin_value
  );

  return {
    template,
    hydratedComponents,
    unitCost,
    salePrice: pricing.salePrice,
    profit: pricing.profit,
    marginPercentage: pricing.marginPercentage,
    profitabilityLevel: pricing.profitabilityLevel,
  };
}

// ============================================================================
// SERVER ACTIONS: GESTIÓN DE COMPONENTES E INSUMOS BASE
// ============================================================================

export interface GetCostComponentsParams {
  category?: string;
  search?: string;
  showArchived?: boolean;
}

async function queryCostComponentsDirectly(category: string, search: string, showArchived: boolean) {
  const supabase = getCachedSupabaseClient();
    let query = supabase.from("cost_components").select("*");

    if (showArchived) {
      query = query.not("archived_at", "is", null);
    } else {
      query = query.is("archived_at", null);
    }

    if (category && category !== "todos") {
      query = query.eq("category", category);
    }

    if (search.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    query = query.order("category", { ascending: true }).order("name", { ascending: true });

    const { data, error } = await query;
    console.log("DEBUG COST COMPONENTS: filas obtenidas =", data?.length, "error =", error);
    if (error) {
      console.error("[getCachedCostComponents] Error de consulta:", error);
      return { components: [], error: error.message };
    }

    return { components: (data || []) as CostComponent[] };
  }

export async function getCostComponents(
  params?: GetCostComponentsParams
): Promise<{ components: CostComponent[]; error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { components: [], error: "No autorizado. Inicia sesión como socio." };
    }

    const { category = "todos", search = "", showArchived = false } = params || {};
    // Bypass temporal de unstable_cache para depuración forense
    return await queryCostComponentsDirectly(category, search, showArchived);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido al obtener componentes";
    console.error("[getCostComponents] Excepción:", err);
    return { components: [], error: message };
  }
}

export async function createCostComponent(
  data: CostComponentFormData
): Promise<{ success: boolean; component?: CostComponent; error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado." };
    }

    if (!data.name || !data.name.trim()) {
      return { success: false, error: "El nombre del insumo es obligatorio." };
    }

    const costNum = Number(data.cost_per_unit);
    if (isNaN(costNum) || costNum < 0) {
      return { success: false, error: "El costo unitario no puede ser negativo." };
    }

    const supabase = createClient();
    const { data: inserted, error } = await supabase
      .from("cost_components")
      .insert({
        name: data.name.trim(),
        category: data.category,
        unit: data.unit.trim() || "unidad",
        cost_per_unit: roundTo(costNum, 4),
        notes: data.notes?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("[createCostComponent] Error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/costos");
    revalidateTag("admin-costs");
    return { success: true, component: inserted as CostComponent };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al registrar insumo";
    return { success: false, error: message };
  }
}

export async function updateCostComponent(
  id: string,
  data: Partial<CostComponentFormData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado." };
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.unit !== undefined) updatePayload.unit = data.unit.trim();
    if (data.cost_per_unit !== undefined) {
      const cost = Number(data.cost_per_unit);
      if (isNaN(cost) || cost < 0) {
        return { success: false, error: "El costo unitario no puede ser negativo." };
      }
      updatePayload.cost_per_unit = roundTo(cost, 4);
    }
    if (data.notes !== undefined) updatePayload.notes = data.notes?.trim() || null;

    const supabase = createClient();
    const { error } = await supabase
      .from("cost_components")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      console.error("[updateCostComponent] Error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/costos");
    revalidateTag("admin-costs");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar insumo";
    return { success: false, error: message };
  }
}

export async function archiveCostComponent(
  id: string,
  archive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado." };
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("cost_components")
      .update({
        archived_at: archive ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("[archiveCostComponent] Error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/costos");
    revalidateTag("admin-costs");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al archivar insumo";
    return { success: false, error: message };
  }
}

// ============================================================================
// SERVER ACTIONS: GESTIÓN DE PLANTILLAS Y RECETAS DE COSTOS
// ============================================================================

export interface GetTemplatesParams {
  category?: string;
  profitability?: string;
  search?: string;
  showArchived?: boolean;
}

export interface GetTemplatesResult {
  templates: CalculatedTemplatePricing[];
  kpis: CostsKpiData;
  allComponents: CostComponent[];
  error?: string;
}

async function queryProductCostTemplatesDirectly(
  category: string,
  profitability: string,
  search: string,
  showArchived: boolean
) {
  const emptyKpis: CostsKpiData = {
    totalActiveTemplates: 0,
    totalComponents: 0,
    averageMarginPercentage: 0,
    mostProfitableTemplate: null,
    lowMarginAlertsCount: 0,
  };

  const supabase = getCachedSupabaseClient();

    // 1. Obtener todos los componentes activos para hidratación
    const { data: rawComponents, error: compError } = await supabase
      .from("cost_components")
      .select("*")
      .order("name", { ascending: true });

    if (compError) {
      console.error("[getCachedProductCostTemplates] Error cargando componentes:", compError);
      return { templates: [], kpis: emptyKpis, allComponents: [], error: compError.message };
    }

    const allComponents = (rawComponents || []) as CostComponent[];
    const componentsMap = new Map<string, CostComponent>();
    for (const comp of allComponents) {
      componentsMap.set(comp.id, comp);
    }

    // 2. Consultar plantillas/recetas
    let query = supabase.from("product_cost_templates").select("*");

    if (showArchived) {
      query = query.not("archived_at", "is", null);
    } else {
      query = query.is("archived_at", null);
    }

    if (category && category !== "todos") {
      query = query.eq("category", category);
    }

    if (search.trim()) {
      query = query.ilike("product_name", `%${search.trim()}%`);
    }

    query = query.order("created_at", { ascending: false });

    const { data: rawTemplates, error: tempError } = await query;
    if (tempError) {
      console.error("[getCachedProductCostTemplates] Error cargando recetas:", tempError);
      return { templates: [], kpis: emptyKpis, allComponents, error: tempError.message };
    }

    const templatesList = (rawTemplates || []) as ProductCostTemplate[];

    // 3. Hidratar cada receta y calcular costos y márgenes en vivo
    const calculatedTemplates: CalculatedTemplatePricing[] = [];
    for (const t of templatesList) {
      const calculated = await hydrateTemplateItem(t, componentsMap);
      calculatedTemplates.push(calculated);
    }

    // 4. Filtrar por rentabilidad si aplica
    let filteredTemplates = calculatedTemplates;
    if (profitability && profitability !== "todos") {
      filteredTemplates = calculatedTemplates.filter(
        (t) => t.profitabilityLevel === profitability
      );
    }

    // 5. Calcular KPIs métricos del taller
    const activeTemplates = calculatedTemplates.filter(
      (t) => t.template.is_active && !t.template.archived_at
    );
    const totalActive = activeTemplates.length;
    let sumMargins = 0;
    let mostProfitable: { name: string; margin: number } | null = null;
    let lowAlerts = 0;

    for (const item of activeTemplates) {
      sumMargins += item.marginPercentage;
      if (!mostProfitable || item.marginPercentage > mostProfitable.margin) {
        mostProfitable = {
          name: item.template.product_name,
          margin: item.marginPercentage,
        };
      }
      if (item.profitabilityLevel === "low" || item.profitabilityLevel === "loss") {
        lowAlerts++;
      }
    }

    const averageMargin = totalActive > 0 ? roundTo(sumMargins / totalActive, 1) : 0;

    const kpis: CostsKpiData = {
      totalActiveTemplates: totalActive,
      totalComponents: allComponents.filter((c) => !c.archived_at).length,
      averageMarginPercentage: averageMargin,
      mostProfitableTemplate: mostProfitable,
      lowMarginAlertsCount: lowAlerts,
    };

    return {
      templates: filteredTemplates,
      kpis,
      allComponents,
    };
  }

export async function getProductCostTemplates(
  params?: GetTemplatesParams
): Promise<GetTemplatesResult> {
  const emptyKpis: CostsKpiData = {
    totalActiveTemplates: 0,
    totalComponents: 0,
    averageMarginPercentage: 0,
    mostProfitableTemplate: null,
    lowMarginAlertsCount: 0,
  };

  try {
    const user = await getSessionUser();
    if (!user) {
      return { templates: [], kpis: emptyKpis, allComponents: [], error: "No autorizado." };
    }

    const {
      category = "todos",
      profitability = "todos",
      search = "",
      showArchived = false,
    } = params || {};

    return await queryProductCostTemplatesDirectly(category, profitability, search, showArchived);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar recetas";
    console.error("[getProductCostTemplates] Excepción:", err);
    return { templates: [], kpis: emptyKpis, allComponents: [], error: message };
  }
}

export async function createProductCostTemplate(
  data: ProductCostTemplateFormData
): Promise<{ success: boolean; template?: ProductCostTemplate; error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado." };
    }

    if (!data.product_name || !data.product_name.trim()) {
      return { success: false, error: "El nombre del producto/receta es obligatorio." };
    }

    const marginValue = Number(data.margin_value) || 0;
    const targetPrice = data.target_price ? Number(data.target_price) : null;

    const supabase = createClient();
    const { data: inserted, error } = await supabase
      .from("product_cost_templates")
      .insert({
        product_name: data.product_name.trim(),
        category: data.category,
        description: data.description?.trim() || null,
        margin_type: data.margin_type,
        margin_value: marginValue,
        target_price: targetPrice,
        components: data.components || [],
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .select()
      .single();

    if (error) {
      console.error("[createProductCostTemplate] Error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/costos");
    revalidateTag("admin-costs");
    return { success: true, template: inserted as ProductCostTemplate };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al registrar receta";
    return { success: false, error: message };
  }
}

export async function updateProductCostTemplate(
  id: string,
  data: Partial<ProductCostTemplateFormData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado." };
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.product_name !== undefined) updatePayload.product_name = data.product_name.trim();
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.description !== undefined) updatePayload.description = data.description?.trim() || null;
    if (data.margin_type !== undefined) updatePayload.margin_type = data.margin_type;
    if (data.margin_value !== undefined) updatePayload.margin_value = Number(data.margin_value) || 0;
    if (data.target_price !== undefined) updatePayload.target_price = data.target_price ? Number(data.target_price) : null;
    if (data.components !== undefined) updatePayload.components = data.components;
    if (data.is_active !== undefined) updatePayload.is_active = data.is_active;

    const supabase = createClient();
    const { error } = await supabase
      .from("product_cost_templates")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      console.error("[updateProductCostTemplate] Error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/costos");
    revalidateTag("admin-costs");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al actualizar receta";
    return { success: false, error: message };
  }
}

export async function archiveProductCostTemplate(
  id: string,
  archive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "No autorizado." };
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("product_cost_templates")
      .update({
        archived_at: archive ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("[archiveProductCostTemplate] Error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/costos");
    revalidateTag("admin-costs");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al archivar receta";
    return { success: false, error: message };
  }
}

// ============================================================================
// CALCULADORA / SIMULADOR DE PEDIDOS POR VOLUMEN
// ============================================================================

export async function simulateProductionRun(
  templatePricing: CalculatedTemplatePricing,
  quantity: number
): Promise<CostSimulationResult> {
  const qty = Math.max(1, Math.round(quantity));
  const totalCost = roundTo(templatePricing.unitCost * qty, 2);
  const totalRevenue = roundTo(templatePricing.salePrice * qty, 2);
  const totalProfit = roundTo(totalRevenue - totalCost, 2);

  const requiredComponents = templatePricing.hydratedComponents.map((item) => {
    const totalItemQty = roundTo(item.quantity * qty, 2);
    const totalItemCost = roundTo(totalItemQty * item.cost_per_unit, 2);
    return {
      component_id: item.component_id,
      name: item.component_name,
      category: item.component_category,
      totalQuantity: totalItemQty,
      unit: item.unit,
      unitCost: item.cost_per_unit,
      totalCost: totalItemCost,
    };
  });

  return {
    templateId: templatePricing.template.id,
    productName: templatePricing.template.product_name,
    quantity: qty,
    unitCost: templatePricing.unitCost,
    unitSalePrice: templatePricing.salePrice,
    unitProfit: templatePricing.profit,
    totalCost,
    totalRevenue,
    totalProfit,
    marginPercentage: templatePricing.marginPercentage,
    requiredComponents,
  };
}
