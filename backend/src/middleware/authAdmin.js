import supabase from "../config/supabase.js";
import { HttpError, wrap } from "../utils/http.js";

// authRole()                    -> semua akun yang punya profil aktif
// authRole("admin")             -> admin saja
// authRole("super_admin")       -> super admin saja
// authRole("admin","super_admin")
export const authRole = (...rolesDiizinkan) =>
  wrap(async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) throw new HttpError(401, "Token tidak ada");

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) throw new HttpError(401, "Token tidak valid atau kedaluwarsa");

    const { data: profil, error: errProfil } = await supabase
      .from("profiles")
      .select("role, aktif, wilayah_id")
      .eq("id", data.user.id)
      .maybeSingle();
    if (errProfil) throw errProfil;

    if (!profil || !profil.aktif) throw new HttpError(403, "Akun tidak aktif atau bukan admin");
    if (rolesDiizinkan.length && !rolesDiizinkan.includes(profil.role)) {
      throw new HttpError(403, "Akses ditolak");
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: profil.role,
      wilayah_id: profil.wilayah_id, // null untuk super_admin
    };
    next();
  });
