import { redirect } from "next/navigation";
import { getSessionUser } from "@/actions/auth.actions";
import {
  getProductCostTemplates,
  getCostComponents,
} from "@/actions/costs.actions";
import { CostsView } from "@/components/admin/costs-view";

export const metadata = {
  title: "Costos y Precios de Venta | AlquimiaTex Panel Admin",
  description:
    "Gestión de costos de fabricación, insumos, fórmulas de producto, cálculo de márgenes y simulador de volumen para socios de AlquimiaTex.",
};

export const dynamic = "force-dynamic";

export default async function CostosAdminPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin/login");
  }

  // Carga inicial en el servidor con hidratación dinámica de precios
  const [templatesResult, componentsResult] = await Promise.all([
    getProductCostTemplates(),
    getCostComponents(),
  ]);

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-6">
      <CostsView
        initialTemplates={templatesResult.templates}
        initialComponents={componentsResult.components}
        initialKpis={templatesResult.kpis}
      />
    </div>
  );
}
