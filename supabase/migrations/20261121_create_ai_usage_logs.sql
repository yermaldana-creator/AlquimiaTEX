-- ============================================================================
-- Tabla de control de cuota de generación IA (por IP hasheada + fusible global)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  product TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para consultas ultrarrápidas de ventanas de 24 horas
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_ip_created
  ON public.ai_usage_logs (ip_hash, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created
  ON public.ai_usage_logs (created_at DESC);

-- Activar RLS y bloquear 100% el acceso público (anon / authenticated)
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Solo el backend con service_role puede leer e insertar registros
DROP POLICY IF EXISTS "Solo service_role accede a ai_usage_logs" ON public.ai_usage_logs;
CREATE POLICY "Solo service_role accede a ai_usage_logs"
  ON public.ai_usage_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
