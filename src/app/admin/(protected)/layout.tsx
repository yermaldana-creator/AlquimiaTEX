import { redirect } from "next/navigation";
import { getSessionUser } from "@/actions/auth.actions";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  // Redirección de respaldo en servidor por si el middleware fallara
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader userEmail={user.email || "socio@alquimiatex.com"} />
      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
