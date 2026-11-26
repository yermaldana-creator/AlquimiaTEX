/**
 * Lista blanca oficial de socios autorizados para acceder al panel /admin
 * y a los Server Actions internos del taller AlquimiaTex.
 */
export const ALLOWED_ADMIN_EMAILS = [
  "yermaldana@gmail.com",
  "adrianamontilla18@gmail.com",
  "texalquimia@gmail.com",
] as const;

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (ALLOWED_ADMIN_EMAILS as readonly string[]).includes(normalized);
}
