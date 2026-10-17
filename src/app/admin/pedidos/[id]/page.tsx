import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/actions/auth.actions";
import { getOrderById } from "@/actions/orders.actions";
import { getInventory } from "@/actions/inventory.actions";
import { OrderDetail } from "@/components/admin/order-detail";

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  const decodedId = decodeURIComponent(params.id);
  return {
    title: `Ficha de Pedido ${decodedId} | AlquimiaTex Admin`,
    description: "Ficha técnica, especificaciones de prendas, reserva de inventario y descarga de artes del pedido.",
  };
}

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin/login");
  }

  const [order, inventoryData] = await Promise.all([
    getOrderById(params.id),
    getInventory({ category: "todos" }),
  ]);

  if (!order) {
    notFound();
  }

  return <OrderDetail order={order} inventoryItems={inventoryData.items || []} />;
}
