import React from "react";

export function StampSeal({
  className = "w-24 h-24 md:w-28 md:h-28",
  text = "100% INDELEBLE",
  subtext = "PRENSA 180°C",
  city = "★ CARACAS ★",
}: {
  className?: string;
  text?: string;
  subtext?: string;
  city?: string;
}) {
  return (
    <div
      className={`rounded-full border-2 border-dashed border-[#F43F5E] p-1 flex items-center justify-center text-[#F43F5E] font-mono text-[8px] md:text-[9px] font-black text-center leading-tight -rotate-6 shadow-[2px_2px_0px_#0A0A0A] select-none ${className}`}
    >
      <div className="w-full h-full rounded-full border border-[#F43F5E] flex flex-col items-center justify-center bg-[#F3EFE6]/90 p-1">
        <span className="tracking-widest">{city}</span>
        <span className="text-xs md:text-sm font-oswald font-black text-black my-0.5 tracking-tight uppercase">
          {text}
        </span>
        <span className="tracking-wider">{subtext}</span>
      </div>
    </div>
  );
}

export function AlchemistFlask({
  className = "w-64 h-64",
}: {
  className?: string;
}) {
  return (
    <svg
      className={`pointer-events-none select-none ${className}`}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      {/* CUELLO Y BASE DEL MATRAZ */}
      <path
        d="M42 10 L58 10 M50 10 L50 35 L20 85 C16 92 22 96 30 96 L70 96 C78 96 84 92 80 85 L50 35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* VAPOR ALQUÍMICO DE SUBLIMACIÓN */}
      <path
        d="M48 5 C45 2 46 -3 49 -6"
        stroke="#F43F5E"
        strokeWidth="1.2"
        strokeDasharray="2 2"
        strokeLinecap="round"
      />
      <path
        d="M52 6 C55 3 54 -2 51 -5"
        stroke="#06B6D4"
        strokeWidth="1.2"
        strokeDasharray="2 2"
        strokeLinecap="round"
      />
      {/* BURBUJAS Y REACTIVOS CMYK */}
      <circle cx="38" cy="76" r="4" fill="#06B6D4" opacity="0.6" stroke="none" />
      <circle cx="60" cy="82" r="3.5" fill="#F43F5E" opacity="0.6" stroke="none" />
      <circle cx="48" cy="68" r="5" fill="#FACC15" opacity="0.6" stroke="none" />
      <circle cx="64" cy="72" r="2.5" fill="#581C87" opacity="0.6" stroke="none" />
      {/* LÍNEA DE MENISCO */}
      <path d="M30 72 Q 50 67 70 72" strokeDasharray="2 2" />
    </svg>
  );
}

export function RegistrationMark({
  label = "REG_01",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 font-mono text-[10px] text-black/50 select-none ${className}`}
    >
      <span className="font-bold text-xs">⌖</span>
      <span className="tracking-widest">{label}</span>
      <div className="flex items-center gap-0.5 ml-1">
        <span className="w-1.5 h-1.5 bg-[#06B6D4] inline-block"></span>
        <span className="w-1.5 h-1.5 bg-[#F43F5E] inline-block"></span>
        <span className="w-1.5 h-1.5 bg-[#FACC15] inline-block"></span>
        <span className="w-1.5 h-1.5 bg-[#0A0A0A] inline-block"></span>
      </div>
    </div>
  );
}

export function IndustrialTapeBanner() {
  return (
    <div className="bg-black text-[#FACC15] py-2 px-3 sm:px-6 font-mono text-[10px] sm:text-xs font-bold flex flex-wrap items-center justify-between gap-2 border-b-2 border-black tracking-widest overflow-hidden select-none">
      <span className="flex items-center gap-2 whitespace-nowrap">
        <span className="h-2 w-2 rounded-full bg-[#F43F5E] animate-ping" />
        <span>{"/// TALLER LA DOLORITA • PETARE CARACAS"}</span>
      </span>
      <span className="hidden md:inline whitespace-nowrap text-white">
        SUBLIMACIÓN INDELEBLE • TERMOFIJADO A 180°C
      </span>
      <span className="bg-[#FACC15] text-black px-2 py-0.5 font-oswald uppercase font-black text-xs border border-black shadow-[2px_2px_0px_#0A0A0A]">
        ★ MOCKUP DIGITAL GRATIS ★
      </span>
      <span className="text-[#06B6D4] whitespace-nowrap hidden sm:inline">
        ENVÍOS A TODA CARACAS [→]
      </span>
    </div>
  );
}
