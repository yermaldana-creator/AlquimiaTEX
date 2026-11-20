import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { marked } from "marked";

const mdPath = path.resolve("docs/MASTER-CONTEXT.md");
const htmlPath = path.resolve("docs/MASTER-CONTEXT.html");
const pdfPath = path.resolve("docs/MASTER-CONTEXT.pdf");

if (!fs.existsSync(mdPath)) {
  console.error("❌ Error: No se encontró docs/MASTER-CONTEXT.md");
  process.exit(1);
}

const mdContent = fs.readFileSync(mdPath, "utf-8");

// Convertir Mermaid block a tarjeta gráfica estilizada antes de marked
const cleanedMd = mdContent.replace(/```mermaid[\s\S]*?```/g, () => {
  return `
<div class="diagram-box">
  <div class="diagram-title">🗄️ MAPA RELACIONAL DE BASE DE DATOS (SUPABASE)</div>
  <div class="diagram-grid">
    <div class="diagram-card">
      <strong>ORDERS (Pedidos)</strong>
      <p>id, order_code, customer_name, status, delivery_date, items, inventory_reserved</p>
    </div>
    <div class="diagram-arrow">➔</div>
    <div class="diagram-card">
      <strong>INVENTORY_ITEMS (Almacén)</strong>
      <p>id, category, name, variant, quantity, unit, cost_per_unit, min_stock_alert</p>
    </div>
    <div class="diagram-arrow">➔</div>
    <div class="diagram-card">
      <strong>INVENTORY_PURCHASES</strong>
      <p>id, purchase_date, item_name, quantity, cost_usd, cost_bs, supplier</p>
    </div>
  </div>
  <div class="diagram-grid" style="margin-top: 10px;">
    <div class="diagram-card">
      <strong>PRODUCT_COST_TEMPLATES</strong>
      <p>id, product_name, margin_type, margin_value, components (fórmulas de costeo)</p>
    </div>
    <div class="diagram-arrow">➔</div>
    <div class="diagram-card">
      <strong>COST_COMPONENTS</strong>
      <p>id, name, category, cost_per_unit, unit (insumos base de costeo)</p>
    </div>
    <div class="diagram-arrow">➔</div>
    <div class="diagram-card">
      <strong>DEBTS (Deudas y Cuentas)</strong>
      <p>id, type, entity_name, amount_original, amount_paid, currency, status, payments</p>
    </div>
  </div>
</div>
`;
});

// Parsear Markdown a HTML
let htmlBody = marked.parse(cleanedMd);

// Reemplazar callouts de GitHub markdown tipo > [!IMPORTANT]
htmlBody = htmlBody.replace(
  /<blockquote>\s*<p>\s*\[!IMPORTANT\]\s*([\s\S]*?)<\/p>\s*<\/blockquote>/g,
  '<div class="callout callout-important"><div class="callout-label">⚠️ IMPORTANTE</div><div class="callout-body">$1</div></div>'
);

const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe Maestro de Transferencia de Contexto — AlquimiaTex</title>
  <style>
    @page {
      size: A4;
      margin: 14mm 14mm 16mm 14mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a1a1a;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    /* Header Superior */
    .doc-header {
      border: 3px solid #000;
      background-color: #F8F5EE;
      padding: 16px 20px;
      margin-bottom: 20px;
      box-shadow: 4px 4px 0px #000;
    }

    .doc-header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .brand-badge {
      display: inline-block;
      background-color: #FACC15;
      color: #000;
      font-weight: 900;
      font-size: 10pt;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 4px 10px;
      border: 2px solid #000;
      box-shadow: 2px 2px 0px #000;
    }

    .version-badge {
      font-family: Consolas, monospace;
      font-size: 9pt;
      font-weight: bold;
      color: #4b5563;
    }

    .doc-title {
      font-size: 18pt;
      font-weight: 900;
      text-transform: uppercase;
      color: #000;
      margin: 6px 0 4px 0;
      letter-spacing: 0.5px;
    }

    .doc-subtitle {
      font-size: 10pt;
      color: #4b5563;
      margin: 0;
      font-style: italic;
    }

    /* Tipografía y Títulos */
    h1 {
      display: none; /* Ya está en el header */
    }

    h2 {
      font-size: 13.5pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #000;
      border-bottom: 2.5px solid #000;
      padding-bottom: 5px;
      margin-top: 24px;
      margin-bottom: 12px;
      page-break-after: avoid;
    }

    h3 {
      font-size: 11.5pt;
      font-weight: 800;
      color: #111827;
      margin-top: 16px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }

    p {
      margin: 0 0 10px 0;
    }

    /* Listas */
    ul, ol {
      margin: 0 0 12px 0;
      padding-left: 22px;
    }

    li {
      margin-bottom: 4px;
    }

    /* Tablas */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0 18px 0;
      font-size: 9.5pt;
      page-break-inside: avoid;
      border: 2px solid #000;
      box-shadow: 3px 3px 0px #000;
    }

    th {
      background-color: #FACC15;
      color: #000;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 10px;
      border: 1.5px solid #000;
      text-align: left;
    }

    td {
      padding: 6px 10px;
      border: 1px solid #d1d5db;
      background-color: #fff;
    }

    tr:nth-child(even) td {
      background-color: #f9fafb;
    }

    /* Bloques de Código */
    pre {
      background-color: #1E1E1E;
      color: #E5E7EB;
      padding: 12px 14px;
      border: 2px solid #000;
      box-shadow: 3px 3px 0px #000;
      border-radius: 0px;
      font-family: Consolas, "Courier New", monospace;
      font-size: 9pt;
      line-height: 1.4;
      overflow-x: auto;
      margin: 10px 0 14px 0;
      page-break-inside: avoid;
    }

    code {
      font-family: Consolas, "Courier New", monospace;
      font-size: 9pt;
      background-color: #F3F4F6;
      color: #B91C1C;
      padding: 1px 4px;
      border: 1px solid #E5E7EB;
    }

    pre code {
      background-color: transparent;
      color: #FACC15;
      padding: 0;
      border: none;
    }

    /* Callouts */
    .callout {
      border: 2px solid #000;
      box-shadow: 3px 3px 0px #000;
      padding: 12px 14px;
      margin: 14px 0;
      page-break-inside: avoid;
    }

    .callout-important {
      background-color: #FEF08A;
      border-color: #854D0E;
    }

    .callout-label {
      font-weight: 900;
      font-size: 9.5pt;
      color: #713F12;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .callout-body {
      font-size: 9.5pt;
      color: #1f2937;
    }

    /* Diagram Box */
    .diagram-box {
      border: 2px solid #000;
      box-shadow: 3px 3px 0px #000;
      background-color: #F8F5EE;
      padding: 14px;
      margin: 14px 0;
      page-break-inside: avoid;
    }

    .diagram-title {
      font-weight: 900;
      font-size: 10pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      text-align: center;
      color: #000;
    }

    .diagram-grid {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }

    .diagram-card {
      flex: 1;
      background-color: #fff;
      border: 1.5px solid #000;
      padding: 8px 10px;
      box-shadow: 2px 2px 0px #000;
      font-size: 8.5pt;
    }

    .diagram-card strong {
      display: block;
      color: #000;
      margin-bottom: 3px;
      font-size: 9pt;
    }

    .diagram-card p {
      margin: 0;
      color: #4b5563;
      font-family: Consolas, monospace;
      font-size: 7.5pt;
      line-height: 1.25;
    }

    .diagram-arrow {
      font-weight: 900;
      font-size: 12pt;
      color: #000;
    }

    /* Links */
    a {
      color: #1D4ED8;
      text-decoration: none;
      font-weight: 600;
    }

    /* Separadores */
    hr {
      border: none;
      border-top: 2px solid #E5E7EB;
      margin: 20px 0;
    }
  </style>
</head>
<body>

  <div class="doc-header">
    <div class="doc-header-top">
      <div class="brand-badge">ALQUIMIATEX — TALLER TEXTIL</div>
      <div class="version-badge">v1.5.0 (PRODUCCIÓN) | 20 NOV 2026</div>
    </div>
    <div class="doc-title">INFORME MAESTRO DE TRANSFERENCIA DE CONTEXTO</div>
    <div class="doc-subtitle">Documento Oficial de Continuidad Técnica, Arquitectura del Sistema y Operación del Negocio</div>
  </div>

  ${htmlBody}

</body>
</html>
`;

fs.writeFileSync(htmlPath, fullHtml, "utf-8");
console.log(`✓ HTML compilado en: ${htmlPath}`);

// Compilar a PDF usando Microsoft Edge en modo headless
console.log("⏳ Generando archivo PDF con Microsoft Edge...");
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

try {
  execFileSync(
    edgePath,
    [
      "--headless",
      "--disable-gpu",
      "--no-pdf-header-footer",
      `--print-to-pdf=${pdfPath}`,
      `file:///${htmlPath.replace(/\\/g, "/")}`,
    ],
    { stdio: "inherit" }
  );

  if (fs.existsSync(pdfPath)) {
    const stats = fs.statSync(pdfPath);
    console.log(`🎉 ¡PDF generado con éxito!`);
    console.log(`📁 Ruta: ${pdfPath}`);
    console.log(`📊 Tamaño: ${(stats.size / 1024).toFixed(1)} KB`);
  } else {
    console.error("❌ Error: No se encontró el PDF generado.");
    process.exit(1);
  }
} catch (err) {
  console.error("❌ Error ejecutando Edge headless:", err.message);
  process.exit(1);
}
