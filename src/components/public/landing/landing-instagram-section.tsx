import Image from "next/image";
import { Heart, ExternalLink } from "lucide-react";
import { InstagramIcon } from "@/components/ui/instagram-icon";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SOCIAL_INFO, INSTAGRAM_POSTS } from "@/lib/landing-content";

export function LandingInstagramSection() {
  return (
    <section id="instagram" className="py-16 md:py-24 bg-background border-t border-border/40">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
        {/* PERFIL / ENCABEZADO DE INSTAGRAM */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-border/50 pb-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-md">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-card">
                <InstagramIcon className="h-8 w-8 text-rose-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-extrabold text-foreground tracking-tight">
                  {SOCIAL_INFO.instagramHandle}
                </h3>
                <Badge variant="secondary" className="text-[10px] font-semibold text-primary">
                  Oficial
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Detrás de cámara, nuevas producciones de franelas y tazas mágicas en Caracas.
              </p>
            </div>
          </div>

          <a
            href={SOCIAL_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 text-white font-semibold shadow-sm hover:opacity-90 gap-1.5"
            )}
          >
            <InstagramIcon className="h-4 w-4" />
            <span>Seguir en Instagram</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
          </a>
        </div>

        {/* GRILLA TIPO MOSAICO DE POSTS (6 FOTOS) */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
          {INSTAGRAM_POSTS.map((post) => (
            <a
              key={post.id}
              href={post.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl bg-muted border border-border/40 transition-all hover:border-primary/60 hover:shadow-md"
            >
              <Image
                src={post.imageUrl}
                alt={post.caption}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* OVERLAY EN HOVER CON LIKES Y CAPTION */}
              <div className="absolute inset-0 flex flex-col justify-between bg-black/60 p-3 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex items-center justify-between text-white text-[11px] font-semibold">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
                    {post.likes}
                  </span>
                  <InstagramIcon className="h-3 w-3 text-white/80" />
                </div>
                <p className="text-[10px] text-white/90 line-clamp-3 leading-snug">
                  {post.caption}
                </p>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <span>Etiquétanos en tus fotos con </span>
          <span className="font-bold text-foreground">#AlquimiaTex</span>
          <span> para aparecer en nuestra comunidad de sublimación textil.</span>
        </div>
      </div>
    </section>
  );
}
