// src/lib/uploadIcon.js
// Unggah ikon nomor darurat lewat endpoint BE (POST /api/pospam/upload).
// BE yang menyimpan ke bucket Supabase "foto-pospam" dan mengembalikan URL publiknya,
// jadi tidak perlu bucket/policy tambahan di Supabase.
import { uploadFotoPospam } from "@/lib/api";

const MAX_SIZE = 3 * 1024 * 1024; // 3 MB, sama dengan batas upload di BE
const TIPE = ["image/jpeg", "image/png", "image/webp"];

export async function uploadNomorIcon(file) {
  if (!TIPE.includes(file.type)) {
    throw new Error("Ikon harus berupa gambar JPG, PNG, atau WebP");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("Ukuran ikon terlalu besar (maksimal 3 MB)");
  }
  return uploadFotoPospam(file); // mengembalikan URL publik
}