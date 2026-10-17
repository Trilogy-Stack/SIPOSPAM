// src/hooks/useAuth.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { getMe } from "@/lib/api";

export function useAuth() {
  const [profile, setProfile] = useState(null); // { id, email, role, wilayah }
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
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