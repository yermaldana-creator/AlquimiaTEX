"use client";

import { useState } from "react";
import { X, HelpCircle, ChevronDown, Sparkles } from "lucide-react";
import { WORKSHOP_FAQS } from "@/lib/constants";

interface AdminHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestartTutorial: () => void;
}

export function AdminHelpModal({
  isOpen,
  onClose,
  onRestartTutorial,
}: AdminHelpModalProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [searchFilter, setSearchFilter] = useState("");

  if (!isOpen) return null;

  const filteredFaqs = WORKSHOP_FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchFilter.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#F8F5EE] dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 max-w-xl w-full shadow-[8px_8px_0px_#0A0A0A] dark:shadow-[8px_8px_0px_#000000] p-5 sm:p-6 space-y-4 my-8 max-h-[90vh] flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b-2 border-black dark:border-zinc-700 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#FACC15] text-black border border-black shadow-[1px_1px_0px_#0A0A0A]">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase text-black dark:text-white leading-none">
                Ayuda del Taller & Dudas Frecuentes
              </h3>
              <p className="font-mono text-[11px] text-slate-600 dark:text-zinc-400 pt-0.5">
                Respuestas directas y sin tecnicismos para el día a día
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 bg-white dark:bg-zinc-800 border border-black dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 text-black dark:text-white shadow-[1px_1px_0px_#0A0A0A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* BUSCADOR RÁPIDO & BOTÓN VER TUTORIAL DE NUEVO */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Buscar duda (ej: entregar, tela, zip)..."
            className="flex-1 p-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 font-mono text-xs text-black dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
          />

          <button
            type="button"
            onClick={() => {
              onClose();
              onRestartTutorial();
            }}
            className="inline-flex items-center justify-center gap-1.5 font-mono text-xs font-bold uppercase bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-zinc-700 px-3 py-2 shadow-[1.5px_1.5px_0px_#0A0A0A] dark:shadow-[1.5px_1.5px_0px_#000000] hover:bg-[#FACC15] dark:hover:bg-[#FACC15] dark:hover:text-black transition-all shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#581C87] dark:text-[#C084FC]" />
            <span>Ver tutorial de nuevo</span>
          </button>
        </div>

        {/* LISTA DE PREGUNTAS FRECUENTES (SCROLLABLE) */}
        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
          {filteredFaqs.length === 0 ? (
            <p className="font-mono text-xs text-slate-500 dark:text-zinc-400 text-center py-6">
              No encontramos respuestas para esa búsqueda. Escríbele al grupo de WhatsApp de socios si necesitas apoyo.
            </p>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpenItem = openFaqIndex === idx;

              return (
                <div
                  key={idx}
                  className="border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpenItem ? null : idx)}
                    className="w-full p-3 text-left font-mono text-xs font-black uppercase text-black dark:text-white bg-[#FFFDF7] dark:bg-zinc-900 flex items-center justify-between gap-2 hover:bg-[#FEFCE8] dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        isOpenItem ? "rotate-180 text-black dark:text-white" : "text-slate-500 dark:text-zinc-400"
                      }`}
                    />
                  </button>

                  {isOpenItem && (
                    <div className="p-3 bg-white dark:bg-zinc-850 font-mono text-xs text-slate-800 dark:text-zinc-200 leading-relaxed border-t border-black dark:border-zinc-700">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* PIE */}
        <div className="pt-2 border-t border-dashed border-slate-300 dark:border-zinc-700 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400 shrink-0">
          <span>AlquimiaTex • Taller La Dolorita</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-black dark:text-white uppercase underline hover:text-[#581C87] dark:hover:text-[#FACC15]"
          >
            Cerrar ventana
          </button>
        </div>
      </div>
    </div>
  );
}
