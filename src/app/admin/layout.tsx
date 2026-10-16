import { Metadata } from "next";
import { getSessionUser } from "@/actions/auth.actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminThemeProvider, ADMIN_THEME_STORAGE_KEY } from "@/components/admin/theme-provider";

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

  // Script bloqueante anti-FOUC (se ejecuta síncronamente antes del primer pintado del DOM)
  const antiFoucScript = `
    (function() {
      try {
        var key = '${ADMIN_THEME_STORAGE_KEY}';
        var saved = localStorage.getItem(key);
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var isDark = saved === 'dark' || ((!saved || saved === 'system') && prefersDark);
        var root = document.getElementById('admin-theme-root');
        if (root) {
          if (isDark) {
            root.classList.add('dark');
            root.classList.add('bg-[#0F0F0F]');
            root.classList.add('text-[#F5F5F5]');
            root.classList.remove('bg-[#F5F5F5]');
            root.classList.remove('text-[#0A0A0A]');
          } else {
            root.classList.remove('dark');
            root.classList.add('bg-[#F5F5F5]');
            root.classList.add('text-[#0A0A0A]');
            root.classList.remove('bg-[#0F0F0F]');
            root.classList.remove('text-[#F5F5F5]');
          }
        }
      } catch (e) {}
    })();
  `;

  return (
    <AdminThemeProvider>
      <div
        id="admin-theme-root"
        className="min-h-screen flex flex-col font-sans transition-colors duration-150 bg-[#F5F5F5] dark:bg-[#0F0F0F] text-[#0A0A0A] dark:text-[#F5F5F5] selection:bg-[#FACC15] selection:text-black"
      >
        <script
          id="admin-theme-script"
          dangerouslySetInnerHTML={{ __html: antiFoucScript }}
        />

        {user ? (
          <>
            <AdminHeader userEmail={user.email || "socio@alquimiatex.com"} />
            <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-6">
              {children}
            </main>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            {children}
          </div>
        )}
      </div>
    </AdminThemeProvider>
  );
}
