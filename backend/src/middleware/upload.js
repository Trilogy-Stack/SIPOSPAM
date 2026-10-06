// UDA TAK SESUIAKAN

import multer from "multer";

export const MAKS_UKURAN = 3 * 1024 * 1024; // 3 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAKS_UKURAN, files: 1 },
  fileFilter: (req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    if (ok) return cb(null, true);

    const error = new Error("File harus berupa gambar JPG, PNG, atau WebP");
    error.status = 400;
    return cb(error);
  },
});

// Unggah satu file (field 'photo' disamakan dengan DB, 'foto' sebagai opsional)
export const uploadFoto = upload.single("photo");
export const uploadFotoAlt = upload.single("foto");

// Deteksi tipe gambar via magic bytes (pencegahan pemalsuan MIME)
export function deteksiTipeGambar(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.subarray(0, 8).equals(png)) return { mime: "image/png", ext: "png" };
  if (
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}