/**
 * ALQUIMIATEX — SCRIPT DE MIGRACIÓN DE DEUDAS Y CUENTAS
 * 
 * Lee 'data/Libro11.xlsx' (Pestaña "DEUDAS - PERDIDAS"):
 * 1. Columna A: Cuentas por Cobrar (Clientes) -> type: 'por_cobrar'
 * 2. Columna B: Cuentas por Pagar (Proveedores / Taller) -> type: 'por_pagar'
 * 3. Ignora columnas de pérdidas (H-L)
 * 
 * Uso:
 *   npx tsx scripts/migrate-debts.ts --dry-run   (Solo visualiza lo que se insertará)
 *   npx tsx scripts/migrate-debts.ts             (Inserta en la tabla public.debts)
 */

import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

// 1. CARGA DE VARIABLES DE ENTORNO (.env.local)
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

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

interface ParsedDebt {
  type: 'por_cobrar' | 'por_pagar';
  entity_name: string;
  description: string;
  currency: 'USD' | 'BS';
  amount_original: number;
  amount_paid: number;
  status: 'pendiente' | 'parcial' | 'pagada' | 'vencida';
  notes: string;
  payments: any[];
}

function parseDebtString(str: any, type: 'por_cobrar' | 'por_pagar', statusCol?: any): ParsedDebt {
  const original = String(str).trim();
  let text = original;
  let currency: 'USD' | 'BS' = 'USD';
  let amount = 0;

  // 1. Detección de Bolívares (BS)
  const milBsMatch = text.match(/(\d+(?:[.,]\d+)?)\s*mil\s*bs/i);
  const bsMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:bs|bolivares)/i) || text.match(/(?:bs|bolivares)\s*(\d+(?:[.,]\d+)?)/i);

  if (milBsMatch) {
    currency = 'BS';
    amount = parseFloat(milBsMatch[1].replace(',', '.')) * 1000;
  } else if (bsMatch) {
    currency = 'BS';
    amount = parseFloat(bsMatch[1].replace(',', '.'));
  } else {
    // 2. Detección de Dólares ($)
    const usdMatch = text.match(/(\d+(?:[.,]\d+)?)\s*\$/) || text.match(/\$\s*(\d+(?:[.,]\d+)?)/);
    if (usdMatch) {
      currency = 'USD';
      amount = parseFloat(usdMatch[1].replace(',', '.'));
    }
  }

  // 3. Estado según columna D (o defecto pendiente)
  let status: 'pendiente' | 'pagada' = 'pendiente';
  if (statusCol) {
    const s = String(statusCol).trim().toUpperCase();
    if (s.includes('PAGAD')) status = 'pagada';
    else if (s.includes('PENDIENT')) status = 'pendiente';
  }

  // 4. Separación de Nombre de Entidad vs Concepto / Descripción
  const parts = original.split(/\s+/);
  let entity_name = original;
  let description = original;

  if (parts.length >= 2) {
    const firstWordLower = parts[0].toLowerCase();

    if (
      firstWordLower === 'cliente' ||
      firstWordLower === 'clienta' ||
      firstWordLower === 'mama' ||
      firstWordLower === 'hermana' ||
      firstWordLower === 'hermano' ||
      firstWordLower === 'amigo' ||
      firstWordLower === 'amiga' ||
      firstWordLower === 'esposa'
    ) {
      const numOrProductIdx = parts.findIndex(
        (p, i) =>
          i > 0 &&
          (/^\d/.test(p) ||
            /^\$/.test(p) ||
            /^(taza|franela|impresion|estampado)/i.test(p))
      );
      if (numOrProductIdx !== -1) {
        entity_name = parts.slice(0, numOrProductIdx).join(' ');
        description = parts.slice(numOrProductIdx).join(' ');
      } else {
        entity_name = parts.slice(0, 3).join(' ');
        description = parts.slice(3).join(' ');
      }
    } else {
      const firstNumOrProd = parts.findIndex(
        (p, i) =>
          i > 0 &&
          (/^\d/.test(p) ||
            /^\(/.test(p) ||
            /^\$/.test(p) ||
            /^(taza|franela|impresion|estampado)/i.test(p))
      );
      if (firstNumOrProd !== -1) {
        entity_name = parts.slice(0, firstNumOrProd).join(' ');
        description = parts.slice(firstNumOrProd).join(' ');
      } else {
        entity_name = parts[0];
        description = parts.slice(1).join(' ');
      }
    }
  }

  entity_name = entity_name.trim().replace(/^[-:,(]+|[-:),]+$/g, '').trim();

  const finalAmount = isNaN(amount) ? 0 : Number(amount.toFixed(2));

  return {
    type,
    entity_name: entity_name || original,
    description: description || original,
    currency,
    amount_original: finalAmount,
    amount_paid: status === 'pagada' ? finalAmount : 0,
    status,
    notes: 'Migrado de Libro11.xlsx (DEUDAS - PERDIDAS)',
    payments: [],
  };
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const excelPath = path.resolve(process.cwd(), 'data/Libro11.xlsx');

  console.log('\n======================================================');
  console.log('   MIGRACIÓN DE DEUDAS Y CUENTAS: EXCEL -> SUPABASE   ');
  console.log('======================================================\n');
  console.log(`📂 Archivo: ${excelPath}`);
  console.log(`⚙️  Modo: ${isDryRun ? 'DRY-RUN (Solo Simulación)' : 'PRODUCCIÓN (Inserción en BD)'}`);

  if (!fs.existsSync(excelPath)) {
    console.error(`❌ Error: No se encontró el archivo ${excelPath}`);
    process.exit(1);
  }

  const wb = XLSX.readFile(excelPath);
  const sheetName = 'DEUDAS - PERDIDAS';
  const ws = wb.Sheets[sheetName];

  if (!ws) {
    console.error(`❌ Error: No se encontró la pestaña "${sheetName}" en el Excel.`);
    process.exit(1);
  }

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
  const debtsToInsert: ParsedDebt[] = [];

  for (let R = 1; R <= range.e.r; R++) {
    const cA = ws[XLSX.utils.encode_cell({ r: R, c: 0 })];
    const cB = ws[XLSX.utils.encode_cell({ r: R, c: 1 })];
    const cD = ws[XLSX.utils.encode_cell({ r: R, c: 3 })];
    const statusVal = cD ? cD.v : null;

    // Columna A: Clientes (Por cobrar)
    if (cA && cA.v && String(cA.v).trim()) {
      debtsToInsert.push(parseDebtString(cA.v, 'por_cobrar', statusVal));
    }

    // Columna B: Nuestras deudas (Por pagar)
    if (cB && cB.v && String(cB.v).trim()) {
      debtsToInsert.push(parseDebtString(cB.v, 'por_pagar', statusVal));
    }
  }

  console.log(`\n📊 Registros detectados para migrar: ${debtsToInsert.length}`);
  const receivables = debtsToInsert.filter((d) => d.type === 'por_cobrar');
  const payables = debtsToInsert.filter((d) => d.type === 'por_pagar');

  console.log(`  - Cuentas Por Cobrar (Clientes): ${receivables.length}`);
  console.log(
    `    * Total USD: $${receivables.filter((d) => d.currency === 'USD').reduce((s, d) => s + d.amount_original, 0).toFixed(2)}`
  );
  console.log(
    `    * Total BS:  Bs. ${receivables.filter((d) => d.currency === 'BS').reduce((s, d) => s + d.amount_original, 0).toFixed(2)}`
  );

  console.log(`  - Cuentas Por Pagar (Proveedores): ${payables.length}`);
  console.log(
    `    * Total USD: $${payables.filter((d) => d.currency === 'USD').reduce((s, d) => s + d.amount_original, 0).toFixed(2)}`
  );
  console.log(
    `    * Total BS:  Bs. ${payables.filter((d) => d.currency === 'BS').reduce((s, d) => s + d.amount_original, 0).toFixed(2)}`
  );

  console.log('\n🔍 Muestra de los primeros 5 registros:');
  console.table(
    debtsToInsert.slice(0, 5).map((d) => ({
      Tipo: d.type,
      Entidad: d.entity_name,
      Concepto: d.description.slice(0, 30),
      Moneda: d.currency,
      Monto: d.amount_original,
      Estado: d.status,
    }))
  );

  if (isDryRun) {
    console.log('\n💡 Modo DRY-RUN completado. No se modificó la base de datos.');
    return;
  }

  // Verificar si la tabla existe en Supabase
  const { error: testError } = await supabase.from('debts').select('id').limit(1);
  if (testError && testError.message.includes('Could not find the table')) {
    console.error('\n❌ Error: La tabla "public.debts" aún no existe en Supabase.');
    console.error('👉 Por favor ejecuta el script SQL de creación de la tabla en el SQL Editor de Supabase antes de migrar.');
    process.exit(1);
  }

  console.log('\n🚀 Insertando registros en Supabase en lotes de 50...');
  const batchSize = 50;
  let insertedCount = 0;

  for (let i = 0; i < debtsToInsert.length; i += batchSize) {
    const chunk = debtsToInsert.slice(i, i + batchSize).map((d) => ({
      type: d.type,
      entity_name: d.entity_name,
      description: d.description,
      currency: d.currency,
      amount_original: d.amount_original,
      amount_paid: d.amount_paid,
      status: d.status,
      payments: d.payments,
      notes: d.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase.from('debts').insert(chunk);

    if (insertError) {
      console.error(`❌ Error al insertar lote ${i / batchSize + 1}:`, insertError.message);
      process.exit(1);
    }

    insertedCount += chunk.length;
    console.log(`  ✓ Insertados ${insertedCount}/${debtsToInsert.length} registros...`);
  }

  console.log(`\n🎉 ¡Migración exitosa! Se insertaron ${insertedCount} cuentas en la tabla 'debts'.\n`);
}

main().catch((err) => {
  console.error('Error fatal durante la migración:', err);
  process.exit(1);
});
