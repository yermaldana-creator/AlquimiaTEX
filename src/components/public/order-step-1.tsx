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
  Pencil,
  Trash2,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PRODUCT_TYPES,
  SHIRT_SIZES,
  SHIRT_CUTS,
  SHIRT_COLORS,
  SHIRT_FABRICS,
  MOUSEPAD_SIZES,
  PUZZLE_FORMATS,
  MAX_ORDER_ITEMS,
} from "@/lib/constants";
import { orderItemSchema, type OrderItem } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const STORAGE_CART_KEY = "alquimiatex_cart_items";

const PRODUCT_ICONS = {
  camisa: Shirt,
  mousepad: Square,
  rompecabezas: Puzzle,
  otro: Sparkles,
};

interface OrderStep1Props {
  items: OrderItem[];
  onItemsChange: (items: OrderItem[]) => void;
  onNext: () => void;
}

export function OrderStep1({ items, onItemsChange, onNext }: OrderStep1Props) {
  const [editingItemId, setEditingItemId] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const formRef = React.useRef<HTMLDivElement>(null);

  const form = useForm<OrderItem>({
    resolver: zodResolver(orderItemSchema),
    defaultValues: {
      id: "temp",
      product: "camisa",
      quantity: 1,
      shirtSize: "",
      shirtCut: "unisex",
      shirtColor: "blanco",
      shirtFabric: "microdurazno",
      mousepadSize: "",
      puzzlePieces: "",
      customProductDetails: "",
    },
    mode: "onChange",
  });

  const {
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = form;

  const selectedProduct = watch("product");
  const quantity = watch("quantity");
  const selectedShirtSize = watch("shirtSize");
  const selectedShirtCut = watch("shirtCut");
  const selectedShirtColor = watch("shirtColor");
  const selectedShirtFabric = watch("shirtFabric");
  const selectedMousepadSize = watch("mousepadSize");
  const selectedPuzzlePieces = watch("puzzlePieces");
  const customDetails = watch("customProductDetails");

  // Restaurar items de localStorage al montar
  React.useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_CART_KEY);
      if (saved) {
        const parsed: OrderItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && items.length === 0) {
          onItemsChange(parsed);
        }
      }
    } catch {}
  }, [items.length, onItemsChange]);

  // Guardar en localStorage cuando cambie el carrito
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(items));
    } catch {}
  }, [items, mounted]);

  const handleProductChange = (prodId: OrderItem["product"]) => {
    setValue("product", prodId, { shouldValidate: true });
    if (prodId === "camisa" && !selectedShirtCut) {
      setValue("shirtCut", "unisex");
      setValue("shirtColor", "blanco");
      setValue("shirtFabric", "microdurazno");
    }
  };

  const handleQuantityDelta = (delta: number) => {
    const next = Math.max(1, Math.min(500, (Number(quantity) || 1) + delta));
    setValue("quantity", next, { shouldValidate: true });
  };

  // Agregar o actualizar un producto en el carrito
  const onAddOrUpdateProduct = (data: OrderItem) => {
    if (editingItemId) {
      // Actualizar artículo existente
      const updated = items.map((it) => (it.id === editingItemId ? { ...it, ...data, id: editingItemId } : it));
      onItemsChange(updated);
      setEditingItemId(null);
    } else {
      // Agregar nuevo artículo
      if (items.length >= MAX_ORDER_ITEMS) {
        alert(`Máximo ${MAX_ORDER_ITEMS} productos por pedido. Para pedidos al mayor, contáctanos directamente.`);
        return;
      }
      const newItem: OrderItem = {
        ...data,
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      onItemsChange([...items, newItem]);
    }

    // Resetear formulario a valores base
    reset({
      id: "temp",
      product: "camisa",
      quantity: 1,
      shirtSize: "",
      shirtCut: "unisex",
      shirtColor: "blanco",
      shirtFabric: "microdurazno",
      mousepadSize: "",
      puzzlePieces: "",
      customProductDetails: "",
    });
  };

  // Iniciar edición de un producto
  const handleEditItem = (item: OrderItem) => {
    setEditingItemId(item.id);
    reset({
      id: item.id,
      product: item.product,
      quantity: item.quantity,
      shirtSize: item.shirtSize || "",
      shirtCut: item.shirtCut || "unisex",
      shirtColor: item.shirtColor || "blanco",
      shirtFabric: item.shirtFabric || "microdurazno",
      mousepadSize: item.mousepadSize || "",
      puzzlePieces: item.puzzlePieces || "",
      customProductDetails: item.customProductDetails || "",
      description: item.description || "",
      referenceImage: item.referenceImage || "",
      referenceImageName: item.referenceImageName || "",
      aiGeneratedImage: item.aiGeneratedImage || "",
    });

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingItemId(null);
    reset({
      id: "temp",
      product: "camisa",
      quantity: 1,
      shirtSize: "",
      shirtCut: "unisex",
      shirtColor: "blanco",
      shirtFabric: "microdurazno",
      mousepadSize: "",
      puzzlePieces: "",
      customProductDetails: "",
    });
  };

  // Eliminar un producto
  const handleRemoveItem = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    onItemsChange(updated);
    if (editingItemId === id) {
      handleCancelEdit();
    }
  };

  const totalQuantity = items.reduce((acc, it) => acc + (it.quantity || 1), 0);

  return (
    <div className="space-y-8" ref={formRef}>
      {/* 1. FORMULARIO CONFIGURADOR DEL PRODUCTO */}
      <form onSubmit={handleSubmit(onAddOrUpdateProduct)} className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground text-sm sm:text-base">
              {editingItemId ? "✏️ Editando producto seleccionado" : "Configura un producto para tu pedido"}
            </h3>
          </div>
          {editingItemId && (
            <Button type="button" variant="ghost" size="sm" onClick={handleCancelEdit} className="text-xs">
              Cancelar edición
            </Button>
          )}
        </div>

        {/* SELECTOR DE TIPO DE PRODUCTO */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tipo de producto <span className="text-destructive">*</span>
          </Label>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {PRODUCT_TYPES.map((prod) => {
              const Icon = PRODUCT_ICONS[prod.id as keyof typeof PRODUCT_ICONS];
              const isSelected = selectedProduct === prod.id;

              return (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleProductChange(prod.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all",
                    isSelected
                      ? "border-2 border-primary bg-primary/10 text-foreground ring-2 ring-primary/20 shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className={cn("h-6 w-6 mb-1.5", isSelected ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-xs font-bold leading-tight">{prod.name.split("/")[0]}</span>
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* VARIANTES DEL PRODUCTO */}
        <div className="rounded-xl border border-border/80 bg-muted/20 p-4 sm:p-5 space-y-5">
          {/* CAMISA */}
          {selectedProduct === "camisa" && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              {/* Talla */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Talla <span className="text-destructive">*</span>
                </Label>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Adultos:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SHIRT_SIZES.filter((s) => !s.label.includes("Niño")).map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => setValue("shirtSize", size.value, { shouldValidate: true })}
                        className={cn(
                          "h-8 min-w-9 px-2.5 rounded-lg border text-xs font-bold transition-all",
                          selectedShirtSize === size.value
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        )}
                      >
                        {size.value}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1">
                  <p className="text-[11px] text-muted-foreground mb-1">Niños (4 al 16):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SHIRT_SIZES.filter((s) => s.label.includes("Niño")).map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => setValue("shirtSize", size.value, { shouldValidate: true })}
                        className={cn(
                          "h-7 px-2.5 rounded-lg border text-[11px] font-semibold transition-all",
                          selectedShirtSize === size.value
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        )}
                      >
                        {size.label.replace(" (Niño)", "")}
                      </button>
                    ))}
                  </div>
                </div>
                {errors.shirtSize && (
                  <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.shirtSize.message}
                  </p>
                )}
              </div>

              {/* Corte */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Corte <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SHIRT_CUTS.map((cut) => (
                    <button
                      key={cut.value}
                      type="button"
                      onClick={() => setValue("shirtCut", cut.value, { shouldValidate: true })}
                      className={cn(
                        "p-2.5 rounded-lg border text-left transition-all",
                        selectedShirtCut === cut.value
                          ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <p className="text-xs font-bold text-foreground">{cut.label.split(" ")[0]}</p>
                      <p className="text-[10px] text-muted-foreground">{cut.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Color Base <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {SHIRT_COLORS.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setValue("shirtColor", col.value, { shouldValidate: true })}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all",
                        selectedShirtColor === col.value
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "border-border bg-background hover:bg-muted"
                      )}
                    >
                      <span
                        className="h-5 w-5 rounded-full border border-gray-400 shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="text-xs font-medium text-foreground">{col.label.split("(")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de Tela */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground">
                    Tipo de Tela
                  </Label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    (Recomendado: Microdurazno)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SHIRT_FABRICS.map((fab) => (
                    <button
                      key={fab.value}
                      type="button"
                      onClick={() => setValue("shirtFabric", fab.value, { shouldValidate: true })}
                      className={cn(
                        "p-2.5 rounded-lg border text-left transition-all",
                        selectedShirtFabric === fab.value
                          ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-foreground">{fab.label}</p>
                        {selectedShirtFabric === fab.value && (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                        {fab.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MOUSEPAD */}
          {selectedProduct === "mousepad" && (
            <div className="space-y-2 animate-in fade-in-50 duration-200">
              <Label className="text-xs font-semibold text-foreground">
                Dimensiones <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-1.5">
                {MOUSEPAD_SIZES.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => setValue("mousepadSize", size.value, { shouldValidate: true })}
                    className={cn(
                      "w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between text-xs",
                      selectedMousepadSize === size.value
                        ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <span className="font-semibold text-foreground">{size.label}</span>
                    {selectedMousepadSize === size.value && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
              {errors.mousepadSize && (
                <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.mousepadSize.message}
                </p>
              )}
            </div>
          )}

          {/* ROMPECABEZAS */}
          {selectedProduct === "rompecabezas" && (
            <div className="space-y-2 animate-in fade-in-50 duration-200">
              <Label className="text-xs font-semibold text-foreground">
                Formato <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-1.5">
                {PUZZLE_FORMATS.map((puz) => (
                  <button
                    key={puz.value}
                    type="button"
                    onClick={() => setValue("puzzlePieces", puz.value, { shouldValidate: true })}
                    className={cn(
                      "w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between text-xs",
                      selectedPuzzlePieces === puz.value
                        ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <span className="font-semibold text-foreground">{puz.label}</span>
                    {selectedPuzzlePieces === puz.value && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
              {errors.puzzlePieces && (
                <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.puzzlePieces.message}
                </p>
              )}
            </div>
          )}

          {/* OTRO */}
          {selectedProduct === "otro" && (
            <div className="space-y-2 animate-in fade-in-50 duration-200">
              <Label htmlFor="customDetails" className="text-xs font-semibold text-foreground">
                ¿Qué artículo personalizado necesitas? <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customDetails"
                placeholder="Ej: Taza blanca 11oz, gorra trucker, llavero acrílico..."
                value={customDetails || ""}
                onChange={(e) => setValue("customProductDetails", e.target.value, { shouldValidate: true })}
                className="bg-background text-xs"
              />
              {errors.customProductDetails && (
                <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.customProductDetails.message}
                </p>
              )}
            </div>
          )}

          {/* CANTIDAD */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <Label className="text-xs font-semibold text-foreground">Cantidad de unidades:</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityDelta(-1)}
                disabled={quantity <= 1}
                className="h-8 w-8 rounded-lg"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="font-bold text-sm w-8 text-center">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityDelta(1)}
                disabled={quantity >= 500}
                className="h-8 w-8 rounded-lg"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* BOTÓN AGREGAR O ACTUALIZAR */}
        <Button
          type="submit"
          variant={editingItemId ? "default" : "outline"}
          disabled={items.length >= MAX_ORDER_ITEMS && !editingItemId}
          className="w-full h-11 text-sm font-semibold gap-2 border-primary/50 text-foreground hover:bg-primary/10 shadow-sm"
        >
          {editingItemId ? (
            <>
              <Check className="h-4 w-4 text-emerald-500" />
              <span>Guardar cambios en este producto</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 text-primary" />
              <span>+ Agregar este producto al pedido</span>
            </>
          )}
        </Button>
      </form>

      {/* 2. LISTA TIPO CARRITO DE PRODUCTOS AGREGADOS */}
      <div className="space-y-4 pt-4 border-t border-border/80">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <span>🛒 Productos en tu pedido</span>
            <Badge variant="secondary" className="text-xs">
              {items.length} de {MAX_ORDER_ITEMS}
            </Badge>
          </h4>
          {items.length > 0 && (
            <span className="text-xs text-muted-foreground">{totalQuantity} unidad(es) en total</span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-muted-foreground text-xs bg-muted/10">
            <p>Aún no has agregado ningún producto a tu pedido.</p>
            <p className="mt-1 font-medium text-foreground">
              Configura arriba tu primer producto y presiona <strong>&quot;+ Agregar este producto al pedido&quot;</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item, index) => {
              const Icon = PRODUCT_ICONS[item.product as keyof typeof PRODUCT_ICONS] || Sparkles;
              const isBeingEdited = editingItemId === item.id;

              let variantSummary = "";
              if (item.product === "camisa") {
                const fabricObj = SHIRT_FABRICS.find((f) => f.value === item.shirtFabric);
                const fabricText = fabricObj ? ` • Tela ${fabricObj.label}` : item.shirtFabric ? ` • Tela ${item.shirtFabric}` : "";
                variantSummary = `Talla ${item.shirtSize || "?"} • ${item.shirtCut || "Unisex"} • ${item.shirtColor || "Blanco"}${fabricText}`;
              } else if (item.product === "mousepad") {
                variantSummary = item.mousepadSize || "Estándar";
              } else if (item.product === "rompecabezas") {
                variantSummary = item.puzzlePieces || "A4";
              } else {
                variantSummary = item.customProductDetails || "Personalizado";
              }

              return (
                <Card
                  key={item.id}
                  className={cn(
                    "p-3.5 flex items-center justify-between gap-3 transition-all",
                    isBeingEdited ? "border-2 border-primary bg-primary/5" : "border-border bg-card"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {index + 1}. {item.product.toUpperCase()} (x{item.quantity})
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{variantSummary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditItem(item)}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      title="Editar este producto"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      title="Quitar del pedido"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {items.length >= MAX_ORDER_ITEMS && (
          <div className="rounded-lg bg-amber-500/10 p-3 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            <span>
              Has alcanzado el límite de {MAX_ORDER_ITEMS} productos por pedido. Para pedidos mayoristas contáctanos al WhatsApp.
            </span>
          </div>
        )}
      </div>

      {/* 3. BOTÓN CONTINUAR AL PASO 2 */}
      <div className="pt-2 border-t border-border/80">
        <Button
          type="button"
          onClick={onNext}
          disabled={items.length === 0}
          className="w-full h-12 text-sm sm:text-base font-semibold gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <span>
            {items.length === 0
              ? "Agrega al menos un producto para continuar"
              : `Continuar al Paso 2: Personalizar Diseños (${items.length} producto${items.length > 1 ? "s" : ""})`}
          </span>
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
