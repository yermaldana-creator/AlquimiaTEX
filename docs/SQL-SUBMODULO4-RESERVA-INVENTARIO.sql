-- ============================================================================
-- ALQUIMIATEX - SUBMÓDULO 4: RESERVA ATÓMICA DE INVENTARIO
-- ============================================================================

-- 1. Modificación de la tabla orders
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS inventory_reserved BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS inventory_reserved_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS inventory_reservations JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Índice para búsquedas rápidas por estado de reserva
CREATE INDEX IF NOT EXISTS idx_orders_inventory_reserved 
  ON public.orders(inventory_reserved);

-- ============================================================================
-- 2. FUNCIÓN RPC: reserve_order_inventory
-- Reserva stock atómicamente para un pedido dado.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.reserve_order_inventory(
  p_order_id UUID,
  p_reservations JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_reserved BOOLEAN;
  v_item RECORD;
  v_current_stock NUMERIC;
  v_item_name TEXT;
  v_enriched_reservations JSONB := '[]'::jsonb;
  v_elem JSONB;
BEGIN
  -- 1. Bloqueo exclusivo de la fila del pedido para evitar condiciones de carrera
  SELECT inventory_reserved INTO v_order_reserved
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'El pedido especificado no existe.'
    );
  END IF;

  IF v_order_reserved IS TRUE THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Este pedido ya tiene inventario reservado previamente.'
    );
  END IF;

  IF p_reservations IS NULL OR jsonb_array_length(p_reservations) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No se enviaron insumos para reservar.'
    );
  END IF;

  -- 2. Validar stock suficiente agrupando por cada inventory_item_id
  -- (Por si el cliente pidió 2 prendas en un ítem y 1 en otro que usan el mismo insumo)
  FOR v_item IN
    SELECT 
      (elem->>'inventory_item_id')::UUID AS item_id,
      SUM((elem->>'quantity')::NUMERIC) AS total_needed
    FROM jsonb_array_elements(p_reservations) AS elem
    GROUP BY (elem->>'inventory_item_id')::UUID
  LOOP
    -- Bloquear la fila del inventario
    SELECT quantity, name || COALESCE(' (' || variant || ')', '')
    INTO v_current_stock, v_item_name
    FROM public.inventory_items
    WHERE id = v_item.item_id AND archived_at IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Uno de los insumos seleccionados no existe o fue archivado.'
      );
    END IF;

    IF v_current_stock < v_item.total_needed THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', format('Stock insuficiente para "%s". Requerido: %s, Disponible en almacén: %s.', v_item_name, v_item.total_needed, v_current_stock)
      );
    END IF;
  END LOOP;

  -- 3. Descontar el stock de cada ítem de inventario
  FOR v_item IN
    SELECT 
      (elem->>'inventory_item_id')::UUID AS item_id,
      SUM((elem->>'quantity')::NUMERIC) AS total_needed
    FROM jsonb_array_elements(p_reservations) AS elem
    GROUP BY (elem->>'inventory_item_id')::UUID
  LOOP
    UPDATE public.inventory_items
    SET 
      quantity = quantity - v_item.total_needed,
      updated_at = NOW()
    WHERE id = v_item.item_id;
  END LOOP;

  -- 4. Enriquecer el snapshot histórico de la reserva
  FOR v_elem IN SELECT * FROM jsonb_array_elements(p_reservations)
  LOOP
    SELECT quantity INTO v_current_stock
    FROM public.inventory_items
    WHERE id = (v_elem->>'inventory_item_id')::UUID;

    v_enriched_reservations := v_enriched_reservations || jsonb_build_object(
      'order_item_id', v_elem->>'order_item_id',
      'inventory_item_id', v_elem->>'inventory_item_id',
      'inventory_item_name', v_elem->>'inventory_item_name',
      'quantity', (v_elem->>'quantity')::NUMERIC,
      'stock_after_reserve', v_current_stock,
      'reserved_at', NOW()
    );
  END LOOP;

  -- 5. Actualizar el pedido como reservado
  UPDATE public.orders
  SET 
    inventory_reserved = TRUE,
    inventory_reserved_at = NOW(),
    inventory_reservations = v_enriched_reservations
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Inventario apartado exitosamente.',
    'reservations', v_enriched_reservations
  );

EXCEPTION WHEN OTHERS THEN
  -- Cualquier error imprevisto revierte la transacción automáticamente
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- ============================================================================
-- 3. FUNCIÓN RPC: release_order_inventory
-- Libera y devuelve el stock al inventario en caso de cancelación o reversión.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.release_order_inventory(
  p_order_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_reserved BOOLEAN;
  v_reservations JSONB;
  v_item RECORD;
BEGIN
  -- 1. Bloquear pedido y verificar estado
  SELECT inventory_reserved, inventory_reservations
  INTO v_order_reserved, v_reservations
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'El pedido especificado no existe.'
    );
  END IF;

  IF v_order_reserved IS NOT TRUE THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Este pedido no tiene inventario reservado para liberar.'
    );
  END IF;

  -- 2. Devolver cantidades agrupadas a inventory_items
  FOR v_item IN
    SELECT 
      (elem->>'inventory_item_id')::UUID AS item_id,
      SUM((elem->>'quantity')::NUMERIC) AS total_return
    FROM jsonb_array_elements(v_reservations) AS elem
    GROUP BY (elem->>'inventory_item_id')::UUID
  LOOP
    UPDATE public.inventory_items
    SET 
      quantity = quantity + v_item.total_return,
      updated_at = NOW()
    WHERE id = v_item.item_id;
  END LOOP;

  -- 3. Limpiar estado en el pedido
  UPDATE public.orders
  SET 
    inventory_reserved = FALSE,
    inventory_reserved_at = NULL,
    inventory_reservations = '[]'::jsonb
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Inventario liberado y devuelto al almacén exitosamente.'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Permisos de ejecución
GRANT EXECUTE ON FUNCTION public.reserve_order_inventory TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.release_order_inventory TO authenticated, service_role;
