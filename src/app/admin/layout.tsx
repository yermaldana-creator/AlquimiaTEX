import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel de Socios | AlquimiaTex",
  description: "Panel de administración y control del taller AlquimiaTex.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F3EFE6] text-black selection:bg-[#FACC15] selection:text-black font-sans">
      {children}
    </div>
  );
}
