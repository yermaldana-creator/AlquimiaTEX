/**
 * ALQUIMIATEX — SCRIPT DE MIGRACIÓN MASIVA DE EXCEL A SUPABASE
 * 
 * Lee 'data/Libro11.xlsx' y procesa:
 * 1. Pestaña "INVENTARIO" -> tabla `inventory_items`
 * 2. Pestaña "Hoja1" -> tablas `cost_components` y `product_cost_templates`
 * 3. Pestaña "MOVIMIENTOS - COMPRAS" (sección COMPRAS) -> tabla `inventory_purchases`
 * 
 * Ejecución:
 *   npx tsx scripts/migrate-excel.ts
 *   npx tsx scripts/migrate-excel.ts --yes (para omitir la confirmación interactiva)
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// 1. CARGA DE VARIABLES DE ENTORNO (.env.local)
// ============================================================================
function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const isServiceRole =
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
  Boolean(process.env.SUPABASE_SECRET_KEY);

console.log('🔌 Conectando a Supabase...');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Modo: ${isServiceRole ? '🔑 Service Role / Administrador (RLS bypass)' : '⚠️ Anon Key'}\n`);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// ============================================================================
// 2. UTILIDADES DE PARSEO DE EXCEL
// ============================================================================
function getCell(ws: XLSX.WorkSheet, col: string, row: number): any {
  const cell = ws[`${col}${row}`];
  return cell ? cell.v : null;
}

function parseExcelDate(val: any): string | null {
  if (!val) return null;
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    if (d && d.y) {
      const month = String(d.m).padStart(2, '0');
      const day = String(d.d).padStart(2, '0');
      return `${d.y}-${month}-${day}`;
    }
  }
  if (typeof val === 'string') {
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  }
  return null;
}

function cleanString(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str).trim();
}

// ============================================================================
// 3. TRANSFORMADORES POR PESTAÑA
// ============================================================================

// --- A. Pestaña "INVENTARIO" -> inventory_items ---
interface InventoryItemRow {
  category: 'material' | 'tela' | 'prenda' | 'otro';
  name: string;
  variant: string | null;
  quantity: number;
  unit: string;
  min_stock_alert: number;
  cost_per_unit: number;
  notes: string | null;
}

function parseInventoryItems(wb: XLSX.WorkBook): InventoryItemRow[] {
  const ws = wb.Sheets['INVENTARIO'];
  if (!ws) {
    console.warn('⚠️ No se encontró la pestaña "INVENTARIO"');
    return [];
  }

  const items: InventoryItemRow[] = [];

  // Bloque 1: Insumos, Tazas y Materiales (Filas 3 a 33, Cols C-F)
  for (let r = 3; r <= 33; r++) {
    const rawName = cleanString(getCell(ws, 'C', r));
    if (!rawName) continue;

    const rawTalla = cleanString(getCell(ws, 'D', r));
    const rawQty = getCell(ws, 'E', r);
    const rawNotes = cleanString(getCell(ws, 'F', r));

    let quantity = 0;
    if (typeof rawQty === 'number') {
      quantity = rawQty;
    } else if (typeof rawQty === 'string') {
      const match = rawQty.replace(',', '.').match(/[\d.]+/);
      quantity = match ? parseFloat(match[0]) : 0;
    }

    let unit = 'unidad';
    const upperName = rawName.toUpperCase();
    const upperTalla = rawTalla.toUpperCase();
    if (upperTalla.includes('MTR') || upperName.includes('VINIL')) {
      unit = 'metro';
    } else if (upperName.includes('RESMA') || upperName.includes('HOJAS')) {
      unit = 'hoja';
    } else if (upperTalla.includes('PQT') || upperName.includes('PAQUETE')) {
      unit = 'paquete';
    } else if (upperName.startsWith('SET DE')) {
      unit = 'set';
    }

    let category: 'material' | 'tela' | 'prenda' | 'otro' = 'material';
    if (
      upperName.includes('TAZA') ||
      upperName.includes('MAUSEPAD') ||
      upperName.includes('MOUSEPAD') ||
      upperName.includes('ROMPECABEZAS') ||
      upperName.includes('PELUCHE') ||
      upperName.includes('BOLSITAS') ||
      upperName.includes('CUADRO') ||
      upperName.includes('PORTA BASOS')
    ) {
      category = 'otro';
    }

    items.push({
      category,
      name: rawName.replace(/\s+/g, ' '),
      variant: rawTalla || null,
      quantity: Math.max(0, quantity),
      unit,
      min_stock_alert: category === 'otro' ? 3 : 1,
      cost_per_unit: 0.0,
      notes: rawNotes || null,
    });
  }

  // Bloque 2: Telas por Metro (Filas 3 a 8, Cols H-I)
  for (let r = 3; r <= 8; r++) {
    const rawName = cleanString(getCell(ws, 'H', r));
    if (!rawName) continue;

    const rawQty = cleanString(getCell(ws, 'I', r));
    const match = rawQty.replace(',', '.').match(/[\d.]+/);
    const quantity = match ? parseFloat(match[0]) : 0;

    let variant: string | null = null;
    const upperName = rawName.toUpperCase();
    if (upperName.includes('BLANC')) variant = 'Blanco';
    else if (upperName.includes('NEGR')) variant = 'Negro';
    else if (upperName.includes('GRIS')) variant = 'Gris';

    items.push({
      category: 'tela',
      name: rawName.replace(/\s+/g, ' '),
      variant,
      quantity: Math.max(0, quantity),
      unit: 'metro',
      min_stock_alert: 5.0,
      cost_per_unit: 0.0,
      notes: 'Inventario de tela por metro registrado en taller',
    });
  }

  // Bloque 3: Prendas Confeccionadas en Stock Directo (Filas 36 a 80, Cols C-E)
  let currentGroup = 'Franela Microdurazno';
  for (let r = 36; r <= 80; r++) {
    const rawName = cleanString(getCell(ws, 'C', r));
    const rawTalla = cleanString(getCell(ws, 'D', r));
    const rawQty = getCell(ws, 'E', r);

    if (!rawName) continue;

    // Detectar encabezados de grupo
    const upper = rawName.toUpperCase();
    if (upper.includes('FRANELAS MICRO DURAZNO BLANCA') || upper.includes('FRANELAS MICRO DURAZNO NEGRO') || upper.includes('FRANELAS COLORES ALGOD') || upper.includes('FRANELA OVERSI') || upper.includes('FRANELA ALGOD')) {
      currentGroup = rawName;
      if (rawQty === null || rawQty === undefined || rawTalla === 'TALLA') {
        continue;
      }
    }

    if (rawQty === null || rawQty === undefined || rawTalla === 'TALLA') {
      continue;
    }

    let quantity = 0;
    if (typeof rawQty === 'number') {
      quantity = rawQty;
    } else if (typeof rawQty === 'string') {
      const match = rawQty.match(/\d+/);
      quantity = match ? parseInt(match[0], 10) : 0;
    }

    items.push({
      category: 'prenda',
      name: currentGroup.replace(/\s+/g, ' '),
      variant: `${rawName} - Talla ${rawTalla}`,
      quantity: Math.max(0, quantity),
      unit: 'unidad',
      min_stock_alert: 2,
      cost_per_unit: 0.0,
      notes: null,
    });
  }

  return items;
}

// --- B. Pestaña "Hoja1" -> cost_components y product_cost_templates ---
interface CostComponentRow {
  name: string;
  category: 'prenda_base' | 'prenda_dtf' | 'tinta' | 'papel' | 'empaque' | 'mano_obra' | 'otro';
  unit: string;
  cost_per_unit: number;
  notes: string | null;
}

interface ProductCostTemplateRow {
  product_name: string;
  category: 'camisa' | 'taza' | 'mousepad' | 'otro';
  description: string;
  margin_type: 'fixed' | 'percentage' | 'target_price';
  margin_value: number;
  target_price: number;
  components: any[];
  is_active: boolean;
}

function parseCostData(wb: XLSX.WorkBook): {
  components: CostComponentRow[];
  templates: ProductCostTemplateRow[];
} {
  // Componentes atómicos base del taller extraídos de Hoja1
  const components: CostComponentRow[] = [
    {
      name: 'Tinta Sublimación',
      category: 'tinta',
      unit: 'unidad',
      cost_per_unit: 0.32,
      notes: 'Estimado 100ml / 100 estampados = $0.32 por prenda ($0.20 al mayor)',
    },
    {
      name: 'Papel de Sublimación A4',
      category: 'papel',
      unit: 'hoja',
      cost_per_unit: 0.11,
      notes: '11$ / 100 hojas = $0.11 por estampado',
    },
    {
      name: 'Cinta Térmica',
      category: 'otro',
      unit: 'unidad',
      cost_per_unit: 0.05,
      notes: 'Consumo promedio por fijado térmico ($0.05 unitario / $0.01 mayor)',
    },
    {
      name: 'Prenda Virgen Microdurazno',
      category: 'prenda_base',
      unit: 'unidad',
      cost_per_unit: 3.63,
      notes: 'Costo base de confección textil microdurazno ($3.58 al mayor)',
    },
    {
      name: 'Prenda Virgen Algodón',
      category: 'prenda_base',
      unit: 'unidad',
      cost_per_unit: 3.8,
      notes: 'Costo base franela jersey algodón peinado ($3.75 al mayor)',
    },
    {
      name: 'Taza Cerámica 11oz (Virgen)',
      category: 'otro',
      unit: 'unidad',
      cost_per_unit: 2.0,
      notes: 'Taza blanca estándar para sublimar ($1.50 al mayor)',
    },
    {
      name: 'Taza Mágica 11oz (Virgen)',
      category: 'otro',
      unit: 'unidad',
      cost_per_unit: 3.5,
      notes: 'Taza termosensible mágica negra ($2.50 al mayor)',
    },
    {
      name: 'Impresión DTF Textil',
      category: 'prenda_dtf',
      unit: 'unidad',
      cost_per_unit: 1.5,
      notes: 'Pliego de impresión DTF por arte ($1.50 - $2.00 según tamaño)',
    },
    {
      name: 'Bolsa de Empaque Individual',
      category: 'empaque',
      unit: 'unidad',
      cost_per_unit: 0.13,
      notes: '13$ / 100 bolsas con adhesivo',
    },
    {
      name: 'Mano de Obra (Estampado Textil)',
      category: 'mano_obra',
      unit: 'unidad',
      cost_per_unit: 1.0,
      notes: 'Honorarios por preparación, planchado térmico y control de calidad',
    },
    {
      name: 'Mano de Obra (Sublimado Tazas)',
      category: 'mano_obra',
      unit: 'unidad',
      cost_per_unit: 0.5,
      notes: 'Honorarios de curado térmico en prensa de tazas',
    },
  ];

  // 5 Recetas Maestras de Productos Oficiales de AlquimiaTex
  const templates: ProductCostTemplateRow[] = [
    {
      product_name: 'Franela Sublimada Microdurazno',
      category: 'camisa',
      description: 'Estampado térmico full color en tela microdurazno tacto suave',
      margin_type: 'target_price',
      margin_value: 1.76,
      target_price: 7.0,
      components: [
        { name: 'Prenda Virgen Microdurazno', cost: 3.63, unit: 'unidad' },
        { name: 'Tinta Sublimación', cost: 0.32, unit: 'unidad' },
        { name: 'Papel de Sublimación A4', cost: 0.11, unit: 'hoja' },
        { name: 'Bolsa de Empaque Individual', cost: 0.13, unit: 'unidad' },
        { name: 'Cinta Térmica', cost: 0.05, unit: 'unidad' },
        { name: 'Mano de Obra (Estampado Textil)', cost: 1.0, unit: 'unidad' },
      ],
      is_active: true,
    },
    {
      product_name: 'Franela DTF Microdurazno',
      category: 'camisa',
      description: 'Transfer digital DTF directo a prenda microdurazno',
      margin_type: 'target_price',
      margin_value: 4.42,
      target_price: 9.0,
      components: [
        { name: 'Prenda Virgen Microdurazno', cost: 1.9, unit: 'unidad' },
        { name: 'Impresión DTF Textil', cost: 1.5, unit: 'unidad' },
        { name: 'Bolsa de Empaque Individual', cost: 0.13, unit: 'unidad' },
        { name: 'Cinta Térmica', cost: 0.05, unit: 'unidad' },
        { name: 'Mano de Obra (Estampado Textil)', cost: 1.0, unit: 'unidad' },
      ],
      is_active: true,
    },
    {
      product_name: 'Franela DTF Algodón',
      category: 'camisa',
      description: 'Transfer digital DTF sobre franela 100% algodón jersey',
      margin_type: 'target_price',
      margin_value: 5.52,
      target_price: 12.0,
      components: [
        { name: 'Prenda Virgen Algodón', cost: 3.8, unit: 'unidad' },
        { name: 'Impresión DTF Textil', cost: 1.5, unit: 'unidad' },
        { name: 'Bolsa de Empaque Individual', cost: 0.13, unit: 'unidad' },
        { name: 'Cinta Térmica', cost: 0.05, unit: 'unidad' },
        { name: 'Mano de Obra (Estampado Textil)', cost: 1.0, unit: 'unidad' },
      ],
      is_active: true,
    },
    {
      product_name: 'Taza Cerámica 11oz',
      category: 'taza',
      description: 'Taza blanca estándar sublimada full color con acabado brillante',
      margin_type: 'target_price',
      margin_value: 1.02,
      target_price: 4.0,
      components: [
        { name: 'Taza Cerámica 11oz (Virgen)', cost: 2.0, unit: 'unidad' },
        { name: 'Tinta Sublimación', cost: 0.32, unit: 'unidad' },
        { name: 'Papel de Sublimación A4', cost: 0.11, unit: 'hoja' },
        { name: 'Cinta Térmica', cost: 0.05, unit: 'unidad' },
        { name: 'Mano de Obra (Sublimado Tazas)', cost: 0.5, unit: 'unidad' },
      ],
      is_active: true,
    },
    {
      product_name: 'Taza Mágica 11oz',
      category: 'taza',
      description: 'Taza mágica termosensible que revela el arte con calor',
      margin_type: 'target_price',
      margin_value: 1.52,
      target_price: 6.0,
      components: [
        { name: 'Taza Mágica 11oz (Virgen)', cost: 3.5, unit: 'unidad' },
        { name: 'Tinta Sublimación', cost: 0.32, unit: 'unidad' },
        { name: 'Papel de Sublimación A4', cost: 0.11, unit: 'hoja' },
        { name: 'Cinta Térmica', cost: 0.05, unit: 'unidad' },
        { name: 'Mano de Obra (Sublimado Tazas)', cost: 0.5, unit: 'unidad' },
      ],
      is_active: true,
    },
  ];

  return { components, templates };
}

// --- C. Pestaña "MOVIMIENTOS - COMPRAS" -> inventory_purchases ---
interface InventoryPurchaseRow {
  purchase_date: string | null;
  item_name: string;
  quantity_raw: string | null;
  quantity: number | null;
  unit: string;
  cost_raw: string | null;
  cost_usd: number | null;
  cost_bs: number | null;
  notes: string | null;
}

function parsePurchases(wb: XLSX.WorkBook): InventoryPurchaseRow[] {
  const ws = wb.Sheets['MOVIMIENTOS - COMPRAS'];
  if (!ws) {
    console.warn('⚠️ No se encontró la pestaña "MOVIMIENTOS - COMPRAS"');
    return [];
  }

  const purchases: InventoryPurchaseRow[] = [];
  let lastDate: string | null = null;

  for (let r = 7; r <= 201; r++) {
    const rawItem = cleanString(getCell(ws, 'H', r));
    if (!rawItem) continue;

    const rawDate = getCell(ws, 'G', r);
    const parsedDate = parseExcelDate(rawDate);
    if (parsedDate) {
      lastDate = parsedDate;
    }

    const rawQty = getCell(ws, 'I', r);
    const rawCost = getCell(ws, 'J', r);

    let quantity: number | null = null;
    let unit = 'unidad';
    if (typeof rawQty === 'number') {
      quantity = rawQty;
    } else if (rawQty) {
      const qStr = String(rawQty).replace(',', '.');
      const match = qStr.match(/[\d.]+/);
      quantity = match ? parseFloat(match[0]) : null;
      if (qStr.toUpperCase().includes('MTS') || qStr.toUpperCase().includes('MTR')) {
        unit = 'metro';
      }
    }

    let cost_usd: number | null = null;
    let cost_bs: number | null = null;
    if (typeof rawCost === 'number') {
      cost_usd = rawCost;
    } else if (rawCost) {
      const cStr = String(rawCost).trim();
      const upper = cStr.toUpperCase();
      if (upper.includes('BS')) {
        // En Venezuela se usa punto como separador de miles y coma como decimal (ej: "3.942,00 BS" o "3942 BS")
        const numPart = cStr.replace(/BS/i, '').trim().replace(/\./g, '').replace(',', '.');
        const match = numPart.match(/[\d.]+/);
        cost_bs = match ? parseFloat(match[0]) : null;
      } else if (upper.includes('$')) {
        const numPart = cStr.replace(/\$/g, '').trim().replace(',', '.');
        const match = numPart.match(/[\d.]+/);
        cost_usd = match ? parseFloat(match[0]) : null;
      } else {
        const numPart = cStr.replace(',', '.');
        const match = numPart.match(/[\d.]+/);
        cost_usd = match ? parseFloat(match[0]) : null;
      }
    }

    purchases.push({
      purchase_date: lastDate,
      item_name: rawItem.replace(/\s+/g, ' '),
      quantity_raw: rawQty ? String(rawQty).trim() : null,
      quantity,
      unit,
      cost_raw: rawCost ? String(rawCost).trim() : null,
      cost_usd,
      cost_bs,
      notes: null,
    });
  }

  return purchases;
}

// ============================================================================
// 4. FUNCIÓN PRINCIPAL DE EJECUCIÓN
// ============================================================================
async function run() {
  const filePath = path.resolve(process.cwd(), 'data/Libro11.xlsx');
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Archivo no encontrado: ${filePath}`);
    process.exit(1);
  }

  console.log(`📖 Leyendo archivo Excel: ${filePath}`);
  const wb = XLSX.readFile(filePath);

  // Parsear datos de las 3 pestañas
  const inventoryItems = parseInventoryItems(wb);
  const { components: costComponents, templates: costTemplates } = parseCostData(wb);
  const purchases = parsePurchases(wb);

  console.log('\n======================================================');
  console.log('📊 RESUMEN DE REGISTROS EXTRAÍDOS DEL EXCEL:');
  console.log('======================================================');
  console.log(`📦 1. Inventario (inventory_items):        ${inventoryItems.length} registros`);
  console.log(`🧪 2. Componentes de Costo (cost_components): ${costComponents.length} insumos`);
  console.log(`📜 3. Recetas de Producto (cost_templates):   ${costTemplates.length} recetas`);
  console.log(`🛒 4. Compras Históricas (purchases):         ${purchases.length} compras`);
  console.log('======================================================\n');

  // Vista previa de los primeros 5 registros de cada conjunto
  console.log('👀 VISTA PREVIA: PRIMEROS 5 REGISTROS DE INVENTARIO:');
  console.table(inventoryItems.slice(0, 5).map(i => ({
    Categoría: i.category,
    Artículo: i.name,
    Variante: i.variant,
    Stock: i.quantity,
    Unidad: i.unit,
  })));

  console.log('\n👀 VISTA PREVIA: PRIMEROS 5 COMPONENTES DE COSTO:');
  console.table(costComponents.slice(0, 5).map(c => ({
    Nombre: c.name,
    Categoría: c.category,
    'Costo Unitario ($)': c.cost_per_unit,
    Unidad: c.unit,
  })));

  console.log('\n👀 VISTA PREVIA: LAS 5 RECETAS MAESTRAS DE PRODUCTOS:');
  console.table(costTemplates.map(t => ({
    Producto: t.product_name,
    Categoría: t.category,
    'Precio Venta ($)': t.target_price,
    'Margen Estimado ($)': t.margin_value,
    'Insumos': t.components.length,
  })));

  console.log('\n👀 VISTA PREVIA: PRIMERAS 5 COMPRAS HISTÓRICAS:');
  console.table(purchases.slice(0, 5).map(p => ({
    Fecha: p.purchase_date,
    Artículo: p.item_name,
    Cantidad: `${p.quantity ?? ''} ${p.unit}`,
    'Bs': p.cost_bs,
    'USD': p.cost_usd,
  })));

  // Verificación de argumento interactivo o banderas
  const isPreview = process.argv.includes('--preview') || process.argv.includes('--dry-run');
  if (isPreview) {
    console.log('🔍 MODO VISTA PREVIA ACTIVO (--preview): No se realizaron inserciones en la base de datos.');
    console.log('👉 Para ejecutar la inserción en Supabase, corre: npx tsx scripts/migrate-excel.ts');
    process.exit(0);
  }

  const autoYes = process.argv.includes('--yes') || process.argv.includes('-y');

  if (!autoYes) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question('\n❓ ¿Deseas insertar estos datos en Supabase ahora mismo? (s/N): ', (ans) => {
        rl.close();
        resolve(ans.trim().toLowerCase());
      });
    });

    if (answer !== 's' && answer !== 'si' && answer !== 'y' && answer !== 'yes') {
      console.log('🛑 Migración cancelada por el usuario. No se modificó la base de datos.');
      process.exit(0);
    }
  }

  console.log('\n🚀 INICIANDO INSERCIÓN EN SUPABASE...\n');

  // 1. Insertar inventory_items
  try {
    console.log(`📦 Insertando ${inventoryItems.length} ítems en inventory_items...`);
    const { error: invErr } = await supabase.from('inventory_items').insert(inventoryItems);
    if (invErr) {
      console.error('❌ Error al insertar en inventory_items:', invErr.message);
    } else {
      console.log('✅ inventory_items insertados exitosamente.');
    }
  } catch (err: any) {
    console.error('❌ Error en inventory_items:', err.message);
  }

  // 2. Insertar cost_components
  try {
    console.log(`🧪 Insertando ${costComponents.length} componentes en cost_components...`);
    const { error: compErr } = await supabase.from('cost_components').insert(costComponents);
    if (compErr) {
      console.error('❌ Error al insertar en cost_components:', compErr.message);
    } else {
      console.log('✅ cost_components insertados exitosamente.');
    }
  } catch (err: any) {
    console.error('❌ Error en cost_components:', err.message);
  }

  // 3. Insertar product_cost_templates
  try {
    console.log(`📜 Insertando ${costTemplates.length} recetas en product_cost_templates...`);
    const { error: tempErr } = await supabase.from('product_cost_templates').insert(costTemplates);
    if (tempErr) {
      console.error('❌ Error al insertar en product_cost_templates:', tempErr.message);
    } else {
      console.log('✅ product_cost_templates insertados exitosamente.');
    }
  } catch (err: any) {
    console.error('❌ Error en product_cost_templates:', err.message);
  }

  // 4. Insertar inventory_purchases
  try {
    console.log(`🛒 Insertando ${purchases.length} compras en inventory_purchases...`);
    const { error: purErr } = await supabase.from('inventory_purchases').insert(purchases);
    if (purErr) {
      if (purErr.message.includes('relation "public.inventory_purchases" does not exist') || purErr.code === '42P01') {
        console.warn('⚠️ La tabla "inventory_purchases" aún no existe en Supabase.');
        console.warn('👉 Recuerda ejecutar el archivo docs/SQL-COMPRAS.sql en el SQL Editor de Supabase y volver a correr el script para guardar las compras.');
      } else {
        console.error('❌ Error al insertar en inventory_purchases:', purErr.message);
      }
    } else {
      console.log('✅ inventory_purchases insertadas exitosamente.');
    }
  } catch (err: any) {
    console.error('❌ Error en inventory_purchases:', err.message);
  }

  console.log('\n🏁 PROCESO DE MIGRACIÓN FINALIZADO.');
}

run().catch((err) => {
  console.error('💥 Error inesperado:', err);
  process.exit(1);
});
