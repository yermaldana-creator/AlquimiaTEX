export interface GalleryItem {
  id: string;
  title: string;
  category: "franelas" | "tazas" | "rompecabezas" | "puzzles" | "mousepads";
  categoryLabel: string;
  technique: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  mediaType?: "image" | "video";
  featured?: boolean;
}

export interface InstagramPost {
  id: string;
  caption: string;
  imageUrl: string;
  videoUrl?: string;
  mediaType?: "image" | "video";
  postUrl: string;
  likes: number;
}

export const LANDING_HERO = {
  badge: "Sublimación & Confección Artesanal • Petare, Caracas",
  slogan: "La alquimia perfecta entre calidad textil y estampado digital",
  tagline:
    "En AlquimiaTex fusionamos confección de alto nivel, tecnología de sublimación indeleble de máxima viveza. Creamos franelas, tazas mágicas y accesorios únicos para marcas, empresas y personas.",
  // FOTOS DEL HERO: Reemplaza estas URLs con las fotos reales de tus productos cuando las tengas
  photos: {
    // Foto principal: Camiseta con diseño gráfico / custom printed graphic tee
    mainProduct:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
    mainProductTitle: "ART_01: MICRODURAZNO BLANCA",
    mainProductBadge: "HASTA XL",
    mainProductPrice: "$5 c/u x Docena",
    // Foto secundaria superpuesta: Taza mágica real personalizada
    secondaryProduct: "/images/galeria/taza-magica-hero.png",
    secondaryProductTitle: "Taza Mágica",
    secondaryProductTag: "EFECTO CALOR 11OZ",
  },
  badges: [
    { label: "4 a 7 días hábiles", icon: "clock" },
    { label: "Mockup digital gratis", icon: "palette" },
  ],
};

export const SOCIAL_INFO = {
  instagramHandle: "@alquimia_tex",
  instagramUrl: "https://instagram.com/alquimia_tex",
  whatsappNumber: "584241589317",
  whatsappFormatted: "+58 424-1589317",
  workshopLocation: "Taller La Dolorita, Petare, Caracas, Venezuela",
  businessHours: "Lunes a Viernes 8:00 AM – 5:00 PM",
  googleMapsNote: "Entregas en taller previa cita y envíos a toda Caracas",
};

export const GALLERY_CATEGORIES = [
  { id: "todas", label: "Todos los Trabajos" },
  { id: "franelas", label: "Franelas & Textil" },
  { id: "tazas", label: "Tazas & Mugs" },
  { id: "rompecabezas", label: "Rompecabezas" },
  { id: "mousepads", label: "Mousepads" },
] as const;

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g1",
    title: "Franela Microdurazno",
    category: "franelas",
    categoryLabel: "Franelas & Textil",
    technique: "Sublimación HD",
    description: "Tacto ultra suave con tintas de curado térmico de alta durabilidad.",
    imageUrl: "/images/galeria/franela-microdurazno.jpg",
    featured: true,
  },
  {
    id: "g2",
    title: "Taza Mágica",
    category: "tazas",
    categoryLabel: "Tazas & Mugs",
    technique: "Video Real",
    description: "Totalmente negra en frío; revela la foto o diseño oculto al verter líquido caliente.",
    imageUrl: "/images/galeria/taza-magica.mp4",
    videoUrl: "/images/galeria/taza-magica.mp4",
    mediaType: "video",
    featured: true,
  },
  {
    id: "g3",
    title: "TAZA APILABLE PEQUEÑA",
    category: "tazas",
    categoryLabel: "Tazas & Mugs",
    technique: "Sublimación Cerámica",
    description:
      "Tazas apilables de 11oz, perfectas para personalizar con diseños únicos. Ideales para regalos o cafeterías.",
    imageUrl: "/images/tazas/taza-apilable.gif",
    videoUrl: "/images/tazas/taza-apilable.gif",
  },
  {
    id: "g4",
    title: "Franela Jersey Algodón",
    category: "franelas",
    categoryLabel: "Franelas & Textil",
    technique: "Estampado Delante y Detrás",
    description: "Resistencia superior y frescura óptima para dotaciones corporativas y eventos.",
    imageUrl: "/images/galeria/franela-jersey.gif",
    videoUrl: "/images/galeria/franela-jersey.gif",
  },
  {
    id: "g5",
    title: "Mousepad",
    category: "mousepads",
    categoryLabel: "Mousepads",
    technique: "Sublimación sobre Neopreno",
    description: "Base de caucho antideslizante y superficie textil optimizada para precisión óptica.",
    imageUrl: "/images/galeria/mousepad-diseno.jpg",
  },
  {
    id: "g6",
    title: "Rompecabezas Sublimado A4",
    category: "rompecabezas",
    categoryLabel: "Rompecabezas",
    technique: "Prensado Térmico Rígido",
    description:
      "120 piezas con acabado brillante, ideal para recuerdos de bodas, cumpleaños y regalos personalizados.",
    imageUrl: "/images/galeria/rompecabezas.jpg",
  },
  {
    id: "g8",
    title: "Franela Oversize Negra",
    category: "franelas",
    categoryLabel: "Franelas & Textil",
    technique: "Sublimación Especial",
    description: "Corte estándar y entallado en tela negra suave de alta resistencia al uso intensivo.",
    imageUrl: "/images/galeria/franela-oversize-negra.jpg",
  },
];

export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: "p1",
    caption: "Tazas apilables 11oz personalizadas en taller. Ideales para cafeterías y combos de regalo. ✨☕",
    imageUrl: "/images/galeria/taza-apilable.gif",
    postUrl: "https://instagram.com/alquimia_tex",
    likes: 189,
  },
  {
    id: "p2",
    caption: "¡Salida de producción! Franelas microdurazno con tacto suave y sublimación indeleble en Caracas. 🔥👕",
    imageUrl: "/images/galeria/franela-microdurazno.jpg",
    postUrl: "https://instagram.com/alquimia_tex",
    likes: 245,
  },
  {
    id: "p3",
    caption: "Mousepads con base de caucho antideslizante y estampado a todo color de máxima fidelidad. 🖱️⚡",
    imageUrl: "/images/galeria/mousepad-diseno.jpg",
    postUrl: "https://instagram.com/alquimia_tex",
    likes: 173,
  },
  {
    id: "p4",
    caption: "Rompecabezas sublimados A4 de 120 piezas con acabado brillante. Hechos con precisión en La Dolorita. 🧩❤️",
    imageUrl: "/images/galeria/rompecabezas.jpg",
    postUrl: "https://instagram.com/alquimia_tex",
    likes: 152,
  },
  {
    id: "p5",
    caption: "Franelas Jersey de algodón con confección reforzada y colores sólidos para tu marca o evento. 👕🧵",
    imageUrl: "/images/galeria/franela-jersey.gif",
    postUrl: "https://instagram.com/alquimia_tex",
    likes: 198,
  },
  {
    id: "p6",
    caption: "Tazas mágicas termosensibles en acción: el diseño oculto se revela al contacto con calor. ✨☕",
    imageUrl: "/images/galeria/taza-magica.mp4",
    videoUrl: "/images/galeria/taza-magica.mp4",
    mediaType: "video",
    postUrl: "https://instagram.com/alquimia_tex",
    likes: 312,
  },
];

export const ORDER_CTA_CONTENT = {
  title: "¿Listo para materializar tus ideas?",
  subtitle:
    "Configura tu pedido en 3 simples pasos desde nuestra web o escríbenos directamente a WhatsApp para cotizar al mayor.",
  buttonOrder: "Crear Pedido en Línea",
  buttonWhatsapp: "Cotizar por WhatsApp",
  guaranteeText: "Atención directa con los artesanos del taller • Sin comisiones de pasarela",
};
