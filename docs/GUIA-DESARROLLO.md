# Guía Práctica de Desarrollo: AlquimiaTex

Esta guía contiene las instrucciones paso a paso para retomar el desarrollo, instalar el entorno local, ejecutar pruebas y resolver problemas comunes en **AlquimiaTex**.

---

## 1. Requisitos Previos

* **Node.js:** Versión 18.17.0 o superior (recomendado Node.js 20+ o Node.js 24).
* **Gestor de paquetes:** `npm` (incluido con Node.js).
* **Git:** Para control de versiones.
* **Navegador moderno:** Chrome, Edge, Safari o Firefox.

---

## 2. Instalación y Configuración Inicial

### Paso 1: Clonar e instalar dependencias
```bash
git clone <url-del-repositorio>
cd AlquimiaTEX
npm install
```

### Paso 2: Configurar las variables de entorno
Copia la plantilla de ejemplo `.env.example` y crea el archivo privado `.env.local`:

```bash
cp .env.example .env.local
```

Abre `.env.local` y define los valores reales:

```env
# Supabase (Base de datos y Storage)
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Número de WhatsApp oficial para recibir pedidos (formato internacional sin signos)
NEXT_PUBLIC_WHATSAPP_NUMBER=584241589317

# Google Gemini API (para optimización de prompts)
GEMINI_API_KEY=AQ...

# Abacus.AI API (motor gráfico FLUX.1 Kontext)
ABACUS_API_KEY=s2_...
ABACUS_BASE_URL=https://routellm.abacus.ai/v1
```

> [!IMPORTANT]
> El archivo `.env.local` nunca debe subirse al control de versiones. Verifica que esté listado en `.gitignore`.

---

## 3. Comandos de Ejecución y Calidad

### Iniciar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

### Verificación de tipos TypeScript
```bash
npx tsc --noEmit
```

### Ejecutar el Linter (ESLint)
```bash
npm run lint
```

### Compilar para producción (Build)
```bash
npm run build
```

### Formato de código (Prettier)
```bash
npm run format:check   # Verificar formato
npm run format         # Aplicar formato automático
```

---

## 4. Convención de Git Commits

El proyecto sigue la convención de **Conventional Commits**:

```bash
git add .
git commit -m "tipo(alcance): descripción concisa en minúsculas"
```

### Tipos comunes:
* `feat`: Nueva característica (ej: `feat(pedido): agregar selector de colores`).
* `fix`: Corrección de errores (ej: `fix(api): aumentar timeout de abacus a 90s`).
* `docs`: Documentación (ej: `docs: actualizar guia de desarrollo`).
* `style`: Formateo de código sin cambios en lógica.
* `refactor`: Reestructuración de código existente.

---

## 5. Checklist de Verificación Paso a Paso del Formulario

Para probar el flujo completo en `http://localhost:3000/pedido`:

### Paso 1 (Carrito de Productos):
- [ ] Selecciona **Camisa / Franela**, elige talla `M`, corte `Dama`, color `Blanco` y cantidad `2`. Pulsa **"Agregar al Pedido"**.
- [ ] Comprueba que el producto aparezca en el resumen del carrito con el badge de 2 unidades.
- [ ] Pulsa **"Editar"** en la tarjeta del producto; verifica que los campos se recarguen en el formulario con sus valores originales.
- [ ] Cambia la talla a `L` y pulsa **"Actualizar Artículo"**.
- [ ] Agrega un segundo producto: **Mousepad** tamaño `Gamer XL`, cantidad `1`.
- [ ] Verifica que el contador total indique `2 tipos de artículos (3 unidades)`.
- [ ] Pulsa **"Continuar al Paso 2: Diseños"**.

### Paso 2 (Diseño, Imagen e IA):
- [ ] Para el primer producto (Camisa), escribe una descripción menor a 10 caracteres e intenta continuar; comprueba que se bloquea con aviso de error.
- [ ] Escribe una descripción válida de entre 20 y 100 caracteres.
- [ ] Sube una foto de referencia de prueba (JPG o PNG de menos de 5MB) y valida que se muestre la miniatura.
- [ ] Para el segundo producto (Mousepad), escribe: *"Logo futurista con estilo cyber en tonos violeta"*.
- [ ] Pulsa **"Crear concepto para este producto"**; verifica que el botón entre en estado de carga.
- [ ] Tras 10-25 segundos, comprueba que la imagen generada por **Abacus.AI FLUX.1** aparezca en el recuadro de previsualización.
- [ ] Pulsa **"Continuar al Paso 3: Contacto y Pago"**.

### Paso 3 (Contacto, Entrega y Confirmación):
- [ ] Ingresa tu nombre completo y número de teléfono.
- [ ] Comprueba que el selector de fecha de entrega solo permita elegir entre **3 y 7 días hábiles** desde la fecha actual.
- [ ] Selecciona un método de pago (Pago Móvil, Binance USDT o Efectivo en Taller) y prueba los botones de copiado rápido al portapapeles.
- [ ] Marca la casilla de aceptación de términos.
- [ ] Pulsa **"Confirmar y Enviar Pedido"**.
- [ ] Verifica que el botón muestre `Guardando y abriendo WhatsApp...`, que el navegador redirija al chat oficial (`+58 424 1589317`) y que el mensaje pre-cargado liste todos los artículos y el código `#ALQ-XXXX`.

---

## 6. Verificación de Conectividad con Supabase

### Verificar Base de Datos:
1. Accede al dashboard de Supabase: `https://supabase.com/dashboard/project/ihbaunncxkskesiqsgap`.
2. En el **Table Editor**, selecciona la tabla `orders`.
3. Al enviar un pedido desde la web, confirma que se inserte una nueva fila con:
   * `order_code`: Código tipo `#ALQ-XXXX`.
   * `customer_name`: Nombre del cliente.
   * `customer_phone`: Teléfono.
   * `items`: Arreglo JSON con todos los artículos y URLs de fotos.

### Verificar Storage Bucket:
1. En el dashboard de Supabase, entra a **Storage**.
2. Abre el bucket `order-references`.
3. Comprueba que las imágenes subidas por los clientes aparezcan nombradas como:
   `ALQ-XXXX-item-1-<timestamp>.png`.

---

## 7. Verificación del Generador con Abacus.AI

Para probar la generación de imágenes directamente sin abrir el navegador, puedes ejecutar el script de prueba incluido en el proyecto:

```bash
node -e "
fetch('http://localhost:3000/api/generate-preview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    product: 'camisa',
    description: 'Dragon cyberpunk en tonos neon morado para franela'
  })
}).then(r => r.json()).then(console.log);
"
```

Respuesta esperada:
```json
{
  "success": true,
  "imageUrl": "data:image/png;base64,...",
  "remainingAttempts": 2,
  "modelUsed": "flux_kontext",
  "optimizedPrompt": "Centered graphic of a cyberpunk dragon in vibrant neon purple...",
  "estimatedCredits": 4,
  "provider": "Abacus.AI (FLUX.1 Kontext)"
}
```

---

## 8. Problemas Conocidos y Soluciones

### Problema 1: La imagen sale como placeholder genérico (SVG)
* **Causa:** La solicitud excedió el tiempo de espera (timeout) o el prompt fue demasiado largo y ambiguo.
* **Solución:** Mantén la descripción por debajo de 500 caracteres. El backend cuenta con un timeout de 90 segundos y optimiza automáticamente el prompt con Gemini antes de enviarlo a FLUX.1.

### Problema 2: WhatsApp no abre automáticamente al confirmar
* **Causa:** El navegador bloqueó una ventana emergente (`window.open`).
* **Solución:** El flujo actual usa redirección directa (`window.location.href`), la cual no puede ser bloqueada por los navegadores. Si el usuario navega desde PC sin WhatsApp Web abierto, simplemente debe hacer clic en "Abrir WhatsApp Web" en la pantalla de confirmación.

### Problema 3: Error 404 en archivos estáticos (`/_next/static/...`)
* **Causa:** Se ejecutó `npm run build` mientras `npm run dev` estaba corriendo, corrompiendo la caché de desarrollo.
* **Solución:**
  1. Detén el servidor (`Ctrl + C`).
  2. Borra la carpeta de caché: `rmdir /s /q .next` (en Windows) o `rm -rf .next`.
  3. Vuelve a iniciar con `npm run dev`.
  4. Recarga el navegador con `Ctrl + F5`.
