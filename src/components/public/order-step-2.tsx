"use client";

import * as React from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
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
  SHIRT_FRONT_PLACEMENTS,
  SHIRT_BACK_PLACEMENTS,
  getShirtColorLabel,
  resolveShirtPlacements,
  getShirtPlacementSummary,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShirtMockupPreview } from "./shirt-mockup-preview";

// Carga lazy estricta del visor 3D (0 KB en landing y en otros productos)
const Mug3DPreview = dynamic(() => import("./mug-3d-preview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[265px] sm:h-[290px] w-full items-center justify-center rounded-xl border-2 border-black bg-[#FAF7F0] font-mono text-xs font-bold text-slate-700">
      <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0891B2]" />
      Cargando visor 3D de taza...
    </div>
  ),
});

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
  const [generatingBackItemId, setGeneratingBackItemId] = React.useState<string | null>(null);
  const [aiErrors, setAiErrors] = React.useState<Record<string, string>>({});
  const [backAiErrors, setBackAiErrors] = React.useState<Record<string, string>>({});
  const [serverLimitMessage, setServerLimitMessage] = React.useState<string | null>(null);
  const [descErrors, setDescErrors] = React.useState<Record<string, string>>({});
  const [placementErrors, setPlacementErrors] = React.useState<Record<string, string>>({});
  const [activeTabs, setActiveTabs] = React.useState<Record<string, "upload" | "ai">>({});
  const [backArtModes, setBackArtModes] = React.useState<Record<string, "upload" | "ai">>({});
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});
  const backFileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  // Ref para evitar closures obsoletos al guardar aiMockupImage desde el callback del Canvas
  const itemsRef = React.useRef(items);
  React.useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const attemptsLeft = serverLimitMessage
    ? 0
    : Math.max(0, MAX_GLOBAL_AI_ATTEMPTS - globalAiAttempts);

  const getActiveTab = (item: OrderItem): "upload" | "ai" => {
    if (activeTabs[item.id]) return activeTabs[item.id];
    if (item.aiGeneratedImage && !item.referenceImage) return "ai";
    return "upload";
  };

  const setActiveTab = (id: string, tab: "upload" | "ai") => {
    setActiveTabs((prev) => ({ ...prev, [id]: tab }));
  };

  const updateItem = React.useCallback(
    (id: string, updates: Partial<OrderItem>) => {
      const updated = itemsRef.current.map((it) => (it.id === id ? { ...it, ...updates } : it));
      onItemsChange(updated);
    },
    [onItemsChange]
  );

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

  const handlePlacementChange = (
    item: OrderItem,
    side: "front" | "back",
    value: string
  ) => {
    const current = resolveShirtPlacements(item);
    const nextFront = side === "front" ? value : current.front;
    const nextBack = side === "back" ? value : current.back;

    if (nextFront === "ninguno" && nextBack === "ninguno") {
      setPlacementErrors((prev) => ({
        ...prev,
        [item.id]: "Debes dejar al menos una zona activa (Frente o Espalda).",
      }));
      return;
    }

    setPlacementErrors((prev) => {
      if (!prev[item.id]) return prev;
      const copy = { ...prev };
      delete copy[item.id];
      return copy;
    });

    updateItem(item.id, {
      frontPlacement: nextFront,
      backPlacement: nextBack,
      // Sincronizar también printPlacement para retrocompatibilidad
      printPlacement:
        nextFront !== "ninguno" && nextBack !== "ninguno"
          ? "pecho_y_espalda"
          : nextFront !== "ninguno"
          ? nextFront
          : nextBack,
    });
  };

  const handleFileChange = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
    isBackSide = false
  ) => {
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
      if (isBackSide) {
        updateItem(id, {
          backReferenceImage: base64,
          backReferenceImageName: file.name,
        });
      } else {
        updateItem(id, {
          referenceImage: base64,
          referenceImageName: file.name,
        });
        setDescErrors((prev) => {
          if (!prev[id]) return prev;
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (id: string, isBackSide = false) => {
    if (isBackSide) {
      updateItem(id, {
        backReferenceImage: "",
        backReferenceImageName: "",
        backReferenceImageUrl: "",
        backAiPrompt: "",
      });
      if (backFileInputRefs.current[id]) {
        backFileInputRefs.current[id]!.value = "";
      }
    } else {
      updateItem(id, {
        referenceImage: "",
        referenceImageName: "",
        referenceImageUrl: "",
      });
      if (fileInputRefs.current[id]) {
        fileInputRefs.current[id]!.value = "";
      }
    }
  };

  // Generar el 2.º arte independiente para la espalda (comparte el mismo contador global attemptsLeft)
  const handleGenerateBackAi = async (item: OrderItem) => {
    if (attemptsLeft <= 0) return;
    const backDesc = (item.backDescription || "").trim();
    if (backDesc.length < 10) {
      setBackAiErrors((prev) => ({
        ...prev,
        [item.id]: "Describe la idea para la espalda con al menos 10 caracteres.",
      }));
      return;
    }

    setGeneratingBackItemId(item.id);
    setBackAiErrors((prev) => {
      const copy = { ...prev };
      delete copy[item.id];
      return copy;
    });

    try {
      const res = await fetch("/api/generate-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: backDesc,
          product: "camisa",
        }),
      });

      const data = await res.json();
      if (res.status === 429) {
        const msg =
          data.error ||
          "Has alcanzado el límite de 3 diseños con IA por hoy. Puedes subir tu propia foto o describir tu idea.";
        setServerLimitMessage(msg);
        setBackAiErrors((prev) => ({ ...prev, [item.id]: msg }));
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || "No se pudo generar el arte de espalda con IA.");
      }

      if (data.imageUrl) {
        updateItem(item.id, {
          backReferenceImage: data.imageUrl,
          backReferenceImageName: "Arte IA (Espalda)",
          backAiPrompt: data.optimizedPrompt || backDesc,
        });
        onUseAiAttempt();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al conectar con el motor de IA.";
      setBackAiErrors((prev) => ({ ...prev, [item.id]: msg }));
    } finally {
      setGeneratingBackItemId(null);
    }
  };

  // 1 sola llamada limpia de IA (Arte Limpio aislado — 4 créditos)
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
      if (res.status === 429) {
        const msg =
          data.error ||
          "Has alcanzado el límite de 3 diseños con IA por hoy. Puedes subir tu propia foto o describir tu idea.";
        setServerLimitMessage(msg);
        setAiErrors((prev) => ({ ...prev, [item.id]: msg }));
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || "No se pudo generar la imagen con Abacus.AI.");
      }

      if (data.imageUrl) {
        updateItem(item.id, {
          aiGeneratedImage: data.imageUrl,
          aiPrompt: data.optimizedPrompt || item.description.trim(),
        });
        onUseAiAttempt();
        setDescErrors((prev) => {
          if (!prev[item.id]) return prev;
          const copy = { ...prev };
          delete copy[item.id];
          return copy;
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al conectar con el motor de IA.";
      setAiErrors((prev) => ({ ...prev, [item.id]: msg }));
    } finally {
      setGeneratingItemId(null);
    }
  };

  const handleDiscardAiImage = (id: string) => {
    updateItem(id, { aiGeneratedImage: "", aiPrompt: "" });
  };

  const validateAndProceed = () => {
    const errors: Record<string, string> = {};
    const pErrors: Record<string, string> = {};

    items.forEach((item, idx) => {
      const hasVisualDesign = Boolean(item.referenceImage || item.aiGeneratedImage);
      const descLen = (item.description || "").trim().length;

      if (item.description && item.description.length > 500) {
        errors[item.id] = `La descripción no puede superar los 500 caracteres (${item.description.length}/500)`;
      } else if (!hasVisualDesign && descLen < 10) {
        errors[item.id] = `Producto #${idx + 1}: describe tu idea (mín. 10 caracteres) o adjunta una foto / concepto IA.`;
      }

      if (item.product === "camisa") {
        const { front, back } = resolveShirtPlacements(item);
        if (front === "ninguno" && back === "ninguno") {
          pErrors[item.id] = "Selecciona al menos una ubicación (Frente o Espalda).";
        }
      }
    });

    if (Object.keys(errors).length > 0 || Object.keys(pErrors).length > 0) {
      setDescErrors(errors);
      setPlacementErrors(pErrors);
      alert("Revisa que cada producto tenga diseño/descripción y una ubicación de estampado válida.");
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
            Elige si deseas adjuntar tu foto de referencia o generar un arte limpio con IA. Para franelas y tazas (Normal, Mágica y Apilable) verás una vista previa en vivo.
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

          // Imagen activa para previsualización en vivo (Canvas de Camisa / 3D de Taza)
          const activeVisualImage =
            activeTab === "ai"
              ? item.aiGeneratedImage || item.referenceImage || ""
              : item.referenceImage || item.aiGeneratedImage || "";

          // Visor 3D habilitado para todas las tazas con imagen (Normal, Mágica y Apilables)
          const isStackableMug =
            item.mugType === "taza_apilable_individual" || item.mugType === "set_apilable";
          const mug3DVariant: "standard" | "magic" | "stackable" =
            item.mugType === "taza_magica"
              ? "magic"
              : isStackableMug
              ? "stackable"
              : "standard";
          const is3DMugEligible = item.product === "taza" && Boolean(activeVisualImage);

          const shirtPlacements = resolveShirtPlacements(item);
          const bothShirtSidesActive =
            item.product === "camisa" &&
            shirtPlacements.front !== "ninguno" &&
            shirtPlacements.back !== "ninguno";

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

              {/* 0. SELECTOR INDEPENDIENTE DE UBICACIÓN (FRENTE + ESPALDA, SOLO CAMISAS) */}
              {item.product === "camisa" && (
                <div className="space-y-3 rounded-xl border-2 border-black/20 bg-[#FAF7F0] p-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Label className="text-xs font-bold text-[#0A0A0A]">
                      Ubicación del estampado <span className="text-rose-600">*</span>
                    </Label>
                    <span className="font-mono text-[10px] font-bold text-slate-700">
                      {getShirtPlacementSummary(item)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Selector Frente */}
                    <div className="space-y-1">
                      <label
                        htmlFor={`front-${item.id}`}
                        className="block font-mono text-[10px] font-black uppercase text-slate-700"
                      >
                        Frente (Pecho):
                      </label>
                      <select
                        id={`front-${item.id}`}
                        value={shirtPlacements.front}
                        onChange={(e) => handlePlacementChange(item, "front", e.target.value)}
                        className="w-full h-9 rounded-lg border-2 border-black bg-white px-2.5 text-xs font-bold text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                      >
                        {SHIRT_FRONT_PLACEMENTS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label} — {p.shortDesc}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Selector Espalda */}
                    <div className="space-y-1">
                      <label
                        htmlFor={`back-${item.id}`}
                        className="block font-mono text-[10px] font-black uppercase text-slate-700"
                      >
                        Espalda:
                      </label>
                      <select
                        id={`back-${item.id}`}
                        value={shirtPlacements.back}
                        onChange={(e) => handlePlacementChange(item, "back", e.target.value)}
                        className="w-full h-9 rounded-lg border-2 border-black bg-white px-2.5 text-xs font-bold text-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                      >
                        {SHIRT_BACK_PLACEMENTS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label} — {p.shortDesc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {placementErrors[item.id] && (
                    <p className="text-xs text-rose-600 flex items-center gap-1 font-semibold">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {placementErrors[item.id]}
                    </p>
                  )}

                  {/* Opción compacta para 2.º arte independiente de espalda (Subir foto O Crear con IA) */}
                  {bothShirtSidesActive && (
                    <div className="pt-2.5 border-t border-black/15 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-[#0A0A0A]">
                          Arte independiente para la espalda{" "}
                          <span className="font-normal text-slate-600">
                            (Opcional — por defecto repite el del frente)
                          </span>
                        </span>
                      </div>

                      {!item.backReferenceImage ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-black bg-[#F3EFE6] p-1">
                            <button
                              type="button"
                              onClick={() =>
                                setBackArtModes((prev) => ({ ...prev, [item.id]: "upload" }))
                              }
                              className={cn(
                                "flex items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-bold transition-all",
                                (backArtModes[item.id] || "upload") === "upload"
                                  ? "bg-white text-[#0A0A0A] border border-black shadow-[1px_1px_0px_#0A0A0A]"
                                  : "text-slate-700 hover:text-black"
                              )}
                            >
                              <UploadCloud className="h-3.5 w-3.5 text-[#0891B2]" />
                              <span>Subir foto</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setBackArtModes((prev) => ({ ...prev, [item.id]: "ai" }))
                              }
                              className={cn(
                                "flex items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-bold transition-all",
                                backArtModes[item.id] === "ai"
                                  ? "bg-[#FACC15] text-[#0A0A0A] border border-black shadow-[1px_1px_0px_#0A0A0A]"
                                  : "text-slate-700 hover:text-black"
                              )}
                            >
                              <Sparkles className="h-3.5 w-3.5 text-[#9333EA]" />
                              <span>Crear con IA</span>
                            </button>
                          </div>

                          {(backArtModes[item.id] || "upload") === "upload" ? (
                            <button
                              type="button"
                              onClick={() => backFileInputRefs.current[item.id]?.click()}
                              className="w-full flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-black/35 bg-white px-3 py-2 text-[11px] font-bold text-[#0A0A0A] hover:border-black hover:bg-[#CFFAFE]/30 transition-all"
                            >
                              <UploadCloud className="h-3.5 w-3.5 text-[#0891B2]" />
                              <span>Subir foto distinta para la espalda</span>
                              <input
                                ref={(el) => {
                                  backFileInputRefs.current[item.id] = el;
                                }}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => handleFileChange(item.id, e, true)}
                                className="hidden"
                              />
                            </button>
                          ) : (
                            <div className="space-y-2 rounded-lg border border-black/25 bg-[#FFFBEB] p-2.5">
                              <Textarea
                                rows={2}
                                maxLength={500}
                                placeholder="Describe el diseño que quieres específicamente en la espalda (mín. 10 caracteres)..."
                                value={item.backDescription || ""}
                                onChange={(e) =>
                                  updateItem(item.id, { backDescription: e.target.value })
                                }
                                className="bg-white text-[#0A0A0A] placeholder:text-slate-500 border border-black/30 focus-visible:border-black text-xs"
                              />
                              <Button
                                type="button"
                                onClick={() => handleGenerateBackAi(item)}
                                disabled={
                                  generatingBackItemId === item.id ||
                                  attemptsLeft <= 0 ||
                                  (item.backDescription || "").trim().length < 10
                                }
                                className="w-full h-9 rounded-lg border-2 border-black bg-[#FACC15] text-[#0A0A0A] hover:bg-[#fde047] disabled:bg-slate-200 disabled:text-slate-500 text-xs font-bold gap-1.5 shadow-[2px_2px_0px_#0A0A0A]"
                              >
                                {generatingBackItemId === item.id ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                                    <span>Generando arte de espalda...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                                    <span>Generar espalda con IA ({attemptsLeft} disp.)</span>
                                  </>
                                )}
                              </Button>
                              {backAiErrors[item.id] && (
                                <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                  {backAiErrors[item.id]}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 rounded-lg border-2 border-black bg-white p-2">
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded border border-black bg-slate-100">
                            <Image
                              src={item.backReferenceImage}
                              alt="Arte espalda"
                              fill
                              unoptimized
                              sizes="44px"
                              className="object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-[#0A0A0A] truncate">
                              {item.backReferenceImageName || "Arte independiente de espalda"}
                            </p>
                            <span className="text-[10px] font-semibold text-emerald-700">
                              Aplicado a la espalda ✓
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveImage(item.id, true)}
                            className="h-7 w-7 text-slate-600 hover:bg-rose-100 hover:text-rose-700"
                            title="Usar el mismo arte del frente"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
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

              {/* 2. SELECTOR SEGMENTADO: SUBIR FOTO VS. CREAR CON IA */}
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

                {/* PESTAÑA A: SUBIR FOTO */}
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
                          onChange={(e) => handleFileChange(item.id, e, false)}
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
                          onClick={() => handleRemoveImage(item.id, false)}
                          className="h-8 w-8 text-slate-600 hover:bg-rose-100 hover:text-rose-700"
                          title="Quitar imagen de referencia"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {hasAi && (
                      <div className="flex items-center justify-between gap-2 rounded-lg border border-black/20 bg-[#F3E8FF] px-3 py-2 text-[11px] text-purple-950">
                        <span>También conservas un <strong>arte generado con IA</strong> en la otra pestaña.</span>
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

                {/* PESTAÑA B: CREAR CON IA (1 SOLA GENERACIÓN LIMPIA) */}
                {activeTab === "ai" && (
                  <div className="rounded-xl border-2 border-black bg-[#FFFBEB] p-3.5 space-y-3 shadow-[2px_2px_0px_#0A0A0A] animate-in fade-in-50 duration-200">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] text-slate-800 leading-relaxed text-justify sm:text-left">
                        <strong className="text-[#0A0A0A]">Generación desde cero:</strong> la IA crea un arte limpio aislado a partir de tu descripción de texto (no edita fotos subidas).
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
                              <span>Creando arte con IA (15-30 seg)...</span>
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

                        {serverLimitMessage ? (
                          <div className="rounded-lg border-2 border-black bg-[#CFFAFE] p-3 space-y-2 text-xs text-[#0A0A0A]">
                            <p className="font-semibold leading-relaxed">{serverLimitMessage}</p>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => setActiveTab(item.id, "upload")}
                              className="h-8 rounded-lg border-2 border-black bg-white text-[#0A0A0A] hover:bg-[#FACC15] text-[11px] font-bold gap-1.5 shadow-[2px_2px_0px_#0A0A0A]"
                            >
                              <UploadCloud className="h-3.5 w-3.5 text-[#0891B2]" />
                              <span>Subir foto de referencia</span>
                            </Button>
                          </div>
                        ) : (
                          aiErrors[item.id] && (
                            <p className="text-xs text-rose-600 flex items-center gap-1 font-semibold">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              {aiErrors[item.id]}
                            </p>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2.5 rounded-xl border-2 border-black bg-white p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <ImageIcon className="h-3.5 w-3.5" />
                            Arte limpio IA guardado
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDiscardAiImage(item.id)}
                            className="h-7 px-2 text-[11px] font-bold text-rose-700 hover:bg-rose-100 hover:text-rose-900"
                          >
                            Descartar
                          </Button>
                        </div>

                        <div className="relative mx-auto h-40 w-full max-w-[200px] overflow-hidden rounded-lg border-2 border-black/20 bg-slate-100">
                          <Image
                            src={item.aiGeneratedImage}
                            alt="Arte limpio IA"
                            fill
                            unoptimized
                            sizes="200px"
                            className="object-contain"
                          />
                        </div>

                        <p className="text-[10px] text-slate-600 text-center leading-relaxed">
                          * Arte limpio referencial. Nuestro taller preparará el montaje final de impresión contigo.
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

                {/* 3A. COMPOSITOR DE MOCKUP 2D EN VIVO PARA CAMISAS (HTML5 CANVAS — 0 CRÉDITOS IA) */}
                {item.product === "camisa" && Boolean(activeVisualImage) && (
                  <ShirtMockupPreview
                    shirtColor={item.shirtColor}
                    frontPlacement={shirtPlacements.front}
                    backPlacement={shirtPlacements.back}
                    frontImage={activeVisualImage}
                    backImage={item.backReferenceImage || activeVisualImage}
                    onMockupGenerated={(dataUrl) =>
                      updateItem(item.id, { aiMockupImage: dataUrl })
                    }
                  />
                )}

                {/* 3B. VISOR 3D ULTRA-LIGERO PARA TAZAS (NORMAL, MÁGICA Y APILABLE) */}
                {is3DMugEligible && (
                  <Mug3DPreview
                    imageUrl={activeVisualImage}
                    isMagic={mug3DVariant === "magic"}
                    mugVariant={mug3DVariant}
                    alt={`Vista 3D ${variantLabel}`}
                  />
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
