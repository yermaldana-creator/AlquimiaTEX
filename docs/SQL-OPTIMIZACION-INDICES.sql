-- ============================================================================
-- ALQUIMIATEX - FASE 1: ÍNDICES DE RENDIMIENTO PARA PEDIDOS
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================================================

-- 1. Índice para filtrado rápido por estado de pedido (tabs de estado)
CREATE INDEX IF NOT EXISTS idx_orders_status 
  ON public.orders(status);

-- 2. Índice para ordenamiento cronológico (pedidos más recientes primero)
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
  ON public.orders(created_at DESC);

-- 3. Índice compuesto para la consulta más frecuente (filtrar por estado y ordenar por fecha)
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at 
  ON public.orders(status, created_at DESC);

-- 4. Índice para búsqueda rápida por código de pedido (#ALQ-XXXX)
CREATE INDEX IF NOT EXISTS idx_orders_order_code 
  ON public.orders(order_code);

-- 5. Índice para búsqueda por nombre de cliente
CREATE INDEX IF NOT EXISTS idx_orders_customer_name 
  ON public.orders(customer_name);
