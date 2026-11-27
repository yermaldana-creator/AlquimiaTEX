import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSessionUser } from "@/actions/auth.actions";
import { getInventory } from "@/actions/inventory.actions";
import { InventoryView } from "@/components/admin/inventory-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Inventario del Taller | Admin AlquimiaTex",
  description: "Control de materiales, telas por metro, prendas terminadas y productos del taller AlquimiaTex.",
};

export default async function AdminInventarioPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { items, kpis, countsByCategory } = await getInventory({ category: "todos" });

  return (
    <div className="space-y-6">
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black dark:border-zinc-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#06B6D4] text-black font-mono text-[10px] font-bold px-2 py-0.5 border border-black uppercase shadow-[1.5px_1.5px_0px_#0A0A0A]">
              SUBMÓDULO 2B
            </span>
            <span className="font-mono text-xs text-slate-600 dark:text-zinc-400">
              Control de Materiales, Telas y Stock Terminado
            </span>
          </div>
          <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase text-black dark:text-white pt-1">
            Inventario del Taller
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-zinc-700 px-3 py-1.5 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver al Dashboard</span>
          </Link>
        </div>
      </div>

      {/* BLOQUE UNIFICADO: KPIs + TABLA SINCRONIZADOS EN VIVO */}
      <InventoryView
        initialItems={items}
        initialKpis={kpis}
        initialCountsByCategory={countsByCategory}
      />
    </div>
  );
}
