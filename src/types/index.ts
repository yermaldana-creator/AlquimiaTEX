import type { OrderItem, Step3ContactFormData } from "@/lib/schemas";
import type { PRODUCT_TYPES } from "@/lib/constants";

export type ProductTypeId = (typeof PRODUCT_TYPES)[number]["id"];

export type { OrderItem, Step3ContactFormData };

export interface OrderDraftState {
  items: OrderItem[];
  customerName?: string;
  customerPhone?: string;
  deliveryDate?: string;
  paymentMethod?: string;
  currentStep: number;
  globalAiAttemptsUsed: number;
}

/**
 * 6 Estados Oficiales del Taller AlquimiaTex (Sub-módulo 2A)
 */
export type OrderStatus =
  | "pendiente_contacto"
  | "abono_verificado"
  | "en_produccion"
  | "listo_para_entrega"
  | "entregado"
  | "cancelado";

export type LegacyOrderStatus = "abonado" | "en_confeccion" | "listo";

export type AnyOrderStatus = OrderStatus | LegacyOrderStatus | string;

export interface OrderInventoryReservationRecord {
  order_item_id: string;
  inventory_item_id: string;
  inventory_item_name: string;
  quantity: number;
  stock_after_reserve?: number;
  reserved_at?: string;
}

export interface AdminOrder {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  delivery_date: string;
  payment_type: "unidad" | "docena" | string;
  order_pricing_type?: "unidad" | "docena" | string;
  payment_method: string;
  items: OrderItem[];
  status: OrderStatus | string;
  ai_attempts_used?: number;
  inventory_reserved?: boolean;
  inventory_reserved_at?: string | null;
  inventory_reservations?: OrderInventoryReservationRecord[];
  created_at: string;
}

export type AdminOrderDetail = AdminOrder;

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface GetOrdersResult {
  orders: AdminOrder[];
  totalCount: number;
  page: number;
  totalPages: number;
}

/**
 * Sub-módulo 2B: Inventario del Taller
 */
export type InventoryCategory = "material" | "tela" | "prenda" | "otro";

export type InventoryUnit =
  | "unidad"
  | "metro"
  | "hoja"
  | "resma"
  | "ml"
  | "rollo"
  | "paquete"
  | "set"
  | string;

export interface InventoryItem {
  id: string;
  category: InventoryCategory;
  name: string;
  variant: string | null;
  quantity: number;
  unit: string;
  min_stock_alert: number;
  cost_per_unit: number;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryFormData {
  category: InventoryCategory;
  name: string;
  variant?: string | null;
  quantity: number;
  unit: string;
  min_stock_alert?: number;
  cost_per_unit?: number;
  notes?: string | null;
}

export interface GetInventoryParams {
  category?: string;
  search?: string;
  onlyAlerts?: boolean;
  showArchived?: boolean;
}

export interface InventoryKpiData {
  totalItems: number;
  lowStockAlerts: number;
  totalFabricMeters: number;
  totalInventoryValue: number;
}

// ----------------------------------------------------------------------
// SUB-MÓDULO 3: COSTOS Y PRECIOS
// ----------------------------------------------------------------------

export type CostComponentCategory =
  | "prenda_base"
  | "prenda_dtf"
  | "tinta"
  | "papel"
  | "empaque"
  | "mano_obra"
  | "otro";

export type CostMarginType = "fixed" | "percentage" | "target_price";

export type CostTemplateCategory = "camisa" | "taza" | "mousepad" | "otro";

export type ProfitabilityLevel = "high" | "medium" | "low" | "loss";

export interface CostComponent {
  id: string;
  name: string;
  category: CostComponentCategory;
  unit: string;
  cost_per_unit: number;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CostComponentFormData {
  name: string;
  category: CostComponentCategory;
  unit: string;
  cost_per_unit: number;
  notes?: string | null;
}

export interface CostTemplateItem {
  component_id: string;
  quantity: number;
  unit?: string;
}

export interface HydratedCostTemplateItem {
  component_id: string;
  quantity: number;
  unit: string;
  component_name: string;
  component_category: CostComponentCategory;
  cost_per_unit: number;
  subtotal: number;
}

export interface ProductCostTemplate {
  id: string;
  product_name: string;
  category: CostTemplateCategory;
  description: string | null;
  margin_type: CostMarginType;
  margin_value: number;
  target_price?: number | null;
  components: CostTemplateItem[];
  is_active: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductCostTemplateFormData {
  product_name: string;
  category: CostTemplateCategory;
  description?: string | null;
  margin_type: CostMarginType;
  margin_value: number;
  target_price?: number | null;
  components: CostTemplateItem[];
  is_active?: boolean;
}

export interface CalculatedTemplatePricing {
  template: ProductCostTemplate;
  hydratedComponents: HydratedCostTemplateItem[];
  unitCost: number;
  salePrice: number;
  profit: number;
  marginPercentage: number;
  profitabilityLevel: ProfitabilityLevel;
}

export interface CostSimulationRequiredItem {
  component_id: string;
  name: string;
  category: CostComponentCategory;
  totalQuantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface CostSimulationResult {
  templateId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  unitSalePrice: number;
  unitProfit: number;
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  marginPercentage: number;
  requiredComponents: CostSimulationRequiredItem[];
}

export interface CostsKpiData {
  totalActiveTemplates: number;
  totalComponents: number;
  averageMarginPercentage: number;
  mostProfitableTemplate?: { name: string; margin: number } | null;
  lowMarginAlertsCount: number;
}
