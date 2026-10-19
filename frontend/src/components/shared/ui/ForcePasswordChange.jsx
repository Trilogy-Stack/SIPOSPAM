// src/components/shared/ui/ForcePasswordChange.jsx
"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { homeFor } from "@/lib/rbac";
import ChangePasswordDialog from "./ChangePasswordDialog";

// Dipasang sekali di Navbar (dipakai layout admin dan superadmin).
// Selama profiles.must_change_password = true, dialog tampil dan tidak bisa ditutup,
// satu-satunya pilihan: buat password baru atau keluar.
// Setelah berhasil, admin TIDAK dikeluarkan: langsung masuk ke dashboard.
export default function ForcePasswordChange() {
  const { profile, login, logout, refreshProfile } = useAuth();
  const router = useRouter();

  if (!profile?.must_change_password) return null;

  async function handleDone({ password_baru } = {}) {
    try {
      // Masuk ulang diam-diam dengan password baru supaya sesi dijamin segar,
      // apa pun kebijakan Supabase soal sesi lama setelah password diganti.
      await login(profile.email, password_baru);
      await refreshProfile(); // must_change_password sudah false -> dialog hilang sendiri
      router.replace(homeFor(profile.role) || "/");
      router.refresh();
    } catch {
      // Kalau masuk ulang gagal, jalur aman: keluar dan minta login manual
      await logout();
    }
  }

  return <ChangePasswordDialog open forced onDone={handleDone} onLogout={logout} />;
}
