import type { Step1ProductFormData, Step2CustomizationFormData } from "@/lib/schemas";
import type { PRODUCT_TYPES } from "@/lib/constants";

export type ProductTypeId = (typeof PRODUCT_TYPES)[number]["id"];

export type { Step1ProductFormData, Step2CustomizationFormData };

export interface OrderDraftState {
  step1?: Step1ProductFormData;
  step2?: Step2CustomizationFormData;
  currentStep: number;
}
