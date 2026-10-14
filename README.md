# 🎨 AlquimiaTex — Taller de Sublimación Textil y Personalización

Plataforma web oficial de **AlquimiaTex**, taller artesanal de sublimación textil y artículos personalizados ubicado en **La Dolorita, Petare / Caracas, Venezuela**.

El sistema digitaliza el proceso de cotización y encargo mediante un **asistente de pedidos guiado (wizard)** multi-producto, generación de conceptos visuales con Inteligencia Artificial (Gemini + Abacus.AI FLUX.1), almacenamiento en Supabase y cierre de compra directo por WhatsApp con métodos de pago manuales (Pago Móvil, Binance USDT y Efectivo en Taller).

---

## 🚀 Tecnologías Principales (Stack)

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
* **Lenguaje:** [TypeScript 5](https://www.typescriptlang.org/)
* **Estilos & UI:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
* **Validación de Datos:** [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)
* **Base de Datos & Storage:** [Supabase](https://supabase.com/) (PostgreSQL & Bucket `order-references`)
* **Inteligencia Artificial:** [Google Gemini](https://ai.google.dev/) (`gemini-3.5-flash-lite`) para optimización de prompts y [Abacus.AI RouteLLM](https://routellm.abacus.ai/) con modelo `flux_kontext` (FLUX.1) para rasterizado gráfico.
* **Canal de Despacho:** Redirección directa hacia WhatsApp (`https://wa.me/584241589317`).

---

## 📚 Documentación del Proyecto

Toda la documentación técnica y de negocio se encuentra organizada en la carpeta [`docs/`](file:///C:/laragon/www/AlquimiaTEX/docs/):

* 📊 **[Estado del Proyecto](file:///C:/laragon/www/AlquimiaTEX/docs/ESTADO-PROYECTO.md):** Resumen ejecutivo, avance por módulos, dependencias y variables de entorno.
* 🧠 **[Registro de Decisiones Técnicas](file:///C:/laragon/www/AlquimiaTEX/docs/DECISIONES-TECNICAS.md):** Justificación de la arquitectura Pragmatic Flat, pagos manuales, wizard de 3 pasos y elección de modelos de IA.
* 🛠️ **[Guía Práctica de Desarrollo](file:///C:/laragon/www/AlquimiaTEX/docs/GUIA-DESARROLLO.md):** Instalación, pruebas paso a paso del formulario, verificación de Supabase/IA y solución de problemas.
* 🗺️ **[Hoja de Ruta (Roadmap)](file:///C:/laragon/www/AlquimiaTEX/docs/ROADMAP.md):** Plan secuencial de fases futuras (Landing pública, Panel Admin, Auth y Despliegue en Vercel).
* 📝 **[Registro de Cambios (Changelog)](file:///C:/laragon/www/AlquimiaTEX/docs/CHANGELOG.md):** Historial cronológico de commits y versiones agrupadas por fase.
* 🤝 **[Acuerdos del Formulario](file:///C:/laragon/www/AlquimiaTEX/docs/acuerdos-formulario.md):** Especificación inicial de las reglas de negocio del formulario.

---

## ⚡ Inicio Rápido en Local

### 1. Clonar e instalar dependencias
```bash
git clone <url-del-repositorio>
cd AlquimiaTEX
npm install
```

### 2. Configurar variables de entorno
Copia el archivo de ejemplo y completa tus credenciales en `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```

Abre tu navegador en:
* **Inicio:** `http://localhost:3000`
* **Asistente de Pedidos:** `http://localhost:3000/pedido`

### 4. Comandos de verificación
```bash
npx tsc --noEmit    # Verificar tipos TypeScript
npm run lint        # Analizar con ESLint
npm run build       # Compilación de producción
```

---

## 🛡️ Licencia y Propiedad

© 2026 **AlquimiaTex**. Todos los derechos reservados.  
Taller La Dolorita, Caracas, Venezuela.
