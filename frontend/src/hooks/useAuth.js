// src/hooks/useAuth.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient, createLoginClient } from "@/lib/supabase";
import { slotFor, slotForRole } from "@/lib/rbac";
import { getMe } from "@/lib/api";

export function useAuth() {
  const [profile, setProfile] = useState(null); // { id, email, role, wilayah }
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient(slotFor(pathname));

  const loadProfile = useCallback(async () => {
    try {
      const data = await getMe();
      setProfile(data);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadProfile();
      else setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        localStorage.setItem("sb-access-token", session.access_token);
        loadProfile().finally(() => setLoading(false));
      } else {
        localStorage.removeItem("sb-access-token");
        setProfile(null);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [loadProfile]);

  async function login(email, password) {
    // 1) Masuk dengan client sementara (tanpa cookie) hanya untuk mengetahui role
    const { data, error } = await createLoginClient().auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const { access_token, refresh_token } = data.session;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/auth/me`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.data) throw new Error(json.message || "Gagal memuat profil akun");

    // 2) Simpan session di slot sesuai role
    const { error: err2 } = await createClient(slotForRole(json.data.role)).auth.setSession({
      access_token,
      refresh_token,
    });
    if (err2) throw new Error(err2.message);
    return json.data; // { id, email, role, wilayah }
  }
async function logout() {
  await supabase.auth.signOut();
  localStorage.removeItem("sb-access-token");
  setProfile(null);
  
  // Semua role diarahkan ke halaman login yang sama
  router.push("/login");
  router.refresh();
}

  return { profile, loading, login, logout, refreshProfile: loadProfile };
}