"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Shirt,
  Square,
  Puzzle,
  Sparkles,
  Plus,
  Minus,
  Check,
  AlertCircle,
  ArrowRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PRODUCT_TYPES,
  SHIRT_SIZES,
  SHIRT_CUTS,
  SHIRT_COLORS,
  MOUSEPAD_SIZES,
  PUZZLE_FORMATS,
} from "@/lib/constants";
import { step1ProductSchema, type Step1ProductFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "alquimiatex_order_step1";

const PRODUCT_ICONS = {
  camisa: Shirt,
  mousepad: Square,
  rompecabezas: Puzzle,
  otro: Sparkles,
};

interface OrderStep1Props {
  onNext?: (data: Step1ProductFormData) => void;
  initialData?: Partial<Step1ProductFormData>;
}

export function OrderStep1({ onNext, initialData }: OrderStep1Props) {
  const [mounted, setMounted] = React.useState(false);

  const form = useForm<Step1ProductFormData>({
    resolver: zodResolver(step1ProductSchema),
    defaultValues: {
      product: "camisa",
      quantity: 1,
      shirtSize: "",
      shirtCut: "unisex",
      shirtColor: "blanco",
      mousepadSize: "",
      puzzlePieces: "",
      customProductDetails: "",
      ...initialData,
    },
    mode: "onChange",
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = form;

  const selectedProduct = watch("product");
  const quantity = watch("quantity");
  const selectedShirtSize = watch("shirtSize");
  const selectedShirtCut = watch("shirtCut");
  const selectedShirtColor = watch("shirtColor");
  const selectedMousepadSize = watch("mousepadSize");
  const selectedPuzzlePieces = watch("puzzlePieces");
  const customDetails = watch("customProductDetails");

  // Restaurar desde localStorage al montar
  React.useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.product) setValue("product", parsed.product);
        if (parsed.quantity) setValue("quantity", Number(parsed.quantity));
        if (parsed.shirtSize) setValue("shirtSize", parsed.shirtSize);
        if (parsed.shirtCut) setValue("shirtCut", parsed.shirtCut);
        if (parsed.shirtColor) setValue("shirtColor", parsed.shirtColor);
        if (parsed.mousepadSize) setValue("mousepadSize", parsed.mousepadSize);
        if (parsed.puzzlePieces) setValue("puzzlePieces", parsed.puzzlePieces);
        if (parsed.customProductDetails)
          setValue("customProductDetails", parsed.customProductDetails);
      }
    } catch {
      // Ignorar error de parsing en localStorage
    }
  }, [setValue]);

  // Guardar en localStorage ante cualquier cambio
  React.useEffect(() => {
    if (!mounted) return;
    const subscription = watch((values) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
      } catch {
        // Ignorar si localStorage está deshabilitado
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, mounted]);

  const handleProductChange = (prodId: Step1ProductFormData["product"]) => {
    setValue("product", prodId, { shouldValidate: true });
    // Limpiar errores cruzados de variantes
    if (prodId === "camisa" && !selectedShirtCut) {
      setValue("shirtCut", "unisex");
      setValue("shirtColor", "blanco");
    }
  };

  const handleQuantityDelta = (delta: number) => {
    const next = Math.max(1, Math.min(500, (Number(quantity) || 1) + delta));
    setValue("quantity", next, { shouldValidate: true });
  };

  const onSubmit = (data: Step1ProductFormData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
    if (onNext) {
      onNext(data);
    } else {
      alert("¡Paso 1 completado con éxito! Datos validados correctamente.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* 1. SELECCIÓN DE PRODUCTO */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-bold text-foreground">
            1. Elige el producto a sublimar <span className="text-destructive">*</span>
          </Label>
          <span className="text-xs text-muted-foreground">Toca para seleccionar</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PRODUCT_TYPES.map((prod) => {
            const Icon = PRODUCT_ICONS[prod.id as keyof typeof PRODUCT_ICONS];
            const isSelected = selectedProduct === prod.id;

            return (
              <Card
                key={prod.id}
                role="button"
                tabIndex={0}
                onClick={() => handleProductChange(prod.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleProductChange(prod.id);
                  }
                }}
                className={cn(
                  "relative cursor-pointer select-none p-4 outline-none transition-all duration-200",
                  "hover:border-primary/50 hover:shadow-sm",
                  isSelected
                    ? "border-2 border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                    : "border-border bg-card opacity-90 hover:opacity-100"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground sm:text-base">
                        {prod.name}
                      </h4>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {prod.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <Badge
                    variant={isSelected ? "default" : "secondary"}
                    className="text-[10px] font-normal"
                  >
                    {prod.badge}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>

        {errors.product && (
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errors.product.message}
          </p>
        )}
      </div>

      {/* 2. VARIANTES DINÁMICAS SEGÚN EL PRODUCTO */}
      <div className="space-y-6 rounded-xl border border-border/80 bg-muted/30 p-4 sm:p-5">
        {/* CASO: CAMISA */}
        {selectedProduct === "camisa" && (
          <div className="space-y-6 duration-300 animate-in fade-in-50">
            {/* Talla */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Talla de la camisa <span className="text-destructive">*</span>
                </Label>
                <span className="text-xs text-muted-foreground">Adultos y Niños</span>
              </div>

              {/* Tallas Adulto */}
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Adultos:</p>
                <div className="flex flex-wrap gap-2">
                  {SHIRT_SIZES.filter((s) => !s.label.includes("Niño")).map((size) => {
                    const isSelected = selectedShirtSize === size.value;
                    return (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => setValue("shirtSize", size.value, { shouldValidate: true })}
                        className={cn(
                          "h-10 min-w-11 rounded-lg border px-3.5 text-sm font-semibold transition-all",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        )}
                      >
                        {size.value}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tallas Niños */}
              <div className="pt-2">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Niños (Tallas 4 al 16):
                </p>
                <div className="flex flex-wrap gap-2">
                  {SHIRT_SIZES.filter((s) => s.label.includes("Niño")).map((size) => {
                    const isSelected = selectedShirtSize === size.value;
                    return (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => setValue("shirtSize", size.value, { shouldValidate: true })}
                        className={cn(
                          "h-9 rounded-lg border px-3 text-xs font-semibold transition-all",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        )}
                      >
                        {size.label.replace(" (Niño)", "")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {errors.shirtSize && (
                <p className="flex items-center gap-1.5 pt-1 text-xs font-medium text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {errors.shirtSize.message}
                </p>
              )}
            </div>

            {/* Corte */}
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold">
                Corte y silueta <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {SHIRT_CUTS.map((cut) => {
                  const isSelected = selectedShirtCut === cut.value;
                  return (
                    <button
                      key={cut.value}
                      type="button"
                      onClick={() => setValue("shirtCut", cut.value, { shouldValidate: true })}
                      className={cn(
                        "rounded-lg border p-3 text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground sm:text-sm">
                          {cut.label.split(" ")[0]}
                        </span>
                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{cut.label}</p>
                    </button>
                  );
                })}
              </div>
              {errors.shirtCut && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {errors.shirtCut.message}
                </p>
              )}
            </div>

            {/* Color */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Color base <span className="text-destructive">*</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Aptos para sublimación textil
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {SHIRT_COLORS.map((col) => {
                  const isSelected = selectedShirtColor === col.value;
                  return (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setValue("shirtColor", col.value, { shouldValidate: true })}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "border-border bg-background hover:bg-muted"
                      )}
                    >
                      <span
                        className="h-6 w-6 shrink-0 rounded-full border border-gray-400 shadow-inner"
                        style={{ backgroundColor: col.hex }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground sm:text-sm">
                          {col.label}
                        </p>
                      </div>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                    </button>
                  );
                })}
              </div>
              {errors.shirtColor && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {errors.shirtColor.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* CASO: MOUSEPAD */}
        {selectedProduct === "mousepad" && (
          <div className="space-y-3 duration-300 animate-in fade-in-50">
            <Label className="text-sm font-semibold">
              Dimensiones del mousepad <span className="text-destructive">*</span>
            </Label>
            <div className="space-y-2">
              {MOUSEPAD_SIZES.map((size) => {
                const isSelected = selectedMousepadSize === size.value;
                return (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => setValue("mousepadSize", size.value, { shouldValidate: true })}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <div>
                      <p className="text-xs font-semibold text-foreground sm:text-sm">
                        {size.label.split("—")[0]}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {size.label.split("—")[1] || size.label}
                      </p>
                    </div>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </button>
                );
              })}
            </div>
            {errors.mousepadSize && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors.mousepadSize.message}
              </p>
            )}
          </div>
        )}

        {/* CASO: ROMPECABEZAS */}
        {selectedProduct === "rompecabezas" && (
          <div className="space-y-3 duration-300 animate-in fade-in-50">
            <Label className="text-sm font-semibold">
              Formato y número de piezas <span className="text-destructive">*</span>
            </Label>
            <div className="space-y-2">
              {PUZZLE_FORMATS.map((puz) => {
                const isSelected = selectedPuzzlePieces === puz.value;
                return (
                  <button
                    key={puz.value}
                    type="button"
                    onClick={() => setValue("puzzlePieces", puz.value, { shouldValidate: true })}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <div>
                      <p className="text-xs font-semibold text-foreground sm:text-sm">
                        {puz.label}
                      </p>
                    </div>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </button>
                );
              })}
            </div>
            {errors.puzzlePieces && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors.puzzlePieces.message}
              </p>
            )}
          </div>
        )}

        {/* CASO: OTRO PRODUCTO */}
        {selectedProduct === "otro" && (
          <div className="space-y-2 duration-300 animate-in fade-in-50">
            <Label htmlFor="customDetails" className="text-sm font-semibold">
              ¿Qué artículo personalizado necesitas? <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customDetails"
              placeholder="Ej: Taza blanca 11oz, gorra trucker, llavero acrílico..."
              value={customDetails || ""}
              onChange={(e) =>
                setValue("customProductDetails", e.target.value, { shouldValidate: true })
              }
              className="bg-background"
            />
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              Especifica el artículo para cotizar disponibilidad de insumos en el taller.
            </p>
            {errors.customProductDetails && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors.customProductDetails.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. CANTIDAD */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <Label className="text-sm font-bold text-foreground">
            Cantidad de unidades <span className="text-destructive">*</span>
          </Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            El precio por unidad se optimiza en pedidos por docena o al mayor.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleQuantityDelta(-1)}
            disabled={quantity <= 1}
            className="h-10 w-10 shrink-0 rounded-lg text-lg"
            aria-label="Restar una unidad"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Input
            type="number"
            min={1}
            max={500}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setValue("quantity", isNaN(val) ? 1 : val, { shouldValidate: true });
            }}
            className="h-10 w-20 bg-background text-center text-base font-bold"
          />

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleQuantityDelta(1)}
            disabled={quantity >= 500}
            className="h-10 w-10 shrink-0 rounded-lg text-lg"
            aria-label="Sumar una unidad"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {errors.quantity && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {errors.quantity.message}
        </p>
      )}

      {/* BOTÓN CONTINUAR */}
      <div className="pt-2">
        <Button
          type="submit"
          className="h-12 w-full gap-2 text-base font-semibold shadow-md transition-all hover:shadow-lg"
        >
          <span>Continuar al Paso 2: Tu Diseño e Idea</span>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Tus datos se guardan automáticamente en tu dispositivo para que no pierdas nada.
        </p>
      </div>
    </form>
  );
}
