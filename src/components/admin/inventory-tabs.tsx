"use client";

import { INVENTORY_CATEGORIES, INVENTORY_CATEGORY_CONFIG } from "@/lib/constants";
import type { InventoryCategory } from "@/types";

interface InventoryTabsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  countsByCategory: Record<string, number>;
}

export function InventoryTabs({
  selectedCategory,
  onSelectCategory,
  countsByCategory,
}: InventoryTabsProps) {
  const totalCount = countsByCategory.todos || 0;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
      {/* PESTAÑA TODOS */}
      <button
        type="button"
        onClick={() => onSelectCategory("todos")}
        className={`px-3 py-1.5 border-2 border-black font-bold uppercase transition-all shrink-0 ${
          selectedCategory === "todos"
            ? "bg-black text-[#FACC15] shadow-[2px_2px_0px_#0A0A0A] -translate-y-0.5"
            : "bg-[#F8F5EE] text-slate-800 hover:bg-white shadow-[1px_1px_0px_#0A0A0A]"
        }`}
      >
        <span>Todos ({totalCount})</span>
      </button>

      {/* 4 CATEGORÍAS OFICIALES CMYK */}
      {INVENTORY_CATEGORIES.map((catKey) => {
        const config = INVENTORY_CATEGORY_CONFIG[catKey];
        const isSelected = selectedCategory === catKey;
        const count = countsByCategory[catKey] || 0;

        return (
          <button
            key={catKey}
            type="button"
            onClick={() => onSelectCategory(catKey as InventoryCategory)}
            className={`px-3 py-1.5 border-2 border-black font-bold uppercase transition-all shrink-0 ${
              isSelected
                ? "bg-[#581C87] text-[#FACC15] shadow-[2px_2px_0px_#0A0A0A] -translate-y-0.5"
                : `${config.bg} ${config.text} hover:opacity-90 shadow-[1px_1px_0px_#0A0A0A]`
            }`}
            title={config.description}
          >
            <span>{config.shortLabel}</span>
            <span className="ml-1.5 px-1 bg-white text-black text-[10px] border border-black font-mono">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
