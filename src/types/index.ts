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
