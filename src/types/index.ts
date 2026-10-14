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
