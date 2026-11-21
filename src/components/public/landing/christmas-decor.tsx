import { IS_CHRISTMAS_SEASON } from "@/lib/constants";

/**
 * 1. Capa global ligera de copos de nieve en CSS puro (solo portada /).
 * Máximo 8 copos visibles en móvil, 14 en escritorio, pointer-events-none.
 */
const SNOWFLAKES = [
  { left: "4%", size: "text-sm", duration: "13s", delay: "0s", opacity: 0.35, mobile: true },
  { left: "12%", size: "text-xs", duration: "16s", delay: "-4s", opacity: 0.3, mobile: false },
  { left: "19%", size: "text-base", duration: "14s", delay: "-7s", opacity: 0.4, mobile: true },
  { left: "27%", size: "text-xs", duration: "18s", delay: "-2s", opacity: 0.28, mobile: false },
  { left: "34%", size: "text-sm", duration: "15s", delay: "-9s", opacity: 0.36, mobile: true },
  { left: "42%", size: "text-xs", duration: "12s", delay: "-5s", opacity: 0.32, mobile: false },
  { left: "51%", size: "text-base", duration: "17s", delay: "-11s", opacity: 0.38, mobile: true },
  { left: "59%", size: "text-xs", duration: "14s", delay: "-3s", opacity: 0.3, mobile: false },
  { left: "66%", size: "text-sm", duration: "16s", delay: "-8s", opacity: 0.36, mobile: true },
  { left: "74%", size: "text-xs", duration: "13s", delay: "-1s", opacity: 0.3, mobile: false },
  { left: "81%", size: "text-base", duration: "15s", delay: "-6s", opacity: 0.4, mobile: true },
  { left: "88%", size: "text-xs", duration: "19s", delay: "-10s", opacity: 0.28, mobile: false },
  { left: "93%", size: "text-sm", duration: "14s", delay: "-12s", opacity: 0.35, mobile: true },
  { left: "97%", size: "text-xs", duration: "16s", delay: "-2.5s", opacity: 0.3, mobile: true },
];

export function ChristmasSnowOverlay() {
  if (!IS_CHRISTMAS_SEASON) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-30 pointer-events-none select-none overflow-hidden"
    >
      {SNOWFLAKES.map((flake, idx) => (
        <span
          key={idx}
          className={`christmas-snowflake absolute top-0 text-sky-700/80 drop-shadow-[0_1px_0_rgba(255,255,255,0.9)] ${
            flake.size
          } ${flake.mobile ? "block" : "hidden sm:block"}`}
          style={
            {
              left: flake.left,
              animationDuration: flake.duration,
              animationDelay: flake.delay,
              "--snow-opacity": flake.opacity,
            } as React.CSSProperties
          }
        >
          ❄
        </span>
      ))}
    </div>
  );
}

/**
 * 2. Tira de luces navideñas Neo-brutalistas con contorno negro y parpadeo suave.
 */
const LIGHT_COLORS = ["#E11D48", "#15803D", "#FACC15", "#06B6D4"];

export function ChristmasLightsGarland({ className = "" }: { className?: string }) {
  if (!IS_CHRISTMAS_SEASON) return null;

  const bulbs = Array.from({ length: 16 }, (_, i) => ({
    x: 24 + i * 74,
    color: LIGHT_COLORS[i % LIGHT_COLORS.length],
    delay: `${(i % 4) * 0.65}s`,
  }));

  return (
    <div
      aria-hidden="true"
      className={`w-full overflow-hidden pointer-events-none select-none leading-none ${className}`}
    >
      <svg
        viewBox="0 0 1200 28"
        preserveAspectRatio="none"
        className="w-full h-5 sm:h-6 block"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cable ondulado negro */}
        <path
          d="M0 4 Q 37 13, 74 4 T 148 4 T 222 4 T 296 4 T 370 4 T 444 4 T 518 4 T 592 4 T 666 4 T 740 4 T 814 4 T 888 4 T 962 4 T 1036 4 T 1110 4 T 1200 4"
          stroke="#0A0A0A"
          strokeWidth="2.5"
          fill="none"
        />

        {bulbs.map((b, idx) => (
          <g key={idx}>
            {/* Casquillo negro */}
            <rect
              x={b.x - 4}
              y="7"
              width="8"
              height="4.5"
              rx="1"
              fill="#0A0A0A"
            />
            {/* Bombillo Neo-brutalista */}
            <ellipse
              cx={b.x}
              cy="18"
              rx="6"
              ry="7.5"
              fill={b.color}
              stroke="#0A0A0A"
              strokeWidth="2.2"
              className="christmas-bulb"
              style={{ animationDelay: b.delay }}
            />
            {/* Brillo sutil */}
            <circle cx={b.x - 2} cy="15.5" r="1.4" fill="#FFFFFF" opacity="0.85" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/**
 * 3. Separador sutil Neo-brutalista entre secciones con ramas de pino, bayas y estrellas.
 */
export function ChristmasSectionDivider({
  bgClass = "bg-[#F3EFE6]",
}: {
  bgClass?: string;
}) {
  if (!IS_CHRISTMAS_SEASON) return null;

  return (
    <div
      aria-hidden="true"
      className={`w-full ${bgClass} border-b-2 border-black py-1.5 px-4 flex items-center justify-center gap-3 sm:gap-5 pointer-events-none select-none overflow-hidden`}
    >
      <span className="h-[2px] flex-1 max-w-[140px] bg-black/25" />
      <span className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]">
        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none">
          <path
            d="M12 2L14.5 9H9.5L12 2Z M12 7L16.5 15H7.5L12 7Z M12 12L18 20H6L12 12Z"
            fill="#15803D"
            stroke="#0A0A0A"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <rect x="10.5" y="20" width="3" height="2.5" fill="#0A0A0A" />
        </svg>
        <span className="text-[#E11D48]">✦</span>
        <span className="text-[#0A0A0A]">EDICIÓN NAVIDAD</span>
        <span className="text-[#E11D48]">✦</span>
        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none">
          <path
            d="M12 2L14.5 9H9.5L12 2Z M12 7L16.5 15H7.5L12 7Z M12 12L18 20H6L12 12Z"
            fill="#15803D"
            stroke="#0A0A0A"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <rect x="10.5" y="20" width="3" height="2.5" fill="#0A0A0A" />
        </svg>
      </span>
      <span className="h-[2px] flex-1 max-w-[140px] bg-black/25" />
    </div>
  );
}

/**
 * 4. Toque de nieve / escarcha SVG limpia sobre el borde superior del botón CTA principal.
 */
export function SnowFrostCap({ className = "" }: { className?: string }) {
  if (!IS_CHRISTMAS_SEASON) return null;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 18"
      preserveAspectRatio="none"
      className={`pointer-events-none select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 8 C 12 2, 26 2, 38 7 C 48 11, 56 3, 72 5 C 86 7, 94 14, 108 8 C 122 2, 134 12, 148 7 C 162 2, 174 11, 188 6 C 198 3, 210 4, 218 8 L 218 12 C 210 15, 202 10, 192 12 C 180 15, 170 10, 156 13 C 142 16, 134 10, 120 12 C 106 15, 96 16, 84 12 C 70 14, 60 11, 46 13 C 32 15, 20 10, 10 13 C 5 14, 2 12, 2 10 Z"
        fill="#FFFFFF"
        stroke="#0A0A0A"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 5. Mini ícono festivo (regalo o copo con trazo negro Neo-brutalista) para esquinas de tarjetas.
 */
export function ChristmasCornerStamp({
  variant = "gift",
  className = "w-5 h-5",
}: {
  variant?: "gift" | "flake";
  className?: string;
}) {
  if (!IS_CHRISTMAS_SEASON) return null;

  if (variant === "flake") {
    return (
      <span
        aria-hidden="true"
        className={`inline-flex items-center justify-center rounded-sm bg-[#06B6D4] text-black border border-black text-[10px] font-black leading-none select-none pointer-events-none ${className}`}
      >
        ❄
      </span>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`pointer-events-none select-none shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Caja de regalo Neo-brutalista */}
      <rect x="4" y="10" width="16" height="11" fill="#E11D48" stroke="#0A0A0A" strokeWidth="2" />
      <rect x="3" y="7" width="18" height="4" fill="#15803D" stroke="#0A0A0A" strokeWidth="2" />
      <rect x="10.5" y="7" width="3" height="14" fill="#FACC15" stroke="#0A0A0A" strokeWidth="1.5" />
      <path
        d="M12 7C10.5 4 7 4 7.5 6.5C8 8 11 7 12 7ZM12 7C13.5 4 17 4 16.5 6.5C16 8 13 7 12 7Z"
        fill="#FACC15"
        stroke="#0A0A0A"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
