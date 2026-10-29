"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { homeFor } from "@/lib/rbac";
import ChangePasswordDialog from "./ChangePasswordDialog";

export default function ForcePasswordChange() {
  const { profile, login, logout, refreshProfile } = useAuth();
  const router = useRouter();

  if (!profile?.must_change_password) return null;

  async function handleDone({ password_baru } = {}) {
    try {
      await login(profile.email, password_baru);
      await refreshProfile(); 
      router.replace(homeFor(profile.role) || "/");
      router.refresh();
    } catch {
      await logout();
    }
  }

  return <ChangePasswordDialog open forced onDone={handleDone} onLogout={logout} />;
}
