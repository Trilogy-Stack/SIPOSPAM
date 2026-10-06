// import { NextResponse } from "next/server";
// import { createServerClient } from "@supabase/ssr";

// export async function proxy(request) {
//   const { pathname } = request.nextUrl;

//   const isAdminArea = pathname.startsWith("/admin");
//   const isSuperadminArea = pathname.startsWith("/superadmin");
//   if ((!isAdminArea && !isSuperadminArea) || pathname === "/login") {
//     return NextResponse.next();
//   }

//   let response = NextResponse.next();
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//     {
//       cookies: {
//         get: (name) => request.cookies.get(name)?.value,
//         set: (name, value, options) => response.cookies.set(name, value, options),
//         remove: (name, options) => response.cookies.set(name, "", { ...options, maxAge: 0 }),
//       },
//     }
//   );

//   const { data: { session } } = await supabase.auth.getSession();
//   if (!session) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   // ⭐ Cek role dari tabel profiles — mencegah Admin buka /superadmin/* lewat URL manual
//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("role")
//     .eq("id", session.user.id)
//     .maybeSingle();

//   if (isAdminArea && profile?.role !== "admin") {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }
//   if (isSuperadminArea && profile?.role !== "superadmin") {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   return response;
// }

// export const config = {
//   matcher: ["/admin/:path*", "/superadmin/:path*"],
// };

//MEMATIKAN PROXY UNTUK FOKUS UI FRONTEND SAJA, KARENA BACKEND MASIH BELUM UNTUK DIHUBUNGKAN.

import { NextResponse } from "next/server";

export async function proxy(request) {
  return NextResponse.next(); // sementara non-aktif selama fokus UI
}

export const config = {
  matcher: ["/admin/:path*", "/superadmin/:path*"],
};