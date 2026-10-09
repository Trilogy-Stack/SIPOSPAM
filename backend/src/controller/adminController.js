import { supabase, supabaseAdmin } from "../config/supabase.js";
import { HttpError, wrap } from "../utils/http.js";

// Helper penanganan error Supabase Auth
function errorAuth(error) {
  const pesan = (error.message || "").toLowerCase();
  if (error.status === 422 || pesan.includes("already")) {
    return new HttpError(409, "Email sudah terdaftar");
  }
  if (pesan.includes("password")) {
    return new HttpError(400, "Password tidak memenuhi syarat");
  }
  return error;
}

async function ambilAdmin(id) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, name, email, role, region, is_active, must_change_password, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new HttpError(404, "Akun admin tidak ditemukan");
  return data;
}

// 1. Daftar seluruh akun admin (dengan pencarian nama/email/region)
export const listAdmin = wrap(async (req, res) => {
  const { q } = req.valid.query;

  let query = supabaseAdmin
    .from("profiles")
    .select("id, name, email, role, region, is_active, created_at")
    .order("created_at", { ascending: false });

  if (q) {
    const aman = q.replace(/[%_\\]/g, " ");
    query = query.or(`name.ilike.%${aman}%,email.ilike.%${aman}%,region.ilike.%${aman}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  res.json({ data });
});

// 2. Buat akun admin baru (oleh Superadmin)
export const createAdmin = wrap(async (req, res) => {
  const { name, email, password, region, role = "admin_wilayah" } = req.valid.body;

  // Gunakan supabaseAdmin (bukan supabase biasa)
  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authErr) throw errorAuth(authErr);

  // Simpan profil di tabel profiles pakai client biasa/admin
  const { error: errProfil } = await supabaseAdmin.from("profiles").insert({
    id: authData.user.id,
    name,
    email,
    region,
    role,
    is_active: true,
    must_change_password: true,
  });

  // Rollback pakai supabaseAdmin jika simpan profil gagal
  if (errProfil) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    throw errProfil;
  }

  res.status(201).json({
    message: "Akun admin berhasil dibuat",
    data: {
      id: authData.user.id,
      name,
      email,
      region,
      role,
      is_active: true,
    },
  });
});

// 3. Perbarui data admin / ubah status aktif
export const updateAdmin = wrap(async (req, res) => {
  const { id } = req.valid.params;
  const { name, email, region, role, is_active } = req.valid.body;

  await ambilAdmin(id); // Memastikan ID ada

  // Update email di Supabase Auth jika berubah
  if (email !== undefined) {
    const { error: errAuth } = await supabaseAdmin.auth.admin.updateUserById(id, {
      email,
      email_confirm: true,
    });
    if (errAuth) throw errorAuth(errAuth);
  }

  const ubahProfil = {};
  if (name !== undefined) ubahProfil.name = name;
  if (email !== undefined) ubahProfil.email = email;
  if (region !== undefined) ubahProfil.region = region;
  if (role !== undefined) ubahProfil.role = role;
  if (is_active !== undefined) ubahProfil.is_active = is_active;

  if (Object.keys(ubahProfil).length > 0) {
    const { error } = await supabaseAdmin.from("profiles").update(ubahProfil).eq("id", id);
    if (error) throw error;
  }

  res.json({
    message: "Data admin berhasil diperbarui",
    data: await ambilAdmin(id),
  });
});

// 4. Hapus akun admin
export const deleteAdmin = wrap(async (req, res) => {
  const { id } = req.valid.params;
  await ambilAdmin(id);

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id); // Profil ikut terhapus otomatis (cascade)
  if (error) throw error;

  res.json({ message: "Akun admin berhasil dihapus" });
});