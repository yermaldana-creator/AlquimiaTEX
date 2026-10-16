"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { ONBOARDING_SLIDES } from "@/lib/constants";

interface OnboardingModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

const STORAGE_KEY = "alquimiatex_onboarding_seen_v1";

export function OnboardingModal({ forceOpen = false, onClose }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setCurrentSlideIndex(0);
      return;
    }

    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        setIsOpen(true);
      }
    } catch (e) {
      console.warn("localStorage no disponible:", e);
    }
  }, [forceOpen]);

  const handleClose = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch (e) {
      console.warn("Error saving to localStorage:", e);
    }
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  const currentSlide = ONBOARDING_SLIDES[currentSlideIndex];
  const isLast = currentSlideIndex === ONBOARDING_SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#F8F5EE] dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 max-w-lg w-full shadow-[8px_8px_0px_#0A0A0A] dark:shadow-[8px_8px_0px_#000000] p-6 space-y-5">
        {/* ENCABEZADO */}
        <div className="flex items-center justify-between border-b-2 border-black dark:border-zinc-700 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-black uppercase bg-[#FACC15] text-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_#0A0A0A]">
              {currentSlide.badge}
            </span>
            <span className="font-mono text-xs text-slate-600 dark:text-zinc-400 font-bold">
              Guía del Taller AlquimiaTex
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1 bg-white dark:bg-zinc-800 border border-black dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 text-black dark:text-white shadow-[1px_1px_0px_#0A0A0A]"
            title="Saltar tutorial"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* CONTENIDO DEL SLIDE */}
        <div className="space-y-3 min-h-[160px]">
          <h3 className="font-oswald text-2xl sm:text-3xl font-black uppercase text-black dark:text-white leading-tight">
            {currentSlide.title}
          </h3>

          <div className="inline-block bg-white dark:bg-zinc-900 px-2 py-0.5 border border-black dark:border-zinc-700 font-mono text-xs font-bold text-[#581C87] dark:text-purple-300">
            {currentSlide.tagline}
          </div>

          <p className="font-mono text-xs sm:text-sm text-slate-800 dark:text-zinc-200 leading-relaxed pt-1">
            {currentSlide.description}
          </p>

          <div className="bg-[#FFFDF7] dark:bg-zinc-900/80 border-l-4 border-[#FACC15] p-2.5 font-mono text-xs text-slate-700 dark:text-zinc-300 italic">
            💡 {currentSlide.tip}
          </div>
        </div>

        {/* NAVEGADOR DE PUNTOS */}
        <div className="flex items-center justify-center gap-2 pt-1">
          {ONBOARDING_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-2.5 transition-all border border-black dark:border-zinc-700 ${
                currentSlideIndex === idx
                  ? "w-8 bg-[#FACC15]"
                  : "w-2.5 bg-white dark:bg-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-600"
              }`}
            />
          ))}
        </div>

        {/* BOTONES DE AVANCE */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t-2 border-dashed border-slate-300 dark:border-zinc-700 font-mono text-xs">
          <button
            type="button"
            onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentSlideIndex === 0}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-zinc-700 font-bold uppercase disabled:opacity-40 shadow-[1.5px_1.5px_0px_#0A0A0A] dark:shadow-[1.5px_1.5px_0px_#000000]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Atrás</span>
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FACC15] text-black border-2 border-black font-black uppercase shadow-[2.5px_2.5px_0px_#0A0A0A] hover:bg-[#EAB308] transition-all hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <Check className="h-4 w-4" />
              <span>¡Entendido, al taller!</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentSlideIndex((prev) => prev + 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#581C87] text-[#FACC15] border-2 border-black font-black uppercase shadow-[2.5px_2.5px_0px_#0A0A0A] hover:opacity-95 transition-all hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <span>Siguiente</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
