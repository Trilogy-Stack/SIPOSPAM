// INI UDA TAK SESUAIKAN

import { supabase } from "../config/supabase.js";
import { HttpError, wrap } from "../utils/http.js";

export const authRole = (...rolesDiizinkan) =>
  wrap(async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) throw new HttpError(401, "Token tidak ada");

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      throw new HttpError(401, "Token tidak valid atau kedaluwarsa");
    }

    const { data: profil, error: errProfil } = await supabase
      .from("profiles")
      .select("role, region, must_change_password, is_active")
      .eq("id", data.user.id)
      .maybeSingle();

    if (errProfil) throw errProfil;
    if (!profil) throw new HttpError(403, "Profil akun tidak ditemukan");
    
    // Cek apakah akun dinonaktifkan (Soft Delete)
    if (profil.is_active === false) {
      throw new HttpError(403, "Akun Anda telah dinonaktifkan. Silakan hubungi Superadmin");
    }

    if (rolesDiizinkan.length && !rolesDiizinkan.includes(profil.role)) {
      throw new HttpError(403, "Akses ditolak");
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: profil.role,
      region: profil.region,
      must_change_password: profil.must_change_password,
    };

    next();
  });