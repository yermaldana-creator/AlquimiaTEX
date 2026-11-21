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
import {
  MUG_TYPES,
  SHIRT_PRINT_PLACEMENTS,
  getShirtColorLabel,
  getShirtColorHex,
  getPrintPlacementLabel,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const [generatingPhase, setGeneratingPhase] = React.useState<"artwork" | "mockup" | null>(null);
  const [aiErrors, setAiErrors] = React.useState<Record<string, string>>({});
  const [aiWarnings, setAiWarnings] = React.useState<Record<string, string>>({});
  const [descErrors, setDescErrors] = React.useState<Record<string, string>>({});
  const [activeTabs, setActiveTabs] = React.useState<Record<string, "upload" | "ai">>({});
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  const attemptsLeft = Math.max(0, MAX_GLOBAL_AI_ATTEMPTS - globalAiAttempts);

  const getActiveTab = (item: OrderItem): "upload" | "ai" => {
    if (activeTabs[item.id]) return activeTabs[item.id];
    if (item.aiGeneratedImage && !item.referenceImage) return "ai";
    return "upload";
  };

  const setActiveTab = (id: string, tab: "upload" | "ai") => {
    setActiveTabs((prev) => ({ ...prev, [id]: tab }));
  };

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
      // Al subir imagen, limpiar error de descripción si existía
      setDescErrors((prev) => {
        if (!prev[id]) return prev;
        const copy = { ...prev };
        delete copy[id];
        return copy;
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
    setGeneratingPhase("artwork");
    setAiErrors((prev) => {
      const copy = { ...prev };
      delete copy[item.id];
      return copy;
    });
    setAiWarnings((prev) => {
      const copy = { ...prev };
      delete copy[item.id];
      return copy;
    });

    try {
      // PASO A: Generar Arte Limpio aislado
      const resArt = await fetch("/api/generate-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "artwork",
          description: item.description,
          product: item.product,
        }),
      });

      const dataArt = await resArt.json();
      if (!resArt.ok) {
        throw new Error(dataArt.error || "No se pudo generar la imagen con Abacus.AI.");
      }

      if (!dataArt.imageUrl) {
        throw new Error("No se recibió la imagen generada por IA.");
      }

      const artworkUrl: string = dataArt.imageUrl;
      const savedPrompt: string = dataArt.optimizedPrompt || item.description.trim();

      // Guardar inmediatamente el Arte Limpio y descontar 1 intento
      updateItem(item.id, {
        aiGeneratedImage: artworkUrl,
        aiPrompt: savedPrompt,
        aiMockupImage: "",
      });
      onUseAiAttempt();
      setDescErrors((prev) => {
        if (!prev[item.id]) return prev;
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      });

      // PASO B (solo para camisas): Segunda llamada independiente para montar el Mockup sobre la camisa
      if (item.product === "camisa") {
        setGeneratingPhase("mockup");
        try {
          const resMockup = await fetch("/api/generate-preview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode: "mockup",
              artworkImageUrl: artworkUrl,
              description: item.description,
              product: "camisa",
              shirtColor: item.shirtColor || "blanco",
              shirtColorLabel: getShirtColorLabel(item.shirtColor),
              shirtColorHex: getShirtColorHex(item.shirtColor),
              shirtCut: item.shirtCut || "unisex",
              shirtFabric: item.shirtFabric || "microdurazno",
              printPlacement: item.printPlacement || "pecho_completo",
            }),
          });

          const dataMockup = await resMockup.json();
          if (resMockup.ok && dataMockup.imageUrl) {
            // Actualizar preservando aiGeneratedImage y aiPrompt
            onItemsChange(
              items.map((it) =>
                it.id === item.id
                  ? {
                      ...it,
                      aiGeneratedImage: artworkUrl,
                      aiPrompt: savedPrompt,
                      aiMockupImage: dataMockup.imageUrl,
                    }
                  : it
              )
            );
          } else {
            setAiWarnings((prev) => ({
              ...prev,
              [item.id]:
                "Tu arte limpio está listo, pero no pudimos montar la vista previa sobre la camisa. Igual se enviará tu arte al taller.",
            }));
          }
        } catch {
          setAiWarnings((prev) => ({
            ...prev,
            [item.id]:
              "Tu arte limpio está listo, pero no pudimos montar la vista previa sobre la camisa. Igual se enviará tu arte al taller.",
          }));
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al conectar con el motor de IA.";
      setAiErrors((prev) => ({ ...prev, [item.id]: msg }));
    } finally {
      setGeneratingItemId(null);
      setGeneratingPhase(null);
    }
  };

  const handleDiscardAiImage = (id: string) => {
    updateItem(id, { aiGeneratedImage: "", aiMockupImage: "", aiPrompt: "" });
    setAiWarnings((prev) => {
      if (!prev[id]) return prev;
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const validateAndProceed = () => {
    const errors: Record<string, string> = {};
    items.forEach((item, idx) => {
      const hasVisualDesign = Boolean(item.referenceImage || item.aiGeneratedImage);
      const descLen = (item.description || "").trim().length;

      if (item.description && item.description.length > 500) {
        errors[item.id] = `La descripción no puede superar los 500 caracteres (${item.description.length}/500)`;
      } else if (!hasVisualDesign && descLen < 10) {
        errors[item.id] = `Producto #${idx + 1}: describe tu idea (mín. 10 caracteres) o adjunta una foto / concepto IA.`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setDescErrors(errors);
      alert("Para cada producto, adjunta una imagen (o crea un concepto con IA) o escribe una descripción de tu idea.");
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b-2 border-black/15 pb-3">
        <div className="space-y-1">
          <h3 className="font-oswald font-black uppercase tracking-wide text-[#0A0A0A] text-sm sm:text-base">
            Personaliza el diseño de cada producto
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed text-justify sm:text-left">
            Explica cómo quieres el estampado de cada artículo y elige si deseas adjuntar tu foto de referencia o generar un concepto desde texto con IA.
          </p>
        </div>
        <span className="self-start sm:self-auto inline-flex items-center gap-1 rounded-lg border-2 border-black bg-[#FACC15] px-2.5 py-1 font-mono text-[11px] font-black text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] shrink-0">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{attemptsLeft} de {MAX_GLOBAL_AI_ATTEMPTS} intentos IA</span>
        </span>
      </div>

      {/* TARJETAS DE PERSONALIZACIÓN POR PRODUCTO */}
      <div className="space-y-6">
        {items.map((item, index) => {
          let variantLabel = "";
          if (item.product === "camisa") {
            variantLabel = `Talla ${item.shirtSize} • ${item.shirtCut} • ${getShirtColorLabel(item.shirtColor)}`;
          } else if (item.product === "mousepad") {
            variantLabel = item.mousepadSize || "Estándar";
          } else if (item.product === "rompecabezas") {
            variantLabel = item.puzzlePieces || "A4";
          } else if (item.product === "taza") {
            const mugObj = MUG_TYPES.find((m) => m.value === item.mugType);
            variantLabel = mugObj ? mugObj.label : (item.mugType || "Taza");
          } else {
            variantLabel = item.customProductDetails || "Personalizado";
          }

          const hasError = !!descErrors[item.id];
          const isGeneratingThis = generatingItemId === item.id;
          const activeTab = getActiveTab(item);
          const hasRef = Boolean(item.referenceImage);
          const hasAi = Boolean(item.aiGeneratedImage);

          return (
            <Card
              key={item.id}
              className="p-4 sm:p-5 rounded-xl border-2 border-black bg-white text-[#0A0A0A] space-y-5 shadow-[3px_3px_0px_#0A0A0A]"
            >
              <div className="flex items-center justify-between gap-2 border-b-2 border-black/10 pb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-black bg-black text-[#FACC15] font-mono text-xs font-black">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-oswald font-black uppercase text-xs sm:text-sm text-[#0A0A0A] truncate">
                      {item.product.toUpperCase()} (x{item.quantity})
                    </h4>
                    <p className="text-[11px] font-mono text-slate-600 truncate">{variantLabel}</p>
                  </div>
                </div>

                {(hasRef || hasAi) && (
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-md border border-black bg-[#DCFCE7] px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-950">
                    <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                    {hasRef && hasAi ? "2 archivos" : hasRef ? "Foto lista" : "IA lista"}
                  </span>
                )}
              </div>

              {/* 0. SELECTOR DE UBICACIÓN DEL ESTAMPADO (SOLO PARA CAMISAS) */}
              {item.product === "camisa" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Label className="text-xs font-bold text-[#0A0A0A]">
                      Ubicación del estampado <span className="text-rose-600">*</span>
                    </Label>
                    <span className="font-mono text-[10px] font-bold text-slate-600">
                      {getPrintPlacementLabel(item.printPlacement)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SHIRT_PRINT_PLACEMENTS.map((place) => {
                      const currentPlacement = item.printPlacement || "pecho_completo";
                      const isSelected = currentPlacement === place.value;
                      return (
                        <button
                          key={place.value}
                          type="button"
                          onClick={() => updateItem(item.id, { printPlacement: place.value })}
                          className={cn(
                            "rounded-lg border-2 px-2.5 py-2 text-left transition-all",
                            isSelected
                              ? "border-black bg-[#FACC15] text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]"
                              : "border-black/20 bg-[#FAF7F0] text-slate-800 hover:border-black"
                          )}
                        >
                          <p className="text-xs font-bold leading-tight text-[#0A0A0A]">
                            {place.label}
                          </p>
                          <p className="text-[10px] text-slate-700 leading-tight mt-0.5">
                            {place.shortDesc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 1. DESCRIPCIÓN */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Label htmlFor={`desc-${item.id}`} className="text-xs font-bold text-[#0A0A0A]">
                    Descripción del estampado / idea{" "}
                    {hasRef || hasAi ? (
                      <span className="font-normal text-emerald-700">(Opcional — diseño adjunto)</span>
                    ) : (
                      <span className="text-rose-600">*</span>
                    )}
                  </Label>
                  <span className="font-mono text-[11px] font-semibold text-slate-600">
                    {(item.description || "").length}/500
                  </span>
                </div>

                <Textarea
                  id={`desc-${item.id}`}
                  rows={3}
                  maxLength={500}
                  placeholder={`Ej: Para esta ${item.product}, quiero un diseño en el centro con colores vivos y estilo moderno...`}
                  value={item.description || ""}
                  onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                  className={cn(
                    "bg-[#FAF7F0] text-[#0A0A0A] placeholder:text-slate-500 border-2 border-black/30 focus-visible:border-black text-xs leading-relaxed",
                    hasError && "border-rose-600 ring-1 ring-rose-600"
                  )}
                />

                {hasError && (
                  <p className="text-xs text-rose-600 flex items-center gap-1 font-semibold">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {descErrors[item.id]}
                  </p>
                )}
              </div>

              {/* 2. SELECTOR SEGMENTADO: SUBIR REFERENCIA VS. CREAR CONCEPTO CON IA */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#0A0A0A]">
                    Referencia visual <span className="font-normal text-slate-600">(Opcional — elige una opción)</span>
                  </Label>
                  <div
                    role="tablist"
                    aria-label="Modo de referencia visual"
                    className="grid grid-cols-2 gap-1.5 rounded-xl border-2 border-black bg-[#F3EFE6] p-1"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "upload"}
                      onClick={() => setActiveTab(item.id, "upload")}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-all",
                        activeTab === "upload"
                          ? "bg-white text-[#0A0A0A] border-2 border-black shadow-[2px_2px_0px_#0A0A0A]"
                          : "text-slate-700 hover:text-black border-2 border-transparent"
                      )}
                    >
                      <UploadCloud className="h-3.5 w-3.5 shrink-0 text-[#0891B2]" />
                      <span>Subir foto</span>
                      {hasRef && (
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Imagen guardada" />
                      )}
                    </button>

                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "ai"}
                      onClick={() => setActiveTab(item.id, "ai")}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-all",
                        activeTab === "ai"
                          ? "bg-[#FACC15] text-[#0A0A0A] border-2 border-black shadow-[2px_2px_0px_#0A0A0A]"
                          : "text-slate-700 hover:text-black border-2 border-transparent"
                      )}
                    >
                      <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#9333EA]" />
                      <span>Crear con IA</span>
                      {hasAi && (
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Concepto IA guardado" />
                      )}
                    </button>
                  </div>
                </div>

                {/* PESTAÑA A: SUBIR MI REFERENCIA */}
                {activeTab === "upload" && (
                  <div className="rounded-xl border-2 border-black/20 bg-[#FAF7F0] p-3.5 space-y-3 animate-in fade-in-50 duration-200">
                    <p className="text-[11px] text-slate-700 leading-relaxed text-justify sm:text-left">
                      Sube tu logo, ilustración o foto desde tu galería (JPG, PNG o WEBP, máx. 5MB). Tu archivo se enviará directamente al taller para montar el mockup oficial.
                    </p>

                    {!item.referenceImage ? (
                      <div
                        onClick={() => fileInputRefs.current[item.id]?.click()}
                        className="flex cursor-pointer flex-col sm:flex-row items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/40 bg-white p-4 text-center text-xs transition-all hover:border-black hover:bg-[#CFFAFE]/40"
                      >
                        <UploadCloud className="h-5 w-5 text-[#0891B2] shrink-0" />
                        <span className="font-bold text-[#0A0A0A]">Toca aquí para subir foto desde tu galería</span>
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
                      <div className="flex items-center gap-3 rounded-xl border-2 border-black bg-white p-2.5 shadow-[2px_2px_0px_#0A0A0A]">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-black bg-slate-100">
                          <Image
                            src={item.referenceImage}
                            alt="Referencia"
                            fill
                            unoptimized
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#0A0A0A] truncate">
                            {item.referenceImageName || "Foto adjunta"}
                          </p>
                          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            Guardada en tu pedido
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveImage(item.id)}
                          className="h-8 w-8 text-slate-600 hover:bg-rose-100 hover:text-rose-700"
                          title="Quitar imagen de referencia"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {hasAi && (
                      <div className="flex items-center justify-between gap-2 rounded-lg border border-black/20 bg-[#F3E8FF] px-3 py-2 text-[11px] text-purple-950">
                        <span>También conservas un <strong>concepto generado con IA</strong> en la otra pestaña.</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab(item.id, "ai")}
                          className="shrink-0 font-bold underline hover:text-black"
                        >
                          Ver
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* PESTAÑA B: CREAR CONCEPTO CON IA */}
                {activeTab === "ai" && (
                  <div className="rounded-xl border-2 border-black bg-[#FFFBEB] p-3.5 space-y-3 shadow-[2px_2px_0px_#0A0A0A] animate-in fade-in-50 duration-200">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] text-slate-800 leading-relaxed text-justify sm:text-left">
                        <strong className="text-[#0A0A0A]">Generación desde cero:</strong> la IA crea un concepto visual nuevo a partir de tu descripción de texto, ajustado automáticamente al formato de tu <strong>{item.product}</strong> (no edita fotos subidas).
                      </p>
                      <span className="shrink-0 rounded-md border border-black bg-white px-2 py-0.5 font-mono text-[10px] font-black text-[#0A0A0A]">
                        {attemptsLeft > 0 ? `${attemptsLeft} disp.` : "0 disp."}
                      </span>
                    </div>

                    {!item.aiGeneratedImage ? (
                      <div className="space-y-2">
                        <Button
                          type="button"
                          onClick={() => handleGenerateAi(item)}
                          disabled={
                            isGeneratingThis ||
                            attemptsLeft <= 0 ||
                            !item.description ||
                            item.description.trim().length < 10
                          }
                          className="w-full h-10 rounded-lg border-2 border-black bg-[#FACC15] text-[#0A0A0A] hover:bg-[#fde047] disabled:bg-slate-200 disabled:text-slate-500 disabled:border-slate-300 text-xs font-bold gap-1.5 shadow-[2px_2px_0px_#0A0A0A] transition-all"
                        >
                          {isGeneratingThis ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                              <span>
                                {item.product === "camisa"
                                  ? generatingPhase === "mockup"
                                    ? "2/2 Montando mockup en tu camisa..."
                                    : "1/2 Generando arte limpio..."
                                  : "Creando con IA (15-30 seg)..."}
                              </span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 shrink-0" />
                              <span>Generar con IA</span>
                            </>
                          )}
                        </Button>

                        {(!item.description || item.description.trim().length < 10) && (
                          <p className="text-[11px] text-slate-600 text-center">
                            Escribe al menos 10 caracteres en la descripción arriba para habilitar la IA.
                          </p>
                        )}

                        {aiErrors[item.id] && (
                          <p className="text-xs text-rose-600 flex items-center gap-1 font-semibold">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {aiErrors[item.id]}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2.5 rounded-xl border-2 border-black bg-white p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <ImageIcon className="h-3.5 w-3.5" />
                            {item.aiMockupImage
                              ? "Mockup + Arte Limpio guardados"
                              : "Concepto IA guardado en tu pedido"}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDiscardAiImage(item.id)}
                            disabled={isGeneratingThis}
                            className="h-7 px-2 text-[11px] font-bold text-rose-700 hover:bg-rose-100 hover:text-rose-900"
                          >
                            Descartar
                          </Button>
                        </div>

                        {isGeneratingThis && generatingPhase === "mockup" && (
                          <div className="flex items-center justify-center gap-2 rounded-lg border border-black/20 bg-[#FEF9C3] px-3 py-2 text-[11px] font-bold text-[#0A0A0A]">
                            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                            <span>2/2 Montando tu arte en la camisa ({getShirtColorLabel(item.shirtColor)})...</span>
                          </div>
                        )}

                        <div
                          className={cn(
                            "grid gap-2.5",
                            item.aiMockupImage ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
                          )}
                        >
                          {item.aiMockupImage && (
                            <div className="space-y-1">
                              <span className="block text-center font-mono text-[10px] font-bold uppercase text-[#0A0A0A]">
                                Mockup ({getPrintPlacementLabel(item.printPlacement)})
                              </span>
                              <div className="relative mx-auto h-44 w-full max-w-[220px] overflow-hidden rounded-lg border-2 border-black bg-slate-100">
                                <Image
                                  src={item.aiMockupImage}
                                  alt="Mockup en camisa"
                                  fill
                                  unoptimized
                                  sizes="220px"
                                  className="object-contain"
                                />
                              </div>
                            </div>
                          )}

                          <div className="space-y-1">
                            {item.aiMockupImage && (
                              <span className="block text-center font-mono text-[10px] font-bold uppercase text-slate-600">
                                Arte Limpio (Sublimación)
                              </span>
                            )}
                            <div className="relative mx-auto h-44 w-full max-w-[220px] overflow-hidden rounded-lg border-2 border-black/20 bg-slate-100">
                              <Image
                                src={item.aiGeneratedImage}
                                alt="Concepto IA"
                                fill
                                unoptimized
                                sizes="220px"
                                className="object-contain"
                              />
                            </div>
                          </div>
                        </div>

                        {aiWarnings[item.id] && (
                          <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-300 rounded-md p-2 text-center font-medium">
                            {aiWarnings[item.id]}
                          </p>
                        )}

                        <p className="text-[10px] text-slate-600 text-center leading-relaxed">
                          * Concepto visual referencial. Nuestro taller preparará el arte final de impresión contigo.
                        </p>
                      </div>
                    )}

                    {hasRef && (
                      <div className="flex items-center justify-between gap-2 rounded-lg border border-black/20 bg-[#CFFAFE] px-3 py-2 text-[11px] text-cyan-950">
                        <span>Tu <strong>foto de referencia</strong> sigue guardada intacta en la primera pestaña.</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab(item.id, "upload")}
                          className="shrink-0 font-bold underline hover:text-black"
                        >
                          Ver
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* BOTONES DE NAVEGACIÓN RESPONSIVE */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t-2 border-black/15">
        <Button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto h-11 px-4 rounded-xl border-2 border-black bg-white text-[#0A0A0A] hover:bg-[#FAF7F0] font-bold text-xs sm:text-sm gap-2 shadow-[2px_2px_0px_#0A0A0A]"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Volver al Paso 1</span>
        </Button>

        <Button
          type="button"
          onClick={validateAndProceed}
          className="w-full sm:w-auto h-12 px-6 rounded-xl border-2 border-black bg-black text-white hover:bg-[#FACC15] hover:text-[#0A0A0A] font-oswald text-base sm:text-lg font-black uppercase tracking-wide gap-2 shadow-[4px_4px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          <span>Continuar al Paso 3</span>
          <ArrowRight className="h-5 w-5 shrink-0" />
        </Button>
      </div>
    </div>
  );
}
