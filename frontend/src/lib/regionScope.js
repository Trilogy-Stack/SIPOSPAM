// Menentukan filter wilayah berdasarkan akun yang login
export function getRegionScope(profile) {
  if (!profile) return { ready: false, blocked: false, params: {} };

  // Super admin melihat semua wilayah
  if (profile.role === "super_admin") return { ready: true, blocked: false, params: {} };

  // Admin wilayah tanpa data wilayah: jangan ambil data sama sekali
  if (!profile.region) return { ready: true, blocked: true, params: {} };

  return { ready: true, blocked: false, params: { region: profile.region } };
}