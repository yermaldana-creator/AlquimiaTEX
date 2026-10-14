import type { Metadata } from "next";
import localFont from "next/font/local";
import { Oswald, Space_Mono, Syne } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["500", "700"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "AlquimiaTex | Sublimación y Confección Textil Oficial",
  description: "Taller artesanal de sublimación y confección en La Dolorita, Petare, Caracas. Ofertas por docena, franelas microdurazno y personalización con IA.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={cn(
        "font-sans",
        geistSans.variable,
        geistMono.variable,
        oswald.variable,
        spaceMono.variable,
        syne.variable
      )}
    >
      <body className="antialiased bg-[#F3EFE6] text-[#0A0A0A]">{children}</body>
    </html>
  );
}
