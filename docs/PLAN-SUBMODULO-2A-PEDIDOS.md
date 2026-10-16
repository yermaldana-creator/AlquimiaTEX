# Plan de Implementación: Sub-módulo 2A — Lista y Detalle de Pedidos (/admin)

> [!IMPORTANT]
> **Alcance Estricto del Sub-módulo 2A:**
> * Visualización, filtrado, búsqueda y cambio de estados para todos los pedidos de Supabase.
> * Ficha técnica detallada por pedido con descarga de artes para sublimación y botón de contacto por WhatsApp.
> * **Sin reserva de inventario por ahora:** El módulo de stock de telas y control de almacén se integrará en el Sub-módulo 2C.
> * **Regla de oro:** No se escribirá código hasta contar con tu aprobación explícita de este plan.

---

## 1. Estructura de Archivos a Crear y Modificar

```
src/
├── app/
│   └── admin/
│       └── (protected)/
│           ├── pedidos/
│           │   ├── page.tsx               <-- Lista general de pedidos con filtros y paginación
│           │   └── [id]/
│           │       └── page.tsx           <-- Ficha técnica detallada del pedido #ALQ-XXXX
│           └── page.tsx                   <-- Dashboard de bienvenida (enlaza a /admin/pedidos)
├── components/
│   └── admin/
│       ├── orders-list.tsx                <-- Tabla interactiva, tabs de estado, buscador y paginador
│       ├── order-detail.tsx               <-- Vista completa: prendas, variantes, imágenes y pagos
│       ├── order-status-badge.tsx         <-- Badge visual con colores CMYK oficiales
│       ├── order-status-select.tsx        <-- Dropdown interactivo para cambiar estado en 1 clic
│       └── admin-header.tsx               <-- Enlace de navegación activo a "Pedidos"
├── actions/
│   └── orders.actions.ts                  <-- getOrders, getOrderById, updateOrderStatus (con auth check)
├── lib/
│   └── constants.ts                       <-- Catálogo oficial de los 6 estados con colores y labels
└── types/
    └── index.ts                           <-- Tipos OrderStatus y AdminOrderDetail
```

---

## 2. Catálogo Oficial de los 6 Estados y Colores CMYK

En `src/lib/constants.ts` definiremos la lista oficial de estados respetando el taller:

| Clave de Estado | Etiqueta en Español | Color CMYK / Tailwind | Significado en Taller |
| :--- | :--- | :--- | :--- |
| `pendiente_contacto` | 🟡 Pendiente de Contacto | `#FACC15` (Amarillo Mostaza) | Pedido recibido de la web, sin verificar pago |
| `abono_verificado` | 🔵 Abono Verificado | `#06B6D4` (Cian Taller) | 50% mayor o 100% detal confirmado en banco |
| `en_produccion` | 🟣 En Producción | `#581C87` (Púrpura Taller) | En corte, impresión de papel o plancha |
| `listo_para_entrega`| 🟢 Listo para Entrega | `#10B981` (Verde Esmeralda) | Prenda lista, revisada y empacada |
| `entregado` | ⚪ Entregado | `#6B7280` (Gris Neutro) | Entregado en La Dolorita o enviado (saldo liquidado) |
| `cancelado` | 🔴 Cancelado | `#F43F5E` (Magenta / Carmesí) | Pedido anulado por cliente o falta de pago |

> *Compatibilidad asegurada:* Mapearemos internamente los estados anteriores (`abonado` ➔ `abono_verificado`, `en_confeccion` ➔ `en_produccion`, `listo` ➔ `listo_para_entrega`) para que ningún pedido viejo quede invisible.

---

## 3. Funcionalidades de la Lista de Pedidos (`/admin/pedidos`)

* **Tabla Responsive / Mobile-First**: En computadoras se muestra la tabla tabular completa; en teléfonos móviles se adaptan como tarjetas apiladas limpias sin desbordes.
* **Buscador en Tiempo Real**: Filtra instantáneamente por código `#ALQ-XXXX`, nombre o teléfono del cliente.
* **Pestañas de Estado**: Filtro de un solo toque con contador numérico por cada estado.
* **Paginación Inteligente**: 20 pedidos por página para garantizar carga ultra-rápida.
* **Clic en Fila**: Navega directamente a la ficha detallada `/admin/pedidos/[id]`.

---

## 4. Funcionalidades de la Ficha Detallada (`/admin/pedidos/[id]`)

* **Botón Directo de WhatsApp**: Abre `https://wa.me/58XXXXXXXXXX` con mensaje preformateado:
  `"¡Hola Carlos! Te escribimos del taller AlquimiaTex respecto a tu pedido #ALQ-4821..."`.
* **Descarga de Imágenes en Alta Resolución**: Abre las URLs de Supabase Storage en pestañas directas con `target="_blank"` para que el diseñador las descargue limpias sin pérdida de calidad.
* **Selector de Estados en Ficha**: Dropdown interactivo con los 6 estados oficiales que actualiza la base de datos y revalida la pantalla en milisegundos.

---

## 5. Seguridad de las Server Actions (`src/actions/orders.actions.ts`)

Todas las acciones administrativas validarán la identidad del socio antes de tocar la base de datos:

1. **`getOrders({ page, limit, status, search })`**:
   * Verifica sesión activa con `getSessionUser()`. Si no hay sesión, rechaza la consulta.
   * Ejecuta consulta a la tabla `orders` con políticas RLS activas.
   * Devuelve pedidos y total para paginación.
2. **`getOrderById(id)`**:
   * Verifica sesión de socio.
   * Busca por UUID o por `order_code`.
   * Retorna el pedido completo con su array JSONB `items`.
3. **`updateOrderStatus(orderId, newStatus)`**:
   * Valida sesión de socio.
   * Valida que `newStatus` pertenezca al catálogo de los 6 estados válidos.
   * Actualiza el campo `status` en Supabase y ejecuta `revalidatePath("/admin/pedidos")`.

---

## 6. Criterios de Aceptación que Probarás en Vivo

1. **Navegación**: Al visitar `http://localhost:3000/admin/pedidos` veo la tabla de pedidos ordenada del más reciente al más antiguo.
2. **Filtros por Estado**: Al pulsar en "Pendientes", "Abonados" o "En producción", la tabla filtra los resultados de inmediato.
3. **Buscador en Vivo**: Al escribir `#ALQ` o el nombre de un cliente, la tabla encuentra el registro al instante.
4. **Paginación**: Si hay más de 20 pedidos, se muestran los controles de página siguiente/anterior.
5. **Apertura de Ficha**: Al hacer clic en cualquier fila o en el código `#ALQ-XXXX`, se abre la ficha completa en `/admin/pedidos/[id]`.
6. **Inspección de Imágenes**: En la ficha puedo ver las miniaturas y pulsar "Descargar imágenes" para abrirlas en tamaño completo.
7. **Cambio de Estado**: Al cambiar el estado en el dropdown (ej. a *Abono Verificado* o *En Producción*), se actualiza en Supabase y se refleja en la lista general.
8. **Contacto WhatsApp**: El botón de WhatsApp abre el chat directo con el número del cliente.
9. **Calidad de Código**: `npm run lint` y `npm run build` pasan al 100% sin errores ni advertencias.
