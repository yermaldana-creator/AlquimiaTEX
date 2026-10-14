import { z } from "zod";
import { APP_VERSION } from "@/lib/constants";

export const feedbackSchema = z.object({
  // Bloque 1: Perfil
  tester_name: z
    .string()
    .min(2, "Ingresa tu nombre o apodo (mínimo 2 caracteres)")
    .max(80, "Nombre demasiado largo"),
  device_used: z.enum(
    ["movil_android", "movil_iphone", "computadora_pc", "tablet"],
    {
      message: "Selecciona el dispositivo que utilizaste",
    }
  ),
  browser_used: z.enum(["chrome", "safari", "opera", "edge", "otro"], {
    message: "Selecciona el navegador que utilizaste",
  }),

  // Bloque 2: Primera Impresión & Diseño
  first_impression_rating: z
    .number({ message: "Califica la primera impresión del 1 al 5" })
    .int()
    .min(1)
    .max(5),
  style_clarity: z.enum(
    [
      "muy_original_claro",
      "llamativo_aceptable",
      "un_poco_confuso",
      "dificil_de_leer",
    ],
    {
      message: "Selecciona qué te pareció el estilo visual",
    }
  ),
  brand_trust: z
    .number({ message: "Califica el nivel de confianza del 1 al 5" })
    .int()
    .min(1)
    .max(5),

  // Bloque 3: Usabilidad del Formulario (/pedido)
  order_flow_rating: z
    .number({ message: "Califica la facilidad del flujo del 1 al 5" })
    .int()
    .min(1)
    .max(5),
  step1_experience: z.enum(
    ["rapida_sin_trabas", "normal", "complicada", "no_entendi"],
    {
      message: "Indica cómo fue tu experiencia en el Paso 1",
    }
  ),
  ai_generation_experience: z.enum(
    [
      "sorprendente_buena",
      "tardo_pero_sirvio",
      "no_me_gusto",
      "dio_error",
      "no_la_probe",
    ],
    {
      message: "Indica cómo te fue con la generación de imagen con IA",
    }
  ),
  image_upload_experience: z.enum(
    ["perfecta_rapida", "normal", "lenta", "dio_error", "no_subi_foto"],
    {
      message: "Indica cómo te fue con la subida de foto de referencia",
    }
  ),

  // Bloque 4: Políticas y WhatsApp
  pricing_policy_clarity: z.enum(
    ["totalmente_claras", "faciles_de_entender", "algo_confusas", "no_las_lei"],
    {
      message: "Indica qué tan claras fueron las condiciones y precios",
    }
  ),
  whatsapp_redirect_rating: z.enum(
    [
      "si_perfecto_con_todo",
      "abrio_faltaron_datos",
      "no_abrio_whatsapp",
      "no_llegue_al_final",
    ],
    {
      message: "Indica si se abrió el WhatsApp correctamente",
    }
  ),

  // Bloque 5: Puntos Críticos y NPS
  errors_found: z.string().optional().default(""),
  most_liked_feature: z
    .string()
    .min(3, "Por favor indica qué fue lo que más te gustó"),
  least_liked_feature: z
    .string()
    .min(3, "Por favor indica qué fue lo que menos te gustó o cambiarías"),
  nps_recommendation: z
    .number({ message: "Selecciona una puntuación NPS del 1 al 10" })
    .int()
    .min(1)
    .max(10),

  // Metadatos y Honeypot
  version_tested: z.string().default(APP_VERSION),
  website_url: z.string().optional(), // Honeypot anti-spam (debe venir vacío)
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;
