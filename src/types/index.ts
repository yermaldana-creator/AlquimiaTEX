import type { Step1ProductFormData } from "@/lib/schemas";
import type { PRODUCT_TYPES } from "@/lib/constants";

export type ProductTypeId = (typeof PRODUCT_TYPES)[number]["id"];

export type { Step1ProductFormData };

export interface OrderDraftState {
  step1?: Step1ProductFormData;
  currentStep: number;
}
