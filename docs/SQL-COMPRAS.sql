-- ============================================================================
-- ALQUIMIATEX - TABLA DE COMPRAS HISTÓRICAS E INSUMOS
-- Almacena el registro de compras realizadas (fecha, artículo, cantidad, costo Bs/USD)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.inventory_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_date DATE NULL,
  item_name TEXT NOT NULL,
  quantity_raw TEXT NULL,
  quantity NUMERIC(10, 2) NULL,
  unit TEXT NULL DEFAULT 'unidad',
  cost_raw TEXT NULL,
  cost_usd NUMERIC(10, 2) NULL,
  cost_bs NUMERIC(12, 2) NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para búsqueda y ordenamiento
CREATE INDEX IF NOT EXISTS idx_inventory_purchases_date ON public.inventory_purchases(purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_purchases_item_name ON public.inventory_purchases(item_name);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.inventory_purchases ENABLE ROW LEVEL SECURITY;

-- Política de acceso para socios autenticados
DROP POLICY IF EXISTS "Socios autenticados gestionan compras" ON public.inventory_purchases;
CREATE POLICY "Socios autenticados gestionan compras"
  ON public.inventory_purchases
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
