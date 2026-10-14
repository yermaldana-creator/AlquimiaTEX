"use client";

import * as React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { step2CustomizationSchema, type Step2CustomizationFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const STORAGE_KEY = "alquimiatex_order_step2";
const MAX_FILE_SIZE_MB = 5;
const MAX_ATTEMPTS = 3;

interface OrderStep2Props {
  productType?: string;
  onBack: () => void;
  onNext: (data: Step2CustomizationFormData) => void;
  initialData?: Partial<Step2CustomizationFormData>;
}

export function OrderStep2({
  productType = "camisa",
  onBack,
  onNext,
  initialData,
}: OrderStep2Props) {
  const [mounted, setMounted] = React.useState(false);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = React.useState(MAX_ATTEMPTS);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<Step2CustomizationFormData>({
    resolver: zodResolver(step2CustomizationSchema),
    defaultValues: {
      description: "",
      referenceImage: "",
      referenceImageName: "",
      aiGeneratedImage: "",
      aiAttemptsCount: 0,
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

  const description = watch("description");
  const referenceImage = watch("referenceImage");
  const referenceImageName = watch("referenceImageName");
  const aiGeneratedImage = watch("aiGeneratedImage");
  const aiAttemptsCount = watch("aiAttemptsCount") || 0;

  // Restaurar desde localStorage al montar
  React.useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.description) setValue("description", parsed.description);
        if (parsed.referenceImage) setValue("referenceImage", parsed.referenceImage);
        if (parsed.referenceImageName) setValue("referenceImageName", parsed.referenceImageName);
        if (parsed.aiGeneratedImage) setValue("aiGeneratedImage", parsed.aiGeneratedImage);
        if (typeof parsed.aiAttemptsCount === "number") {
          setValue("aiAttemptsCount", parsed.aiAttemptsCount);
          setAttemptsLeft(Math.max(0, MAX_ATTEMPTS - parsed.aiAttemptsCount));
        }
      }
    } catch {}
  }, [setValue]);

  // Guardar en localStorage ante cambios
  React.useEffect(() => {
    if (!mounted) return;
    const subscription = watch((values) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
      } catch {}
    });
    return () => subscription.unsubscribe();
  }, [watch, mounted]);

  // Manejo de subida de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setFileError("Formato no compatible. Por favor sube una imagen JPG, PNG o WEBP.");
      return;
    }

    // Validar tamaño
    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb > MAX_FILE_SIZE_MB) {
      setFileError(
        `La imagen supera los ${MAX_FILE_SIZE_MB}MB. Por favor elige una imagen más ligera.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setValue("referenceImage", base64, { shouldValidate: true });
      setValue("referenceImageName", file.name, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setValue("referenceImage", "");
    setValue("referenceImageName", "");
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Generador de idea con IA (Gemini)
  const handleGenerateAi = async () => {
    if (attemptsLeft <= 0) return;
    if (!description || description.trim().length < 10) {
      setAiError(
        "Escribe primero una descripción de al menos 10 caracteres para que la IA entienda tu idea."
      );
      return;
    }

    setAiError(null);
    setIsGeneratingAi(true);

    try {
      const res = await fetch("/api/generate-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          product: productType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo generar la idea visual.");
      }

      if (data.imageUrl) {
        setValue("aiGeneratedImage", data.imageUrl, { shouldValidate: true });
        const nextUsed = aiAttemptsCount + 1;
        setValue("aiAttemptsCount", nextUsed);
        setAttemptsLeft(Math.max(0, MAX_ATTEMPTS - nextUsed));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al conectar con el servicio de IA.";
      setAiError(msg);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleDiscardAiImage = () => {
    setValue("aiGeneratedImage", "");
  };

  const onSubmit = (data: Step2CustomizationFormData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
    onNext(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 duration-300 animate-in fade-in-50"
    >
      {/* 1. DESCRIPCIÓN DE LA IDEA */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="desc" className="text-base font-bold text-foreground">
            1. Describe tu idea de diseño <span className="text-destructive">*</span>
          </Label>
          <span className="text-xs text-muted-foreground">{description.length}/1000</span>
        </div>

        <Textarea
          id="desc"
          rows={4}
          maxLength={1000}
          placeholder="Ej: Quiero una franela con el logo de mi banda en el pecho y una frase en la espalda en letras doradas. El estilo debe ser moderno y llamativo..."
          value={description}
          onChange={(e) => setValue("description", e.target.value, { shouldValidate: true })}
          className="resize-none bg-background text-sm leading-relaxed"
        />

        {errors.description ? (
          <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errors.description.message}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Explica con tus palabras qué personajes, logos, frases o temática deseas.
          </p>
        )}
      </div>

      {/* 2. SUBIDA DE IMAGEN DE REFERENCIA */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-bold text-foreground">
            2. Imagen de referencia{" "}
            <span className="text-xs font-normal text-muted-foreground">(Opcional)</span>
          </Label>
          <span className="text-xs text-muted-foreground">JPG, PNG o WEBP (Máx. 5MB)</span>
        </div>

        {!referenceImage ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-muted/20 p-6 text-center transition-all",
              "hover:border-primary hover:bg-primary/5 hover:shadow-sm"
            )}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/10">
              <UploadCloud className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Toca aquí para subir tu imagen desde tu dispositivo
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Fotos de internet, bocetos, logos o capturas que sirvan de guía
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 shadow-sm">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
              <Image
                src={referenceImage}
                alt="Referencia del cliente"
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {referenceImageName || "Imagen seleccionada"}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>Lista para adjuntar al pedido</span>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemoveImage}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Quitar imagen"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {fileError && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {fileError}
          </p>
        )}
      </div>

      {/* 3. GENERADOR DE IDEA VISUAL CON IA (GEMINI) */}
      <Card className="space-y-4 border-primary/30 bg-gradient-to-br from-purple-500/5 via-background to-primary/5 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground sm:text-base">
                ¿Quieres una idea visual orientativa con IA?
              </h4>
              <p className="text-xs text-muted-foreground">
                Google Gemini creará un concepto rápido basado en tu texto.
              </p>
            </div>
          </div>

          <Badge variant="accent" className="shrink-0 self-start text-[11px] sm:self-auto">
            {attemptsLeft > 0 ? `${attemptsLeft} de ${MAX_ATTEMPTS} intentos` : "Límite alcanzado"}
          </Badge>
        </div>

        {/* Botón de Generar */}
        {!aiGeneratedImage && (
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateAi}
              disabled={isGeneratingAi || attemptsLeft <= 0 || description.trim().length < 10}
              className="w-full gap-2 border-primary/40 text-primary hover:bg-primary/10 sm:w-auto"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creando tu idea visual...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generar concepto con IA</span>
                </>
              )}
            </Button>

            {description.trim().length < 10 && attemptsLeft > 0 && (
              <p className="text-[11px] text-muted-foreground">
                * Escribe al menos 10 caracteres en la descripción arriba para activar la IA.
              </p>
            )}

            {aiError && (
              <p className="flex items-center gap-1.5 pt-1 text-xs font-medium text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {aiError}
              </p>
            )}
          </div>
        )}

        {/* Previsualización de la Idea generada */}
        {aiGeneratedImage && (
          <div className="space-y-3 rounded-xl border border-primary/20 bg-background/80 p-3 duration-200 animate-in zoom-in-95 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <ImageIcon className="h-4 w-4" />
                Concepto generado por IA:
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDiscardAiImage}
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
              >
                Descartar idea
              </Button>
            </div>

            <div className="relative mx-auto h-52 w-52 overflow-hidden rounded-xl border bg-muted shadow-sm sm:h-64 sm:w-64">
              <Image
                src={aiGeneratedImage}
                alt="Idea visual generada por IA"
                fill
                sizes="(max-width: 640px) 208px, 256px"
                className="object-contain"
              />
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>Nota:</strong> Esta imagen es sólo un boceto orientativo. El socio diseñador
                afinará el arte final contigo por WhatsApp.
              </span>
            </div>

            {attemptsLeft > 0 && (
              <div className="text-right">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAi}
                  disabled={isGeneratingAi}
                  className="gap-1.5 text-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Probar otra idea ({attemptsLeft} restantes)</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* BOTONES DE NAVEGACIÓN */}
      <div className="flex flex-col-reverse items-center justify-between gap-3 pt-3 sm:flex-row">
        <Button type="button" variant="outline" onClick={onBack} className="w-full gap-2 sm:w-auto">
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al Paso 1</span>
        </Button>

        <Button
          type="submit"
          className="h-11 w-full gap-2 px-6 text-sm font-semibold shadow-md transition-all hover:shadow-lg sm:w-auto sm:text-base"
        >
          <span>Continuar al Paso 3: Entrega y Contacto</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
