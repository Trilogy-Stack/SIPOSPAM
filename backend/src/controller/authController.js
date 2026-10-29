import { supabase, supabaseAdmin, createStatelessClient } from "../config/supabase.js";
import { HttpError, wrap } from "../utils/http.js";

// 1. Endpoint Login Admin
export const login = wrap(async (req, res) => {
  const { email, password } = req.valid.body;

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    throw new HttpError(401, "Email atau password salah");
  }

  const { data: profil, error: errProfil } = await supabaseAdmin
    .from("profiles")
    .select("name, role, region, must_change_password, is_active")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (errProfil || !profil) {
    throw new HttpError(403, "Profil akun tidak ditemukan");
  }

  if (profil.is_active === false) {
    throw new HttpError(403, "Akun Anda telah dinonaktifkan. Silakan hubungi Superadmin");
  }

  res.json({
    message: "Login berhasil",
    token: authData.session.access_token,
    refresh_token:authData.session.refresh_token,
    data: {
      id: authData.user.id,
      email: authData.user.email,
      name: profil.name,
      role: profil.role,
      region: profil.region,
      must_change_password: profil.must_change_password,
    },
  });
});

// 2. Frontend memanggil ini setelah login: untuk tahu role, wilayah, dan status ganti password
export const me = wrap(async (req, res) => {
  const { id, email, name, role, region, must_change_password } = req.user;
  res.json({ data: { id, email, name, role, region, must_change_password } });
});

// 3. Dipakai admin baru di login pertama (dan boleh kapan saja sesudahnya)
export const gantiPassword = wrap(async (req, res) => {
  const { password_lama, password_baru } = req.valid.body;

  const { error: errLama } = await createStatelessClient().auth.signInWithPassword({
    email: req.user.email,
    password: password_lama,
  });
  if (errLama) {
    if (errLama.status === 429) {
      throw new HttpError(429, "Terlalu banyak percobaan. Coba lagi beberapa menit lagi");
    }
    throw new HttpError(400, "Password lama salah");
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(req.user.id, {
    password: password_baru,
  });

  if (error) {
    const pesan = (error.message || "").toLowerCase();
    if (pesan.includes("password")) throw new HttpError(400, "Password tidak memenuhi syarat");
    throw error;
  }

  const { error: errProfil } = await supabaseAdmin
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", req.user.id);

  if (errProfil) throw errProfil;

  res.json({ message: "Password berhasil diganti" });
});