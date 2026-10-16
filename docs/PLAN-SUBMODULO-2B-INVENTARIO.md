# Plan de Implementación: Sub-módulo 2B — Inventario del Taller (/admin/inventario)

> [!IMPORTANT]
> **Alcance del Sub-módulo 2B:**
> * Reemplazo directo del Excel que usan actualmente los 3 socios para gestionar el inventario.
> * Clasificación en 4 categorías: **Materiales/Insumos**, **Telas por Metro**, **Prendas Terminadas en Stock** y **Otros Productos**.
> * Control de existencias con alertas de stock mínimo, ajuste rápido de unidades (`+1` / `-1`), buscador con debounce de 300ms y soporte de importación/exportación CSV desde Excel.
> * **Regla de oro:** No se escribirá código hasta que apruebes explícitamente este plan.

---

## 1. Esquema de Base de Datos en Supabase (SQL)

Crearemos la tabla `inventory_items` con Row Level Security (RLS) para que únicamente los socios autenticados puedan leer y escribir:

```sql
-- 1. Tabla de Inventario de AlquimiaTex (Sub-módulo 2B)
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('material', 'tela', 'prenda', 'otro')),
  name TEXT NOT NULL,
  variant TEXT, -- Color, Talla, Corte o especificación (ej: "Blanca Dama M", "Cian", "70x30cm")
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (quantity >= 0), -- Bloqueo estricto de stock negativo
  unit TEXT NOT NULL DEFAULT 'unidad', -- 'unidad', 'metro', 'hoja', 'resma', 'ml', 'rollo', 'paquete'
  min_stock_alert NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (min_stock_alert >= 0),
  cost_per_unit NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (cost_per_unit >= 0), -- Costo unitario en USD
  notes TEXT,
  archived_at TIMESTAMPTZ DEFAULT NULL, -- Soft Delete para no perder historial
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Índice único para evitar duplicados en ítems activos (category + name + variant)
CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_unique_active 
  ON inventory_items (category, name, COALESCE(variant, '')) 
  WHERE archived_at IS NULL;

-- 3. Índices para búsqueda rápida y filtrado
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory_items(name);
CREATE INDEX IF NOT EXISTS idx_inventory_min_stock ON inventory_items(quantity, min_stock_alert);
CREATE INDEX IF NOT EXISTS idx_inventory_archived ON inventory_items(archived_at);

-- 3. Habilitar Seguridad por Fila (RLS)
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- 4. Políticas: Solo usuarios autenticados (socios) pueden leer y modificar
CREATE POLICY "Socios autenticados pueden ver inventario"
  ON inventory_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Socios autenticados pueden insertar inventario"
  ON inventory_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Socios autenticados pueden actualizar inventario"
  ON inventory_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Socios autenticados pueden eliminar inventario"
  ON inventory_items FOR DELETE
  TO authenticated
  USING (true);

-- 5. Trigger automático para actualizar updated_at
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_inventory_updated_at ON inventory_items;
CREATE TRIGGER trigger_inventory_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_updated_at();
```

---

## 2. Catálogo Oficial de Categorías y Colores CMYK

| Categoría | Clave BD | Color CMYK / Estilo | Unidades Habituales | Ejemplos del Taller |
| :--- | :--- | :--- | :--- | :--- |
| **Materiales / Insumos** | `material` | `#FACC15` (Amarillo Mostaza)<br>`bg-[#FEF9C3] text-[#854D0E]` | `ml`, `hoja`, `resma`, `rollo`, `unidad` | Tinta Sublimación (Cian, Magenta, Amarillo, Negro), Papel A4/A3, Cinta térmica, Vinil textil |
| **Telas por Metro** | `tela` | `#06B6D4` (Cian Taller)<br>`bg-[#CFFAFE] text-[#155E75]` | `metro` | Microdurazno Heavy (Blanca, Negra, Gris), Micro Rib, Jersey Boxer Algodón |
| **Prendas en Stock** | `prenda` | `#581C87` (Púrpura Taller)<br>`bg-[#F3E8FF] text-[#581C87]` | `unidad` | Franela Microdurazno Blanca Dama M, Caballero L, Franela Niño Talla 8 |
| **Otros Productos** | `otro` | `#F43F5E` (Magenta / Carmesí)<br>`bg-[#FFE4E6] text-[#9F1239]` | `unidad`, `set` | Tazas 11oz, Tazas Mágicas, Set 4 tazas apilables, Mousepads, Rompecabezas |

---

## 3. Estructura de Archivos a Crear y Modificar

```
src/
├── app/
│   └── admin/
│       ├── inventario/
│       │   └── page.tsx                     <-- Página principal: tabs, KPIs, buscador, tabla y alertas
│       └── layout.tsx                       <-- Ya protege y añade el header global
├── components/
│   └── admin/
│       ├── inventory-kpis.tsx               <-- 4 tarjetas: Total Ítems, Alertas Críticas, Metros de Tela, Valor USD
│       ├── inventory-tabs.tsx               <-- Pestañas de categorías con badges de conteo CMYK
│       ├── inventory-table.tsx              <-- Tabla responsive + mobile cards + botones rápidos +1 / -1
│       ├── inventory-form-modal.tsx         <-- Modal interactivo para Crear / Editar ítem
│       ├── inventory-alerts-banner.tsx      <-- Panel colapsable de ítems con stock bajo el mínimo
│       ├── inventory-csv-modal.tsx          <-- Herramienta para Importar/Exportar CSV (migración Excel)
│       └── admin-header.tsx                 <-- Enlace de navegación activo a "Inventario" (/admin/inventario)
├── actions/
│   └── inventory.actions.ts                 <-- getInventory, createItem, updateItem, deleteItem, adjustStockDelta
├── lib/
│   └── constants.ts                         <-- Catálogo de categorías, unidades y colores CMYK
└── types/
    └── index.ts                             <-- Tipos InventoryItem, InventoryCategory, InventoryFormData
```

---

## 4. Funcionalidades Detalladas del Módulo

### A. Dashboard de KPIs del Inventario
1. **Total de Ítems**: Conteo total de productos y materiales en catálogo.
2. **Alertas de Stock Bajo**: Conteo de ítems cuya `quantity <= min_stock_alert` (destacado en rojo si > 0).
3. **Metros de Tela Disponibles**: Suma acumulada de metros de todas las telas registradas.
4. **Valor Total en Inventario**: Suma de `(quantity * cost_per_unit)` en dólares USD para conocer el capital inmovilizado en taller.

### B. Navegación y Filtros Reactivos
* **Pestañas por Categoría**: Todos / Materiales / Telas / Prendas / Otros (con conteo numérico en cada tab).
* **Buscador en Vivo con Debounce de 300ms**: Filtra instantáneamente por nombre, variante o notas sin saturar la red.
* **Filtro Rápido "Solo Alertas"**: Un switch o botón que muestra de inmediato los insumos que necesitan reposición urgente.

### C. Tabla de Control y Acciones Rápidas
* **Columnas Desktop**:
  1. *Ítem / Categoría*: Nombre + badge CMYK de categoría.
  2. *Variante / Especificación*: Talla, color, corte o detalle.
  3. *Existencia Actual*: Número con unidad (`8.00 metros`, `100 ml`, `3 unidades`).
  4. *Ajuste Rápido*: Botones compactos `[-1]` y `[+1]` que actualizan en Supabase al instante sin necesidad de abrir modales.
  5. *Stock Mínimo*: Límite configurado. Si la existencia es menor o igual, muestra badge rojo `⚠️ Bajo Mínimo`.
  6. *Costo / Valor*: Costo unitario y valor total en dólares.
  7. *Acciones*: Botón de editar (abre modal con los datos cargados) y botón de eliminar (con diálogo de confirmación).
* **Vista Móvil Automática**: En pantallas de celular se despliega como tarjetas limpias con botones táctiles grandes.

### D. Modal de Creación y Edición Inteligente
* Formulario adaptativo según la categoría seleccionada:
  * Al seleccionar **Prenda**: ofrece selectores rápidos de telas (`Microdurazno`, `Jersey`), cortes (`Unisex`, `Dama`, `Oversize`) y tallas oficiales (`S`, `M`, `L`, `XL`, niños).
  * Al seleccionar **Tela**: sugiere unidades en `metro` y campos de color y descripción de caída.
  * Al seleccionar **Material**: sugiere unidades como `ml`, `hoja`, `resma`, `rollo`.
* Validación estricta con feedback visual y prevención de stock negativo.

### E. Importación y Exportación CSV (Migración del Excel de los Socios)
* **Descarga de Plantilla CSV**: Archivo modelo con las columnas requeridas para rellenar en Excel.
* **Importador de CSV en Lote**: Permite a los socios subir su archivo Excel/CSV y registrar decenas de ítems en segundos.
* **Exportador de Respaldo**: Descarga en 1 clic el inventario completo en formato `.csv` para respaldo externo.

---

## 5. Criterios de Aceptación que Probarás en Vivo

1. **Navegación**: El header de socios muestra el nuevo enlace a **"Inventario"** (`/admin/inventario`).
2. **Pestañas**: Al pulsar en *Materiales*, *Telas*, *Prendas* u *Otros*, la tabla filtra instantáneamente.
3. **Buscador 300ms**: Al escribir en el buscador, espera 300ms y filtra por nombre o variante.
4. **Creación de Ítem**: Al pulsar `+ Nuevo Ítem`, el modal permite registrar un nuevo material o tela con su stock mínimo.
5. **Ajuste Rápido `+1` / `-1`**: Al hacer clic en los botones de ajuste, la cantidad se actualiza en Supabase y el valor total se recalcula.
6. **Alerta de Stock Crítico**: Si la cantidad cae por debajo del mínimo, se activa el badge rojo de advertencia y se incrementa el contador de alertas.
7. **Filtro de Alertas**: Al activar "Solo alertas", la lista muestra únicamente los insumos críticos.
8. **Edición y Eliminación**: Se pueden editar todos los campos o eliminar un registro previa confirmación.
9. **Importación / Exportación CSV**: Se puede exportar el inventario actual a CSV y cargar datos en lote.
10. **Calidad de Código**: `npm run lint` y `npm run build` pasando al 100% sin advertencias.
