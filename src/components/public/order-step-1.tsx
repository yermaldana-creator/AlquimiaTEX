"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Shirt,
  Square,
  Puzzle,
  Sparkles,
  Coffee,
  Plus,
  Minus,
  Check,
  AlertCircle,
  ArrowRight,
  Info,
  Pencil,
  Trash2,
  ShoppingBag,
  CheckCircle2,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PRODUCT_TYPES,
  SHIRT_SIZES,
  SHIRT_CUTS,
  SHIRT_CUT_LABELS,
  SHIRT_COLORS,
  POPULAR_SHIRT_COLOR_VALUES,
  SHIRT_COLOR_GROUPS,
  getShirtColorLabel,
  getShirtColorHex,
  getShirtFabricLabel,
  SHIRT_FABRICS,
  MOUSEPAD_SIZES,
  PUZZLE_FORMATS,
  MUG_TYPES,
  MAX_ORDER_ITEMS,
} from "@/lib/constants";
import { orderItemSchema, type OrderItem } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const STORAGE_CART_KEY = "alquimiatex_cart_items";

const PRODUCT_ICONS = {
  camisa: Shirt,
  mousepad: Square,
  rompecabezas: Puzzle,
  taza: Coffee,
  otro: Sparkles,
};

const PRODUCT_THEMES: Record<
  string,
  {
    selectedBg: string;
    iconBg: string;
    iconColor: string;
    badgeBg: string;
  }
> = {
  camisa: {
    selectedBg: "bg-[#CFFAFE]",
    iconBg: "bg-[#CFFAFE]",
    iconColor: "text-[#0891B2]",
    badgeBg: "bg-[#06B6D4] text-white",
  },
  mousepad: {
    selectedBg: "bg-[#FFEDD5]",
    iconBg: "bg-[#FFEDD5]",
    iconColor: "text-[#EA580C]",
    badgeBg: "bg-[#F97316] text-white",
  },
  rompecabezas: {
    selectedBg: "bg-[#F3E8FF]",
    iconBg: "bg-[#F3E8FF]",
    iconColor: "text-[#9333EA]",
    badgeBg: "bg-[#A855F7] text-white",
  },
  taza: {
    selectedBg: "bg-[#DCFCE7]",
    iconBg: "bg-[#DCFCE7]",
    iconColor: "text-[#059669]",
    badgeBg: "bg-[#10B981] text-white",
  },
  otro: {
    selectedBg: "bg-[#FFE4E6]",
    iconBg: "bg-[#FFE4E6]",
    iconColor: "text-[#E11D48]",
    badgeBg: "bg-[#F43F5E] text-white",
  },
};

interface OrderStep1Props {
  items: OrderItem[];
  onItemsChange: (items: OrderItem[]) => void;
  onNext: () => void;
}

export function OrderStep1({ items, onItemsChange, onNext }: OrderStep1Props) {
  const [editingItemId, setEditingItemId] = React.useState<string | null>(null);
  const [addedToast, setAddedToast] = React.useState<boolean>(false);
  const [mounted, setMounted] = React.useState(false);
  const [isColorPaletteOpen, setIsColorPaletteOpen] = React.useState(false);
  const [colorSearch, setColorSearch] = React.useState("");
  const formRef = React.useRef<HTMLDivElement>(null);

  const popularColors = React.useMemo(
    () =>
      POPULAR_SHIRT_COLOR_VALUES.map((val) =>
        SHIRT_COLORS.find((c) => c.value === val)
      ).filter((c): c is (typeof SHIRT_COLORS)[number] => Boolean(c)),
    []
  );

  const filteredColorGroups = React.useMemo(() => {
    const q = colorSearch
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return SHIRT_COLOR_GROUPS.map((group) => {
      const colors = SHIRT_COLORS.filter((c) => {
        if (c.group !== group) return false;
        if (!q) return true;
        const normLabel = c.label
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        const normGroup = group
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        return normLabel.includes(q) || normGroup.includes(q);
      });
      return { group, colors };
    }).filter((g) => g.colors.length > 0);
  }, [colorSearch]);

  // Auto-ocultar toast después de 8 segundos
  React.useEffect(() => {
    if (!addedToast) return;
    const timer = setTimeout(() => setAddedToast(false), 8000);
    return () => clearTimeout(timer);
  }, [addedToast]);

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
      mugType: "",
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
  const selectedMugType = watch("mugType");
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
    } else if (prodId === "mousepad") {
      setValue("mousepadSize", "estandar", { shouldValidate: true });
    } else if (prodId === "rompecabezas") {
      setValue("puzzlePieces", "a4_120", { shouldValidate: true });
    } else if (prodId === "taza") {
      if (!selectedMugType) {
        setValue("mugType", "taza_blanca", { shouldValidate: true });
      }
    }
  };

  const handleQuantityDelta = (delta: number) => {
    const next = Math.max(1, Math.min(500, (Number(quantity) || 1) + delta));
    setValue("quantity", next, { shouldValidate: true });
  };

  // Agregar o actualizar un producto en el carrito
  const onAddOrUpdateProduct = (data: OrderItem) => {
    const sanitizedData: OrderItem = {
      ...data,
      shirtSize: data.product === "camisa" ? data.shirtSize : "",
      shirtCut: data.product === "camisa" ? data.shirtCut : "",
      shirtColor: data.product === "camisa" ? data.shirtColor : "",
      shirtFabric: data.product === "camisa" ? data.shirtFabric : "",
      printPlacement: data.product === "camisa" ? data.printPlacement || "pecho_completo" : "",
      frontPlacement: data.product === "camisa" ? data.frontPlacement || "pecho_completo" : "",
      backPlacement: data.product === "camisa" ? data.backPlacement || "ninguno" : "",
      mousepadSize: data.product === "mousepad" ? data.mousepadSize : "",
      puzzlePieces: data.product === "rompecabezas" ? data.puzzlePieces : "",
      mugType: data.product === "taza" ? data.mugType : "",
      customProductDetails: data.product === "otro" ? data.customProductDetails : "",
    };

    if (editingItemId) {
      // Actualizar artículo existente
      const updated = items.map((it) => (it.id === editingItemId ? { ...it, ...sanitizedData, id: editingItemId } : it));
      onItemsChange(updated);
      setEditingItemId(null);
    } else {
      // Agregar nuevo artículo
      if (items.length >= MAX_ORDER_ITEMS) {
        alert(`Máximo ${MAX_ORDER_ITEMS} productos por pedido. Para pedidos al mayor, contáctanos directamente.`);
        return;
      }
      const newItem: OrderItem = {
        ...sanitizedData,
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      onItemsChange([...items, newItem]);
    }

    setAddedToast(true);

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
      mugType: "",
      customProductDetails: "",
    });
  };

  // Agregar producto actual y limpiar variantes para configurar otra opción
  const handleAddAnotherVariant = () => {
    handleSubmit((data) => {
      onAddOrUpdateProduct(data);
      // Mantener el mismo tipo de producto pero limpiar variantes para la siguiente pieza
      setValue("shirtSize", "", { shouldValidate: false });
      setValue("shirtCut", "unisex", { shouldValidate: false });
      setValue("shirtColor", "blanco", { shouldValidate: false });
      setValue("shirtFabric", "microdurazno", { shouldValidate: false });
      setValue("mousepadSize", "", { shouldValidate: false });
      setValue("puzzlePieces", "", { shouldValidate: false });
      setValue("mugType", "", { shouldValidate: false });
      setValue("customProductDetails", "", { shouldValidate: false });
      setValue("quantity", 1, { shouldValidate: false });
      setAddedToast(true);

      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth" });
      }
    })();
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
      mugType: item.mugType || "",
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
      mugType: "",
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
        <div className="flex items-center justify-between border-b-2 border-black/15 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-black bg-[#FACC15] text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]">
              <ShoppingBag className="h-4 w-4" />
            </span>
            <h3 className="font-oswald font-black uppercase tracking-wide text-[#0A0A0A] text-sm sm:text-base">
              {editingItemId ? "✏️ Editando producto seleccionado" : "Configura un producto para tu pedido"}
            </h3>
          </div>
          {editingItemId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              className="text-xs font-bold text-rose-700 hover:bg-rose-100 hover:text-rose-900"
            >
              Cancelar edición
            </Button>
          )}
        </div>

        {/* SELECTOR DE TIPO DE PRODUCTO CON PALETA ARTESANAL */}
        <div className="space-y-3">
          <Label className="font-mono text-xs font-black text-slate-800 uppercase tracking-wider">
            Tipo de producto <span className="text-rose-600">*</span>
          </Label>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {PRODUCT_TYPES.map((prod) => {
              const Icon = PRODUCT_ICONS[prod.id as keyof typeof PRODUCT_ICONS];
              const theme = PRODUCT_THEMES[prod.id] || PRODUCT_THEMES.otro;
              const isSelected = selectedProduct === prod.id;

              return (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleProductChange(prod.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all",
                    isSelected
                      ? cn(
                          "border-black text-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] -translate-y-0.5",
                          theme.selectedBg
                        )
                      : "border-black/25 bg-white text-slate-800 hover:border-black hover:shadow-[2px_2px_0px_#0A0A0A]"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg border border-black/20 mb-2 transition-transform",
                      isSelected ? "bg-white border-black shadow-[1px_1px_0px_#0A0A0A]" : theme.iconBg
                    )}
                  >
                    <Icon className={cn("h-5 w-5", theme.iconColor)} />
                  </div>
                  <span className="font-oswald text-xs sm:text-sm font-black uppercase tracking-wide leading-tight text-[#0A0A0A]">
                    {prod.name.split("/")[0]}
                  </span>
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[#FACC15]">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* VARIANTES DEL PRODUCTO */}
        <div className="rounded-xl border-2 border-black bg-white p-4 sm:p-5 space-y-5 shadow-[3px_3px_0px_#0A0A0A]">
          {/* CAMISA */}
          {selectedProduct === "camisa" && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              {/* Talla */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#0A0A0A]">
                  Talla <span className="text-rose-600">*</span>
                </Label>
                <div>
                  <p className="font-mono text-[11px] font-semibold text-slate-600 mb-1.5">Adultos:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SHIRT_SIZES.filter((s) => !s.label.includes("Niño")).map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => setValue("shirtSize", size.value, { shouldValidate: true })}
                        className={cn(
                          "h-8 min-w-9 px-2.5 rounded-lg border-2 text-xs font-bold transition-all",
                          selectedShirtSize === size.value
                            ? "border-black bg-black text-[#FACC15] shadow-[2px_2px_0px_#06B6D4]"
                            : "border-black/25 bg-[#FAF7F0] text-[#0A0A0A] hover:border-black hover:bg-[#FACC15]/30"
                        )}
                      >
                        {size.value}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1">
                  <p className="font-mono text-[11px] font-semibold text-slate-600 mb-1.5">Niños (4 al 16):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SHIRT_SIZES.filter((s) => s.label.includes("Niño")).map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => setValue("shirtSize", size.value, { shouldValidate: true })}
                        className={cn(
                          "h-7 px-2.5 rounded-lg border-2 text-[11px] font-bold transition-all",
                          selectedShirtSize === size.value
                            ? "border-black bg-black text-[#FACC15] shadow-[2px_2px_0px_#06B6D4]"
                            : "border-black/25 bg-[#FAF7F0] text-[#0A0A0A] hover:border-black hover:bg-[#FACC15]/30"
                        )}
                      >
                        {size.label.replace(" (Niño)", "")}
                      </button>
                    ))}
                  </div>
                </div>
                {errors.shirtSize && (
                  <p className="text-xs text-rose-600 flex items-center gap-1 font-semibold mt-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.shirtSize.message}
                  </p>
                )}
              </div>

              {/* Corte */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#0A0A0A]">
                  Corte <span className="text-rose-600">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {SHIRT_CUTS.map((cut) => (
                    <button
                      key={cut.value}
                      type="button"
                      onClick={() => setValue("shirtCut", cut.value, { shouldValidate: true })}
                      className={cn(
                        "p-2.5 rounded-lg border-2 text-left transition-all",
                        selectedShirtCut === cut.value
                          ? "border-black bg-[#CFFAFE] text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]"
                          : "border-black/20 bg-[#FAF7F0] text-slate-700 hover:border-black"
                      )}
                    >
                      <p className="text-xs font-bold text-[#0A0A0A]">{cut.label.split(" ")[0]}</p>
                      <p className="text-[10px] text-slate-600">{cut.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Base — Paleta Oficial de 39 Colores (Selector Compacto Mobile-First) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Label className="text-xs font-bold text-[#0A0A0A]">
                    Color Base <span className="text-rose-600">*</span>
                  </Label>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-black bg-[#FAF7F0] px-2 py-0.5 font-mono text-[11px] font-bold text-[#0A0A0A]">
                    <span
                      className="h-3 w-3 rounded-full border border-black/50 shrink-0"
                      style={{ backgroundColor: getShirtColorHex(selectedShirtColor) }}
                    />
                    <span>{getShirtColorLabel(selectedShirtColor)}</span>
                  </span>
                </div>

                {/* 6 Colores más pedidos como chips rápidos */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {popularColors.map((col) => {
                    const isSelected = selectedShirtColor === col.value;
                    return (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => setValue("shirtColor", col.value, { shouldValidate: true })}
                        className={cn(
                          "flex items-center gap-2 px-2.5 py-2 rounded-lg border-2 text-left transition-all",
                          isSelected
                            ? "border-black bg-[#CFFAFE] shadow-[2px_2px_0px_#0A0A0A]"
                            : "border-black/20 bg-[#FAF7F0] hover:border-black"
                        )}
                      >
                        <span
                          className="h-4 w-4 rounded-full border-2 border-black/40 shrink-0"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span className="text-xs font-bold text-[#0A0A0A] truncate">{col.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Botón desplegable para los 39 colores */}
                <button
                  type="button"
                  onClick={() => setIsColorPaletteOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border-2 border-black bg-white hover:bg-[#FACC15]/40 text-xs font-bold text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] transition-all"
                  aria-expanded={isColorPaletteOpen}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-4 w-4 rounded-full border border-black shrink-0"
                      style={{ backgroundColor: getShirtColorHex(selectedShirtColor) }}
                    />
                    <span>
                      {isColorPaletteOpen
                        ? "Ocultar paleta completa"
                        : `Ver los ${SHIRT_COLORS.length} colores oficiales`}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-150",
                      isColorPaletteOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Panel desplegable compacto con filtro y 7 familias */}
                {isColorPaletteOpen && (
                  <div className="rounded-xl border-2 border-black bg-[#FAF7F0] p-3 space-y-3 shadow-[3px_3px_0px_#0A0A0A] animate-in fade-in-50 duration-150">
                    {/* Buscador rápido */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                      <Input
                        type="text"
                        value={colorSearch}
                        onChange={(e) => setColorSearch(e.target.value)}
                        placeholder="Buscar color (ej. vinotinto, jade, azul...)"
                        className="h-8 pl-8 pr-8 text-xs bg-white text-[#0A0A0A] placeholder:text-slate-400 border-2 border-black/30 focus-visible:border-black"
                      />
                      {colorSearch && (
                        <button
                          type="button"
                          onClick={() => setColorSearch("")}
                          className="absolute right-2 top-2 text-slate-500 hover:text-black"
                          aria-label="Limpiar búsqueda de color"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Familias cromáticas con scroll interno controlado */}
                    <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                      {filteredColorGroups.length === 0 ? (
                        <p className="text-xs text-slate-600 text-center py-3">
                          No encontramos un color con &quot;{colorSearch}&quot;.
                        </p>
                      ) : (
                        filteredColorGroups.map(({ group, colors }) => (
                          <div key={group} className="space-y-1.5">
                            <p className="font-mono text-[10px] font-black uppercase tracking-wider text-slate-600">
                              {group} ({colors.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {colors.map((col) => {
                                const isSelected = selectedShirtColor === col.value;
                                return (
                                  <button
                                    key={col.value}
                                    type="button"
                                    onClick={() => {
                                      setValue("shirtColor", col.value, { shouldValidate: true });
                                      setIsColorPaletteOpen(false);
                                      setColorSearch("");
                                    }}
                                    className={cn(
                                      "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all",
                                      isSelected
                                        ? "border-2 border-black bg-[#FACC15] text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]"
                                        : "border-black/25 bg-white text-[#0A0A0A] hover:border-black"
                                    )}
                                  >
                                    <span
                                      className="h-3.5 w-3.5 rounded-full border border-black/40 shrink-0"
                                      style={{ backgroundColor: col.hex }}
                                    />
                                    <span>{col.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Tipo de Tela */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <Label className="text-xs font-bold text-[#0A0A0A]">
                    Tipo de Tela
                  </Label>
                  <span className="text-[10px] text-slate-600 font-mono font-semibold">
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
                        "p-2.5 rounded-lg border-2 text-left transition-all",
                        selectedShirtFabric === fab.value
                          ? "border-black bg-[#CFFAFE] text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]"
                          : "border-black/20 bg-[#FAF7F0] text-slate-700 hover:border-black"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-[#0A0A0A]">{fab.label}</p>
                        {selectedShirtFabric === fab.value && (
                          <Check className="h-3.5 w-3.5 text-[#0891B2] stroke-[3]" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
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
              <Label className="text-xs font-bold text-[#0A0A0A]">
                Dimensiones <span className="text-rose-600">*</span>
              </Label>
              <div className="space-y-1.5">
                {MOUSEPAD_SIZES.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => setValue("mousepadSize", size.value, { shouldValidate: true })}
                    className={cn(
                      "w-full p-2.5 rounded-lg border-2 text-left transition-all flex items-center justify-between text-xs",
                      selectedMousepadSize === size.value
                        ? "border-black bg-[#FFEDD5] text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]"
                        : "border-black/20 bg-[#FAF7F0] text-slate-700 hover:border-black"
                    )}
                  >
                    <span className="font-bold text-[#0A0A0A]">{size.label}</span>
                    {selectedMousepadSize === size.value && <Check className="h-3.5 w-3.5 text-[#EA580C] stroke-[3]" />}
                  </button>
                ))}
              </div>
              {errors.mousepadSize && (
                <p className="text-xs text-rose-600 flex items-center gap-1 font-semibold">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.mousepadSize.message}
                </p>
              )}
            </div>
          )}

          {/* ROMPECABEZAS */}
          {selectedProduct === "rompecabezas" && (
            <div className="space-y-2 animate-in fade-in-50 duration-200">
              <Label className="text-xs font-bold text-[#0A0A0A]">
                Formato <span className="text-rose-600">*</span>
              </Label>
              <div className="space-y-1.5">
                {PUZZLE_FORMATS.map((puz) => (
                  <button
                    key={puz.value}
                    type="button"
                    onClick={() => setValue("puzzlePieces", puz.value, { shouldValidate: true })}
                    className={cn(
                      "w-full p-2.5 rounded-lg border-2 text-left transition-all flex items-center justify-between text-xs",
                      selectedPuzzlePieces === puz.value
                        ? "border-black bg-[#F3E8FF] text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]"
                        : "border-black/20 bg-[#FAF7F0] text-slate-700 hover:border-black"
                    )}
                  >
                    <span className="font-bold text-[#0A0A0A]">{puz.label}</span>
                    {selectedPuzzlePieces === puz.value && <Check className="h-3.5 w-3.5 text-[#9333EA] stroke-[3]" />}
                  </button>
                ))}
              </div>
              {errors.puzzlePieces && (
                <p className="text-xs text-rose-600 flex items-center gap-1 font-semibold">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.puzzlePieces.message}
                </p>
              )}
            </div>
          )}

          {/* TAZAS */}
          {selectedProduct === "taza" && (
            <div className="space-y-2 animate-in fade-in-50 duration-200">
              <Label className="text-xs font-bold text-[#0A0A0A]">
                Modelo de Taza <span className="text-rose-600">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MUG_TYPES.map((mug) => (
                  <button
                    key={mug.value}
                    type="button"
                    onClick={() => setValue("mugType", mug.value, { shouldValidate: true })}
                    className={cn(
                      "p-3 rounded-lg border-2 text-left transition-all",
                      selectedMugType === mug.value
                        ? "border-black bg-[#DCFCE7] text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]"
                        : "border-black/20 bg-[#FAF7F0] text-slate-700 hover:border-black"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#0A0A0A]">{mug.label}</p>
                      {selectedMugType === mug.value && (
                        <Check className="h-3.5 w-3.5 text-[#059669] stroke-[3]" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                      {mug.description}
                    </p>
                  </button>
                ))}
              </div>
              {errors.mugType && (
                <p className="text-xs text-rose-600 flex items-center gap-1 font-semibold">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.mugType.message}
                </p>
              )}
            </div>
          )}

          {/* OTRO */}
          {selectedProduct === "otro" && (
            <div className="space-y-2 animate-in fade-in-50 duration-200">
              <Label htmlFor="customDetails" className="text-xs font-bold text-[#0A0A0A]">
                ¿Qué artículo personalizado necesitas? <span className="text-rose-600">*</span>
              </Label>
              <Input
                id="customDetails"
                placeholder="Ej: Gorra bordada/estampada, llavero acrílico, bolso tote..."
                value={customDetails || ""}
                onChange={(e) => setValue("customProductDetails", e.target.value, { shouldValidate: true })}
                className="bg-white text-[#0A0A0A] placeholder:text-slate-400 border-2 border-black/30 focus-visible:border-black text-xs"
              />
              {errors.customProductDetails && (
                <p className="text-xs text-rose-600 flex items-center gap-1 font-semibold">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.customProductDetails.message}
                </p>
              )}
            </div>
          )}

          {/* CANTIDAD */}
          <div className="flex items-center justify-between pt-3 border-t-2 border-black/10">
            <Label className="text-xs font-bold text-[#0A0A0A]">Cantidad de unidades:</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityDelta(-1)}
                disabled={quantity <= 1}
                className="h-8 w-8 rounded-lg border-2 border-black bg-white text-[#0A0A0A] hover:bg-[#FACC15] disabled:opacity-40"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="font-mono font-black text-sm w-8 text-center text-[#0A0A0A]">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityDelta(1)}
                disabled={quantity >= 500}
                className="h-8 w-8 rounded-lg border-2 border-black bg-white text-[#0A0A0A] hover:bg-[#FACC15] disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* MENSAJE DE ÉXITO / AYUDA MULTIVARIANTE */}
        {addedToast && (
          <div className="rounded-xl border-2 border-black bg-[#DCFCE7] p-3.5 text-xs text-emerald-950 shadow-[3px_3px_0px_#0A0A0A] flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-emerald-950">Producto agregado ✓</p>
                <p className="text-[11px] text-emerald-900 mt-0.5">
                  ¿Necesitas otra talla o color? Puedes agregarlo de nuevo con las variantes que quieras.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAddedToast(false)}
              className="text-emerald-900 hover:text-black text-[11px] font-black px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* BOTONES AGREGAR PRODUCTO O VARIANTE */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <Button
            type="submit"
            disabled={items.length >= MAX_ORDER_ITEMS && !editingItemId}
            className="flex-1 h-11 text-xs sm:text-sm font-bold gap-2 rounded-xl border-2 border-black bg-[#FACC15] text-[#0A0A0A] hover:bg-[#fde047] shadow-[3px_3px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            {editingItemId ? (
              <>
                <Check className="h-4 w-4 text-emerald-800 stroke-[3]" />
                <span>Guardar cambios en este producto</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Agregar este producto al pedido</span>
              </>
            )}
          </Button>

          {!editingItemId && (
            <Button
              type="button"
              onClick={handleAddAnotherVariant}
              disabled={items.length >= MAX_ORDER_ITEMS}
              className="flex-1 sm:flex-none h-11 text-xs sm:text-sm font-bold gap-1.5 rounded-xl border-2 border-black bg-white text-[#0A0A0A] hover:bg-[#CFFAFE] shadow-[3px_3px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 px-4 whitespace-normal text-center transition-all"
              title="Guarda este artículo y prepara el formulario para elegir otra talla o color"
            >
              <Plus className="h-3.5 w-3.5 shrink-0 stroke-[3]" />
              <span>Otra variante igual</span>
            </Button>
          )}
        </div>
      </form>

      {/* 2. LISTA TIPO CARRITO DE PRODUCTOS AGREGADOS */}
      <div className="space-y-4 pt-5 border-t-2 border-black/15">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-oswald font-black uppercase tracking-wide text-sm sm:text-base text-[#0A0A0A] flex items-center gap-2">
              <span>🛒 Productos en tu pedido</span>
            </h4>
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
              <span className="rounded-md border border-black bg-black px-2 py-0.5 font-bold text-[#FACC15] shadow-[1px_1px_0px_#0A0A0A]">
                {items.length} de {MAX_ORDER_ITEMS}
              </span>
              {items.length > 0 && (
                <span className="rounded-md border border-black bg-white px-2 py-0.5 font-bold text-[#0A0A0A] shadow-[1px_1px_0px_#0A0A0A]">
                  {totalQuantity} {totalQuantity === 1 ? "unid." : "unid."} en total
                </span>
              )}
            </div>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Cada fila es un producto independiente con su propia talla, corte o color.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-black/30 bg-white/80 p-6 text-center text-slate-600 text-xs">
            <p>Aún no has agregado ningún producto a tu pedido.</p>
            <p className="mt-1 font-semibold text-[#0A0A0A]">
              Configura arriba tu primer producto y presiona <strong>&quot;Agregar este producto al pedido&quot;</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item, index) => {
              const Icon = PRODUCT_ICONS[item.product as keyof typeof PRODUCT_ICONS] || Sparkles;
              const theme = PRODUCT_THEMES[item.product] || PRODUCT_THEMES.otro;
              const isBeingEdited = editingItemId === item.id;

              let variantSummary = "";
              if (item.product === "camisa") {
                const cutText = (item.shirtCut && SHIRT_CUT_LABELS[item.shirtCut]) || item.shirtCut || "Caballero / Unisex";
                const colorText = getShirtColorLabel(item.shirtColor);
                const fabricText = getShirtFabricLabel(item.shirtFabric);
                variantSummary = `Camisa — Talla ${item.shirtSize || "?"} — ${cutText} — ${colorText} — Tela ${fabricText} — x${item.quantity}`;
              } else if (item.product === "mousepad") {
                variantSummary = `Mousepad — Medida ${item.mousepadSize || "Estándar"} — x${item.quantity}`;
              } else if (item.product === "rompecabezas") {
                variantSummary = `Rompecabezas — Formato ${item.puzzlePieces || "A4"} — x${item.quantity}`;
              } else if (item.product === "taza") {
                const mugObj = MUG_TYPES.find((m) => m.value === item.mugType);
                const mugLabel = mugObj ? mugObj.label : (item.mugType || "Taza");
                variantSummary = `${mugLabel} — x${item.quantity}`;
              } else {
                variantSummary = `${item.customProductDetails || "Personalizado"} — x${item.quantity}`;
              }

              return (
                <Card
                  key={item.id}
                  className={cn(
                    "p-3.5 flex items-center justify-between gap-3 transition-all rounded-xl border-2",
                    isBeingEdited
                      ? "border-black bg-[#FACC15]/25 shadow-[3px_3px_0px_#0A0A0A]"
                      : "border-black bg-white shadow-[2px_2px_0px_#0A0A0A]"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-black",
                        theme.iconBg,
                        theme.iconColor
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-oswald text-xs sm:text-sm font-black uppercase text-[#0A0A0A]">
                          #{index + 1} • {item.product === "camisa" ? "Camisa" : item.product}
                        </p>
                        <span className="rounded border border-black bg-[#FAF7F0] px-1.5 py-0 font-mono text-[10px] font-bold text-[#0A0A0A]">
                          x{item.quantity} {item.quantity === 1 ? "unid." : "unids."}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium break-words">
                        {variantSummary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditItem(item)}
                      className="h-8 w-8 text-slate-700 hover:bg-[#FACC15] hover:text-black"
                      title="Editar este producto"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                      className="h-8 w-8 text-slate-700 hover:bg-rose-100 hover:text-rose-700"
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
          <div className="rounded-lg border-2 border-black bg-[#FEF3C7] p-3 text-amber-950 text-xs flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            <span>
              Has alcanzado el límite de {MAX_ORDER_ITEMS} productos por pedido. Para pedidos mayoristas contáctanos al WhatsApp.
            </span>
          </div>
        )}
      </div>

      {/* 3. BOTÓN CONTINUAR AL PASO 2 (MOBILE-SAFE, SIN DESBORDE) */}
      <div className="pt-3 border-t-2 border-black/15">
        <Button
          type="button"
          onClick={onNext}
          disabled={items.length === 0}
          className="w-full h-12 px-4 rounded-xl border-2 border-black bg-black text-white hover:bg-[#FACC15] hover:text-[#0A0A0A] disabled:bg-slate-300 disabled:text-slate-600 disabled:border-slate-400 font-oswald text-base sm:text-lg font-black uppercase tracking-wide gap-2 shadow-[4px_4px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          <span className="truncate">
            {items.length === 0
              ? "Agrega un producto para continuar"
              : "Continuar al Paso 2"}
          </span>
          <ArrowRight className="h-5 w-5 shrink-0" />
        </Button>
      </div>
    </div>
  );
}
