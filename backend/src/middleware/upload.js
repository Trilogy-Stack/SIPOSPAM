import multer from "multer";
import { HttpError } from "../utils/http.js";

export const MAKS_UKURAN = 3 * 1024 * 1024; // 3 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAKS_UKURAN, files: 1 },
  fileFilter: (req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    if (ok) return cb(null, true);
    cb(new HttpError(400, "File harus berupa gambar JPG, PNG, atau WebP"));
  },
});

// Satu file di field bernama "foto"
export const uploadFoto = upload.single("foto");

// Cek isi file (magic bytes), karena mimetype dari klien bisa dipalsukan
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
