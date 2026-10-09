// src/proxy.js  (Next.js 16: pengganti middleware.js)
// Menjaga /admin/* dan /superadmin/* di sisi server. Halaman publik tidak tersentuh
// karena matcher di bawah hanya mencakup dua prefix itu.
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ROLE_PREFIX, isAllowed, homeFor } from "./lib/rbac";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export async function proxy(request) {
  // Saklar darurat untuk mengerjakan UI tanpa login: set DISABLE_AUTH_GUARD=true di .env.local
  // (tanpa awalan NEXT_PUBLIC_, jadi tidak ikut terkirim ke browser). Jangan aktifkan di produksi.
  if (process.env.DISABLE_AUTH_GUARD === "true") return NextResponse.next();

  const { pathname } = request.nextUrl;
  const toLogin = () => NextResponse.redirect(new URL("/login", request.url));

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        // Dipanggil saat token disegarkan: tulis ulang cookie ke request dan response
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() memvalidasi token ke Supabase dan menyegarkan token yang kedaluwarsa.
  // (getSession() hanya membaca cookie, tidak bisa dipercaya untuk keputusan akses.)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return toLogin();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return toLogin();

  // Role diambil dari backend (/api/auth/me): sumber yang sama dengan frontend, tidak
  // bergantung pada RLS tabel profiles, dan sekaligus menolak akun yang is_active = false.
  let role = null;
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    if (res.ok) role = (await res.json()).data?.role ?? null;
  } catch {
    // backend tidak terjangkau: perlakukan seperti belum login
  }

  if (!role || !ROLE_PREFIX[role]) return toLogin();

  // Role valid tapi salah area (mis. admin membuka /superadmin): arahkan ke dashboard miliknya
  if (!isAllowed(role, pathname)) {
    return NextResponse.redirect(new URL(homeFor(role), request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/superadmin/:path*"],
};