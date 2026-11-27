import { z } from "zod";
import { SHIRT_FABRICS } from "./constants";

const ALLOWED_SHIRT_FABRIC_VALUES = SHIRT_FABRICS.map((f) => f.value) as string[];

export const orderItemSchema = z
  .object({
    id: z.string(),
    product: z.enum(["camisa", "mousepad", "rompecabezas", "taza", "otro"]),
    quantity: z
      .number()
      .int("La cantidad debe ser un número entero")
      .min(1, "La cantidad mínima es 1 unidad")
      .max(500, "Para pedidos mayores a 500 unidades, contáctanos directamente"),
    shirtSize: z.string().optional(),
    shirtCut: z.string().optional(),
    shirtColor: z.string().optional(),
    backupColors: z
      .array(z.string())
      .max(2, "Puedes seleccionar máximo 2 colores de respaldo")
      .optional(),
    shirtFabric: z.string().optional(),
    printPlacement: z.string().optional(),
    frontPlacement: z.string().optional(),
    backPlacement: z.string().optional(),
    mousepadSize: z.string().optional(),
    puzzlePieces: z.string().optional(),
    mugType: z.string().optional(),
    customProductDetails: z.string().optional(),
    description: z
      .string()
      .max(500, "La descripción no puede superar los 500 caracteres")
      .optional(),
    notes: z.string().optional(),
    referenceImage: z.string().optional(),
    referenceImageName: z.string().optional(),
    referenceImageUrl: z.string().optional(),
    backReferenceImage: z.string().optional(),
    backReferenceImageName: z.string().optional(),
    backReferenceImageUrl: z.string().optional(),
    backDescription: z
      .string()
      .max(500, "La descripción de espalda no puede superar los 500 caracteres")
      .optional(),
    backAiPrompt: z.string().optional(),
    aiGeneratedImage: z.string().optional(),
    aiMockupImage: z.string().optional(),
    aiPrompt: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.product === "camisa") {
      if (!data.shirtSize || data.shirtSize.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["shirtSize"],
          message: "Selecciona una talla para la franela",
        });
      }
      if (!data.shirtCut || data.shirtCut.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["shirtCut"],
          message: "Selecciona el corte (Caballero o Dama)",
        });
      }
      if (!data.shirtColor || data.shirtColor.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["shirtColor"],
          message: "Selecciona el color de la franela",
        });
      }
      if (data.shirtFabric && !ALLOWED_SHIRT_FABRIC_VALUES.includes(data.shirtFabric)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["shirtFabric"],
          message: "Selecciona un tipo de tela válido",
        });
      }
    } else if (data.product === "mousepad") {
      if (!data.mousepadSize || data.mousepadSize.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["mousepadSize"],
          message: "Selecciona las dimensiones del mousepad",
        });
      }
    } else if (data.product === "rompecabezas") {
      if (!data.puzzlePieces || data.puzzlePieces.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["puzzlePieces"],
          message: "Selecciona el formato del rompecabezas",
        });
      }
    } else if (data.product === "taza") {
      if (!data.mugType || data.mugType.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["mugType"],
          message: "Selecciona el modelo de taza",
        });
      }
    } else if (data.product === "otro") {
      if (!data.customProductDetails || data.customProductDetails.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customProductDetails"],
          message: "Indica qué artículo deseas personalizar (mínimo 3 caracteres)",
        });
      }
    }
  });

export type OrderItem = z.infer<typeof orderItemSchema>;

export const step3ContactSchema = z.object({
  customerName: z
    .string()
    .min(3, "Ingresa tu nombre y apellido (mínimo 3 caracteres)")
    .max(80, "Nombre demasiado largo"),
  customerPhone: z
    .string()
    .min(10, "Ingresa un número telefónico válido (mínimo 10 dígitos)"),
  deliveryDate: z.string().min(1, "Selecciona una fecha de entrega"),
  orderPricingType: z.enum(["unidad", "docena"]),
  paymentMethod: z.enum(["pago_movil", "binance", "efectivo", "acordar"]),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones para continuar",
  }),
});

export type Step3ContactFormData = z.infer<typeof step3ContactSchema>;

/**
 * Sub-módulo 5: Gestión de Deudas y Cuentas
 */
export const debtFormSchema = z.object({
  type: z.enum(["por_cobrar", "por_pagar"]),
  entity_name: z
    .string()
    .min(2, "El nombre de la persona o negocio debe tener al menos 2 caracteres")
    .max(150, "Nombre demasiado largo"),
  description: z.string().max(500, "Descripción demasiado larga").optional().nullable(),
  currency: z.enum(["USD", "BS"]),
  amount_original: z
    .number()
    .min(0, "El monto no puede ser negativo"),
  due_date: z.string().optional().nullable(),
  notes: z.string().max(500, "Notas demasiado largas").optional().nullable(),
});

export type DebtFormSchema = z.infer<typeof debtFormSchema>;

export const debtPaymentFormSchema = z.object({
  amount: z
    .number()
    .positive("El abono debe ser mayor a 0"),
  payment_method: z.string().min(2, "Indica el método de pago"),
  date: z.string().min(1, "Selecciona la fecha del pago"),
  notes: z.string().max(500, "Notas demasiado largas").optional().nullable(),
});

export type DebtPaymentFormSchema = z.infer<typeof debtPaymentFormSchema>;

/**
 * Sub-módulo 6: Finanzas / Caja Diaria y Compras de Insumos
 */
export const cashMovementSchema = z.object({
  account_id: z.string().uuid("Selecciona una cuenta válida"),
  type: z.enum(["ingreso", "egreso"]),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  concept: z
    .string()
    .trim()
    .min(3, "Describe el concepto (mínimo 3 caracteres)")
    .max(250, "Concepto demasiado largo"),
  category: z.string().trim().min(2).max(60).default("general"),
  related_order_id: z.string().uuid().optional().nullable(),
});

export type CashMovementFormData = z.infer<typeof cashMovementSchema>;

export const inventoryPurchaseSchema = z.object({
  inventory_item_id: z.string().uuid("Selecciona un ítem del inventario"),
  quantity: z.number().positive("La cantidad comprada debe ser mayor a 0"),
  total_cost: z.number().positive("El costo total debe ser mayor a 0"),
  account_id: z.string().uuid("Selecciona la cuenta con la que se pagó"),
  notes: z.string().max(400, "Notas demasiado largas").optional().nullable(),
});

export type InventoryPurchaseFormData = z.infer<typeof inventoryPurchaseSchema>;
