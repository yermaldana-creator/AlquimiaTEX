# Acuerdos de Diseño y Lógica de Negocio: Formulario de Pedidos

Documento de especificación y acuerdos técnicos para el flujo de pedidos de **AlquimiaTex**, definido mediante sesión `/grill-me`.

---

## 1. Flujo de Envío y Persistencia de Datos
- **Doble canal**: Al hacer clic en "Enviar pedido", el formulario guarda primero el registro en la base de datos de **Supabase** con estado inicial `pendiente_contacto`.
- **Código de pedido amigable**: Se genera un identificador corto y legible para humanos (ejemplo: `#ALQ-1042`).
- **Apertura de WhatsApp**: Acto seguido, se abre automáticamente la URL de WhatsApp (`https://wa.me/...`) con el resumen preformateado y el código `#ALQ-XXXX` para que tanto el cliente como los socios sincronicen el pedido en el chat y en el panel.

---

## 2. Manejo de Imágenes de Referencia
- **Subida a Storage**: El cliente puede subir de forma opcional una imagen de referencia.
  - Validación estricta: tipos MIME permitidos `image/jpeg`, `image/png`, `image/webp`.
  - Tamaño máximo por archivo: `5 MB`.
  - Almacenamiento: Bucket de Supabase Storage.
- **Limitación técnica de WhatsApp**: Los enlaces directos `wa.me` no permiten adjuntar archivos binarios de forma automática.
- **Instrucción al cliente**: En el mensaje generado de WhatsApp se incluirá explícitamente:
  > *"⚠️ Por favor, adjunta tu imagen de referencia en este chat (los enlaces web no pueden adjuntar archivos automáticamente)."*
- **Disponibilidad para socios**: La imagen queda registrada en Supabase y accesible inmediatamente desde el panel `/admin`.

---

## 3. Generador de Ideas Visuales con IA (Google Gemini)
- **Carácter opcional**: La generación visual es una ayuda creativa opcional, no un requisito obligatorio para enviar el pedido.
- **Protección de cuotas (Rate Limiting)**:
  - Máximo **3 intentos** de generación por usuario / pedido para proteger la cuota de la capa gratuita de Gemini API.
  - El botón requiere que el cliente haya ingresado al menos una descripción mínima (20 caracteres).
- **Procesamiento Server-Side**: La llamada a la API de Gemini se ejecuta en una ruta de servidor (`/api/generate-preview`) para nunca exponer la API key en el cliente.

---

## 4. Política de Precios y Cotizaciones
- **Precios dinámicos**: El formulario **no calcula montos totales ni automáticos** debido a la variabilidad de costos e inflación en Venezuela.
- **Etiqueta informativa**: Mostrará claramente la leyenda **"Precio a cotizar"**.
- **Condición de abono**: Se recuerda explícitamente la política del **30% de abono** requerido para iniciar la producción una vez acordado el presupuesto final por WhatsApp. El socio fija el monto en el panel `/admin`.

---

## 5. Fecha Deseada de Entrega
- **Tiempo real de taller (3 a 7 días)**: Al ser un taller artesanal y pequeño, la producción toma tiempo y depende del inventario. No se realizan pedidos de un día para otro.
- **Bloqueo en el calendario**: El selector de fechas bloquea automáticamente cualquier día menor a 3 días a partir de hoy (mínimo de entrega: a partir del 3er día).
- **Mensaje informativo**: Se indica claramente al cliente:
  > *"⏳ Nuestro tiempo estimado de elaboración y entrega es de 3 a 7 días hábiles, contados a partir de la confirmación del 30% de abono."*

---

## 6. Validación y Sanitización Telefónica
- **Selector de país**: Código `+58` (Venezuela) por defecto con máscaras para las principales operadoras móviles (`0412`, `0414`, `0424`, `0416`, `0426`), manteniendo compatibilidad con números internacionales.
- **Sanitización estricta para `wa.me`**: La función generadora del enlace limpiará cualquier caracter no numérico (espacios, guiones, paréntesis y el signo `+`), transformando por ejemplo `+58 412-1234567` en `584121234567`.

---

## 7. Experiencia de Usuario (UX) Móvil
- **Wizard multi-paso (3 pasos)** con barra de progreso optimizada para navegación en teléfonos móviles:
  1. **Paso 1 (Producto y Variantes)**: Tipo de producto (camisa, mousepad, rompecabezas, otro), cantidad y variantes (talla, corte, dimensiones).
  2. **Paso 2 (Personalización y Creatividad)**: Descripción de la idea, subida de imagen de referencia y botón opcional de generación con IA (Gemini).
  3. **Paso 3 (Datos de Entrega y Contacto)**: Nombre completo, teléfono WhatsApp, fecha deseada de entrega, aceptación de términos y resumen del pedido.
- **Persistencia local (`localStorage`)**: El estado del formulario se sincroniza en almacenamiento local para evitar la pérdida de datos si el cliente retrocede pasos, refresca la pantalla o pierde conexión momentáneamente.

---

## 8. Configuración de Destino WhatsApp
- **Variable de entorno**: Variable `NEXT_PUBLIC_WHATSAPP_NUMBER` configurable en `.env.local`.
- **Fallback**: Valor por defecto centralizado en `src/lib/constants.ts`.
