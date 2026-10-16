import { z } from "zod";

export const orderItemSchema = z
  .object({
    id: z.string(),
    product: z.enum(["camisa", "mousepad", "rompecabezas", "otro"]),
    quantity: z
      .number()
      .int("La cantidad debe ser un número entero")
      .min(1, "La cantidad mínima es 1 unidad")
      .max(500, "Para pedidos mayores a 500 unidades, contáctanos directamente"),
    shirtSize: z.string().optional(),
    shirtCut: z.string().optional(),
    shirtColor: z.string().optional(),
    shirtFabric: z.string().optional(),
    mousepadSize: z.string().optional(),
    puzzlePieces: z.string().optional(),
    customProductDetails: z.string().optional(),
    description: z
      .string()
      .max(500, "La descripción no puede superar los 500 caracteres")
      .optional(),
    notes: z.string().optional(),
    referenceImage: z.string().optional(),
    referenceImageName: z.string().optional(),
    referenceImageUrl: z.string().optional(),
    aiGeneratedImage: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.product === "camisa") {
      if (!data.shirtSize || data.shirtSize.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["shirtSize"],
          message: "Selecciona una talla para la camisa",
        });
      }
      if (!data.shirtCut || data.shirtCut.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["shirtCut"],
          message: "Selecciona el corte (unisex, dama u oversize)",
        });
      }
      if (!data.shirtColor || data.shirtColor.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["shirtColor"],
          message: "Selecciona el color de la camisa",
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
