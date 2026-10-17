-- ============================================================================
-- ALQUIMIATEX - SUBMÓDULO 3: COSTOS Y PRECIOS
-- Tablas para Insumos/Componentes Base y Recetas de Costos de Productos
-- NOTA: Este script contiene ÚNICAMENTE la estructura (tablas, índices y RLS).
-- NO CONTIENE DATOS SEMILLA (INSERTs) para permitir cargar los datos reales del taller desde la interfaz.
-- ============================================================================

-- 1. TABLA DE COMPONENTES E INSUMOS BASE
-- Almacena los costos unitarios de cada insumo (tinta, tela, papel, mano de obra, empaque, etc.)
CREATE TABLE IF NOT EXISTS public.cost_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('prenda_base', 'prenda_dtf', 'tinta', 'papel', 'empaque', 'mano_obra', 'otro')),
  unit TEXT NOT NULL DEFAULT 'unidad',
  cost_per_unit NUMERIC(10, 4) NOT NULL CHECK (cost_per_unit >= 0),
  notes TEXT NULL,
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para optimizar filtros y búsquedas
CREATE INDEX IF NOT EXISTS idx_cost_components_category ON public.cost_components(category);
CREATE INDEX IF NOT EXISTS idx_cost_components_archived_at ON public.cost_components(archived_at);
CREATE INDEX IF NOT EXISTS idx_cost_components_name ON public.cost_components(name);

-- 2. TABLA DE PLANTILLAS / RECETAS DE COSTOS DE PRODUCTOS
-- Define la fórmula de fabricación de cada producto combinando insumos + margen de ganancia
CREATE TABLE IF NOT EXISTS public.product_cost_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'camisa' CHECK (category IN ('camisa', 'taza', 'mousepad', 'otro')),
  description TEXT NULL,
  margin_type TEXT NOT NULL DEFAULT 'fixed' CHECK (margin_type IN ('fixed', 'percentage', 'target_price')),
  margin_value NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  target_price NUMERIC(10, 2) NULL,
  components JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para optimizar consultas de recetas
CREATE INDEX IF NOT EXISTS idx_product_cost_templates_category ON public.product_cost_templates(category);
CREATE INDEX IF NOT EXISTS idx_product_cost_templates_is_active ON public.product_cost_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_product_cost_templates_archived_at ON public.product_cost_templates(archived_at);
CREATE INDEX IF NOT EXISTS idx_product_cost_templates_product_name ON public.product_cost_templates(product_name);

-- 3. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
ALTER TABLE public.cost_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_cost_templates ENABLE ROW LEVEL SECURITY;

-- Acceso total a socios autenticados para cost_components
DROP POLICY IF EXISTS "Socios autenticados gestionan componentes de costo" ON public.cost_components;
CREATE POLICY "Socios autenticados gestionan componentes de costo"
  ON public.cost_components
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Acceso total a socios autenticados para product_cost_templates
DROP POLICY IF EXISTS "Socios autenticados gestionan recetas de costo" ON public.product_cost_templates;
CREATE POLICY "Socios autenticados gestionan recetas de costo"
  ON public.product_cost_templates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
