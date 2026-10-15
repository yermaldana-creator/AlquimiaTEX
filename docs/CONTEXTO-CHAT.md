# CONTEXTO DEL PROYECTO: ALQUIMIATEX

## SOBRE MÍ Y MI FORMA DE TRABAJAR:
- Soy un emprendedor venezolano, dueño de un taller de sublimación textil llamado AlquimiaTex, ubicado en La Dolorita, Petare, Caracas.
- Somos 3 socios: uno vende, uno plancha, uno diseña. Los 3 tenemos los mismos privilegios.
- NO programo desde cero. Entiendo la lógica pero no leo código avanzado.
- Mi rol es SUPERVISOR/TECH LEAD: yo dirijo, la IA escribe el código, yo reviso y apruebo.
- Uso Google Antigravity como IDE con IA (usa Gemini 3.8 Flash como modelo principal).
- Uso también ChatLLM de Abacus.AI (plan de $10/mes con 20,000 créditos mensuales).
- Prefiero ir por fases pequeñas, aprobar planes antes de escribir código, y probar cada módulo antes de avanzar.
- Estoy aprendiendo. Prefiero explicaciones con manzanas y sin tecnicismos innecesarios.
- A veces uso lenguaje venezolano coloquial.

---

## SOBRE EL NEGOCIO (ALQUIMIATEX)
- Taller artesanal de sublimación textil y personalización.
- Productos: camisas/franelas, tazas mágicas, mugs, mousepads, rompecabezas, y artículos promocionales.
- Ubicación: La Dolorita, Petare, Caracas, Venezuela.
- Sin RIF ni facturación fiscal todavía (etapa inicial).
- Instagram: @alquimia_tex
- WhatsApp oficial: +58 424 1589317
- Redes: solo Instagram por ahora.

### REGLAS DE NEGOCIO CLAVE:
- Tiempo de entrega: 4 a 7 días hábiles desde confirmación del abono.
- Pedidos por unidad: 100% anticipado (obligatorio).
- Pedidos por docena (12+ unidades): 50% abono + 50% contra entrega.
- Sin pasarela de pago automática (por ahora). Pagos manuales: Pago Móvil, Binance USDT, efectivo en taller.
- Máximo 2 estampados por pieza (delante y detrás).
- Mockup digital (render previo) gratuito antes de estampar.
- No se hacen cambios ni devoluciones por errores de talla del cliente.
- No aplican descuentos por volumen a Oversize ni Algodón 100% Peinado.
- Precios base por docena:
  * Microdurazno Blanca: $5 c/u ($60 docena)
  * Microdurazno Negra: $7 c/u ($84 docena)
  * 50% Jersey / 50% Poliéster: $10 c/u ($120 docena)
- Límite de 10 artículos por pedido.
- Límite de 3 intentos globales de IA por pedido.
- Descripción del diseño: máximo 500 caracteres.

---

## STACK TECNOLÓGICO
- Next.js 14.2.35 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zod + react-hook-form + @hookform/resolvers
- Supabase (DB PostgreSQL + Storage + Auth)
- Google Gemini (gemini-3.5-flash-lite) para optimizar prompts
- Abacus.AI RouteLLM con modelo flux_kontext (FLUX.1) para generar imágenes (4 créditos/imagen)
- Vercel para deploy (plan Hobby)
- GitHub para respaldo
- Estructura: Pragmatic Flat (Alternativa 3) — `components/public`, `components/admin`, `components/ui`, `actions/`, `lib/`, `types/`

### VARIABLES DE ENTORNO (en .env.local, NUNCA se suben a GitHub):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_WHATSAPP_NUMBER=584241589317`
- `GEMINI_API_KEY`
- `ABACUS_API_KEY`
- `ABACUS_BASE_URL=https://routellm.abacus.ai/v1`

### URLs:
- Repositorio: `github.com/yermaldana-creator/AlquimiaTEX`
- Producción: `alquimia-tex.vercel.app`
- Local: `localhost:3000`

---

## LO QUE YA ESTÁ HECHO Y FUNCIONANDO
1. **Landing pública con estilo "Taller Experimental / Collage Streetwear"**:
   - Fondo papel crema (`#F3EFE6`), tipografía Oswald condensada, acentos CMYK del logo.
   - Header sticky con logo, WhatsApp y botón "Hacer Pedido".
   - Hero con eslogan, badges de confianza, doble CTA.
   - Galería con filtros por categoría.
   - Sección de ofertas por docena con precios oficiales.
   - Sección de Instagram (`@alquimia_tex`).
   - CTA final y footer con contacto y ubicación.

2. **Formulario de pedidos (/pedido) - Wizard de 3 pasos**:
   - Paso 1: Selección de producto (tarjetas táctiles), variantes dinámicas, carrito multi-producto (hasta 10 artículos), botón "Agregar otra variante del mismo producto", editar/eliminar, tipo de tela.
   - Paso 2: Descripción (máx 500 chars), subida de imagen (máx 5MB, JPG/PNG/WEBP), generación de idea visual con IA (3 intentos globales), advertencia de que la IA no transforma la imagen del cliente.
   - Paso 3: Contacto, selector de fecha (4-7 días hábiles), instrucciones de pago manual (Pago Móvil, Binance USDT, Efectivo), checkbox de términos con enlaces clickeables, resumen completo.
   - Confirmación: código único `#ALQ-XXXX`, guardado en Supabase, redirección directa a WhatsApp con mensaje preformateado.

3. **Pipeline de IA**:
   - Gemini optimiza el prompt en español → inglés técnico.
   - Abacus.AI (FLUX.1 Kontext) genera la imagen.
   - Fallback SVG si falla.
   - Timeout de 90 segundos.

4. **Base de datos Supabase**:
   - Tabla `orders` con RLS (inserción pública, lectura solo autenticados).
   - Tabla `feedback` con RLS.
   - Bucket `order-references` público para imágenes.

5. **Formulario de feedback beta (/feedback)**:
   - 16 preguntas, 5 bloques, NPS 1-10.
   - No indexado, honeypot anti-spam, guardado en localStorage.
   - Guarda respuestas en tabla `feedback` de Supabase.

6. **Páginas legales**:
   - `/terminos`: Términos y condiciones.
   - `/privacidad`: Política de privacidad.
   - Diseño integrado al estilo Taller Experimental.

7. **Documentación completa en docs/**:
   - `ESTADO-PROYECTO.md`
   - `DECISIONES-TECNICAS.md`
   - `GUIA-DESARROLLO.md`
   - `ROADMAP.md`
   - `CHANGELOG.md`
   - `acuerdos-formulario.md`
   - `RESUMEN-HISTORICO.md`

8. **Deploy en Vercel** (producción online).

9. **Respaldo en GitHub**.

---

## LO QUE FALTA (ROADMAP)
- **FASE 3**: ✅ COMPLETADA (páginas legales)
- **FASE 4**: ⏳ SIGUIENTE - Panel de Administración (`/admin`) - ALTA PRIORIDAD
  - Sub-módulo 1: Autenticación de socios con Supabase Auth + middleware de protección.
  - Sub-módulo 2: Dashboard + Lista de pedidos con filtros por estado.
  - Sub-módulo 3: Ficha detallada del pedido (ver comprobantes, cambiar estado, descargar imágenes).
  - Sub-módulo 4: Métricas rápidas (unidades pendientes por tipo de prenda).
- **FASE 5**: ⏳ Dominio propio (comprar `alquimiatex.com` o `.com.ve` y conectar a Vercel).
- **FASE 6**: ⏳ Feedback beta con 5-10 personas reales (ya está el formulario `/feedback` listo).
- **FASE 7**: ⏳ Pasarela de cobro automática (solo cuando tengamos RIF).

---

## CÓMO TRABAJAMOS JUNTOS
1. Actúas como Tech Lead senior. Yo dirijo, tú me guías.
2. Antes de cada tarea grande, usamos `/plan` en Antigravity para revisar el plan.
3. Explicaciones con manzanas y analogías sencillas cuando sea algo técnico.
4. Priorizar siempre el MVP funcional sobre la perfección.
5. Recordar hacer git commit después de cada fase exitosa.
6. Alertar de inmediato cualquier riesgo de seguridad.
7. Si algo puede esperar para una fase posterior, señalarlo para no sobre-construir.
8. Comunicación clara, directa y con buena energía.
