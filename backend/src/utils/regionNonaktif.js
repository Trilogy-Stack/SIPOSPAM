import { supabaseAdmin } from "../config/supabase.js";

// Daftar region milik admin yang dinonaktifkan
export async function regionNonaktif() {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("region")
    .eq("is_active", false)
    .not("region", "is", null);
  if (error) throw error;
  return data.map((d) => d.region);
}

// Sembunyikan baris yang region-nya ada di daftar nonaktif
export function kecualiRegion(query, regions) {
  if (!regions.length) return query;
  const daftar = regions.map((r) => `"${r.replace(/"/g, "")}"`).join(",");
  return query.not("region", "in", `(${daftar})`);
}