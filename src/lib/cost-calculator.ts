import type {
  CostComponent,
  CostMarginType,
  CostTemplateItem,
  HydratedCostTemplateItem,
  ProfitabilityLevel,
} from "@/types";

export function roundTo(num: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

export function getProfitabilityLevel(
  marginPercentage: number,
  profit: number
): ProfitabilityLevel {
  if (profit < 0) return "loss";
  if (marginPercentage >= 40) return "high";
  if (marginPercentage >= 20) return "medium";
  return "low";
}

/**
 * Cálculo síncrono del costo de fabricación unitario a partir de componentes y cantidades.
 */
export function calculateLiveUnitCost(
  items: CostTemplateItem[],
  componentsMap: Map<string, CostComponent>
): {
  unitCost: number;
  hydratedItems: HydratedCostTemplateItem[];
} {
  let totalUnitCost = 0;
  const hydratedItems: HydratedCostTemplateItem[] = [];

  for (const item of items) {
    const comp = componentsMap.get(item.component_id);
    const quantity = Number(item.quantity) || 0;
    const costPerUnit = comp ? Number(comp.cost_per_unit) || 0 : 0;
    const subtotal = roundTo(quantity * costPerUnit, 4);

    totalUnitCost += subtotal;

    hydratedItems.push({
      component_id: item.component_id,
      quantity,
      unit: item.unit || comp?.unit || "unidad",
      component_name: comp?.name || "Componente desconocido",
      component_category: comp?.category || "otro",
      cost_per_unit: costPerUnit,
      subtotal: roundTo(subtotal, 2),
    });
  }

  return {
    unitCost: roundTo(totalUnitCost, 2),
    hydratedItems,
  };
}

/**
 * Cálculo síncrono de precio de venta y margen para los 3 modos:
 * 1. 'fixed': Ganancia fija en $
 * 2. 'percentage': Recargo % sobre costo
 * 3. 'target_price': Precio de venta deseado en $
 */
export function calculateLivePricing(
  unitCost: number,
  marginType: CostMarginType,
  marginValue: number
): {
  salePrice: number;
  profit: number;
  marginPercentage: number;
  profitabilityLevel: ProfitabilityLevel;
} {
  let salePrice = 0;
  let profit = 0;
  let marginPercentage = 0;

  const cost = Math.max(0, Number(unitCost) || 0);
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

  const profitabilityLevel = getProfitabilityLevel(marginPercentage, profit);

  return {
    salePrice,
    profit,
    marginPercentage,
    profitabilityLevel,
  };
}
