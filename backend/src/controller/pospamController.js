import { supabase, BUCKET_FOTO, supabaseAdmin } from "../config/supabase.js";
import { HttpError, wrap } from "../utils/http.js";
import { deteksiTipeGambar } from "../middleware/upload.js";

// #NA
import { regionNonaktif, kecualiRegion } from "../utils/regionNonaktif.js";

// Helper verifikasi hak akses wilayah
function pastikanAksesWilayah(reqUser, targetRegion) {
  if (reqUser.role !== "super_admin" && reqUser.region !== targetRegion) {
    throw new HttpError(403, "Anda tidak memiliki akses ke data wilayah ini");
  }
}

/* ------------------------------------------------------------------ */
/* Public & Peta                                                      */
/* ------------------------------------------------------------------ */

// Daftar pospam (dengan paginasi & pencarian)
export const listPospam = wrap(async (req, res) => {
  let { region, q, page = 1, limit = 10 } = req.valid.query;

  // Admin wilayah hanya boleh melihat wilayahnya sendiri
  if (req.user && req.user.role !== "super_admin") {
    region = req.user.region;
  }

  let query = supabaseAdmin
    .from("pospam")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (region) query = query.eq("region", region);
  
  if (q) {
    const aman = q.replace(/[,()%*\\]/g, " ");
    query = query.or(`name.ilike.%${aman}%,location.ilike.%${aman}%`);
  }

  // #NA Sembunyikan pospam milik admin nonaktif
  const nonaktif = await regionNonaktif();
  query = kecualiRegion(query, nonaktif);

  const dari = (page - 1) * limit;
  const { data, error, count } = await query.range(dari, dari + limit - 1);
  if (error) throw error;

  res.json({
    data,
    meta: { page: Number(page), limit: Number(limit), total: count ?? 0 },
  });
});

// Titik koordinat untuk visualisasi peta & Coverage Gap (ringan)
export const petaPospam = wrap(async (req, res) => {
  const { region } = req.valid.query;

  let query = supabaseAdmin
    .from("pospam")
    .select("id, name, region, location, latitude, longitude, facility, photo")
    .limit(1000);

  if (region) query = query.eq("region", region);

  // #NA Sembunyikan pospam milik admin nonaktif
  const nonaktif = await regionNonaktif();
  query = kecualiRegion(query, nonaktif);

  const { data, error } = await query;
  if (error) throw error;

  res.json({ data });
});

// Detail single pospam
export const getPospam = wrap(async (req, res) => {
  const { id } = req.valid.params;

  const { data, error } = await supabaseAdmin
    .from("pospam")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new HttpError(404, "Pospam tidak ditemukan");

// #NA Pospam milik admin nonaktif dianggap tidak ada
  if ((await regionNonaktif()).includes(data.region)) {
    throw new HttpError(404, "Pospam tidak ditemukan");
  }

  res.json({ data });
});

/* ------------------------------------------------------------------ */
/* Admin Management & Upload Foto                                     */
/* ------------------------------------------------------------------ */

// Unggah foto fasilitas ke Supabase Storage (Mengembalikan URL Publik)
export const uploadFotoPospam = wrap(async (req, res) => {
  if (!req.file) throw new HttpError(400, "Tidak ada berkas foto yang diunggah");

  const infoGambar = deteksiTipeGambar(req.file.buffer);
  if (!infoGambar) throw new HttpError(400, "Format gambar tidak valid atau korup");

  const namaFile = `pospam/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${infoGambar.ext}`;

  const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
    .from(BUCKET_FOTO || "pospam-photos")
    .upload(namaFile, req.file.buffer, {
      contentType: infoGambar.mime,
      upsert: false,
    });

  if (uploadErr) throw new HttpError(500, `Gagal upload foto: ${uploadErr.message}`);

  const { data: urlData } = supabaseAdmin.storage
    .from(BUCKET_FOTO || "pospam-photos")
    .getPublicUrl(uploadData.path);

  res.status(201).json({
    message: "Foto berhasil diunggah",
    url: urlData.publicUrl,
  });
});

export const createPospam = wrap(async (req, res) => {
  const body = req.valid.body;

  // Jika admin_wilayah, paksa region dari akun login
  if (req.user.role !== "super_admin") {
    body.region = req.user.region;
  }

  const { data, error } = await supabaseAdmin
    .from("pospam")
    .insert({
      ...body,
      user_id: req.user.id,
    })
    .select()
    .single();

  if (error) throw error;
  res.status(201).json({ message: "Pospam berhasil dibuat", data });
});

export const updatePospam = wrap(async (req, res) => {
  const { id } = req.valid.params;
  const body = req.valid.body;

  const { data: poslama } = await supabaseAdmin
    .from("pospam")
    .select("region")
    .eq("id", id)
    .maybeSingle();

  if (!poslama) throw new HttpError(404, "Pospam tidak ditemukan");
  pastikanAksesWilayah(req.user, poslama.region);

  const { data, error } = await supabaseAdmin
    .from("pospam")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  res.json({ message: "Data pospam berhasil diperbarui", data });
});

export const deletePospam = wrap(async (req, res) => {
  const { id } = req.valid.params;

  const { data: poslama } = await supabaseAdmin
    .from("pospam")
    .select("region")
    .eq("id", id)
    .maybeSingle();

  if (!poslama) throw new HttpError(404, "Pospam tidak ditemukan");
  pastikanAksesWilayah(req.user, poslama.region);

  const { error } = await supabaseAdmin.from("pospam").delete().eq("id", id);
  if (error) throw error;

  res.json({ message: "Pospam berhasil dihapus" });
});