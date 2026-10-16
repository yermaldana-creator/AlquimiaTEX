"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type AdminTheme = "light" | "dark" | "system";

interface AdminThemeContextType {
  theme: AdminTheme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: AdminTheme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export const ADMIN_THEME_STORAGE_KEY = "alquimiatex_admin_theme";

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Calcula si el sistema operativo prefiere tema oscuro
  const getSystemTheme = useCallback((): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);

  // Aplica las clases de estilo al contenedor #admin-theme-root sin tocar <html> ni <body>
  const applyThemeToRoot = useCallback((activeTheme: "light" | "dark") => {
    if (typeof document === "undefined") return;
    const root = document.getElementById("admin-theme-root");
    if (!root) return;

    if (activeTheme === "dark") {
      root.classList.add("dark");
      root.classList.add("bg-[#0F0F0F]");
      root.classList.add("text-[#F5F5F5]");
      root.classList.remove("bg-[#F5F5F5]");
      root.classList.remove("text-[#0A0A0A]");
    } else {
      root.classList.remove("dark");
      root.classList.add("bg-[#F5F5F5]");
      root.classList.add("text-[#0A0A0A]");
      root.classList.remove("bg-[#0F0F0F]");
      root.classList.remove("text-[#F5F5F5]");
    }
  }, []);

  // Inicialización al montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADMIN_THEME_STORAGE_KEY) as AdminTheme | null;
      const initialTheme: AdminTheme = saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
      setThemeState(initialTheme);

      const computed = initialTheme === "system" ? getSystemTheme() : initialTheme;
      setResolvedTheme(computed);
      applyThemeToRoot(computed);
    } catch (e) {
      console.warn("Error leyendo tema de localStorage:", e);
    }
  }, [getSystemTheme, applyThemeToRoot]);

  // Actualizar tema explícitamente
  const setTheme = useCallback(
    (newTheme: AdminTheme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(ADMIN_THEME_STORAGE_KEY, newTheme);
      } catch (e) {
        console.warn("Error guardando tema en localStorage:", e);
      }

      const computed = newTheme === "system" ? getSystemTheme() : newTheme;
      setResolvedTheme(computed);
      applyThemeToRoot(computed);
    },
    [getSystemTheme, applyThemeToRoot]
  );

  // Escuchar cambios de preferencia del sistema si está en modo "system"
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemChange = () => {
      if (theme === "system") {
        const computed = mediaQuery.matches ? "dark" : "light";
        setResolvedTheme(computed);
        applyThemeToRoot(computed);
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, [theme, applyThemeToRoot]);

  // Atajo de teclado: Ctrl + Shift + L para resetear inmediatamente a "Claro"
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "L" || e.key === "l")) {
        e.preventDefault();
        setTheme("light");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setTheme]);

  return (
    <AdminThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error("useAdminTheme debe ser utilizado dentro de AdminThemeProvider");
  }
  return context;
}
