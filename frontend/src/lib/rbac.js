// src/lib/rbac.js
// Satu sumber aturan: role mana boleh mengakses prefix path mana.
// Nama role mengikuti tabel profiles / backend (bukan "admin"/"superadmin" seperti sebelumnya).
// Dipakai proxy.js (blokir di server) dan boleh dipakai komponen untuk menyembunyikan menu.
export const ROLE_PREFIX = {
  super_admin: "/superadmin",
  admin_wilayah: "/admin",
  admin: "/admin", // role lama; masih diizinkan oleh CHECK di tabel profiles
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

export function isProtectedPath(pathname) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/superadmin" ||
    pathname.startsWith("/superadmin/")
  );
}