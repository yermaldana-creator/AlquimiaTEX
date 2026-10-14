# Registro de Cambios (Changelog): AlquimiaTex

Todos los cambios notables realizados en el proyecto **AlquimiaTex** se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [0.4.0] - 2026-10-14

### Fase: Optimización de IA y Estabilización de WhatsApp

#### Añadido
* Pipeline híbrido de IA: optimización automática de prompts en lenguaje natural usando **Google Gemini (`gemini-3.5-flash-lite`)** antes de invocar la generación gráfica con **Abacus.AI FLUX.1 (`flux_kontext`)**.
* Límite estricto de 500 caracteres en la descripción de diseño (en frontend con contador visual `X/500`, validación en esquema Zod y en la API Route).
* Configuración del canal oficial de WhatsApp del taller: `+58 424 1589317`.
* Documentación de acuerdos en `docs/acuerdos-formulario.md` sobre el canal oficial y la redirección directa.

#### Modificado
* Aumento del timeout del endpoint `/api/generate-preview` a **90 segundos** para tolerar tiempos de inferencia en colas GPU sin disparar errores de timeout abortado.
* Reemplazo de `window.open` por redirección directa con `window.location.href = whatsappUrl` en [`order-success-dialog.tsx`](file:///C:/laragon/www/AlquimiaTEX/src/components/public/order-success-dialog.tsx), eliminando el bloqueo silencioso de navegadores por políticas anti pop-up.
* Indicador de progreso en el botón de confirmación: `Guardando y abriendo WhatsApp...`.

#### Commits destacados
* `7f5cad9` (2026-10-14): *Número de WhatsApp oficial configurado y redirección directa sin pop-up blocker*
* `bfcef98` (2026-10-14): *feat(ai): optimizacion de prompts con Gemini, limite 500 caracteres y timeout extendido a 90s para Abacus.AI FLUX.1*
* `2695186` (2026-10-14): *fix(whatsapp): configurar numero oficial +58 4241589317 y redireccion directa sin bloqueo de pop-ups*

---

## [0.3.0] - 2026-10-13

### Fase: Flujo Multi-Producto y Pagos Manuales

#### Añadido
* **Carrito Multi-Artículo (Paso 1):** Soporte para encargar hasta 10 artículos por pedido con botón *"+ Agregar otro producto"*, edición en caliente y eliminación de productos.
* **Personalización Multi-Ítem (Paso 2):** Tarjetas independientes por cada producto agregado con su propio campo de descripción, subida de foto de referencia hasta 5MB y generador de ideas con IA (respetando un límite global de 3 intentos por pedido).
* **Contacto, Entrega y Pagos (Paso 3):**
  * Resumen completo de todos los artículos con miniaturas y detalles.
  * Selector de fechas hábiles acotado entre 3 y 7 días hábiles desde la fecha actual.
  * Cajas de instrucciones para pagos manuales: Pago Móvil (Banesco/BDV), Binance USDT y Efectivo en Taller con requisito del 30% de abono.
* **Integración con Abacus.AI RouteLLM:** Adopción del modelo `flux_kontext` (FLUX.1 Kontext) con consumo de 4 créditos por imagen.
* **Server Action de Pedidos:** `submitOrderAction` en `src/actions/orders.actions.ts` para subir fotos a Supabase Storage (`order-references`), insertar en la tabla `orders` y construir la URL de WhatsApp.
* Diálogo de éxito [`OrderSuccessDialog`](file:///C:/laragon/www/AlquimiaTEX/src/components/public/order-success-dialog.tsx) mostrando el código único `#ALQ-XXXX`.

#### Commits destacados
* `f14bd12` (2026-10-13): *feat(pedido): flujo multi-producto completo, pagos manuales y generacion IA con Abacus.AI (FLUX.1)*
* `c05517c` (2026-10-13): *fix(api): pipeline hibrido con Gemini 3.8 Flash para generacion real de imagenes con IA*

---

## [0.2.0] - 2026-10-13

### Fase: Construcción de Pasos 1 y 2 del Formulario

#### Añadido
* Conector de base de datos Supabase en `src/lib/supabase/client.ts` y `server.ts`.
* Componente [`OrderStep1`](file:///C:/laragon/www/AlquimiaTEX/src/components/public/order-step-1.tsx) con catálogo de variantes para franelas, mousepads y rompecabezas.
* Componente [`OrderStep2`](file:///C:/laragon/www/AlquimiaTEX/src/components/public/order-step-2.tsx) para captura de ideas de diseño y fotos de referencia.
* Esquemas de validación Zod en `src/lib/schemas.ts` para tipado estricto de productos y pedidos.
* Constantes del catálogo y variantes textiles en `src/lib/constants.ts`.

#### Commits destacados
* `1c16cd1` (2026-10-13): *feat(pedido): configurar Supabase, Gemini y construir Paso 2 del formulario (idea, imagen e IA)*
* `6113dec` (2026-10-13): *feat(pedido): implementar Paso 1 del formulario (producto, variantes, cantidad y validacion Zod)*

---

## [0.1.0] - 2026-10-13

### Fase: Inicialización y Documentación de Acuerdos

#### Añadido
* Inicialización del proyecto Next.js 14 con TypeScript, Tailwind CSS y componentes de shadcn/ui.
* Configuración de linters, formato de código (ESLint, Prettier) y `.gitignore` estricto protegiendo `.env.local`.
* Adopción de la arquitectura **Pragmatic Flat (Alternativa 3)**.
* Documentación de requisitos y acuerdos de negocio en `docs/acuerdos-formulario.md`.

#### Commits destacados
* `7f25cce` (2026-10-13): *docs: integrar diagrama y especificacion detallada del Paso 1 (Producto y Variantes)*
* `1b4613b` (2026-10-13): *docs: actualizar tiempo estimado de elaboracion a 3-7 dias y bloqueo en calendario*
* `8d5464b` (2026-10-13): *docs: acuerdos de diseno y logica de negocio para el formulario de pedidos*
* `56f541c` (2026-10-13): *Estructura de carpetas inicial*
* `ff64f57` (2026-10-13): *chore: initial commit with Next.js 14, Tailwind, shadcn/ui, ESLint and Prettier*
