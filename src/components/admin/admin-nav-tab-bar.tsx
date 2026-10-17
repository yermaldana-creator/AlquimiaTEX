"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  Calculator,
} from "lucide-react";

export function AdminNavTabBar() {
  const pathname = usePathname();

  // No mostrar en la pantalla de login
  if (pathname === "/admin/login") {
    return null;
  }

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/admin",
    },
    {
      href: "/admin/pedidos",
      label: "Pedidos",
      icon: ShoppingBag,
      isActive: pathname.startsWith("/admin/pedidos"),
    },
    {
      href: "/admin/inventario",
      label: "Inventario",
      icon: Boxes,
      isActive: pathname.startsWith("/admin/inventario"),
    },
    {
      href: "/admin/costos",
      label: "Costos y Precios",
      icon: Calculator,
      isActive: pathname.startsWith("/admin/costos"),
    },
  ];

  return (
    <nav
      aria-label="Navegación principal del taller"
      className="w-full border-b-2 border-black dark:border-zinc-800 bg-[#F8F5EE] dark:bg-[#171717] px-4 sm:px-6 md:px-8 py-2.5 transition-colors duration-150"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 font-mono text-xs sm:text-sm font-black uppercase px-3.5 sm:px-4 py-2 border-2 border-black dark:border-zinc-700 transition-all shrink-0 select-none ${
                  active
                    ? "bg-[#FACC15] text-black shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] -translate-y-0.5"
                    : "bg-white dark:bg-[#262626] text-slate-800 dark:text-[#E5E5E5] hover:bg-slate-100 dark:hover:bg-zinc-800 shadow-[1.5px_1.5px_0px_#0A0A0A] dark:shadow-[1.5px_1.5px_0px_#000000] hover:-translate-y-0.5"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-black" : "text-slate-600 dark:text-zinc-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
