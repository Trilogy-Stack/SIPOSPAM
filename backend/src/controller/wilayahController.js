import supabase from "../config/supabase.js";
import { wrap } from "../utils/http.js";

// Daftar wilayah (Polres) + poligon untuk peta dashboard super admin
export const listWilayah = wrap(async (req, res) => {
  const { data, error } = await supabase
    .from("wilayah")
    .select("id, nama, batas_geojson")
    .order("nama");
  if (error) throw error;
  res.json({ data });
});

// Isi dropdown "Cari Daerah": daftar kabupaten/kota yang punya pospam
export const listDaerah = wrap(async (req, res) => {
  const { data, error } = await supabase.rpc("daftar_daerah");
  if (error) throw error;
  res.json({ data: data.map((r) => r.kabupaten_kota) });
});

// Rekapitulasi per wilayah (super admin)
export const rekapWilayah = wrap(async (req, res) => {
  const { data, error } = await supabase
    .from("rekap_wilayah")
    .select("id, nama, jumlah_pospam, jumlah_nomor_darurat")
    .order("nama");
  if (error) throw error;

  const total = data.reduce(
    (t, w) => ({
      pospam: t.pospam + Number(w.jumlah_pospam),
      nomor_darurat: t.nomor_darurat + Number(w.jumlah_nomor_darurat),
    }),
    { pospam: 0, nomor_darurat: 0 }
  );

  res.json({ data, total });
});
