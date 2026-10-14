# Bitácora Histórica y Resumen Completo del Proyecto — AlquimiaTex

**Proyecto:** Plataforma web oficial para taller de sublimación y confección textil artesanal en Caracas, Venezuela.  
**Versión Actual:** `v1.0` (Beta Funcional en Producción).  
**Dominio / Producción:** `https://alquimiatex.vercel.app`  
**Entorno Local:** `http://localhost:3000` (LAN: `http://192.168.1.2:3000`)  
**Fecha de Actualización:** 14 de Octubre de 2026.

---

## 1. Identidad Visual y Landing Page ("Taller Experimental")

Se estableció una estética diferenciadora basada en el concepto **"Taller Textil Experimental / Streetwear"**:
- **Paleta de Color:**
  - Papel crema / Kraft claro: `#F3EFE6` y `#F8F5EE`.
  - Negro profundo con sombras duras sólidas: `#0A0A0A` con `shadow-[3px_3px_0px_#0A0A0A]`, `shadow-[5px_5px_0px_#0A0A0A]`.
  - Acentos de color: Amarillo neón (`#FACC15`), Magenta/Carmesí (`#F43F5E`), Cyan (`#06B6D4`), Púrpura taller (`#581C87`).
- **Tipografías:**
  - `Oswald` (Google Fonts): Para titulares industriales y números grandes.
  - `Space Mono`: Para códigos de pedidos, etiquetas técnicas y badges.
  - `Geist Sans`: Para lectura limpia y legible en formularios.
- **Componentes de la Landing Page:**
  - `LandingHeader`: Sticky con logo oficial, botón de WhatsApp y ticker de cinta amarilla animada (`MOCKUP DIGITAL GRATIS • 4 A 7 DÍAS HÁBILES • TALLER PETARE`).
  - `LandingHero`: Collage streetwear con sellos de taller, citas y mockup de productos reales.
  - `LandingWorkGallery`: Catálogo visual con pestañas (Camisas, Mousepads, Rompecabezas, Gorras, Tazas).
  - `LandingWholesaleOffers`: Precios y promociones especiales por docena (50% de abono).
  - `LandingInstagramSection`: Feed y llamada a la comunidad `@alquimia_tex`.
  - `LandingOrderCta` & `LandingFooter`: Enlace directo al configurador y políticas del taller.

---

## 2. Flujo Completo de Pedido (`/pedido`)

El wizard interactivo se divide en **3 pasos progresivos**, sincronizados mediante `localStorage` para no perder avance:

### Paso 1: Configuración de Artículos y Carrito Dinámico
- **Productos Soportados:**
  - **Camisas / Franelas:**
    - Tallas: Adulto (S a 2XL) y Niños (Talla 4 a 16).
    - Cortes: `Caballero / Unisex`, `Dama`, `Oversize`.
    - Colores: Blanco y Gris Jaspeado Claro.
    - Telas: `Microdurazno`, `50% Jersey / Algodón`, `Algodón 100% Peinado`, `Poliéster Deportivo`.
  - **Mousepads:** Estándar (22x18 cm), Gamer XL (70x30 cm), Gamer XXL (90x40 cm), Ergonómico con gel.
  - **Rompecabezas Sublimados:** Varios formatos de piezas.
  - **Otros Artículos:** Campo abierto para tazas, gorras o pedidos especiales a cotizar.
- **UX Multi-Variante:**
  - Botón principal: `+ Agregar este producto al pedido`.
  - Botón secundario: `+ Agregar otra variante de este mismo producto` (añade el actual y limpia talla/color para configurar inmediatamente otra prenda para otra persona en la misma orden).
  - Banner toast: *"Producto agregado ✓ — ¿Necesitas otra talla o color? Puedes agregarlo de nuevo con las variantes que quieras."*
  - Desglose detallado en el carrito de compras: cada artículo se muestra numerado (`#1`, `#2`) con sus variantes exactas para que sea obvio que son prendas independientes.

### Paso 2: Personalización Visual e Inteligencia Artificial
- **Subida de Imagen Propia:** Soporta hasta 5 MB (JPG, PNG, WEBP). Se convierte y sube a Supabase Storage con URL pública.
- **Generador de IA (Abacus.AI / FLUX.1):**
  - Permite crear conceptos visuales desde una descripción de texto cuando el cliente no tiene una imagen lista (hasta 3 intentos).
  - Copy educativo y advertencias:
    - *"¿No tienes clara tu idea? La IA te genera un concepto visual desde tu descripción de texto"*.
    - *"⚠️ Importante: la IA NO usa tu imagen de referencia. Genera un concepto nuevo desde la descripción. Si ya tienes tu imagen clara, no necesitas usar la IA — se enviará tal cual al taller"*.
    - Banner condicional si ya subió foto: *"Ya subiste una imagen. ¿De verdad quieres que la IA genere algo diferente? Puedes saltar este paso"*.
- **Diseño Responsive:** Botones adaptados con breakpoint `lg:` (1024px) y textos optimizados (`Volver al Paso 1`, `Continuar al Paso 3`) para garantizar que nunca se desborden en pantallas pequeñas (320px) ni en monitores grandes (1920px).

### Paso 3: Contacto, Políticas y Enlace a WhatsApp
- Recopilación de nombre del cliente y teléfono.
- Fecha estimada de entrega calculada automáticamente (4 a 7 días hábiles).
- Modalidad de pago: 100% anticipado para pedidos al detal / 50% abono para docenas al mayor.
- Métodos de pago preferidos: Pago Móvil, Binance USDT, Efectivo en Taller, A convenir.
- Generación de código amigable único: `#ALQ-XXXX`.
- Generación automática de enlace oficial a WhatsApp con mensaje estructurado:
  - Resumen del pedido y código.
  - Listado de artículos con Talla, Corte formateado (`Caballero / Unisex`), Color y Tela (`• Tela: Microdurazno`).
  - Idea de diseño o aviso de foto adjunta en web.
  - Recordatorio de políticas (4-7 días hábiles, sin cambios por error de talla, envío de comprobante).

---

## 3. Base de Datos e Infraestructura en Supabase

- **Tabla `public.orders`:**
  - Columnas: `id` (UUID PK), `order_code` (TEXT UNIQUE), `customer_name`, `customer_phone`, `delivery_date`, `payment_type`, `order_pricing_type`, `payment_method`, `items` (JSONB con todos los productos), `status` (default: `pendiente_contacto`), `ai_attempts_used`, `created_at`.
  - Políticas RLS:
    - Inserción pública (`anon, authenticated`) para que los clientes envíen sus pedidos desde la web.
    - Lectura, edición y eliminación restringidas a usuarios autenticados (socios del taller).
- **Storage Bucket `order-references`:**
  - Bucket público configurado para almacenar las imágenes de referencia cargadas por los clientes.
- **Configuración Next.js en Vercel (`next.config.mjs`):**
  - Configurado `experimental.serverActions.bodySizeLimit: '5mb'` para admitir imágenes de hasta 5 MB en Server Actions sin errores `Body exceeded 1 MB limit`.

---

## 4. Formulario Beta Privado de Feedback (`/feedback`)

Herramienta interna desarrollada para recopilar diagnósticos de 5 a 10 beta testers:
- **Privacidad:** No indexado en Google (`robots: { index: false, follow: false, nocache: true }`).
- **16 Preguntas Estructuradas en 5 Bloques:**
  1. *Perfil:* Nombre/apodo, dispositivo y navegador.
  2. *Primera Impresión:* Calificación de la landing (1-5), claridad del estilo Taller y confianza (1-5).
  3. *Flujo `/pedido`:* Facilidad general (1-5), Paso 1, Generador de IA y Subida de fotos.
  4. *Políticas y WhatsApp:* Claridad en pagos/tiempos y verificación de redirección a WhatsApp.
  5. *Diagnóstico Crítico y NPS:* Detección de errores, lo que más gustó, lo que menos gustó y NPS (1-10).
- **Protección y Persistencia:**
  - Campo honeypot anti-spam oculto (`website_url`).
  - Registro transparente de `version_tested` (`v1.0`).
  - Auto-guardado y recuperación de borrador en `localStorage` (`alquimiatex_feedback_draft`).
  - Barra de progreso dinámica en tiempo real (0% a 100%).
  - Pantalla de agradecimiento final con sello de taller y botón para copiar el link al portapapeles.
- **Tabla `public.feedback` en Supabase:**
  - Creada con esquema tipado, índices para paneles de administración y políticas RLS (inserción pública para testers, lectura reservada para socios).

---

## 5. Historial de Commits Clave

| Commit | Mensaje | Descripción |
| :--- | :--- | :--- |
| `a07fc0b` | `checkpoint: versión estable antes de arreglos de feedback` | Punto de restauración seguro. |
| `27d30a5` | `fix: botón Paso 2 responsive (md:flex-row + whitespace-normal)` | Primera iteración responsive de botones de navegación. |
| `44d8605` | `fix: botones Paso 2 responsive definitivo (lg + textos cortos)` | Breakpoint elevado a `lg:` y textos cortos para evitar desbordes en monitores 1920px. |
| `aedeff8` | `feat: variante tipo de tela para camisas` | Introducción de `shirtFabric` en camisas sin alterar la base de datos (JSONB). |
| `5d25bd4` | `fix: tipo de tela en WhatsApp + eliminar duplicado Oversize + label corte correcto` | Mapeo de corte a "Caballero / Unisex", inclusión de tela en WhatsApp y sustitución de Oversize por Poliéster Deportivo. |
| `685484d` | `feat: mejorar UX para agregar múltiples variantes del mismo producto` | Botón secundario de otra variante, banner informativo y desglose nítido en el carrito. |
| `5459ea9` | `fix(ux): clarificar propósito de IA generativa y advertencia sobre foto de referencia` | Explicación clara de que la IA no transforma la foto propia. |
| `acd2ae7` | `fix: clarificar copy de IA (no usa imagen de referencia)` | Título explícito, aviso condicional cuando ya subieron foto y botón de 3 intentos. |

---

## 6. Estado Actual y Próximos Pasos (Fase 2)

- ✅ **Producción 100% Operativa:** Landing page, configurador multi-producto, subida a storage, generación con IA, tabla de pedidos en Supabase, redirección a WhatsApp y formulario beta de feedback.
- 📋 **Roadmap Fase 2 (Próximamente):**
  1. Panel de administración web para visualizar pedidos y respuestas de feedback.
  2. Implementación de generación Image-to-Image con IA (`flux_kontext`) para que la IA tome la foto de referencia como base real.
  3. Notificaciones push o integración directa con webhook de WhatsApp/Telegram.
