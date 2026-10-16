# Plan de Implementación: Sistema de Temas (Modo Claro + Modo Oscuro) en /admin/*

> [!IMPORTANT]
> **Alcance Estricto del Sistema de Temas:**
> * Aplica **exclusivamente al panel de administración** (`/admin/*`).
> * La tienda y landing pública (`/`, `/pedido`, etc.) **mantienen su diseño original sin alteraciones**.
> * **Sin Flash de Carga (Zero FOUC):** Script síncrono previo a pintura que lee `localStorage` y la preferencia del sistema operativo (`prefers-color-scheme`).
> * **Regla de oro:** No se escribirá código hasta contar con tu aprobación explícita de este plan.

---

## 1. Respuestas a tus Preguntas Clave

### A. ¿Cuántas horas de trabajo estimas que va a tomar esta implementación?
* **Estimación estándar de desarrollo:** **~4 a 5 horas de trabajo profesional**.
  * Arquitectura del Provider & script anti-flash: 45 min.
  * Selector / Switcher animado Sol/Luna con persistencia: 30 min.
  * Adaptación de estilos `dark:` en los 16 componentes del panel (Dashboard, Pedidos, Ficha Técnica, Inventario, Modales, Tablas y Badges): 2.5 horas.
  * Calibración de contraste en colores CMYK y sombras neo-brutalistas: 45 min.
  * Pruebas de regresión, lint y compilación de producción: 30 min.
  *(Nosotros ejecutaremos la construcción completa y verificada en un flujo continuo y seguro en cuanto des tu visto bueno).*

### B. ¿Qué es lo más delicado de hacer bien?
1. **Evitar el "Flashazo Blanco" (FOUC) y los errores de Hidratación de React**:
   El servidor de Next.js prerenderiza HTML estático sin saber si el socio usa modo claro u oscuro. Si se usa un `useEffect` simple para aplicar el tema, el navegador pintará un destello blanco de medio segundo antes de oscurecerse. Además, si el HTML del servidor y del cliente no coinciden, React lanza advertencias de hidratación (`Hydration mismatch`). Se resuelve con un **script síncrono inline bloqueante** antes de que el navegador pinte el primer píxel.
2. **Aislamiento estricto (Scoping) para no alterar la tienda pública**:
   Descubrimos que algunos componentes de compra pública ya tienen clases `dark:` genéricas de Shadcn. Si activamos `.dark` a nivel global en `<html>`, visitar la tienda pública podría desconfigurar sus colores. Debemos aislar el selector de tema dentro del layout del panel administrativo (`/admin/*`).
3. **Calibrar el Neo-Brutalismo en Modo Oscuro**:
   En modo claro usamos bordes negros `border-black` y sombras duras `shadow-[4px_4px_0px_#0A0A0A]`. En un fondo `#0F0F0F`, un borde negro desaparece en la oscuridad. En modo oscuro, los bordes deben transicionar a un gris definido (`dark:border-zinc-700`) y las sombras a un negro profundo (`dark:shadow-[4px_4px_0px_#000000]`), conservando la identidad del taller.
4. **Legibilidad de los Badges CMYK**:
   Los colores del taller (amarillo mostaza, cian, púrpura y magenta) deben calibrarse en fondos translúcidos oscuros (`dark:bg-amber-950/40`, `dark:bg-cyan-950/40`) con tipografía brillante de alto contraste para que el operario del taller los identifique de un vistazo bajo luz tenue.

---

## 2. Estrategia Técnica

1. **Gestión de Temas Personalizada (Custom Scoped Theme Provider)**:
   * Creamos `AdminThemeProvider` con React Context (`light` | `dark` | `system`).
   * Almacenamiento en `localStorage` con la clave `'alquimiatex_admin_theme'`.
   * Si no hay preferencia guardada, consulta `window.matchMedia('(prefers-color-scheme: dark)')` para respetar el sistema operativo del socio.
2. **Prevención de Flash (Anti-FOUC)**:
   * En `src/app/admin/layout.tsx`, inyectamos un pequeño script síncrono previo a la renderización que evalúa `localStorage` y añade la clase `.dark` al contenedor raíz del admin antes del primer frame de pintura.
3. **Hidratación Segura**:
   * El botón switcher utiliza un estado montado (`mounted`) para evitar disparidades de renderizado entre SSR y cliente.

---

## 3. Paleta de Colores Oficial

| Elemento UI | Modo Claro (Taller Profesional) | Modo Oscuro (Ergonomía Nocturna) |
| :--- | :--- | :--- |
| **Fondo General del Admin** | `#F5F5F5` (Gris claro neutro Google/Microsoft) | `#0F0F0F` (Negro profundo OLED) |
| **Header y Barras** | `#FFFFFF` con borde `border-black` | `#171717` con borde `dark:border-zinc-800` |
| **Tarjetas y Paneles** | `#FFFFFF` | `#1E1E1E` (Gris carbón) |
| **Bordes Neo-Brutalistas** | `border-2 border-black` | `dark:border-2 dark:border-zinc-700` |
| **Sombras Duras** | `shadow-[4px_4px_0px_#0A0A0A]` | `dark:shadow-[4px_4px_0px_#000000]` |
| **Texto Principal** | `#0A0A0A` (Negro tinta) | `#F5F5F5` (Blanco tiza suave) |
| **Texto Secundario** | `#525252` (Gris medio) | `#A3A3A3` (Gris claro legible) |
| **Tablas (Encabezados/Filas)**| `#F8F5EE` / hover `#FFFDF7` | `#262626` / hover `#2A2A2A` |
| **Insumos / Amarillo CMYK** | `bg-[#FEF9C3] text-[#854D0E] border-[#CA8A04]` | `dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-500/60` |
| **Telas / Cian CMYK** | `bg-[#CFFAFE] text-[#155E75] border-[#06B6D4]` | `dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-500/60` |
| **Prendas / Púrpura CMYK** | `bg-[#F3E8FF] text-[#581C87] border-[#7E22CE]` | `dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-400/60` |
| **Alertas / Magenta CMYK** | `bg-[#FFE4E6] text-[#9F1239] border-[#F43F5E]` | `dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-500/60` |

---

## 4. Archivos a Crear y Modificar

### Archivos Nuevos:
1. `src/components/admin/theme-provider.tsx`: Contexto y lógica de cambio de tema con persistencia.
2. `src/components/admin/theme-switcher.tsx`: Botón interactivo Sol / Luna con animación y tooltip explicativo.

### Archivos a Modificar:
1. `src/app/admin/layout.tsx`: Incorporación del ThemeProvider, script anti-flash y clases de fondo dinámicas.
2. `src/components/admin/admin-header.tsx`: Integración del `ThemeSwitcher` entre las opciones de navegación.
3. `src/app/admin/page.tsx`: Clases `dark:` para el Dashboard general y accesos directos.
4. `src/app/admin/login/page.tsx` & `src/components/admin/login-form.tsx`: Tarjeta de inicio de sesión con soporte oscuro.
5. `src/app/admin/pedidos/page.tsx` & `src/components/admin/orders-list.tsx`: Tabla, filtros, paginación e inputs.
6. `src/app/admin/pedidos/[id]/page.tsx` & `src/components/admin/order-detail.tsx`: Ficha técnica, desgloses y botones de descarga ZIP.
7. `src/components/admin/orders-kpi-bar.tsx`: Tarjetas de KPI métricas con fondos oscuros.
8. `src/components/admin/order-status-badge.tsx` & `order-status-select.tsx`: Badges y selects adaptados.
9. `src/app/admin/inventario/page.tsx` & `src/components/admin/inventory-table.tsx`: Tabla de almacén, filtros y controles `+1` / `-1`.
10. `src/components/admin/inventory-kpis.tsx`: Tarjetas de capital y metros de tela.
11. `src/components/admin/inventory-tabs.tsx`: Pestañas de categorías con badges luminosos.
12. `src/components/admin/inventory-form-modal.tsx`: Modal de registro y edición.
13. `src/components/admin/inventory-alerts-banner.tsx`: Alerta de stock bajo en rojo oscuro.
14. `src/components/admin/onboarding-modal.tsx` & `admin-help-modal.tsx`: Modales de ayuda y bienvenida.

---

## 5. Criterios de Aceptación que Probarás en Vivo

1. **Cambio Instantáneo**: Al pulsar el botón Sol/Luna en el header, todo el panel conmuta de tema en milisegundos sin recargar la página.
2. **Persistencia**: Al refrescar o cerrar el navegador, se mantiene exactamente el último tema seleccionado.
3. **Zero Flash**: Al recargar la página en modo oscuro, no hay ningún destello blanco antes de pintar el contenido.
4. **Aislamiento Total**: Al abrir la tienda pública (`/` o `/pedido`), su apariencia se mantiene idéntica sin alteraciones.
5. **Ergonomía en Componentes**: Todas las tarjetas, tablas, modales y botones son 100% legibles en ambos modos.
6. **Compilación y Tipado**: `npm run lint` y `npm run build` pasan con 0 errores y 0 advertencias.
