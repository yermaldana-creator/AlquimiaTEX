import type { Metadata } from "next";
import localFont from "next/font/local";
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
    <html lang="es" className={cn("font-sans", geistSans.variable, geistMono.variable)}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
