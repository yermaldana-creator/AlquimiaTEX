import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSessionUser } from "@/actions/auth.actions";
import { getFinanceDashboardData } from "@/actions/finance.actions";
import { FinanceDashboard } from "@/components/admin/finance/finance-dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Finanzas y Caja Diaria | Admin AlquimiaTex",
  description:
    "Control de caja diaria por moneda, cierre del día y compras de insumos conectadas al inventario.",
};

export default async function AdminFinanzasPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin/login");
  }

  const initialData = await getFinanceDashboardData();

  return (
    <div className="space-y-6">
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black dark:border-zinc-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#10B981] text-white font-mono text-[10px] font-bold px-2 py-0.5 border border-black uppercase shadow-[1.5px_1.5px_0px_#0A0A0A]">
              SUBMÓDULO 6
            </span>
            <span className="font-mono text-xs text-slate-600 dark:text-zinc-400">
              Caja Diaria, Cierre por Moneda y Compras Conectadas
            </span>
          </div>
          <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase text-black dark:text-white pt-1">
            Finanzas &amp; Caja del Taller
          </h1>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-zinc-700 px-3 py-1.5 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all hover:translate-x-0.5 hover:translate-y-0.5 self-start sm:self-auto"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Volver al Dashboard</span>
        </Link>
      </div>

      <FinanceDashboard initialData={initialData} />
    </div>
  );
}
