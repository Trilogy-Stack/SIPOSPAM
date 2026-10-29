export const ROLE_PREFIX = {
  super_admin: "/superadmin",
  admin_wilayah: "/admin",
  admin: "/admin", 
};

// Halaman awal tiap role setelah login
export function homeFor(role) {
  const prefix = ROLE_PREFIX[role];
  return prefix ? `${prefix}/dashboard` : null;
}

export function isAllowed(role, pathname) {
  const prefix = ROLE_PREFIX[role];
  if (!prefix) return false;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

// Slot session per area, akun /admin dan /superadmin disimpan di cookie berbeda
// dua role bisa login bersamaan di tab berbeda pada satu browser.
export const slotFor = (pathname = "") =>
pathname === "/superadmin" || pathname.startsWith("/superadmin/") ? "superadmin" : "admin";
export const slotForRole = (role) => (role === "super_admin" ? "superadmin" : "admin");
export const cookieNameFor = (slot) => `sb-${slot}-auth-token`;