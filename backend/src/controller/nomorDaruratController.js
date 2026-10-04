import supabase from "../config/supabase.js";
import { HttpError, wrap } from "../utils/http.js";
import { pastikanMilik } from "../utils/akses.js";
import { linkMaps, linkTelepon } from "../utils/wa.js";

const KOLOM =
  "id, wilayah_id, nama_instansi, nomor_telepon, kategori, provinsi, kabupaten_kota, " +
  "kecamatan, kode_pos, jalan, latitude, longitude, created_at, updated_at";

const tambahTautan = (n) => ({
  ...n,
  tel_link: linkTelepon(n.nomor_telepon),
  maps_link: linkMaps(n.latitude, n.longitude),
});

async function queryDaftar({ wilayah_id, kategori, q, page, limit }) {
  let query = supabase
    .from("nomor_darurat")
    .select(`${KOLOM}, wilayah:wilayah_id(id, nama)`, { count: "exact" })
    .order("nama_instansi", { ascending: true });

  if (wilayah_id) query = query.eq("wilayah_id", wilayah_id);
  if (kategori) query = query.contains("kategori", [kategori]);
  if (q) {
    const aman = q.replace(/[,()%*\\]/g, " ");
    query = query.or(`nama_instansi.ilike.%${aman}%,jalan.ilike.%${aman}%`);
  }

  const dari = (page - 1) * limit;
  const { data, error, count } = await query.range(dari, dari + limit - 1);
  if (error) throw error;

  return {
    data: data.map(tambahTautan),
    meta: { page, limit, total: count ?? 0 },
  };
}

/* ------------------------------------------------------------------ */
/* Publik                                                              */
/* ------------------------------------------------------------------ */

// "Layanan di sekitar anda": pemadam, SPBU, bengkel, RS, polsek, dst.
export const getNomorDaruratTerdekat = wrap(async (req, res) => {
  const { lat, lng, radius_m, batas, kategori } = req.valid.query;

  const params = { lat, lng, radius_m, batas };
  if (kategori) params.kat = kategori;

  const { data, error } = await supabase.rpc("nomor_darurat_terdekat", params);
  if (error) throw error;
  res.json({ data: data.map(tambahTautan) });
});

export const getNomorDarurat = wrap(async (req, res) => {
  const { data, error } = await supabase
    .from("nomor_darurat")
    .select(`${KOLOM}, wilayah:wilayah_id(id, nama)`)
    .eq("id", req.valid.params.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(404, "Data tidak ditemukan");
  res.json({ data: tambahTautan(data) });
});

/* ------------------------------------------------------------------ */
/* Super admin: lihat lintas wilayah                                   */
/* ------------------------------------------------------------------ */

export const listNomorDarurat = wrap(async (req, res) => {
  res.json(await queryDaftar(req.valid.query));
});

/* ------------------------------------------------------------------ */
/* Admin (hanya wilayah sendiri)                                       */
/* ------------------------------------------------------------------ */

export const listNomorDaruratSaya = wrap(async (req, res) => {
  res.json(await queryDaftar({ ...req.valid.query, wilayah_id: req.user.wilayah_id }));
});

export const createNomorDarurat = wrap(async (req, res) => {
  const isi = req.valid.body;
  const { data, error } = await supabase
    .from("nomor_darurat")
    .insert({
      ...isi,
      kategori: [...new Set(isi.kategori)],
      wilayah_id: req.user.wilayah_id,
    })
    .select(KOLOM)
    .single();
  if (error) throw error;
  res.status(201).json({ data: tambahTautan(data) });
});

export const updateNomorDarurat = wrap(async (req, res) => {
  const { id } = req.valid.params;
  await pastikanMilik("nomor_darurat", id, req.user.wilayah_id);

  const isi = { ...req.valid.body };
  if (!Object.keys(isi).length) throw new HttpError(400, "Tidak ada data yang diubah");
  if (isi.kategori) isi.kategori = [...new Set(isi.kategori)];

  const { data, error } = await supabase
    .from("nomor_darurat")
    .update(isi)
    .eq("id", id)
    .eq("wilayah_id", req.user.wilayah_id)
    .select(KOLOM)
    .single();
  if (error) throw error;
  res.json({ data: tambahTautan(data) });
});

export const deleteNomorDarurat = wrap(async (req, res) => {
  const { id } = req.valid.params;
  await pastikanMilik("nomor_darurat", id, req.user.wilayah_id);

  const { error } = await supabase
    .from("nomor_darurat")
    .delete()
    .eq("id", id)
    .eq("wilayah_id", req.user.wilayah_id);
  if (error) throw error;
  res.json({ message: "Data dihapus" });
});
