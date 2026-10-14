"use client";

import * as React from "react";
import Image from "next/image";
import {
  Sparkles,
  UploadCloud,
  X,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderItem } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MAX_FILE_SIZE_MB = 5;
const MAX_GLOBAL_AI_ATTEMPTS = 3;

interface OrderStep2Props {
  items: OrderItem[];
  onItemsChange: (items: OrderItem[]) => void;
  onBack: () => void;
  onNext: () => void;
  globalAiAttempts: number;
  onUseAiAttempt: () => void;
}

export function OrderStep2({
  items,
  onItemsChange,
  onBack,
  onNext,
  globalAiAttempts,
  onUseAiAttempt,
}: OrderStep2Props) {
  const [generatingItemId, setGeneratingItemId] = React.useState<string | null>(null);
  const [aiErrors, setAiErrors] = React.useState<Record<string, string>>({});
  const [descErrors, setDescErrors] = React.useState<Record<string, string>>({});
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  const attemptsLeft = Math.max(0, MAX_GLOBAL_AI_ATTEMPTS - globalAiAttempts);

  const updateItem = (id: string, updates: Partial<OrderItem>) => {
    const updated = items.map((it) => (it.id === id ? { ...it, ...updates } : it));
    onItemsChange(updated);
  };

  const handleDescriptionChange = (id: string, text: string) => {
    updateItem(id, { description: text });
    if (text.trim().length >= 10 && descErrors[id]) {
      setDescErrors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Por favor sube una imagen en formato JPG, PNG o WEBP.");
      return;
    }

    if (file.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
      alert(`La imagen supera los ${MAX_FILE_SIZE_MB}MB. Elige un archivo más ligero.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      updateItem(id, {
        referenceImage: base64,
        referenceImageName: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (id: string) => {
    updateItem(id, {
      referenceImage: "",
      referenceImageName: "",
    });
    if (fileInputRefs.current[id]) {
      fileInputRefs.current[id]!.value = "";
    }
  };

  const handleGenerateAi = async (item: OrderItem) => {
    if (attemptsLeft <= 0) return;
    if (!item.description || item.description.trim().length < 10) {
      setAiErrors((prev) => ({
        ...prev,
        [item.id]: "Describe primero tu idea con al menos 10 caracteres para que la IA entienda el diseño.",
      }));
      return;
    }

    if (item.description.length > 500) {
      setAiErrors((prev) => ({
        ...prev,
        [item.id]: "La descripción debe tener un máximo de 500 caracteres para el modelo de IA.",
      }));
      return;
    }

    setGeneratingItemId(item.id);
    setAiErrors((prev) => {
      const copy = { ...prev };
      delete copy[item.id];
      return copy;
    });

    try {
      const res = await fetch("/api/generate-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: item.description,
          product: item.product,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo generar la imagen con Abacus.AI.");
      }

      if (data.imageUrl) {
        updateItem(item.id, { aiGeneratedImage: data.imageUrl });
        onUseAiAttempt();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al conectar con el motor de IA.";
      setAiErrors((prev) => ({ ...prev, [item.id]: msg }));
    } finally {
      setGeneratingItemId(null);
    }
  };

  const handleDiscardAiImage = (id: string) => {
    updateItem(id, { aiGeneratedImage: "" });
  };

  const validateAndProceed = () => {
    const errors: Record<string, string> = {};
    items.forEach((item, idx) => {
      if (!item.description || item.description.trim().length < 10) {
        errors[item.id] = `Por favor describe la idea de diseño para este producto (${idx + 1})`;
      } else if (item.description.length > 500) {
        errors[item.id] = `La descripción no puede superar los 500 caracteres (${item.description.length}/500)`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setDescErrors(errors);
      alert("Por favor escribe la descripción de diseño para cada producto antes de continuar.");
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
        <div>
          <h3 className="font-bold text-foreground text-sm sm:text-base">
            Personaliza el diseño de cada producto
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Explica cómo quieres el estampado de cada uno y añade imágenes de referencia.
          </p>
        </div>
        <Badge variant="accent" className="self-start sm:self-auto text-xs shrink-0">
          ✨ {attemptsLeft} de {MAX_GLOBAL_AI_ATTEMPTS} intentos de IA disponibles
        </Badge>
      </div>

      {/* TARJETAS DE PERSONALIZACIÓN POR PRODUCTO */}
      <div className="space-y-6">
        {items.map((item, index) => {
          let variantLabel = "";
          if (item.product === "camisa") {
            variantLabel = `Talla ${item.shirtSize} • ${item.shirtCut} • ${item.shirtColor}`;
          } else if (item.product === "mousepad") {
            variantLabel = item.mousepadSize || "Estándar";
          } else if (item.product === "rompecabezas") {
            variantLabel = item.puzzlePieces || "A4";
          } else {
            variantLabel = item.customProductDetails || "Personalizado";
          }

          const hasError = !!descErrors[item.id];
          const isGeneratingThis = generatingItemId === item.id;

          return (
            <Card key={item.id} className="p-4 sm:p-5 border-border bg-card space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-foreground">
                      {item.product.toUpperCase()} (x{item.quantity})
                    </h4>
                    <p className="text-[11px] text-muted-foreground">{variantLabel}</p>
                  </div>
                </div>
              </div>

              {/* 1. DESCRIPCIÓN */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`desc-${item.id}`} className="text-xs font-semibold text-foreground">
                    Descripción del estampado / idea <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    {(item.description || "").length}/500
                  </span>
                </div>

                <Textarea
                  id={`desc-${item.id}`}
                  rows={3}
                  maxLength={500}
                  placeholder={`Ej: Para esta ${item.product}, quiero un logo en el centro con colores vivos y estilo moderno...`}
                  value={item.description || ""}
                  onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                  className={cn("bg-background text-xs", hasError && "border-destructive ring-1 ring-destructive")}
                />

                {hasError && (
                  <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {descErrors[item.id]}
                  </p>
                )}
              </div>

              {/* 2. SUBIDA DE IMAGEN DE REFERENCIA */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Imagen de referencia <span className="text-[11px] font-normal text-muted-foreground">(Opcional, máx 5MB)</span>
                </Label>

                {!item.referenceImage ? (
                  <div
                    onClick={() => fileInputRefs.current[item.id]?.click()}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/80 bg-muted/20 p-3.5 text-center text-xs transition-all hover:border-primary hover:bg-primary/5"
                  >
                    <UploadCloud className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">Toca aquí para subir foto desde tu galería</span>
                    <input
                      ref={(el) => {
                        fileInputRefs.current[item.id] = el;
                      }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleFileChange(item.id, e)}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-2.5">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={item.referenceImage}
                        alt="Referencia"
                        fill
                        unoptimized
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">
                        {item.referenceImageName || "Foto adjunta"}
                      </p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Lista para adjuntar
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveImage(item.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* 3. GENERADOR DE IA */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>¿No tienes clara tu idea? La IA te genera un concepto visual desde tu descripción de texto</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      ⚠️ <strong>Importante:</strong> la IA NO usa tu imagen de referencia. Genera un concepto nuevo desde la descripción que escribiste. Si ya tienes tu imagen clara, no necesitas usar la IA — tu imagen de referencia se enviará tal cual al taller.
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0 bg-background px-2 py-0.5 rounded border border-border">
                    {attemptsLeft > 0 ? `${attemptsLeft} restantes` : "Agotados"}
                  </span>
                </div>

                {item.referenceImage && (
                  <div className="rounded-md bg-amber-500/15 border border-amber-500/30 p-2.5 text-[11px] text-amber-950 dark:text-amber-200 flex items-start gap-2">
                    <span className="shrink-0 text-sm">📷</span>
                    <p className="font-medium">
                      Ya subiste una imagen. ¿De verdad quieres que la IA genere algo diferente? Puedes saltar este paso.
                    </p>
                  </div>
                )}

                {!item.aiGeneratedImage ? (
                  <div className="space-y-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateAi(item)}
                      disabled={isGeneratingThis || attemptsLeft <= 0 || !item.description || item.description.trim().length < 10}
                      className="text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                    >
                      {isGeneratingThis ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Creando concepto con IA (toma 15-30 seg)...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Generar idea nueva desde texto (3 intentos)</span>
                        </>
                      )}
                    </Button>

                    {aiErrors[item.id] && (
                      <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {aiErrors[item.id]}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 rounded-lg border border-primary/20 bg-background/90 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                        <ImageIcon className="h-3.5 w-3.5" />
                        Concepto generado:
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDiscardAiImage(item.id)}
                        className="h-6 text-[10px] text-muted-foreground hover:text-destructive"
                      >
                        Descartar
                      </Button>
                    </div>

                    <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-lg border bg-muted shadow-sm">
                      <Image
                        src={item.aiGeneratedImage}
                        alt="Concepto IA"
                        fill
                        unoptimized
                        sizes="176px"
                        className="object-contain"
                      />
                    </div>

                    <p className="text-[10px] text-muted-foreground text-center">
                      * Concepto de referencia. Nuestro equipo afinará los detalles de impresión contigo.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* BOTONES DE NAVEGACIÓN RESPONSIVE */}
      <div className="flex flex-col-reverse lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-3 border-t border-border/80">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="w-full lg:w-auto h-auto min-h-11 py-2.5 px-4 gap-2 whitespace-normal text-center"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Volver al Paso 1</span>
        </Button>

        <Button
          type="button"
          onClick={validateAndProceed}
          className="w-full lg:w-auto h-auto min-h-11 py-2.5 px-6 text-sm font-semibold gap-2 shadow-md hover:shadow-lg transition-all whitespace-normal text-center"
        >
          <span>Continuar al Paso 3</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Button>
      </div>
    </div>
  );
}
