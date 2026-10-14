import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Package,
  Layers,
  Palette,
  AlertCircle,
  MessageCircle,
  Scissors,
  Check,
  Info,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  WHOLESALE_CATALOG_OFFERS,
  CATALOG_POLICIES,
  ORDER_PRICING_CONDITIONS,
  DEFAULT_WHATSAPP_NUMBER,
} from "@/lib/constants";

export default function HomePage() {
  const whatsappUrl = `https://wa.me/${DEFAULT_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "¡Hola AlquimiaTex! Vengo desde su página web y me gustaría hacer una consulta o cotización."
  )}`;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-primary/95 px-4 py-2 text-center text-xs font-medium text-primary-foreground">
        <span className="inline-flex items-center gap-1.5 flex-wrap justify-center">
          <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
          <span>¡Nuevo catálogo disponible! Ofertas especiales por docena y diseño digital (mockup) gratuito.</span>
          <Link href="#ofertas" className="underline font-bold hover:text-accent ml-1">
            Ver ofertas
          </Link>
        </span>
      </div>

      {/* 2. NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="AlquimiaTex Logo"
              width={160}
              height={44}
              priority
              className="h-10 w-auto object-contain"
            />
            <Badge variant="outline" className="hidden sm:inline-flex text-[11px] font-semibold text-primary border-primary/30">
              Taller La Dolorita
            </Badge>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-6">
            <Link
              href="#ofertas"
              className="text-xs sm:text-sm font-medium text-muted-foreground transition hover:text-foreground hidden md:inline-block"
            >
              Ofertas por Docena
            </Link>
            <Link
              href="#politicas"
              className="text-xs sm:text-sm font-medium text-muted-foreground transition hover:text-foreground hidden md:inline-block"
            >
              Políticas y Pagos
            </Link>
            <Link
              href="#como-funciona"
              className="text-xs sm:text-sm font-medium text-muted-foreground transition hover:text-foreground hidden sm:inline-block"
            >
              Cómo Funciona
            </Link>
            <Link
              href="/pedido"
              className={cn(buttonVariants({ size: "sm" }), "font-semibold shadow-sm gap-1.5")}
            >
              <span>Hacer Pedido</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-border/40 py-12 md:py-20 lg:py-24 bg-gradient-to-b from-muted/30 via-background to-background">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="space-y-6 text-center lg:text-left lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Scissors className="h-3.5 w-3.5" />
                <span>Sublimación & Confección Artesanal • Petare, Caracas</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
                Estampados y confección textil que{" "}
                <span className="bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  hacen magia
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                En <strong>AlquimiaTex</strong> transformamos tus ideas en franelas, tazas, puzzles y mousepads
                con máxima fidelidad de color. Cotiza en línea en 3 simples pasos con previsualización inteligente.
              </p>

              {/* Badges de Garantía y Tiempos */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  <Clock className="h-3.5 w-3.5" /> 4 a 7 días hábiles
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2.5 py-1 font-medium text-blue-700 dark:text-blue-300 border border-blue-500/20">
                  <Palette className="h-3.5 w-3.5" /> Mockup digital gratis
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/10 px-2.5 py-1 font-medium text-purple-700 dark:text-purple-300 border border-purple-500/20">
                  <Layers className="h-3.5 w-3.5" /> Hasta 2 estampados por pieza
                </span>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-4">
                <Link
                  href="/pedido"
                  className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto text-base font-semibold gap-2 shadow-md")}
                >
                  <span>Configurar mi Pedido</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="#ofertas"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto text-base")}
                >
                  Ver Precios por Docena
                </Link>
              </div>

              <p className="text-xs text-muted-foreground flex items-center justify-center lg:justify-start gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Sin intermediarios • Trato directo por WhatsApp con el taller</span>
              </p>
            </div>

            {/* Showcase Visual */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-foreground">Taller Activo</span>
                  </div>
                  <span className="text-xs text-muted-foreground">La Dolorita, Petare</span>
                </div>

                <div className="overflow-hidden rounded-xl bg-muted/40 p-4 border border-border/40 text-center space-y-3">
                  <div className="relative mx-auto h-48 w-full max-w-[240px] flex items-center justify-center">
                    <Image
                      src="/logo.png"
                      alt="AlquimiaTex Muestra"
                      width={220}
                      height={180}
                      className="object-contain drop-shadow-lg"
                    />
                  </div>
                  <div className="text-left space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Franela Microdurazno Premium</span>
                      <Badge variant="outline" className="text-[10px] text-primary">Catálogo Oficial</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Sublimación indeleble de alta densidad que no se cuartea ni pierde color.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-muted/30 p-2.5 border border-border/30">
                    <p className="text-muted-foreground text-[10px]">Unidad (Al detal)</p>
                    <p className="font-bold text-foreground">100% Anticipado</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-2.5 border border-primary/20">
                    <p className="text-primary text-[10px] font-semibold">Docena (Al mayor)</p>
                    <p className="font-bold text-primary">50% Abono inicial</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN OFERTAS POR DOCENA (CATÁLOGO OFICIAL) */}
      <section id="ofertas" className="py-16 md:py-24 bg-muted/10">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="secondary" className="font-semibold text-xs text-primary">
              Precios al Mayor
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Ofertas por Docena del Catálogo Oficial
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Precios base diseñados para marcas, uniformes corporativos, eventos y revendedores.
              Ahorra con tarifas especiales a partir de 12 unidades.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {WHOLESALE_CATALOG_OFFERS.map((offer, index) => {
              const isPopular = index === 0;
              return (
                <Card
                  key={offer.id}
                  className={`relative flex flex-col justify-between border transition-all hover:shadow-lg ${
                    isPopular
                      ? "border-primary shadow-md bg-gradient-to-b from-primary/[0.03] to-card"
                      : "border-border/60 bg-card"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground font-bold text-[10px] px-3 py-0.5 shadow-sm">
                        MÁS SOLICITADA
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {offer.tag}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        2 estampados inc.
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold mt-2">{offer.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {offer.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="rounded-lg bg-muted/40 p-4 border border-border/40 space-y-1 text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-black text-foreground">${offer.unitPrice}</span>
                        <span className="text-xs text-muted-foreground font-medium">c/u al mayor</span>
                      </div>
                      <p className="text-xs font-semibold text-primary">
                        Docena completa: ${offer.dozenPrice}
                      </p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
                        Qué incluye esta oferta:
                      </p>
                      <ul className="space-y-1.5">
                        {offer.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                            <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        <li className="flex items-start gap-2 text-muted-foreground">
                          <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                          <span>Mockup digital de confirmación sin costo</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2">
                    <Link
                      href="/pedido"
                      className={cn(
                        buttonVariants({ variant: isPopular ? "default" : "outline" }),
                        "w-full font-semibold"
                      )}
                    >
                      <span>Hacer Pedido de {offer.name.split(" ")[0]}</span>
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Políticas Clave al pie de las ofertas */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.05] p-4 sm:p-5 text-xs text-foreground space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
              <Info className="h-4 w-4 shrink-0" />
              <span>Condiciones importantes de las ofertas por volumen</span>
            </div>
            <ul className="grid gap-1.5 sm:grid-cols-2 text-muted-foreground pl-6 list-disc">
              <li>
                <strong>Estampados incluidos:</strong> Hasta 2 estampados por pieza (delante y detrás) en todas las ofertas.
              </li>
              <li>
                <strong>Exclusiones:</strong> {CATALOG_POLICIES.volumeExclusions}
              </li>
              <li>
                <strong>Diseño digital:</strong> {CATALOG_POLICIES.digitalMockup}
              </li>
              <li>
                <strong>Garantía oficial:</strong> {CATALOG_POLICIES.sizeGuarantee}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. SECCIÓN POLÍTICAS Y CONDICIONES DE PAGO */}
      <section id="politicas" className="py-16 md:py-20 border-t border-border/40 bg-background">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="font-semibold text-xs text-primary border-primary/30">
              Transparencia y Confianza
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Políticas Oficiales y Condiciones de Pago
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Sin letras pequeñas. Conoce de antemano las modalidades de pago, tiempos de entrega y garantías de nuestro taller.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Modalidad Unidad */}
            <Card className="border-border/60 bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {ORDER_PRICING_CONDITIONS.unidad.badge}
                  </Badge>
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg font-bold mt-2">
                  {ORDER_PRICING_CONDITIONS.unidad.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {ORDER_PRICING_CONDITIONS.unidad.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="rounded-lg bg-muted/40 p-3 border border-border/40">
                  <p className="font-semibold text-foreground">Condición requerida:</p>
                  <p className="font-bold text-primary mt-0.5">
                    {ORDER_PRICING_CONDITIONS.unidad.condition}
                  </p>
                </div>
                <p className="text-muted-foreground">
                  Se inicia el proceso de corte, impresión y estampado una vez verificado el 100% del pago por WhatsApp.
                </p>
              </CardContent>
            </Card>

            {/* Modalidad Docena */}
            <Card className="border-primary/50 bg-primary/[0.02]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-primary text-primary-foreground text-xs font-semibold">
                    {ORDER_PRICING_CONDITIONS.docena.badge}
                  </Badge>
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg font-bold mt-2">
                  {ORDER_PRICING_CONDITIONS.docena.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {ORDER_PRICING_CONDITIONS.docena.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="rounded-lg bg-primary/10 p-3 border border-primary/20">
                  <p className="font-semibold text-foreground">Condición requerida:</p>
                  <p className="font-bold text-primary mt-0.5">
                    {ORDER_PRICING_CONDITIONS.docena.condition}
                  </p>
                </div>
                <p className="text-muted-foreground">
                  El 50% restante se liquida el día de la entrega del lote, previa inspección física en taller o antes del despacho.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cuadrícula de 3 Pilares del Taller */}
          <div className="grid gap-6 sm:grid-cols-3 pt-4">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span>Tiempo de Entrega</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {CATALOG_POLICIES.deliveryTime} No realizamos entregas el mismo día para asegurar curado y control de calidad.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <Palette className="h-4 w-4 text-primary" />
                <span>Mockup Digital Gratuito</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {CATALOG_POLICIES.digitalMockup} Revisas la distribución y colores exactos en pantalla antes de aplicar calor sobre la prenda.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Garantía de Tallas</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>{CATALOG_POLICIES.sizeGuarantee}</strong> Revisa atentamente nuestra tabla de medidas corporales antes de confirmar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CÓMO FUNCIONA EL PROCESO */}
      <section id="como-funciona" className="py-16 md:py-24 bg-muted/20 border-t border-border/40">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="secondary" className="font-semibold text-xs text-primary">
              Paso a Paso
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Cómo realizar tu pedido en 3 pasos
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Diseñado para ser rápido, intuitivo y sin registro obligatorio.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-foreground">Selecciona tus Artículos</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Escoge franelas, tazas, puzzles o mousepads. Especifica telas (microdurazno, jersey, algodón), tallas, colores y cantidades.
              </p>
            </div>

            <div className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-foreground">Personaliza o Genera con IA</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sube tu logo o diseño propio, o escribe una descripción para que nuestra Inteligencia Artificial genere un diseño exclusivo.
              </p>
            </div>

            <div className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-foreground">Envía directo a WhatsApp</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Elige tu fecha de entrega (4 a 7 días), condición de pago (unidad o docena) y abre el chat oficial con el pedido ya redactado.
              </p>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link
              href="/pedido"
              className={cn(
                buttonVariants({ size: "lg" }),
                "inline-flex items-center justify-center font-semibold gap-2 shadow-md text-base"
              )}
            >
              <span>Comenzar mi Pedido Ahora</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FOOTER OFICIAL CON LOGO */}
      <footer className="mt-auto border-t border-border/50 bg-card py-12 text-foreground">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-3 sm:col-span-2">
              <Link href="/" className="inline-block">
                <Image
                  src="/logo.png"
                  alt="AlquimiaTex"
                  width={170}
                  height={48}
                  className="h-10 w-auto object-contain"
                />
              </Link>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Taller artesanal de sublimación y confección textil en Caracas, Venezuela.
                Calidad fotográfica en prendas y artículos personalizados para particulares y empresas.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                <span>Atención y pedidos por WhatsApp oficial</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Enlaces Rápidos</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>
                  <Link href="/pedido" className="hover:text-foreground transition">
                    Crear Pedido en Línea
                  </Link>
                </li>
                <li>
                  <Link href="#ofertas" className="hover:text-foreground transition">
                    Ofertas por Docena
                  </Link>
                </li>
                <li>
                  <Link href="#politicas" className="hover:text-foreground transition">
                    Políticas y Pagos
                  </Link>
                </li>
                <li>
                  <Link href="#como-funciona" className="hover:text-foreground transition">
                    Cómo Funciona
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Ubicación y Contacto</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>Taller La Dolorita, Petare</li>
                <li>Caracas, Miranda, Venezuela</li>
                <li>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span>+58 424-1589317</span>
                  </a>
                </li>
                <li>Horario: Lunes a Viernes 8am - 5pm</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground text-center sm:text-left">
            <p>© {new Date().getFullYear()} AlquimiaTex. Todos los derechos reservados.</p>
            <p className="flex items-center justify-center gap-1">
              <span>Hecho con dedicación en Caracas</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
