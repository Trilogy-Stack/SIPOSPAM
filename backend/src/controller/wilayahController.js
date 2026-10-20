import { supabaseAdmin } from "../config/supabase.js";
import { wrap } from "../utils/http.js";

//#NA
import { regionNonaktif } from "../utils/regionNonaktif.js";

// Daftar wilayah (region) yang ada di sistem
export const listWilayah = wrap(async (req, res) => {
  // Admin wilayah hanya melihat wilayahnya sendiri
  if (req.user && req.user.role !== "super_admin") {
    return res.json({ data: req.user.region ? [req.user.region] : [] });
  }

  const { data, error } = await supabaseAdmin.from("pospam").select("region");
  if (error) throw error;

  //#NA 
  const nonaktif = await regionNonaktif();


  // const wilayahUnik = [...new Set(data.map((item) => item.region).filter(Boolean))].sort();
  const wilayahUnik = [ // ubah
    ...new Set(data.map((item) => item.region).filter((r) => r && !nonaktif.includes(r))),
  ].sort();

  res.json({ data: wilayahUnik });
});

// 2. Isi dropdown "Cari Daerah" di frontend (diambil dari region pospam)
export const listDaerah = wrap(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("pospam")
    .select("region");

  if (error) throw error;

  // #NA
  const nonaktif = await regionNonaktif();   // ← TAMBAH

  // const daerahUnik = [...new Set(data.map((item) => item.region).filter(Boolean))].sort();
  const daerahUnik = [
    ...new Set(data.map((item) => item.region).filter((r) => r && !nonaktif.includes(r))),
  ].sort();   // ← UBAH (menggantikan baris daerahUnik yang lama)


  res.json({ data: daerahUnik });
});

// 3. Rekapitulasi jumlah pospam & nomor darurat per wilayah untuk Dashboard Superadmin
export const rekapWilayah = wrap(async (req, res) => {
  const { data: pospamData, error: errPospam } = await supabaseAdmin
    .from("pospam")
    .select("region");

  if (errPospam) throw errPospam;

  const { data: nomorData, error: errNomor } = await supabaseAdmin
    .from("nomor_darurat")
    .select("region");

  if (errNomor) throw errNomor;

  // #NA Sembunyikan data milik admin nonaktif   ← TAMBAH (3 baris)
  const nonaktif = await regionNonaktif();
  const pospamTampil = (pospamData ?? []).filter((i) => !nonaktif.includes(i.region));
  const nomorTampil = (nomorData ?? []).filter((i) => !nonaktif.includes(i.region));

  // Kelompokkan dan hitung jumlah data per region
  const rekapMap = {};

  // pospamData?.forEach((item) => {
  pospamTampil.forEach((item) => {  // #NA ← UBAH (menggantikan baris pospamData yang lama)
    if (!item.region) return;
    if (!rekapMap[item.region]) {
      rekapMap[item.region] = { region: item.region, jumlah_pospam: 0, jumlah_nomor_darurat: 0 };
    }
    rekapMap[item.region].jumlah_pospam += 1;
  });

  // nomorData?.forEach((item) => {
  nomorTampil.forEach((item) => {  // #NA ← UBAH (menggantikan baris nomorData yang lama)
    if (!item.region) return;
    if (!rekapMap[item.region]) {
      rekapMap[item.region] = { region: item.region, jumlah_pospam: 0, jumlah_nomor_darurat: 0 };
    }
    rekapMap[item.region].jumlah_nomor_darurat += 1;
  });

  const data = Object.values(rekapMap);

  // const total = {
  //   pospam: pospamData?.length || 0,
  //   nomor_darurat: nomorData?.length || 0,
  // };

  // #NA ← UBAH (menggantikan baris total yang lama)
  const total = {
    pospam: pospamTampil.length,
    nomor_darurat: nomorTampil.length,
  };

  res.json({ data, total });
});