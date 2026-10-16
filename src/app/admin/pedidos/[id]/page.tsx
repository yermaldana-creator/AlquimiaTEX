import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderById } from "@/actions/orders.actions";
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
    description: "Ficha técnica, especificaciones de prendas y descarga de artes del pedido.",
  };
}

export const revalidate = 0; // Datos frescos

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const order = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  return <OrderDetail order={order} />;
}
