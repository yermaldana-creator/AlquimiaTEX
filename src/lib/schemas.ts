import { z } from "zod";

export const step1ProductSchema = z
  .object({
    product: z.enum(["camisa", "mousepad", "rompecabezas", "otro"]),
    quantity: z
      .number()
      .int("La cantidad debe ser un número entero")
      .min(1, "La cantidad mínima es 1 unidad")
      .max(500, "Para pedidos de más de 500 unidades, contáctanos directamente"),
    shirtSize: z.string().optional(),
    shirtCut: z.string().optional(),
    shirtColor: z.string().optional(),
    mousepadSize: z.string().optional(),
    puzzlePieces: z.string().optional(),
    customProductDetails: z.string().optional(),
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

export type Step1ProductFormData = z.infer<typeof step1ProductSchema>;
