// src/lib/supabase.js
import { createBrowserClient } from "@supabase/ssr";
import { createClient as createJsClient } from "@supabase/supabase-js";
import { slotFor, cookieNameFor } from "./rbac";

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const clients = {}; // satu client per slot (admin / superadmin)

// Tanpa argumen, slot mengikuti area halaman yang sedang dibuka
export function createClient(
  slot = slotFor(typeof window !== "undefined" ? window.location.pathname : "")
) {
  if (!clients[slot]) {
    clients[slot] = createBrowserClient(SUPA_URL, SUPA_KEY, {
      isSingleton: false,
      cookieOptions: { name: cookieNameFor(slot) },
    });
  }
  return clients[slot];
}

// Client sementara khusus login: tidak menyimpan session apa pun
let loginClient;
export function createLoginClient() {
  loginClient ??= createJsClient(SUPA_URL, SUPA_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: "sb-login-temp",
    },
  });
  return loginClient;
}