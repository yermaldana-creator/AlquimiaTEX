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

export type OrderStatus =
  | "pendiente_contacto"
  | "abonado"
  | "en_confeccion"
  | "listo"
  | "entregado";

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
  status: OrderStatus;
  ai_attempts_used: number;
  created_at: string;
}
