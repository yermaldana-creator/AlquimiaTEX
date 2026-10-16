import { Metadata } from "next";
import { getSessionUser } from "@/actions/auth.actions";
import { AdminHeader } from "@/components/admin/admin-header";

export const metadata: Metadata = {
  title: "Panel de Socios | AlquimiaTex",
  description: "Panel de administración y control del taller AlquimiaTex.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  // Si no hay usuario autenticado (ejemplo: pantalla de /admin/login)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F3EFE6] text-black selection:bg-[#FACC15] selection:text-black font-sans">
        {children}
      </div>
    );
  }

  // Para todas las rutas autenticadas protegidas de /admin/*
  return (
    <div className="min-h-screen flex flex-col bg-[#F3EFE6] text-black selection:bg-[#FACC15] selection:text-black font-sans">
      <AdminHeader userEmail={user.email || "socio@alquimiatex.com"} />
      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
