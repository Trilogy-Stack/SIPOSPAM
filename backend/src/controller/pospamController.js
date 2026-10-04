import supabase, { BUCKET_FOTO } from "../config/supabase.js";
import { HttpError, wrap } from "../utils/http.js";
import { pastikanMilik } from "../utils/akses.js";
import { normalisasiNomor, linkWhatsApp, linkMaps } from "../utils/wa.js";

// Lima fasilitas bawaan di form admin. Selain ini = fasilitas tambahan (standar = false).
const FASILITAS_STANDAR = ["Toilet", "Mushola", "Medis", "Parkir Area", "Rest Area"];

// Kolom `lokasi` (geography) sengaja tidak diambil: hasilnya kode hex, bukan koordinat.
const KOLOM_DASAR =
  "id, wilayah_id, nama_pos, nama_koordinator, kontak_koordinator, provinsi, " +
  "kabupaten_kota, kecamatan, kode_pos, jalan, latitude, longitude";

const KOLOM_DETAIL =
  `${KOLOM_DASAR}, created_at, updated_at, wilayah:wilayah_id(id, nama), ` +
  "fasilitas_pospam(id, nama, standar), foto_pospam(id, url, urutan)";

const tambahTautan = (p) => ({
  ...p,
  wa_link: linkWhatsApp(
    p.kontak_koordinator,
    `Halo petugas ${p.nama_pos}, saya membutuhkan bantuan.`
  ),
  maps_link: linkMaps(p.latitude, p.longitude),
});

/* ------------------------------------------------------------------ */
/* Helper                                                              */
/* ------------------------------------------------------------------ */

async function queryDaftar({ kabupaten_kota, wilayah_id, q, page, limit }) {
  let query = supabase
    .from("pospam")
    .select(
      `${KOLOM_DASAR}, wilayah:wilayah_id(id, nama), fasilitas_pospam(id, nama, standar)`,
      { count: "exact" }
    )
    .order("nama_pos", { ascending: true });

  if (kabupaten_kota) query = query.eq("kabupaten_kota", kabupaten_kota);
  if (wilayah_id) query = query.eq("wilayah_id", wilayah_id);
  if (q) {
    // buang karakter yang punya arti khusus di filter PostgREST
    const aman = q.replace(/[,()%*\\]/g, " ");
    query = query.or(`nama_pos.ilike.%${aman}%,jalan.ilike.%${aman}%`);
  }

  const dari = (page - 1) * limit;
  const { data, error, count } = await query.range(dari, dari + limit - 1);
  if (error) throw error;

  return {
    data: data.map(tambahTautan),
    meta: { page, limit, total: count ?? 0 },
  };
}

async function ambilDetail(id) {
  const { data, error } = await supabase
    .from("pospam")
    .select(KOLOM_DETAIL)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(404, "Pospam tidak ditemukan");

  data.foto_pospam.sort((a, b) => a.urutan - b.urutan);
  return tambahTautan(data);
}

// Samakan fasilitas pospam dengan daftar nama dari form:
// tambah/perbarui yang baru dulu, baru hapus yang sudah tidak ada.
async function sinkronFasilitas(pospamId, daftarNama) {
  const baku = new Map(FASILITAS_STANDAR.map((n) => [n.toLowerCase(), n]));
  const unik = new Map();
  for (const nama of daftarNama) {
    const kunci = nama.toLowerCase();
    if (!unik.has(kunci)) unik.set(kunci, nama);
  }

  const baris = [...unik.entries()].map(([kunci, nama]) => {
    const namaBaku = baku.get(kunci);
    return {
      pospam_id: pospamId,
      nama: namaBaku || nama,
      standar: Boolean(namaBaku),
    };
  });

  if (baris.length) {
    const { error } = await supabase
      .from("fasilitas_pospam")
      .upsert(baris, { onConflict: "pospam_id,nama" });
    if (error) throw error;
  }

  const { data: ada, error: errAda } = await supabase
    .from("fasilitas_pospam")
    .select("id, nama")
    .eq("pospam_id", pospamId);
  if (errAda) throw errAda;

  const dipertahankan = new Set(baris.map((b) => b.nama));
  const idHapus = ada.filter((r) => !dipertahankan.has(r.nama)).map((r) => r.id);
  if (idHapus.length) {
    const { error } = await supabase.from("fasilitas_pospam").delete().in("id", idHapus);
    if (error) throw error;
  }
}

/* ------------------------------------------------------------------ */
/* Publik                                                              */
/* ------------------------------------------------------------------ */

// Daftar pospam (filter daerah/wilayah/pencarian + paginasi)
export const listPospam = wrap(async (req, res) => {
  res.json(await queryDaftar(req.valid.query));
});

// Semua titik untuk peta (ringan: tanpa fasilitas)
export const petaPospam = wrap(async (req, res) => {
  const { wilayah_id, kabupaten_kota } = req.valid.query;
  let query = supabase
    .from("pospam")
    .select("id, wilayah_id, nama_pos, latitude, longitude")
    .limit(1000);
  if (wilayah_id) query = query.eq("wilayah_id", wilayah_id);
  if (kabupaten_kota) query = query.eq("kabupaten_kota", kabupaten_kota);

  const { data, error } = await query;
  if (error) throw error;
  res.json({ data });
});

// Pospam terdekat dari posisi pengguna, urut jarak
export const getPospamTerdekat = wrap(async (req, res) => {
  const { lat, lng, batas } = req.valid.query;

  const { data, error } = await supabase.rpc("pospam_terdekat", { lat, lng, batas });
  if (error) throw error;

  const peta = {};
  const ids = data.map((r) => r.id);
  if (ids.length) {
    const { data: fas, error: errFas } = await supabase
      .from("fasilitas_pospam")
      .select("pospam_id, nama, standar")
      .in("pospam_id", ids);
    if (errFas) throw errFas;
    for (const f of fas) {
      (peta[f.pospam_id] ||= []).push({ nama: f.nama, standar: f.standar });
    }
  }

  res.json({
    data: data.map((r) => tambahTautan({ ...r, fasilitas: peta[r.id] || [] })),
  });
});

export const getPospam = wrap(async (req, res) => {
  res.json({ data: await ambilDetail(req.valid.params.id) });
});

/* ------------------------------------------------------------------ */
/* Admin (hanya wilayah sendiri)                                       */
/* ------------------------------------------------------------------ */

export const listPospamSaya = wrap(async (req, res) => {
  res.json(await queryDaftar({ ...req.valid.query, wilayah_id: req.user.wilayah_id }));
});

export const createPospam = wrap(async (req, res) => {
  const { fasilitas, ...isi } = req.valid.body;

  const { data, error } = await supabase
    .from("pospam")
    .insert({
      ...isi,
      kontak_koordinator: normalisasiNomor(isi.kontak_koordinator),
      wilayah_id: req.user.wilayah_id, // selalu dari akun, bukan dari body
    })
    .select("id")
    .single();
  if (error) throw error;

  if (fasilitas?.length) {
    try {
      await sinkronFasilitas(data.id, fasilitas);
    } catch (err) {
      await supabase.from("pospam").delete().eq("id", data.id); // batalkan
      throw err;
    }
  }

  res.status(201).json({ data: await ambilDetail(data.id) });
});

export const updatePospam = wrap(async (req, res) => {
  const { id } = req.valid.params;
  await pastikanMilik("pospam", id, req.user.wilayah_id);

  const { fasilitas, ...isi } = req.valid.body;
  if ("kontak_koordinator" in isi) {
    isi.kontak_koordinator = normalisasiNomor(isi.kontak_koordinator);
  }

  if (Object.keys(isi).length) {
    const { error } = await supabase
      .from("pospam")
      .update(isi)
      .eq("id", id)
      .eq("wilayah_id", req.user.wilayah_id);
    if (error) throw error;
  } else if (!fasilitas) {
    throw new HttpError(400, "Tidak ada data yang diubah");
  }

  if (fasilitas) await sinkronFasilitas(id, fasilitas);

  res.json({ data: await ambilDetail(id) });
});

export const deletePospam = wrap(async (req, res) => {
  const { id } = req.valid.params;
  await pastikanMilik("pospam", id, req.user.wilayah_id);

  const { data: foto } = await supabase
    .from("foto_pospam")
    .select("storage_path")
    .eq("pospam_id", id);

  const { error } = await supabase
    .from("pospam")
    .delete()
    .eq("id", id)
    .eq("wilayah_id", req.user.wilayah_id); // foto & fasilitas ikut terhapus (cascade)
  if (error) throw error;

  if (foto?.length) {
    const { error: errStorage } = await supabase.storage
      .from(BUCKET_FOTO)
      .remove(foto.map((f) => f.storage_path));
    if (errStorage) console.error("Gagal menghapus file foto:", errStorage.message);
  }

  res.json({ message: "Pospam dihapus" });
});
