import { redirect } from "next/navigation";
import { getSessionUser } from "@/actions/auth.actions";
import { getDebts } from "@/actions/debts.actions";
import { DebtsDashboard } from "@/components/admin/debts/debts-dashboard";

export const metadata = {
  title: "Gestión de Deudas y Cuentas | AlquimiaTex Panel Admin",
  description:
    "Control bimonetario ($ / Bs.) de cuentas por cobrar a clientes y cuentas por pagar a proveedores en AlquimiaTex.",
};

export const dynamic = "force-dynamic";

export default async function DeudasAdminPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin/login");
  }

  // Carga inicial en el servidor
  const result = await getDebts();

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-6">
      <DebtsDashboard
        initialDebts={result.debts}
        initialKpis={result.kpis}
      />
    </div>
  );
}
