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
    // Foto principal: Franela o prenda con estampado de alta densidad
    mainProduct:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    mainProductTitle: "ART_01: MICRODURAZNO BLANCA",
    mainProductBadge: "HASTA XL",
    mainProductPrice: "$5 c/u x Docena",
    // Foto secundaria superpuesta: Taza mágica revelándose con calor
    secondaryProduct:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80",
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
    caption: "¡Salida de producción por docena! Franelas microdurazno listas para entrega en Caracas. 🔥👕",
    imageUrl:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
    postUrl: "https://instagram.com/alquimia_tex",
    likes: 142,
  },
  {
    id: "p2",
    caption: "Tazas mágicas en acción: mira cómo desaparece el negro al contacto con agua caliente ✨☕",
    imageUrl:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    postUrl: "https://instagram.com/alquimia_tex",
    likes: 215,
  },
  {
    id: "p3",
    caption: "Control de calidad en prensa térmica. Cada detalle cuenta antes del empaque final. ⚡",
    imageUrl:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
    postUrl: "https://instagram.com/alquimia_tex",
    likes: 98,
  },
  {
    id: "p4",
    caption: "Mugs personalizados para regalos corporativos. Acabado brillante e impecable. 💼✨",
    imageUrl:
      "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=600&q=80",
    postUrl: "https://instagram.com/alquimia_tex",
    likes: 184,
  },
  {
    id: "p5",
    caption: "Puzzles personalizados en formato A4 y Corazón. Una idea original para fechas especiales 🧩❤️",
    imageUrl:
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80",
    postUrl: "https://instagram.com/alquimia_tex",
    likes: 129,
  },
  {
    id: "p6",
    caption: "Mousepads ergonómicos con estampado gamer de alta fidelidad. Calidad que se siente. 🖱️🎮",
    imageUrl:
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80",
    postUrl: "https://instagram.com/alquimia_tex",
    likes: 173,
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
