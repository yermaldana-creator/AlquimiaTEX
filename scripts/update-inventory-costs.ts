import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// 1. Cargar variables de entorno desde .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: Archivo .env.local no encontrado.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/)?.[1]?.trim();
const serviceRoleKey =
  envContent.match(/SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/)?.[1]?.trim() ||
  envContent.match(/SUPABASE_SECRET_KEY=([^\r\n]+)/)?.[1]?.trim();

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurados.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function normalize(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface PurchaseRow {
  id: string;
  purchase_date: string | null;
  item_name: string;
  quantity: number | null;
  unit: string;
  cost_raw: string | null;
  cost_usd: number | null;
  cost_bs: number | null;
}

interface InventoryItemRow {
  id: string;
  name: string;
  variant: string | null;
  category: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
}

/**
 * Calcula el costo unitario en USD de una compra real.
 */
function getPurchaseUnitCostUsd(p: PurchaseRow): number | null {
  const qty = Number(p.quantity) > 0 ? Number(p.quantity) : 1;

  if (p.cost_usd !== null && p.cost_usd > 0) {
    return Number((p.cost_usd / qty).toFixed(2));
  }

  let bs = p.cost_bs;
  if (p.cost_raw && p.cost_raw.toUpperCase().includes('BS')) {
    const rawClean = p.cost_raw.replace(/BS/i, '').trim();
    const parsed = parseFloat(rawClean);
    if (!isNaN(parsed) && parsed > 0 && parsed < (p.cost_bs || 0)) {
      bs = parsed;
    }
  }

  if (bs !== null && bs > 0) {
    const is2026 = p.purchase_date && p.purchase_date.startsWith('2026');
    const rate = is2026 ? 950 : 365;
    return Number(((bs / rate) / qty).toFixed(2));
  }

  return null;
}

async function run() {
  console.log('🔄 Sincronizando costos reales de compras a la tabla inventory_items...');

  const { data: purchases, error: pErr } = await supabase
    .from('inventory_purchases')
    .select('*')
    .order('purchase_date', { ascending: false });

  if (pErr || !purchases) {
    console.error('❌ Error al obtener compras:', pErr?.message);
    process.exit(1);
  }

  const { data: items, error: iErr } = await supabase
    .from('inventory_items')
    .select('*')
    .is('archived_at', null)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (iErr || !items) {
    console.error('❌ Error al obtener inventario:', iErr?.message);
    process.exit(1);
  }

  const updates: { id: string; name: string; variant: string | null; category: string; qty: number; oldCost: number; newCost: number; reason: string }[] = [];
  const sqlStatements: string[] = [];

  for (const item of items as InventoryItemRow[]) {
    const itemNameNorm = normalize(item.name);
    const itemVarNorm = normalize(item.variant || '');
    const isTela = item.category === 'tela';
    const isPrenda = item.category === 'prenda';
    const isNumericVar = /^\d+$/.test(itemVarNorm);

    let bestScore = -1;
    let bestUnitCost: number | null = null;
    let bestPurchaseName = '';

    for (const p of purchases as PurchaseRow[]) {
      const pNameNorm = normalize(p.item_name);
      const unitCost = getPurchaseUnitCostUsd(p);
      if (!unitCost || unitCost <= 0) continue;

      let score = 0;

      // REGLA CRÍTICA DE AISLAMIENTO POR CATEGORÍA
      const pIsPrenda = pNameNorm.includes('franela') || pNameNorm.includes('bas ') || pNameNorm.includes('over') || pNameNorm.includes('croptop');
      const pIsTela = p.unit === 'metro' || pNameNorm.includes('metro') || pNameNorm.includes('mts') || pNameNorm.includes('tela') || pNameNorm.includes('dtf');

      // Un material/otro NUNCA debe matchear una compra de prenda o tela
      if (!isPrenda && !isTela && (pIsPrenda || pIsTela)) {
        continue;
      }
      if (isTela && pIsPrenda) {
        continue;
      }
      if (isPrenda && pIsTela) {
        continue;
      }

      // 1. Coincidencia de nombre
      if (pNameNorm === itemNameNorm) score += 100;
      if (itemVarNorm && !isNumericVar && pNameNorm === itemVarNorm) score += 95;
      if (itemVarNorm && !isNumericVar && pNameNorm.includes(itemVarNorm)) score += 70;
      if (pNameNorm.includes(itemNameNorm) && itemNameNorm.length > 3) score += 55;
      if (itemNameNorm.includes(pNameNorm) && pNameNorm.length > 3) score += 45;

      // 2. Coincidencias específicas por producto
      if (isPrenda) {
        // Modelo y estilo
        if ((itemVarNorm.includes('over') || itemNameNorm.includes('over')) && (pNameNorm.includes('over') || pNameNorm.includes('boxi'))) score += 40;
        if ((itemVarNorm.includes('algo') || itemNameNorm.includes('algo')) && (pNameNorm.includes('algo') || pNameNorm.includes('algodon'))) score += 30;
        if ((itemVarNorm.includes('micro') || itemNameNorm.includes('micro')) && (pNameNorm.includes('micro') || pNameNorm.includes('md') || pNameNorm.includes('mdp'))) score += 30;

        // Color
        const colors = ['blanca', 'blanco', 'negra', 'negro', 'gris', 'rojo', 'roja', 'azul', 'mostaza', 'terracota'];
        for (const c of colors) {
          if ((itemVarNorm.includes(c) || itemNameNorm.includes(c)) && pNameNorm.includes(c)) score += 15;
        }

        // Talla
        const sizes = ['xs', 's', 'm', 'l', 'xl', 'xxl', '14', '16', '4', '8', '10', '12'];
        for (const sz of sizes) {
          if (itemVarNorm.includes('talla ' + sz) && (pNameNorm.includes('talla ' + sz) || pNameNorm.endsWith(' ' + sz))) score += 20;
        }
      }

      if (isTela) {
        if (itemNameNorm.includes('heavy blanca') && pNameNorm.includes('heavy blanca')) score += 60;
        if (itemNameNorm.includes('heavy gris') && pNameNorm.includes('gris')) score += 50;
        if (itemNameNorm.includes('rib blanco') && pNameNorm.includes('rib blanca')) score += 60;
        if (itemNameNorm.includes('rib negro') && pNameNorm.includes('rib negra')) score += 60;
        if (itemNameNorm.includes('jersey') && pNameNorm.includes('jersey')) score += 60;
      }

      // Materiales y otros
      if (itemNameNorm.includes('tazas magicas') && pNameNorm.includes('tazas magicas')) score += 80;
      if (itemNameNorm.includes('set de 4 tazas') && pNameNorm.includes('set') && pNameNorm.includes('taza')) score += 80;
      if (itemNameNorm === 'tazas' && pNameNorm.includes('taza') && !pNameNorm.includes('magica')) score += 70;
      if (itemNameNorm.includes('mausepad') && (pNameNorm.includes('mousepad') || pNameNorm.includes('mausepad'))) score += 80;
      if (itemNameNorm.includes('rompecabezas') && pNameNorm.includes('rompecabezas')) score += 80;
      if (itemNameNorm.includes('cinta termica') && pNameNorm.includes('cinta termica')) score += 80;
      if (itemNameNorm.includes('tijera') && pNameNorm.includes('tijera')) score += 80;
      if (itemNameNorm.includes('cartulina') && pNameNorm.includes('cartulina')) score += 60;
      if (itemNameNorm.includes('resma de hojas de sublimacion') && (pNameNorm.includes('resma de papel de sublimacion') || pNameNorm.includes('hojas de sublimacion'))) score += 80;
      if (itemNameNorm.includes('papel fotografico') && pNameNorm.includes('papel')) score += 50;
      if (itemNameNorm.includes('vinil textil') && pNameNorm.includes('vinil textil')) score += 80;

      if (score > bestScore) {
        bestScore = score;
        bestUnitCost = unitCost;
        bestPurchaseName = p.item_name;
      }
    }

    let calculatedCost = 0;
    let reason = '';

    if (bestUnitCost !== null && bestScore >= 50) {
      calculatedCost = bestUnitCost;
      reason = `Compra (${bestScore}pts): ${bestPurchaseName}`;
    } else {
      // Fallbacks exactos por categoría y catálogo de taller
      if (isPrenda) {
        if (itemNameNorm.includes('over') || itemVarNorm.includes('over')) {
          calculatedCost = 6.50;
          reason = 'Referencia: Franela Oversize ($6.50)';
        } else if (itemNameNorm.includes('algo') || itemVarNorm.includes('algo')) {
          calculatedCost = 3.50;
          reason = 'Referencia: Franela Algodón ($3.50)';
        } else {
          calculatedCost = 2.50;
          reason = 'Referencia: Franela Microdurazno ($2.50)';
        }
      } else if (isTela) {
        if (itemNameNorm.includes('rib')) {
          calculatedCost = 1.45;
          reason = 'Referencia: Tela Micro Rib ($1.45/m)';
        } else if (itemNameNorm.includes('microdurazno heavy gris')) {
          calculatedCost = 1.74;
          reason = 'Referencia: Tela MDP Gris ($1.74/m)';
        } else if (itemNameNorm.includes('microdurazno')) {
          calculatedCost = 1.35;
          reason = 'Referencia: Tela Microdurazno ($1.35/m)';
        } else if (itemNameNorm.includes('jersey')) {
          calculatedCost = 1.67;
          reason = 'Referencia: Tela Jersey Algodón ($1.67/m)';
        }
      } else if (itemNameNorm.includes('taza magica')) {
        calculatedCost = 2.00;
        reason = 'Referencia: Taza Mágica 11oz ($2.00)';
      } else if (itemNameNorm.includes('set de 4 tazas')) {
        calculatedCost = 3.83;
        reason = 'Referencia: Set 4 Tazas Apilables ($3.83)';
      } else if (itemNameNorm.includes('taza')) {
        calculatedCost = 1.50;
        reason = 'Referencia: Taza Blanca 11oz ($1.50)';
      } else if (itemNameNorm.includes('mausepad') || itemNameNorm.includes('mousepad')) {
        calculatedCost = 1.58;
        reason = 'Referencia: Mousepad ($1.58)';
      } else if (itemNameNorm.includes('rompecabezas')) {
        calculatedCost = 0.83;
        reason = 'Referencia: Rompecabezas A4 ($0.83)';
      } else if (itemNameNorm.includes('vinil')) {
        calculatedCost = 3.00;
        reason = 'Referencia: Vinil Textil ($3.00/m)';
      } else if (itemNameNorm.includes('cinta')) {
        calculatedCost = 3.00;
        reason = 'Referencia: Cinta Térmica ($3.00)';
      } else if (itemNameNorm.includes('tinta')) {
        calculatedCost = 4.00;
        reason = 'Referencia: Tinta Sublimación ($4.00/ud)';
      } else if (itemNameNorm.includes('resma') || itemNameNorm.includes('hojas de sublimacion')) {
        calculatedCost = 6.00;
        reason = 'Referencia: Resma Papel Sublimación ($6.00)';
      } else if (itemNameNorm.includes('papel fotografico')) {
        calculatedCost = 4.50;
        reason = 'Referencia: Papel Fotográfico ($4.50)';
      } else if (itemNameNorm.includes('bolsa')) {
        calculatedCost = 0.08;
        reason = 'Referencia: Bolsas de Empaque ($0.08)';
      } else if (itemNameNorm.includes('peluche')) {
        calculatedCost = 5.00;
        reason = 'Referencia: Peluche Sublimable ($5.00)';
      } else if (itemNameNorm.includes('tijera')) {
        calculatedCost = 1.35;
        reason = 'Referencia: Tijera de Taller ($1.35)';
      } else if (itemNameNorm.includes('cartulina')) {
        calculatedCost = 1.05;
        reason = 'Referencia: Cartulina ($1.05)';
      } else if (itemNameNorm.includes('cuadro')) {
        calculatedCost = 3.00;
        reason = 'Referencia: Cuadro Sublimable ($3.00)';
      } else if (itemNameNorm.includes('porta basos')) {
        calculatedCost = 0.80;
        reason = 'Referencia: Portavasos ($0.80)';
      } else {
        calculatedCost = 1.50;
        reason = 'Referencia: Herramientas / Insumos varios ($1.50)';
      }
    }

    updates.push({
      id: item.id,
      name: item.name,
      variant: item.variant,
      category: item.category,
      qty: item.quantity,
      oldCost: item.cost_per_unit,
      newCost: Number(calculatedCost.toFixed(2)),
      reason,
    });

    sqlStatements.push(`UPDATE inventory_items SET cost_per_unit = ${calculatedCost.toFixed(2)}, updated_at = NOW() WHERE id = '${item.id}';`);
  }

  // 3. Imprimir desglose por categorías
  console.log('\n📊 DESGLOSE DE COSTOS ACTUALIZADOS (Muestra por categorías):');
  
  const sampleTela = updates.filter(u => u.category === 'tela');
  const samplePrenda = updates.filter(u => u.category === 'prenda').slice(0, 8);
  const sampleOtro = updates.filter(u => u.category === 'otro').slice(0, 6);
  const sampleMat = updates.filter(u => u.category === 'material').slice(0, 6);

  console.log('\n--- TELAS POR METRO ---');
  console.table(sampleTela.map(u => ({ Tela: u.name, Metros: u.qty, 'Costo ($/m)': u.newCost, 'Subtotal ($)': Number((u.qty * u.newCost).toFixed(2)), Fuente: u.reason.slice(0, 38) })));

  console.log('\n--- PRENDAS CONFECCIONADAS ---');
  console.table(samplePrenda.map(u => ({ Prenda: u.name, Variante: u.variant?.slice(0, 25), Stock: u.qty, 'Costo ($/ud)': u.newCost, 'Subtotal ($)': Number((u.qty * u.newCost).toFixed(2)), Fuente: u.reason.slice(0, 38) })));

  console.log('\n--- BLANKS / TAZAS / SUBLIMABLES ---');
  console.table(sampleOtro.map(u => ({ Producto: u.name, Stock: u.qty, 'Costo ($)': u.newCost, 'Subtotal ($)': Number((u.qty * u.newCost).toFixed(2)), Fuente: u.reason.slice(0, 38) })));

  console.log('\n--- MATERIALES E INSUMOS ---');
  console.table(sampleMat.map(u => ({ Insumo: u.name, Stock: u.qty, 'Costo ($)': u.newCost, 'Subtotal ($)': Number((u.qty * u.newCost).toFixed(2)), Fuente: u.reason.slice(0, 38) })));

  const totalCapital = updates.reduce((sum, u) => sum + (u.qty * u.newCost), 0);
  console.log(`\n================================================================`);
  console.log(`💰 CAPITAL TOTAL ESTIMADO EN INVENTARIO: $${totalCapital.toFixed(2)} USD`);
  console.log(`================================================================\n`);

  // 4. Aplicar actualización en Supabase
  console.log('🚀 Actualizando registros en Supabase...');
  let updatedCount = 0;
  for (const u of updates) {
    const { error: updErr } = await supabase
      .from('inventory_items')
      .update({ cost_per_unit: u.newCost, updated_at: new Date().toISOString() })
      .eq('id', u.id);

    if (updErr) {
      console.error(`⚠️ Error actualizando ítem ${u.id}:`, updErr.message);
    } else {
      updatedCount++;
    }
  }

  console.log(`✅ ¡Completado! Se actualizaron ${updatedCount} de ${updates.length} ítems en Supabase.`);

  // 5. Guardar SQL limpio
  const sqlFilePath = path.resolve(process.cwd(), 'scripts', 'update-inventory-costs.sql');
  fs.writeFileSync(sqlFilePath, sqlStatements.join('\n'), 'utf8');
  console.log(`📝 Script SQL guardado en: scripts/update-inventory-costs.sql`);

  // 6. Revalidar Next.js cache
  try {
    const res = await fetch('http://localhost:3000/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        paths: ['/admin/inventario', '/admin/costos'],
        tags: ['admin-inventory', 'admin-costs'],
      }),
    });
    const json = await res.json();
    console.log('⚡ Caché de Next.js revalidada:', json);
  } catch (err: any) {
    console.warn('⚠️ Nota sobre revalidate:', err.message);
  }
}

run().catch((err) => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
