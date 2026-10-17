import Image from "next/image";
import { Heart, ExternalLink } from "lucide-react";
import { InstagramIcon } from "@/components/ui/instagram-icon";
import { RegistrationMark } from "./alchemy-graphics";
import { SOCIAL_INFO, INSTAGRAM_POSTS } from "@/lib/landing-content";

export function LandingInstagramSection() {
  return (
    <section id="instagram" className="py-16 md:py-24 bg-[#ECE7DC] border-b-2 border-black px-4 sm:px-6 md:px-10">
      <div className="container mx-auto max-w-6xl space-y-10">
        {/* ENCABEZADO DE FEED SOCIAL */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b-2 border-black pb-8 text-center sm:text-left bg-white p-6 border-2 border-black shadow-[6px_6px_0px_#0A0A0A]">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* AVATAR ESTILO FANZINE */}
            <div className="relative flex h-16 w-16 items-center justify-center bg-black text-white p-1 border-2 border-black shadow-[3px_3px_0px_#F43F5E] -rotate-3">
              <InstagramIcon className="h-8 w-8 text-[#FACC15]" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-2xl font-oswald font-black uppercase text-black tracking-tight">
                  {SOCIAL_INFO.instagramHandle}
                </h3>
                <span className="bg-[#06B6D4] text-black text-[10px] font-mono font-bold px-1.5 py-0.5 border border-black uppercase">
                  OFICIAL
                </span>
              </div>
              <p className="font-mono text-xs text-slate-600">
                Detrás de cámara, nuevas producciones de franelas y tazas mágicas en Caracas.
              </p>
            </div>
          </div>

          <a
            href={SOCIAL_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#F43F5E] hover:bg-[#E11D48] text-white font-oswald text-sm font-black uppercase px-5 py-3 border-2 border-black shadow-[3px_3px_0px_#0A0A0A] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A0A0A]"
          >
            <InstagramIcon className="h-4 w-4" />
            <span>Seguir en Instagram</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* GRILLA DE 6 PUBLICACIONES */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {INSTAGRAM_POSTS.map((post, idx) => (
            <a
              key={post.id}
              href={post.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden bg-black border-2 border-black shadow-[4px_4px_0px_#0A0A0A] hover:shadow-[6px_6px_0px_#FACC15] transition-all duration-300 hover:-translate-y-1 block"
            >
              {post.videoUrl || post.imageUrl.endsWith(".mp4") ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                >
                  <source src={post.videoUrl || post.imageUrl} type="video/mp4" />
                </video>
              ) : (
                <Image
                  src={post.imageUrl}
                  alt={post.caption}
                  fill
                  unoptimized={post.imageUrl.toLowerCase().endsWith(".gif")}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              )}

              {/* OVERLAY DE INTERACCIÓN */}
              <div className="absolute inset-0 flex flex-col justify-between bg-black/85 p-3 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 text-white z-10 pointer-events-none">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                  <span className="flex items-center gap-1 text-[#F43F5E]">
                    <Heart className="h-3 w-3 fill-[#F43F5E]" />
                    {post.likes}
                  </span>
                  <span className="text-[#06B6D4]">#{idx + 1}</span>
                </div>
                <p className="text-[10px] font-sans text-white/95 line-clamp-3 leading-snug">
                  {post.caption}
                </p>
              </div>
            </a>
          ))}
        </div>

        {/* FOOTNOTE DE HASHTAG */}
        <div className="flex items-center justify-between border-t border-black/20 pt-4 text-xs font-mono text-slate-700">
          <RegistrationMark label="INSTA_FEED_01" />
          <span>
            Etiquétanos con <strong className="text-black">#AlquimiaTex</strong> para aparecer en nuestra vitrina.
          </span>
        </div>
      </div>
    </section>
  );
}
