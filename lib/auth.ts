export const PRIMARY_ADMIN_EMAIL = 'admin@example.com';

export const ADMIN_EMAILS = [
  'admin@example.com',
  'admin@inkora.com',
  'admin@gmail.com',
  process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase(),
].filter(Boolean) as string[];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export const ADMIN_COOKIE_NAME = 'inkora_admin_auth';

export function setAdminCookie(isAdmin: boolean) {
  if (typeof document === 'undefined') return;
  if (isAdmin) {
    document.cookie = `${ADMIN_COOKIE_NAME}=true; path=/; max-age=604800; SameSite=Lax`;
  } else {
    document.cookie = `${ADMIN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}
