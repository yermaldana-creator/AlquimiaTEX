# Acuerdos de Diseño y Lógica de Negocio: Formulario de Pedidos (Actualizado)

Documento de especificación y acuerdos técnicos para el flujo de pedidos de **AlquimiaTex**, actualizado con soporte para **múltiples productos por pedido** y **pagos manuales sin pasarela**.

---

## 1. Flujo de Envío y Persistencia de Datos
- **Doble canal**: Al hacer clic en "Enviar pedido", el formulario guarda primero el registro en la base de datos de **Supabase** con estado inicial `pendiente_contacto`.
- **Código de pedido amigable**: Se genera un identificador corto y legible para humanos (ejemplo: `#ALQ-1042`).
- **Apertura de WhatsApp**: Acto seguido, se abre automáticamente la URL de WhatsApp (`https://wa.me/...`) con el resumen preformateado y el código `#ALQ-XXXX` para que tanto el cliente como los socios sincronicen el pedido en el chat y en el panel.

---

## 2. Múltiples Productos por Pedido (Carrito Multi-Artículo)
- El cliente puede encargar **varios productos diferentes en un mismo pedido** (ej: 2 camisas + 1 mousepad + 1 rompecabezas).
- **Paso 1 (Selección y Carrito)**:
  - El cliente configura un producto con sus variantes y cantidad.
  - Botón destacado: **"+ Agregar otro producto al pedido"**.
  - Lista visual tipo "carrito" que muestra todos los productos agregados hasta el momento con opción de quitar cualquiera.
  - Contador total de artículos y validación de mínimo 1 producto para avanzar.
- **Paso 2 (Personalización por Producto)**:
  - Se genera una tarjeta independiente para **CADA producto agregado**.
  - Cada artículo tiene su propio campo de descripción y su propio selector de imagen de referencia.
  - Cada artículo puede usar el generador de ideas con IA (Gemini), respetando un **límite global acumulado de 3 intentos** por pedido.
- **Paso 3 (Resumen Multi-Ítem y WhatsApp)**:
  - El resumen final y el mensaje preformateado de WhatsApp desglosan la lista completa de artículos con sus especificaciones.

---

## 3. Manejo de Imágenes de Referencia
- **Subida a Storage**: Cada artículo puede tener su propia imagen de referencia opcional.
  - Validación estricta: tipos MIME permitidos `image/jpeg`, `image/png`, `image/webp`.
  - Tamaño máximo por archivo: `5 MB`.
  - Almacenamiento: Bucket de Supabase Storage (`order-references`).
- **Instrucción al cliente**: En el mensaje generado de WhatsApp se incluirá explícitamente:
  > *"⚠️ Por favor, adjunta tus imágenes de referencia en este chat (los enlaces web no pueden adjuntar archivos automáticamente)."*
- **Disponibilidad para socios**: Las imágenes quedan registradas en Supabase y accesibles inmediatamente desde el panel `/admin`.

---

## 4. Política de Pagos (100% Manual, Sin Pasarelas de Cobro)
- **Cero pasarelas automáticas**: No hay cobro ni pasarelas automáticas integradas en la web.
- **Instrucciones claras en el Paso 3**:
  - **Pago Móvil**: Datos bancarios (Banco, Cédula/RIF, Teléfono).
  - **Binance Pay / USDT**: Dirección o Pay ID de Binance.
  - **Efectivo**: Pago directo en el taller (La Dolorita, Caracas).
- **Requisito del 30% de abono**: Se recuerda de forma destacada que la producción física inicia al confirmar el abono del 30%.
- **Validación del pago**: El cliente envía la captura del comprobante por el chat de WhatsApp.
- **Gestión en el panel**: Los socios revisan la captura y marcan manualmente el estado del pedido como `"abono recibido"` o `"pagado"` en el panel `/admin`.

---

## 5. Generador de Ideas Visuales con IA (Google Gemini + Motor Gráfico)
- **Carácter opcional**: La generación visual es una ayuda creativa opcional.
- **Límite global**: Máximo **3 intentos en total por pedido** (distribuibles entre los productos agregados).
- **Procesamiento Server-Side**: La llamada se ejecuta en `/api/generate-preview` con timeout ampliado a 35s y rate limiting por IP.

---

## 6. Fecha Deseada de Entrega
- **Tiempo real de taller (3 a 7 días)**: Al ser un taller artesanal, no se realizan pedidos express de 24 horas.
- **Bloqueo en el calendario**: El selector bloquea automáticamente fechas menores a 3 días a partir de hoy (mínimo de entrega: a partir del 3er día).
- **Mensaje informativo**:
  > *"⏳ Nuestro tiempo estimado de elaboración y entrega es de 3 a 7 días hábiles, contados a partir de la confirmación del 30% de abono."*

---

## 7. Validación y Sanitización Telefónica
- Selector de código `+58` (Venezuela) por defecto con operadoras (`0412`, `0414`, `0424`, `0416`, `0426`) y soporte internacional.
- Sanitización estricta para `wa.me` eliminando cualquier caracter no numérico (convierte `+58 412-1234567` en `584121234567`).

---

## 8. Persistencia Local (`localStorage`)
- El carrito de productos agregados, sus descripciones y los datos de contacto se sincronizan continuamente en `localStorage` para evitar pérdidas ante recargas o navegación entre pasos.
