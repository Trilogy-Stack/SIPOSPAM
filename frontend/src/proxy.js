import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ROLE_PREFIX, isAllowed, homeFor, slotFor, cookieNameFor } from "./lib/rbac";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export async function proxy(request) {
  if (process.env.DISABLE_AUTH_GUARD === "true") return NextResponse.next();

  const { pathname } = request.nextUrl;
  const toLogin = () => NextResponse.redirect(new URL("/login", request.url));

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions: { name: cookieNameFor(slotFor(pathname)) },
      cookies: {
        getAll: () => request.cookies.getAll(),

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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return toLogin();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return toLogin();

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

  if (!isAllowed(role, pathname)) {
    return NextResponse.redirect(new URL(homeFor(role), request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/superadmin/:path*"],
};