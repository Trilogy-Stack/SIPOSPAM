import supabase, { BUCKET_FOTO } from "../config/supabase.js";
import { HttpError, wrap } from "../utils/http.js";
import { pastikanMilik } from "../utils/akses.js";
import { deteksiTipeGambar } from "../middleware/upload.js";

// POST /api/pospam/:id/foto  (multipart: field "foto" + field "urutan" 1-4)
// Kalau slot urutan sudah terisi, fotonya diganti.
export const unggahFoto = wrap(async (req, res) => {
  const { id } = req.valid.params;
  const { urutan } = req.valid.body;

  await pastikanMilik("pospam", id, req.user.wilayah_id);

  if (!req.file) throw new HttpError(400, "File foto wajib dikirim (field 'foto')");
  const tipe = deteksiTipeGambar(req.file.buffer);
  if (!tipe) throw new HttpError(400, "Isi file bukan gambar JPG, PNG, atau WebP yang valid");

  const { data: lama, error: errLama } = await supabase
    .from("foto_pospam")
    .select("id, storage_path")
    .eq("pospam_id", id)
    .eq("urutan", urutan)
    .maybeSingle();
  if (errLama) throw errLama;

  const path = `${id}/${urutan}-${Date.now()}.${tipe.ext}`;
  const { error: errUpload } = await supabase.storage
    .from(BUCKET_FOTO)
    .upload(path, req.file.buffer, { contentType: tipe.mime, upsert: false });
  if (errUpload) {
    console.error("Upload Storage gagal:", errUpload.message);
    throw new HttpError(502, "Gagal mengunggah foto ke penyimpanan");
  }

  const { data: pub } = supabase.storage.from(BUCKET_FOTO).getPublicUrl(path);

  const { data, error } = await supabase
    .from("foto_pospam")
    .upsert(
      { pospam_id: id, urutan, url: pub.publicUrl, storage_path: path },
      { onConflict: "pospam_id,urutan" }
    )
    .select("id, url, urutan")
    .single();
  if (error) {
    await supabase.storage.from(BUCKET_FOTO).remove([path]);
    throw error;
  }

  if (lama) await supabase.storage.from(BUCKET_FOTO).remove([lama.storage_path]);

  res.status(201).json({ data });
});

// DELETE /api/pospam/:id/foto/:fotoId
export const hapusFoto = wrap(async (req, res) => {
  const { id, fotoId } = req.valid.params;
  await pastikanMilik("pospam", id, req.user.wilayah_id);

  const { data: foto, error } = await supabase
    .from("foto_pospam")
    .select("id, storage_path")
    .eq("id", fotoId)
    .eq("pospam_id", id)
    .maybeSingle();
  if (error) throw error;
  if (!foto) throw new HttpError(404, "Foto tidak ditemukan");

  const { error: errHapus } = await supabase.from("foto_pospam").delete().eq("id", fotoId);
  if (errHapus) throw errHapus;

  const { error: errStorage } = await supabase.storage
    .from(BUCKET_FOTO)
    .remove([foto.storage_path]);
  if (errStorage) console.error("Gagal menghapus file foto:", errStorage.message);

  res.json({ message: "Foto dihapus" });
});
