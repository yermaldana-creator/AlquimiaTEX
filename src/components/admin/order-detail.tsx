"use client";

import { useState } from "react";
import Link from "next/link";
import JSZip from "jszip";
import {
  ArrowLeft,
  Calendar,
  MessageCircle,
  ExternalLink,
  Download,
  FileArchive,
  Layers,
  Sparkles,
  CreditCard,
  User,
  Clock,
  Loader2,
} from "lucide-react";
import { normalizeOrderStatus } from "@/lib/constants";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderStatusSelect } from "./order-status-select";
import type { AdminOrder, OrderStatus } from "@/types";

interface OrderDetailProps {
  order: AdminOrder;
}

function cleanPhoneForWhatsApp(phone: string): string {
  if (!phone) return "";
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("0")) {
    clean = "58" + clean.substring(1);
  }
  if (!clean.startsWith("58") && clean.length === 10) {
    clean = "58" + clean;
  }
  return clean;
}

function getDeliveryBadge(dateStr: string) {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Atrasado (${Math.abs(diffDays)}d)`,
      color: "bg-red-100 text-red-900 border-red-500 font-bold",
    };
  }
  if (diffDays === 0) {
    return {
      label: "¡Entrega Hoy!",
      color: "bg-[#FACC15] text-black border-black font-black",
    };
  }
  if (diffDays === 1) {
    return {
      label: "Entrega Mañana",
      color: "bg-amber-100 text-amber-900 border-amber-400 font-bold",
    };
  }
  return {
    label: `En ${diffDays} días`,
    color: "bg-slate-100 text-slate-700 border-slate-300",
  };
}

export function OrderDetail({ order }: OrderDetailProps) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(
    normalizeOrderStatus(order.status)
  );
  const [isZipping, setIsZipping] = useState(false);
  const [downloadingImageIdx, setDownloadingImageIdx] = useState<number | null>(null);

  const deliveryBadge = getDeliveryBadge(order.delivery_date);
  const waNumber = cleanPhoneForWhatsApp(order.customer_phone);
  const waMessage = `¡Hola ${order.customer_name}! Te escribimos del taller AlquimiaTex respecto a tu pedido ${order.order_code}.`;
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  const isDocena = (order.order_pricing_type || order.payment_type) === "docena";
  const totalQuantity = (order.items || []).reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  // Recolectar todas las imágenes del pedido
  const orderImages: { url: string; filename: string; itemIndex: number; isAi: boolean }[] = [];
  (order.items || []).forEach((item, idx) => {
    const rawCode = (order.order_code || "pedido").replace(/#/g, "");
    if (item.referenceImageUrl || (item.referenceImage && !item.referenceImage.startsWith("data:"))) {
      const url = item.referenceImageUrl || item.referenceImage || "";
      orderImages.push({
        url,
        filename: `${rawCode}-item${idx + 1}-referencia.jpg`,
        itemIndex: idx + 1,
        isAi: false,
      });
    } else if (item.referenceImage && item.referenceImage.startsWith("data:")) {
      orderImages.push({
        url: item.referenceImage,
        filename: `${rawCode}-item${idx + 1}-referencia.jpg`,
        itemIndex: idx + 1,
        isAi: false,
      });
    }

    if (item.aiGeneratedImage) {
      orderImages.push({
        url: item.aiGeneratedImage,
        filename: `${rawCode}-item${idx + 1}-arte-ia.png`,
        itemIndex: idx + 1,
        isAi: true,
      });
    }
  });

  // Descargar una imagen individual
  const handleDownloadSingleImage = async (url: string, filename: string, imgKey: number) => {
    setDownloadingImageIdx(imgKey);
    try {
      if (url.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error("Error al descargar imagen:", err);
      // Fallback: abrir en nueva ventana
      window.open(url, "_blank");
    } finally {
      setDownloadingImageIdx(null);
    }
  };

  // Descargar todas las imágenes en ZIP usando JSZip
  const handleDownloadAllZip = async () => {
    if (orderImages.length === 0) {
      alert("Este pedido no contiene imágenes de referencia o IA para descargar.");
      return;
    }

    setIsZipping(true);
    try {
      const zip = new JSZip();
      const rawCode = (order.order_code || "pedido").replace(/#/g, "");
      const folder = zip.folder(`artes-${rawCode}`) || zip;

      for (let i = 0; i < orderImages.length; i++) {
        const img = orderImages[i];
        if (img.url.startsWith("data:")) {
          // Extraer base64
          const base64Data = img.url.replace(/^data:image\/\w+;base64,/, "");
          folder.file(img.filename, base64Data, { base64: true });
        } else {
          try {
            const res = await fetch(img.url);
            const blob = await res.blob();
            folder.file(img.filename, blob);
          } catch (fetchErr) {
            console.warn(`No se pudo descargar la imagen ${img.filename}:`, fetchErr);
          }
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const blobUrl = window.URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${rawCode}-artes-alquimiatex.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error al generar archivo ZIP:", err);
      alert("Hubo un error al empaquetar las imágenes en ZIP. Intenta descargarlas individualmente.");
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* NAVEGACIÓN SUPERIOR Y ACCIONES */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black dark:border-zinc-700 pb-4">
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-zinc-700 px-3 py-1.5 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all hover:translate-x-0.5 hover:translate-y-0.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a la Lista</span>
        </Link>

        <div className="flex items-center gap-2">
          {orderImages.length > 0 && (
            <button
              onClick={handleDownloadAllZip}
              disabled={isZipping}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-black uppercase bg-[#FACC15] text-black border-2 border-black px-3.5 py-1.5 shadow-[3px_3px_0px_#0A0A0A] hover:bg-[#EAB308] transition-all hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
              title="Descargar todas las imágenes de este pedido en un archivo .zip"
            >
              {isZipping ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                  <span>Generando ZIP...</span>
                </>
              ) : (
                <>
                  <FileArchive className="h-4 w-4 text-black" />
                  <span>Descargar todas las imágenes (ZIP)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ENCABEZADO PRINCIPAL DE LA FICHA */}
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-5 shadow-[6px_6px_0px_#0A0A0A] dark:shadow-[6px_6px_0px_#000000] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black dark:border-zinc-700 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-oswald text-3xl sm:text-4xl font-black uppercase text-black dark:text-white">
                {order.order_code}
              </span>
              <OrderStatusBadge status={currentStatus} size="lg" />
            </div>
            <p className="font-mono text-xs text-slate-600 dark:text-zinc-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
              <span>
                Registrado el{" "}
                {order.created_at
                  ? new Date(order.created_at).toLocaleString("es-VE", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Fecha no disponible"}
              </span>
            </p>
          </div>

          {/* CAMBIADOR DE ESTADO EN CABECERA */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-[#F8F5EE] dark:bg-zinc-900 p-3 border-2 border-black dark:border-zinc-700">
            <span className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">
              Estado Actual:
            </span>
            <OrderStatusSelect
              orderId={order.id}
              currentStatus={currentStatus}
              onStatusUpdated={(newStatus) => setCurrentStatus(newStatus)}
            />
          </div>
        </div>

        {/* REJILLA: DATOS DEL CLIENTE + RESUMEN FINANCIERO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* DATOS DEL CLIENTE */}
          <div className="border-2 border-black dark:border-zinc-700 p-4 bg-[#FFFDF7] dark:bg-zinc-900 space-y-3">
            <div className="flex items-center gap-2 text-black dark:text-white font-oswald text-base uppercase border-b border-black dark:border-zinc-700 pb-1.5 font-black">
              <User className="h-4 w-4 text-[#581C87] dark:text-[#C084FC]" />
              <span>Información del Cliente</span>
            </div>

            <div className="font-mono text-xs space-y-2">
              <div>
                <span className="text-slate-500 dark:text-zinc-400 block text-[10px] uppercase">Nombre:</span>
                <strong className="text-black dark:text-white text-sm">{order.customer_name}</strong>
              </div>

              <div>
                <span className="text-slate-500 dark:text-zinc-400 block text-[10px] uppercase">Teléfono:</span>
                <span className="text-black dark:text-zinc-200 text-sm">{order.customer_phone}</span>
              </div>

              <div>
                <span className="text-slate-500 dark:text-zinc-400 block text-[10px] uppercase">
                  Fecha Prometida de Entrega:
                </span>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="font-bold text-black dark:text-zinc-200 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-600 dark:text-zinc-400" />
                    {order.delivery_date || "No especificada"}
                  </span>
                  {deliveryBadge && (
                    <span className={`px-2 py-0.5 text-[10px] border ${deliveryBadge.color}`}>
                      {deliveryBadge.label}
                    </span>
                  )}
                </div>
              </div>

              {/* BOTÓN DIRECTO DE WHATSAPP */}
              <div className="pt-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-xs font-black uppercase text-emerald-950 bg-emerald-400 hover:bg-emerald-300 border-2 border-black px-3.5 py-2 shadow-[2px_2px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5 w-full justify-center"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-950" />
                  <span>Contactar por WhatsApp</span>
                  <ExternalLink className="h-3 w-3 text-emerald-950" />
                </a>
              </div>
            </div>
          </div>

          {/* RESUMEN FINANCIERO Y DE PAGO */}
          <div className="border-2 border-black dark:border-zinc-700 p-4 bg-[#FFFDF7] dark:bg-zinc-900 space-y-3">
            <div className="flex items-center gap-2 text-black dark:text-white font-oswald text-base uppercase border-b border-black dark:border-zinc-700 pb-1.5 font-black">
              <CreditCard className="h-4 w-4 text-[#06B6D4]" />
              <span>Condiciones & Pago</span>
            </div>

            <div className="font-mono text-xs space-y-2.5">
              <div>
                <span className="text-slate-500 dark:text-zinc-400 block text-[10px] uppercase">
                  Modalidad de Pedido:
                </span>
                <span
                  className={`inline-block font-mono text-xs font-black uppercase px-2 py-0.5 border border-black dark:border-zinc-700 mt-1 ${
                    isDocena ? "bg-[#581C87] text-[#FACC15]" : "bg-white dark:bg-zinc-800 text-black dark:text-zinc-200"
                  }`}
                >
                  {isDocena ? "Pedido al Mayor (Docena)" : "Pedido al Detal (Unidad)"}
                </span>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 pt-1">
                  {isDocena
                    ? "Condición: 50% de abono para iniciar producción y 50% restante contra entrega."
                    : "Condición: Pago del 100% anticipado para confección y estampado."}
                </p>
              </div>

              <div>
                <span className="text-slate-500 dark:text-zinc-400 block text-[10px] uppercase">Método de Pago:</span>
                <strong className="text-black dark:text-zinc-200 uppercase">
                  {order.payment_method || "No especificado"}
                </strong>
              </div>

              <div className="pt-1 border-t border-dashed border-slate-300 dark:border-zinc-700 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 dark:text-zinc-400 block text-[10px] uppercase">
                    Total Prendas:
                  </span>
                  <strong className="text-black dark:text-white text-base">{totalQuantity} piezas</strong>
                </div>

                <div className="text-right">
                  <span className="text-slate-500 dark:text-zinc-400 block text-[10px] uppercase">
                    Imágenes Adjuntas:
                  </span>
                  <span className="font-bold text-black dark:text-zinc-200">{orderImages.length} archivos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LISTA DETALLADA DE PRODUCTOS */}
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-5 shadow-[6px_6px_0px_#0A0A0A] dark:shadow-[6px_6px_0px_#000000] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black dark:border-zinc-700 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-black dark:text-white" />
            <h2 className="font-oswald text-xl font-black uppercase text-black dark:text-white">
              Prendas & Especificaciones Técnicas
            </h2>
          </div>
          <span className="font-mono text-xs font-bold bg-[#FACC15] text-black px-2.5 py-0.5 border border-black">
            {order.items?.length || 0} modelos
          </span>
        </div>

        {order.items && order.items.length > 0 ? (
          <div className="space-y-4">
            {order.items.map((item, index) => {
              return (
                <div
                  key={item.id || index}
                  className="border-2 border-black dark:border-zinc-700 p-4 bg-[#F8F5EE] dark:bg-zinc-900 shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] space-y-3"
                >
                  {/* ENCABEZADO DEL ITEM */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black dark:border-zinc-700 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black bg-black dark:bg-zinc-800 text-[#FACC15] px-2 py-0.5 border border-black dark:border-zinc-700">
                        ITEM #{index + 1}
                      </span>
                      <h3 className="font-oswald text-lg font-black uppercase text-black dark:text-white">
                        {item.product === "camisa"
                          ? "Camisa / Franela"
                          : item.product === "mousepad"
                          ? "Mousepad"
                          : item.product === "rompecabezas"
                          ? "Rompecabezas"
                          : "Producto Especial"}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 px-2.5 py-1 border border-black dark:border-zinc-700 shadow-[1.5px_1.5px_0px_#0A0A0A] dark:shadow-[1.5px_1.5px_0px_#000000]">
                        Cantidad: {item.quantity} {item.quantity > 1 ? "unidades" : "unidad"}
                      </span>
                      {item.aiGeneratedImage && (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-black bg-[#581C87] text-[#FACC15] px-2 py-1 border border-black uppercase">
                          <Sparkles className="h-3 w-3" />
                          <span>Diseñado con IA</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ESPECIFICACIONES TÉCNICAS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 font-mono text-xs">
                    {/* TALLA */}
                    {item.shirtSize && (
                      <div className="bg-white dark:bg-zinc-800 p-2 border border-black dark:border-zinc-700">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase block">Talla:</span>
                        <strong className="text-black dark:text-zinc-100">{item.shirtSize}</strong>
                      </div>
                    )}

                    {/* CORTE */}
                    {item.shirtCut && (
                      <div className="bg-white dark:bg-zinc-800 p-2 border border-black dark:border-zinc-700">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase block">Corte:</span>
                        <strong className="text-black dark:text-zinc-100 uppercase">{item.shirtCut}</strong>
                      </div>
                    )}

                    {/* TELA */}
                    {item.shirtFabric && (
                      <div className="bg-white dark:bg-zinc-800 p-2 border border-black dark:border-zinc-700">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase block">Tela:</span>
                        <strong className="text-black dark:text-zinc-100">{item.shirtFabric}</strong>
                      </div>
                    )}

                    {/* COLOR */}
                    {item.shirtColor && (
                      <div className="bg-white dark:bg-zinc-800 p-2 border border-black dark:border-zinc-700">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase block">Color:</span>
                        <strong className="text-black dark:text-zinc-100 uppercase">{item.shirtColor}</strong>
                      </div>
                    )}

                    {/* MEDIDAS MOUSEPAD */}
                    {item.mousepadSize && (
                      <div className="bg-white dark:bg-zinc-800 p-2 border border-black dark:border-zinc-700">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase block">Medida:</span>
                        <strong className="text-black dark:text-zinc-100">{item.mousepadSize}</strong>
                      </div>
                    )}

                    {/* PIEZAS ROMPECABEZAS */}
                    {item.puzzlePieces && (
                      <div className="bg-white dark:bg-zinc-800 p-2 border border-black dark:border-zinc-700">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase block">Piezas:</span>
                        <strong className="text-black dark:text-zinc-100">{item.puzzlePieces} piezas</strong>
                      </div>
                    )}
                  </div>

                  {/* NOTAS O INDICACIONES */}
                  {(item.notes || item.description) && (
                    <div className="bg-[#FFFDF7] dark:bg-zinc-850 p-2.5 border border-black dark:border-zinc-700 font-mono text-xs">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-bold block">
                        Instrucciones del Cliente:
                      </span>
                      <p className="text-slate-800 dark:text-zinc-200 pt-0.5">{item.notes || item.description}</p>
                    </div>
                  )}

                  {/* PREVISUALIZACIÓN DE IMÁGENES & BOTONES DE DESCARGA */}
                  {(item.referenceImage || item.referenceImageUrl || item.aiGeneratedImage) && (
                    <div className="pt-2 border-t border-black dark:border-zinc-700 space-y-2">
                      <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase block">
                        Arte & Referencias Visuales:
                      </span>

                      <div className="flex flex-wrap items-center gap-4">
                        {/* IMAGEN DE REFERENCIA */}
                        {(item.referenceImageUrl || item.referenceImage) && (
                          <div className="flex flex-col gap-1.5">
                            <div className="relative h-32 w-32 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] overflow-hidden group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.referenceImageUrl || item.referenceImage}
                                alt={`Referencia item ${index + 1}`}
                                className="h-full w-full object-contain p-1"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const url = item.referenceImageUrl || item.referenceImage || "";
                                const rawCode = (order.order_code || "pedido").replace(/#/g, "");
                                handleDownloadSingleImage(
                                  url,
                                  `${rawCode}-item${index + 1}-referencia.jpg`,
                                  index * 2
                                );
                              }}
                              disabled={downloadingImageIdx === index * 2}
                              className="inline-flex items-center justify-center gap-1 font-mono text-[11px] font-bold uppercase bg-white dark:bg-zinc-800 text-black dark:text-white border border-black dark:border-zinc-700 px-2 py-1 shadow-[1.5px_1.5px_0px_#0A0A0A] dark:shadow-[1.5px_1.5px_0px_#000000] hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
                            >
                              {downloadingImageIdx === index * 2 ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Download className="h-3 w-3 text-black dark:text-white" />
                              )}
                              <span>Descargar</span>
                            </button>
                          </div>
                        )}

                        {/* ARTE GENERADO POR IA */}
                        {item.aiGeneratedImage && (
                          <div className="flex flex-col gap-1.5">
                            <div className="relative h-32 w-32 bg-[#FAF5FF] dark:bg-purple-950/40 border-2 border-[#581C87] dark:border-purple-600 shadow-[2px_2px_0px_#581C87] dark:shadow-[2px_2px_0px_#000000] overflow-hidden group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.aiGeneratedImage}
                                alt={`Arte IA item ${index + 1}`}
                                className="h-full w-full object-contain p-1"
                              />
                              <span className="absolute top-1 left-1 bg-[#581C87] text-[#FACC15] text-[9px] font-mono font-bold px-1 border border-black">
                                IA
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const rawCode = (order.order_code || "pedido").replace(/#/g, "");
                                handleDownloadSingleImage(
                                  item.aiGeneratedImage!,
                                  `${rawCode}-item${index + 1}-arte-ia.png`,
                                  index * 2 + 1
                                );
                              }}
                              disabled={downloadingImageIdx === index * 2 + 1}
                              className="inline-flex items-center justify-center gap-1 font-mono text-[11px] font-bold uppercase bg-[#581C87] text-[#FACC15] border border-black px-2 py-1 shadow-[1.5px_1.5px_0px_#0A0A0A] hover:opacity-95 transition-all hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
                            >
                              {downloadingImageIdx === index * 2 + 1 ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Download className="h-3 w-3" />
                              )}
                              <span>Descargar Arte IA</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="font-mono text-xs text-slate-500 dark:text-zinc-400">
            No hay prendas registradas para este pedido.
          </p>
        )}
      </div>
    </div>
  );
}
