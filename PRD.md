# AlquimiaTex — Plataforma Web

## 1. Contexto
Emprendimiento de sublimación ubicado en La Dolorita, Caracas, Venezuela.
Somos 3 socios con los mismos privilegios: uno vende, uno plancha, uno diseña.
Actualmente no tenemos RIF ni facturación fiscal. Recibimos pedidos por WhatsApp,
Instagram DM y boca a boca.

## 2. Objetivo
Crear una plataforma web que:
1. Muestre nuestro trabajo (catálogo visual + feed de Instagram).
2. Permita a los clientes enviar pedidos personalizados con una idea visual.
3. Acepte pagos (Pago Móvil, Binance/USDT, efectivo) con 30% de abono.
4. Envíe el pedido completo por WhatsApp con un clic.
5. Tenga un panel privado para los 3 socios: inventario, deudas, cuentas y reportes.

## 3. Stack técnico
- Frontend: Next.js 14+ (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Base de datos: PostgreSQL en Supabase (plan free)
- Auth: Supabase Auth (email + password)
- IA para mockups: Google Gemini API (free tier)
- Deploy: Vercel (plan free)
- Repositorio: GitHub

## 4. Módulos

### Módulo 1 — Landing pública
- Hero con logo, eslogan y CTA "Haz tu pedido".
- Galería "Nuestros trabajos" (fotos de camisas, mousepads, rompecabezas).
- Sección "Síguenos en Instagram" (feed o enlace destacado).
- Sección "Haz tu pedido" (formulario).
- Footer con redes y contacto.
- Blog/sección de novedades (nice-to-have, fase 2).

### Módulo 2 — Formulario de pedido
Campos:
- Nombre y apellido
- Teléfono (WhatsApp)
- Producto (select: camisa, mousepad, rompecabezas, otro)
- Cantidad
- Variantes (talla, color, tamaño) según producto
- Descripción de lo que quiere (texto largo)
- Imagen de referencia (opcional, subida)
- Fecha deseada de entrega
- Aceptación de términos y condiciones

Al enviar: genera un resumen + abre WhatsApp con el pedido completo predefinido.

### Módulo 3 — Idea visual con IA (opcional)
- El cliente puede pedir "generar una idea visual" tras describir su pedido.
- Se llama a la API de Gemini con el texto + imagen de referencia.
- Devuelve una imagen orientativa. NO es un mockup exacto del producto.
- El cliente puede regenerarla o ignorarla.
- La imagen se adjunta al pedido que llega al panel y al WhatsApp.

### Módulo 4 — WhatsApp
- Botón flotante siempre visible.
- Al enviar el formulario, abre `https://wa.me/<NUMERO>?text=<PEDIDO_FORMATEADO>`.
- El texto debe incluir: nombre, teléfono, producto, variantes, descripción, fecha, si adjuntó imagen.

### Módulo 5 — Pagos
- Mostrar instrucciones de pago (Pago Móvil con datos bancarios, Binance USDT con dirección, efectivo).
- NO procesamos el pago dentro de la web (no hay pasarela integrada al inicio).
- Se indica claramente: 30% de abono para iniciar producción.
- El cliente confirma el pago por WhatsApp con captura.
- En el panel, el socio marca el pedido como "abono recibido" manualmente.

### Módulo 6 — Panel de socios (`/admin`)
Autenticación:
- Solo emails específicos (los 3 socios) pueden acceder.
- Mismo nivel de privilegios para los 3.

Vistas:
1. **Dashboard**: pedidos pendientes, ventas del mes, deudas activas, alertas de stock bajo.
2. **Pedidos**: lista con filtros (estado: pendiente, en diseño, aprobado, en producción, entregado, pagado).
3. **Inventario**: materiales (planchas, tinta, papel, camisas en blanco) y productos terminados. Campos: nombre, cantidad, unidad, stock mínimo, alerta.
4. **Deudas**:
   - Clientes: quién nos debe, cuánto, cuándo pagó parcial.
   - Proveedores: a quién le debemos, cuánto, vencimiento.
   - Saldo actualizado automáticamente.
5. **Cuentas**: balance general, ingresos, gastos, ganancias. Filtro por rango de fechas.
6. **Reportes**: diario, semanal, mensual. Exportar a PDF y Excel.
7. **Clientes**: historial de pedidos por cliente.

### Módulo 7 — Legal
- Página de Términos y Condiciones.
- Página de Política de Privacidad.
- Checkbox de aceptación en el formulario de pedido.

## 5. Reglas críticas
- NUNCA exponer API keys en el frontend. Todas en `.env.local` y `.env` en Vercel.
- Validar todas las entradas con Zod.
- Rate limiting en el endpoint de Gemini.
- El panel `/admin` protegido con middleware de Supabase.
- Los precios son variables (Venezuela): NO hardcodear precios. Usar "cotización" y mostrarlo como "a convenir".
- Moneda dual: mostrar Bs y USDT donde aplique.

## 6. Idiomas y moneda
- Español (Venezuela).
- Mostrar montos en Bs y su equivalente en USDT.

## 7. Referencia de estilo
- Logo ya existe (lo subirá el usuario).
- Paleta: por definir según logo. Sugerido: morado/violeta + dorado/naranja.
- Estilo: moderno, limpio, creativo, mobile-first.

## 8. Fuera del alcance (por ahora)
- Integración de pasarela de pago automática (Pabilo, VEXPay).
- Facturación fiscal con RIF.
- Multiidioma.
- App móvil nativa.
- Chat en vivo dentro de la web.