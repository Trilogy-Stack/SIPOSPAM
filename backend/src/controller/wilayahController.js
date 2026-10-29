import { supabaseAdmin } from "../config/supabase.js";
import { wrap } from "../utils/http.js";
import { regionNonaktif } from "../utils/regionNonaktif.js";

// 1. Daftar wilayah (region) yang ada di sistem
export const listWilayah = wrap(async (req, res) => {

  if (req.user && req.user.role !== "super_admin") {
    return res.json({ data: req.user.region ? [req.user.region] : [] });
  }

  const { data, error } = await supabaseAdmin.from("pospam").select("region");
  if (error) throw error;

  const nonaktif = await regionNonaktif();

  const wilayahUnik = [ 
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

  const nonaktif = await regionNonaktif();

  const daerahUnik = [
    ...new Set(data.map((item) => item.region).filter((r) => r && !nonaktif.includes(r))),
  ].sort(); 

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

  const nonaktif = await regionNonaktif();
  const pospamTampil = (pospamData ?? []).filter((i) => !nonaktif.includes(i.region));
  const nomorTampil = (nomorData ?? []).filter((i) => !nonaktif.includes(i.region));
  const rekapMap = {};

  pospamTampil.forEach((item) => { 
    if (!item.region) return;
    if (!rekapMap[item.region]) {
      rekapMap[item.region] = { region: item.region, jumlah_pospam: 0, jumlah_nomor_darurat: 0 };
    }
    rekapMap[item.region].jumlah_pospam += 1;
  });

  nomorTampil.forEach((item) => {  
    if (!item.region) return;
    if (!rekapMap[item.region]) {
      rekapMap[item.region] = { region: item.region, jumlah_pospam: 0, jumlah_nomor_darurat: 0 };
    }
    rekapMap[item.region].jumlah_nomor_darurat += 1;
  });

  const data = Object.values(rekapMap);

  const total = {
    pospam: pospamTampil.length,
    nomor_darurat: nomorTampil.length,
  };

  res.json({ data, total });
});