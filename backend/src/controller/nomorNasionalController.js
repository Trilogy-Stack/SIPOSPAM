import supabase from "../config/supabase.js";
import { HttpError, wrap } from "../utils/http.js";

const KOLOM = "id, nama, nomor, logo_url, urutan, aktif";

// Publik: grid 119, 112, 110, dst. (hanya yang aktif)
export const listNomorNasional = wrap(async (req, res) => {
  const { data, error } = await supabase
    .from("nomor_nasional")
    .select(KOLOM)
    .eq("aktif", true)
    .order("urutan");
  if (error) throw error;
  res.json({ data });
});

// Super admin: semua, termasuk yang nonaktif
export const listSemuaNomorNasional = wrap(async (req, res) => {
  const { data, error } = await supabase
    .from("nomor_nasional")
    .select(KOLOM)
    .order("urutan");
  if (error) throw error;
  res.json({ data });
});

export const createNomorNasional = wrap(async (req, res) => {
  const { data, error } = await supabase
    .from("nomor_nasional")
    .insert(req.valid.body)
    .select(KOLOM)
    .single();
  if (error) throw error;
  res.status(201).json({ data });
});

export const updateNomorNasional = wrap(async (req, res) => {
  const { id } = req.valid.params;
  if (!Object.keys(req.valid.body).length) {
    throw new HttpError(400, "Tidak ada data yang diubah");
  }
  const { data, error } = await supabase
    .from("nomor_nasional")
    .update(req.valid.body)
    .eq("id", id)
    .select(KOLOM)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(404, "Data tidak ditemukan");
  res.json({ data });
});

export const deleteNomorNasional = wrap(async (req, res) => {
  const { id } = req.valid.params;
  const { data, error } = await supabase
    .from("nomor_nasional")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw error;
  if (!data.length) throw new HttpError(404, "Data tidak ditemukan");
  res.json({ message: "Data dihapus" });
});
