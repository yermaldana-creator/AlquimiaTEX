"use client";

import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { useAdminTheme, type AdminTheme } from "./theme-provider";

export function ThemeSwitcher() {
  const { theme, setTheme } = useAdminTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const options: { id: AdminTheme; label: string; sublabel: string; icon: typeof Sun }[] = [
    {
      id: "light",
      label: "Claro",
      sublabel: "Fondo claro profesional",
      icon: Sun,
    },
    {
      id: "dark",
      label: "Oscuro",
      sublabel: "Negro OLED de taller",
      icon: Moon,
    },
    {
      id: "system",
      label: "Auto (Sistema)",
      sublabel: "Sigue a tu computadora",
      icon: Laptop,
    },
  ];

  const currentOption = options.find((o) => o.id === theme) || options[2];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* BOTÓN DISPARADOR */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-xs font-bold uppercase bg-white dark:bg-[#262626] text-black dark:text-[#F5F5F5] border-2 border-black dark:border-zinc-700 shadow-[1.5px_1.5px_0px_#0A0A0A] dark:shadow-[1.5px_1.5px_0px_#000000] hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all hover:translate-x-0.5 hover:translate-y-0.5"
        title={`Tema actual: ${currentOption.label}. Haz clic para cambiar`}
        aria-label="Selector de tema claro/oscuro/auto"
      >
        <CurrentIcon className="h-3.5 w-3.5 text-amber-500 dark:text-yellow-400" />
        <span className="hidden sm:inline">{currentOption.label}</span>
        <span className="text-[9px] font-mono select-none text-slate-500 dark:text-zinc-400">▼</span>
      </button>

      {/* MENÚ DESPLEGABLE */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] z-50 p-1.5 font-mono text-xs animate-in fade-in zoom-in-95">
          <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 mb-1">
            Modo de Pantalla
          </div>

          <div className="space-y-1">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 text-left font-bold transition-colors ${
                    isSelected
                      ? "bg-[#FACC15] text-black border border-black"
                      : "text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <div>
                      <div className="leading-tight">{opt.label}</div>
                      <div className={`text-[10px] font-normal ${isSelected ? "text-black/80" : "text-slate-500 dark:text-zinc-400"}`}>
                        {opt.sublabel}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* ATAJO DE TECLADO INFO */}
          <div className="mt-2 pt-1.5 border-t border-dashed border-slate-300 dark:border-zinc-800 text-[10px] text-slate-500 dark:text-zinc-400 px-1 leading-tight">
            <span>Atajo: </span>
            <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-black dark:text-zinc-200 rounded font-sans">
              Ctrl+Shift+L
            </kbd>{" "}
            <span>fuerza modo claro.</span>
          </div>
        </div>
      )}
    </div>
  );
}
