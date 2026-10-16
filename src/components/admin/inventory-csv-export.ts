import type { InventoryItem } from "@/types";

/**
 * Genera y descarga un archivo CSV con el inventario actual.
 * Incluye el BOM UTF-8 (\uFEFF) para compatibilidad nativa con Microsoft Excel en español.
 */
export function exportInventoryToCsv(items: InventoryItem[], filename = "inventario-alquimiatex.csv") {
  const headers = [
    "CATEGORIA",
    "NOMBRE",
    "VARIANTE",
    "CANTIDAD",
    "UNIDAD",
    "STOCK_MINIMO",
    "COSTO_UNITARIO_USD",
    "VALOR_TOTAL_USD",
    "NOTAS",
    "ESTADO",
  ];

  const rows = items.map((item) => {
    const categoryLabel =
      item.category === "material"
        ? "Material/Insumo"
        : item.category === "tela"
        ? "Tela por Metro"
        : item.category === "prenda"
        ? "Prenda en Stock"
        : "Otro Producto";

    const totalValue = (Number(item.quantity || 0) * Number(item.cost_per_unit || 0)).toFixed(2);
    const statusLabel = item.archived_at ? "Archivado" : "Activo";

    return [
      escapeCsv(categoryLabel),
      escapeCsv(item.name),
      escapeCsv(item.variant || ""),
      item.quantity,
      escapeCsv(item.unit),
      item.min_stock_alert,
      item.cost_per_unit,
      totalValue,
      escapeCsv(item.notes || ""),
      statusLabel,
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

/**
 * Descarga una plantilla CSV vacía con filas de ejemplo para rellenar en Excel.
 */
export function downloadCsvTemplate(filename = "plantilla-inventario-alquimiatex.csv") {
  const headers = [
    "CATEGORIA (material / tela / prenda / otro)",
    "NOMBRE",
    "VARIANTE",
    "CANTIDAD",
    "UNIDAD (unidad / metro / ml / hoja / resma / rollo)",
    "STOCK_MINIMO",
    "COSTO_UNITARIO_USD",
    "NOTAS",
  ];

  const sampleRows = [
    ["tela", "Microdurazno Heavy", "Blanca", "25.00", "metro", "10", "4.50", "Rollo nuevo de La Dolorita"],
    ["prenda", "Franela Microdurazno", "Blanca Dama M", "5", "unidad", "2", "3.00", "Para sublimación rápida"],
    ["material", "Tinta Sublimación", "Cian", "500.00", "ml", "100", "12.00", "Botella original"],
    ["otro", "Taza 11oz Blanca", "Cerámica Clásica", "36", "unidad", "12", "1.20", "Caja sellada"],
  ].map((row) => row.map(escapeCsv).join(","));

  const csvContent = "\uFEFF" + [headers.join(","), ...sampleRows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

function escapeCsv(value: string | number): string {
  if (value === null || value === undefined) return '""';
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return `"${stringValue}"`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
