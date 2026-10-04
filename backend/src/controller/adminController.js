import supabase from "../config/supabase.js";
import { HttpError, wrap } from "../utils/http.js";

// Terjemahkan error Supabase Auth menjadi pesan yang jelas
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
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, aktif, created_at, wilayah:wilayah_id(id, nama)")
    .eq("id", id)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(404, "Akun admin tidak ditemukan");
  return data;
}

export const listAdmin = wrap(async (req, res) => {
  const { q } = req.valid.query;

  // !inner = hanya admin yang wilayahnya cocok dengan pencarian
  const relasi = q ? "wilayah:wilayah_id!inner(id, nama)" : "wilayah:wilayah_id(id, nama)";
  let query = supabase
    .from("profiles")
    .select(`id, email, aktif, created_at, ${relasi}`)
    .eq("role", "admin")
    .order("created_at", { ascending: true });

  if (q) query = query.ilike("wilayah.nama", `%${q.replace(/[%_\\]/g, " ")}%`);

  const { data, error } = await query;
  if (error) throw error;
  res.json({ data });
});

// Membuat wilayah + akun Auth + profil. Kalau satu langkah gagal, langkah sebelumnya dibatalkan.
export const createAdmin = wrap(async (req, res) => {
  const { nama_wilayah, email, password } = req.valid.body;

  // 1. Wilayah: pakai yang sudah ada (jika belum punya admin) atau buat baru
  let wilayah;
  let wilayahBaru = false;

  const cari = await supabase
    .from("wilayah")
    .select("id, nama")
    .eq("nama", nama_wilayah)
    .maybeSingle();
  if (cari.error) throw cari.error;

  if (cari.data) {
    const adaAdmin = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .eq("wilayah_id", cari.data.id)
      .maybeSingle();
    if (adaAdmin.error) throw adaAdmin.error;
    if (adaAdmin.data) throw new HttpError(409, "Wilayah ini sudah punya akun admin");
    wilayah = cari.data;
  } else {
    const baru = await supabase
      .from("wilayah")
      .insert({ nama: nama_wilayah })
      .select("id, nama")
      .single();
    if (baru.error) throw baru.error;
    wilayah = baru.data;
    wilayahBaru = true;
  }

  const batalkanWilayah = async () => {
    if (wilayahBaru) await supabase.from("wilayah").delete().eq("id", wilayah.id);
  };

  // 2. Akun Auth (password di-hash oleh Supabase)
  const akun = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (akun.error) {
    await batalkanWilayah();
    throw errorAuth(akun.error);
  }

  // 3. Profil
  const profil = await supabase.from("profiles").insert({
    id: akun.data.user.id,
    email,
    role: "admin",
    wilayah_id: wilayah.id,
  });
  if (profil.error) {
    await supabase.auth.admin.deleteUser(akun.data.user.id);
    await batalkanWilayah();
    throw profil.error;
  }

  res.status(201).json({
    data: { id: akun.data.user.id, email, aktif: true, wilayah },
  });
});

export const updateAdmin = wrap(async (req, res) => {
  const { id } = req.valid.params;
  const { nama_wilayah, email, aktif } = req.valid.body;

  if (nama_wilayah === undefined && email === undefined && aktif === undefined) {
    throw new HttpError(400, "Tidak ada data yang diubah");
  }

  const admin = await ambilAdmin(id); // 404 bila bukan admin

  if (email !== undefined) {
    const { error } = await supabase.auth.admin.updateUserById(id, {
      email,
      email_confirm: true,
    });
    if (error) throw errorAuth(error);
  }

  const ubahProfil = {};
  if (email !== undefined) ubahProfil.email = email;
  if (aktif !== undefined) ubahProfil.aktif = aktif;
  if (Object.keys(ubahProfil).length) {
    const { error } = await supabase.from("profiles").update(ubahProfil).eq("id", id);
    if (error) throw error;
  }

  if (nama_wilayah !== undefined) {
    const { error } = await supabase
      .from("wilayah")
      .update({ nama: nama_wilayah })
      .eq("id", admin.wilayah.id);
    if (error) throw error;
  }

  res.json({ data: await ambilAdmin(id) });
});

// Menghapus AKUN saja. Wilayah beserta pospam dan nomor daruratnya tetap tersimpan.
export const deleteAdmin = wrap(async (req, res) => {
  const { id } = req.valid.params;
  await ambilAdmin(id);

  const { error } = await supabase.auth.admin.deleteUser(id); // profil ikut terhapus (cascade)
  if (error) throw error;

  res.json({ message: "Akun admin dihapus. Data wilayah tetap tersimpan." });
});
