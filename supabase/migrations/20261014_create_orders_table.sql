-- ==============================================================================
-- ALQUIMIATEX — TABLA DE PEDIDOS (orders) Y POLÍTICAS DE SEGURIDAD (RLS)
-- ==============================================================================

-- 1. CREACIÓN DE LA TABLA 'orders'
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_date DATE NOT NULL,
    payment_type TEXT DEFAULT 'unidad',           -- 'unidad' (100% anticipado) o 'docena' (50% abono)
    order_pricing_type TEXT DEFAULT 'unidad',     -- Alias para compatibilidad con código existente
    payment_method TEXT DEFAULT 'pago_movil',     -- 'pago_movil', 'binance', 'efectivo', 'acordar'
    items JSONB NOT NULL DEFAULT '[]'::jsonb,     -- Array completo de productos, tallas, colores y fotos
    status TEXT NOT NULL DEFAULT 'pendiente_contacto', -- 'pendiente_contacto', 'abonado', 'en_confeccion', 'listo', 'entregado'
    ai_attempts_used INTEGER NOT NULL DEFAULT 0,  -- Contador de intentos de IA utilizados
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. ÍNDICES DE RENDIMIENTO PARA CONSULTAS RÁPIDAS
CREATE INDEX IF NOT EXISTS idx_orders_order_code ON public.orders (order_code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- 3. HABILITACIÓN DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE RLS PARA LA TABLA 'orders'
-- a) Permitir inserción anónima (el cliente web con anon_key guarda el pedido)
DROP POLICY IF EXISTS "Permitir inserción pública de pedidos" ON public.orders;
CREATE POLICY "Permitir inserción pública de pedidos"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- b) Solo usuarios autenticados (socios/administradores) pueden LEER pedidos
DROP POLICY IF EXISTS "Solo socios autenticados pueden leer pedidos" ON public.orders;
CREATE POLICY "Solo socios autenticados pueden leer pedidos"
ON public.orders
FOR SELECT
TO authenticated
USING (true);

-- c) Solo usuarios autenticados pueden ACTUALIZAR estados de pedidos
DROP POLICY IF EXISTS "Solo socios autenticados pueden actualizar pedidos" ON public.orders;
CREATE POLICY "Solo socios autenticados pueden actualizar pedidos"
ON public.orders
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- d) Solo usuarios autenticados pueden ELIMINAR pedidos
DROP POLICY IF EXISTS "Solo socios autenticados pueden eliminar pedidos" ON public.orders;
CREATE POLICY "Solo socios autenticados pueden eliminar pedidos"
ON public.orders
FOR DELETE
TO authenticated
USING (true);

-- ==============================================================================
-- 5. POLÍTICAS DE SEGURIDAD PARA STORAGE (Bucket: order-references)
-- ==============================================================================
-- Asegurar que los clientes anónimos puedan subir fotos de referencia
DROP POLICY IF EXISTS "Permitir subida pública de imágenes de referencia" ON storage.objects;
CREATE POLICY "Permitir subida pública de imágenes de referencia"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'order-references');

-- Asegurar lectura pública de las imágenes para WhatsApp y visualización
DROP POLICY IF EXISTS "Permitir lectura pública de imágenes de referencia" ON storage.objects;
CREATE POLICY "Permitir lectura pública de imágenes de referencia"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'order-references');
