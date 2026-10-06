// src/lib/rbac.js
// Satu sumber aturan: role mana boleh akses prefix path mana.
// Dipakai middleware.js (blokir di server) dan useAuth.js (sembunyikan menu).
export const ROLE_PREFIX = {
  admin: "/admin",
  superadmin: "/superadmin",
};

export function isAllowed(role, pathname) {
  const prefix = ROLE_PREFIX[role];
  if (!prefix) return false;
  return pathname.startsWith(prefix);
}

export function isProtectedPath(pathname) {
  return pathname.startsWith("/admin") || pathname.startsWith("/superadmin");
}