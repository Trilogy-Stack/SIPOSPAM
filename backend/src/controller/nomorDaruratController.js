import supabase, { supabaseAdmin } from "../config/supabase.js";
import { HttpError, wrap } from "../utils/http.js";

// #NA
import { regionNonaktif, kecualiRegion } from "../utils/regionNonaktif.js";

// Helper verifikasi hak akses wilayah
function pastikanAksesWilayah(reqUser, targetRegion) {
  if (reqUser.role !== "super_admin" && reqUser.region !== targetRegion) {
    throw new HttpError(403, "Anda tidak memiliki akses ke data wilayah ini");
  }
}

// Nama instansi harus unik dalam satu wilayah (tidak peka huruf besar/kecil)
async function pastikanNamaUnik(agencyName, region, ignoreId = null) {
  const pola = agencyName.trim().replace(/[%_\\]/g, "\\$&"); // tanpa wildcard = cocok persis
  let query = supabaseAdmin
    .from("nomor_darurat")
    .select("id")
    .eq("region", region)
    .ilike("agency_name", pola)
    .limit(1);
  if (ignoreId) query = query.neq("id", ignoreId);

  const { data, error } = await query;
  if (error) throw error;
  if (data.length) throw new HttpError(409, "Nama instansi sudah terdaftar di wilayah ini");
}

/* ------------------------------------------------------------------ */
/* Publik                                                             */
/* ------------------------------------------------------------------ */

// Ambil daftar nomor darurat (Bisa filter per region, kategori, pencarian q)
export const listNomorDarurat = wrap(async (req, res) => {
  const { region, category, q, page = 1, limit = 10 } = req.valid.query;

  let query = supabaseAdmin
    .from("nomor_darurat")
    .select("*", { count: "exact" })
    .order("agency_name", { ascending: true });

  if (region) query = query.eq("region", region);
  if (category) query = query.eq("category", category);
  if (q) {
    const aman = q.replace(/[,()%*\\]/g, " ");
    query = query.or(`agency_name.ilike.%${aman}%,telephone.ilike.%${aman}%`);
  }

  // #NA Sembunyikan nomor darurat milik admin nonaktif  ← TAMBAH (3 baris)
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

/* ------------------------------------------------------------------ */
/* Admin Management                                                   */
/* ------------------------------------------------------------------ */

export const createNomorDarurat = wrap(async (req, res) => {
  const body = req.valid.body;

  // Jika admin_wilayah, paksa region dari akun login & cegah input "NASIONAL"
  if (req.user.role !== "super_admin") {
    body.region = req.user.region;
  }

  await pastikanNamaUnik(body.agency_name, body.region);

  const { data, error } = await supabaseAdmin
    .from("nomor_darurat")
    .insert({
      ...body,
      user_id: req.user.id,
    })
    .select()
    .single();

  // if (error) throw error;
  if (error) {
    console.error("=== DETAIL ERROR SUPABASE ===", error);
    return res.status(500).json({
      message: "Gagal insert ke Supabase",
      error_message: error.message,
      error_details: error.details,
      error_hint: error.hint,
    });
  }

  res.status(201).json({ message: "Nomor darurat berhasil ditambahkan", data });
});

export const updateNomorDarurat = wrap(async (req, res) => {
  const { id } = req.valid.params;
  const body = req.valid.body;

  const { data: lama } = await supabaseAdmin
    .from("nomor_darurat")
    .select("region")
    .eq("id", id)
    .maybeSingle();

  if (!lama) throw new HttpError(404, "Nomor darurat tidak ditemukan");
  pastikanAksesWilayah(req.user, lama.region);

  if (body.agency_name !== undefined) {
    await pastikanNamaUnik(body.agency_name, lama.region, id);
  }

  const { data, error } = await supabaseAdmin
    .from("nomor_darurat")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  res.json({ message: "Nomor darurat berhasil diperbarui", data });
});

export const deleteNomorDarurat = wrap(async (req, res) => {
  const { id } = req.valid.params;

  const { data: lama } = await supabaseAdmin
    .from("nomor_darurat")
    .select("region")
    .eq("id", id)
    .maybeSingle();

  if (!lama) throw new HttpError(404, "Nomor darurat tidak ditemukan");
  pastikanAksesWilayah(req.user, lama.region);

  const { error } = await supabaseAdmin.from("nomor_darurat").delete().eq("id", id);
  if (error) throw error;

  res.json({ message: "Nomor darurat berhasil dihapus" });
});