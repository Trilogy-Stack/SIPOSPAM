import supabase from "../config/supabase.js";
import { wrap } from "../utils/http.js";

// Frontend memanggil ini setelah login untuk tahu role dan wilayah akun
export const me = wrap(async (req, res) => {
  let wilayah = null;

  if (req.user.wilayah_id) {
    const { data, error } = await supabase
      .from("wilayah")
      .select("id, nama")
      .eq("id", req.user.wilayah_id)
      .maybeSingle();
    if (error) throw error;
    wilayah = data;
  }

  res.json({
    data: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      wilayah,
    },
  });
});
