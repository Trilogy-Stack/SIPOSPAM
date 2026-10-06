import { supabase } from "../config/supabase.js";
import { wrap } from "../utils/http.js";

// 1. Ambil daftar semua wilayah/region unik dari tabel pospam & profiles
export const listWilayah = wrap(async (req, res) => {
  const { data: pospamData, error: errPospam } = await supabase
    .from("pospam")
    .select("region");

  if (errPospam) throw errPospam;

  // Ambil daftar region unik dan hilangkan nilai null/kosong
  const wilayahUnik = [...new Set(pospamData.map((item) => item.region).filter(Boolean))].sort();

  res.json({ data: wilayahUnik });
});

// 2. Isi dropdown "Cari Daerah" di frontend (diambil dari region pospam)
export const listDaerah = wrap(async (req, res) => {
  const { data, error } = await supabase
    .from("pospam")
    .select("region");

  if (error) throw error;

  const daerahUnik = [...new Set(data.map((item) => item.region).filter(Boolean))].sort();

  res.json({ data: daerahUnik });
});

// 3. Rekapitulasi jumlah pospam & nomor darurat per wilayah untuk Dashboard Superadmin
export const rekapWilayah = wrap(async (req, res) => {
  const { data: pospamData, error: errPospam } = await supabase
    .from("pospam")
    .select("region");

  if (errPospam) throw errPospam;

  const { data: nomorData, error: errNomor } = await supabase
    .from("nomor_darurat")
    .select("region");

  if (errNomor) throw errNomor;

  // Kelompokkan dan hitung jumlah data per region
  const rekapMap = {};

  pospamData?.forEach((item) => {
    if (!item.region) return;
    if (!rekapMap[item.region]) {
      rekapMap[item.region] = { region: item.region, jumlah_pospam: 0, jumlah_nomor_darurat: 0 };
    }
    rekapMap[item.region].jumlah_pospam += 1;
  });

  nomorData?.forEach((item) => {
    if (!item.region) return;
    if (!rekapMap[item.region]) {
      rekapMap[item.region] = { region: item.region, jumlah_pospam: 0, jumlah_nomor_darurat: 0 };
    }
    rekapMap[item.region].jumlah_nomor_darurat += 1;
  });

  const data = Object.values(rekapMap);

  const total = {
    pospam: pospamData?.length || 0,
    nomor_darurat: nomorData?.length || 0,
  };

  res.json({ data, total });
});