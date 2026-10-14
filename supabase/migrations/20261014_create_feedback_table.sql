-- ==============================================================================
-- ALQUIMIATEX — TABLA DE FEEDBACK (feedback) Y POLÍTICAS DE SEGURIDAD (RLS)
-- Creado: 2026-10-14
-- Propósito: Cuestionario privado de evaluación beta (/feedback)
-- ==============================================================================

-- 1. CREACIÓN DE LA TABLA 'feedback'
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Bloque 1: Perfil del evaluador
    tester_name TEXT NOT NULL,
    device_used TEXT NOT NULL,
    browser_used TEXT NOT NULL,
    
    -- Bloque 2: Primera Impresión & Estética
    first_impression_rating INTEGER NOT NULL CHECK (first_impression_rating BETWEEN 1 AND 5),
    style_clarity TEXT NOT NULL,
    brand_trust INTEGER NOT NULL CHECK (brand_trust BETWEEN 1 AND 5),
    
    -- Bloque 3: Usabilidad del Flujo de Pedido (/pedido)
    order_flow_rating INTEGER NOT NULL CHECK (order_flow_rating BETWEEN 1 AND 5),
    step1_experience TEXT NOT NULL,
    ai_generation_experience TEXT NOT NULL,
    image_upload_experience TEXT NOT NULL,
    
    -- Bloque 4: Políticas, Precios y WhatsApp
    pricing_policy_clarity TEXT NOT NULL,
    whatsapp_redirect_rating TEXT NOT NULL,
    
    -- Bloque 5: Diagnóstico Crítico y NPS
    errors_found TEXT DEFAULT 'Ninguno',
    most_liked_feature TEXT NOT NULL,
    least_liked_feature TEXT NOT NULL,
    nps_recommendation INTEGER NOT NULL CHECK (nps_recommendation BETWEEN 1 AND 10),
    
    -- Metadatos de auditoría y versión
    version_tested TEXT NOT NULL DEFAULT 'v1.0',
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. ÍNDICES DE RENDIMIENTO PARA EL PANEL DE ADMINISTRACIÓN
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_nps ON public.feedback (nps_recommendation);
CREATE INDEX IF NOT EXISTS idx_feedback_version ON public.feedback (version_tested);

-- 3. HABILITACIÓN DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE SEGURIDAD (RLS)
-- a) Permitir inserción anónima (para que los evaluadores beta envíen sin registrar cuenta)
DROP POLICY IF EXISTS "Permitir inserción pública de feedback" ON public.feedback;
CREATE POLICY "Permitir inserción pública de feedback"
ON public.feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- b) Solo socios autenticados pueden LEER los registros de feedback en el panel admin
DROP POLICY IF EXISTS "Solo socios autenticados pueden leer feedback" ON public.feedback;
CREATE POLICY "Solo socios autenticados pueden leer feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (true);

-- c) Solo socios autenticados pueden ACTUALIZAR o ELIMINAR feedback (mantenimiento)
DROP POLICY IF EXISTS "Solo socios autenticados pueden actualizar feedback" ON public.feedback;
CREATE POLICY "Solo socios autenticados pueden actualizar feedback"
ON public.feedback
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Solo socios autenticados pueden eliminar feedback" ON public.feedback;
CREATE POLICY "Solo socios autenticados pueden eliminar feedback"
ON public.feedback
FOR DELETE
TO authenticated
USING (true);
