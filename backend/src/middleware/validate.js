import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Helper validasi                                                     */
/* ------------------------------------------------------------------ */

// validate({ params, query, body }) -> hasil parse ada di req.valid.params/query/body
export const validate = (skema) => (req, res, next) => {
  req.valid = {};

  for (const bagian of ["params", "query", "body"]) {
    if (!skema[bagian]) continue;

    let masukan = req[bagian];
    // ?q=&kabupaten_kota= (string kosong) dianggap tidak dikirim
    if (bagian === "query") {
      masukan = Object.fromEntries(
        Object.entries(masukan || {}).filter(([, v]) => v !== "")
      );
    }

    const hasil = skema[bagian].safeParse(masukan ?? {});
    if (!hasil.success) {
      return res.status(400).json({
        message: "Data tidak valid",
        detail: hasil.error.issues.map((i) => ({
          field: i.path.join("."),
          pesan: i.message,
        })),
      });
    }
    req.valid[bagian] = hasil.data;
  }
  next();
};

/* ------------------------------------------------------------------ */
/* Potongan skema yang dipakai ulang                                   */
/* ------------------------------------------------------------------ */

export const KATEGORI = ["bencana", "medis", "keamanan", "bbm", "bengkel"];

const uuid = z.string().uuid("ID tidak valid");
const teks = (maks) => z.string().trim().min(1, "Wajib diisi").max(maks);

// Teks opsional: "" dianggap kosong (null)
const opsional = (maks, pola, pesan) => {
  let s = z.string().trim().max(maks);
  if (pola) s = s.refine((v) => v === "" || pola.test(v), pesan);
  return s.transform((v) => (v === "" ? null : v)).nullish();
};

const lat = z.number().min(-90).max(90);
const lng = z.number().min(-180).max(180);
const latQ = z.coerce.number().min(-90).max(90);
const lngQ = z.coerce.number().min(-180).max(180);

const paging = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
};

const email = z.string().trim().toLowerCase().email("Email tidak valid");

/* ------------------------------------------------------------------ */
/* Params                                                              */
/* ------------------------------------------------------------------ */

export const idParam = z.object({ id: uuid });
export const idFotoParam = z.object({ id: uuid, fotoId: uuid });

/* ------------------------------------------------------------------ */
/* Query                                                               */
/* ------------------------------------------------------------------ */

export const pospamListQuery = z.object({
  kabupaten_kota: z.string().trim().max(100).optional(),
  wilayah_id: uuid.optional(),
  q: z.string().trim().max(100).optional(),
  ...paging,
});

export const pospamTerdekatQuery = z.object({
  lat: latQ,
  lng: lngQ,
  batas: z.coerce.number().int().min(1).max(20).default(10),
});

export const petaQuery = z.object({
  wilayah_id: uuid.optional(),
  kabupaten_kota: z.string().trim().max(100).optional(),
});

export const nomorDaruratTerdekatQuery = z.object({
  lat: latQ,
  lng: lngQ,
  radius_m: z.coerce.number().int().min(100).max(50000).default(5000),
  batas: z.coerce.number().int().min(1).max(20).default(5),
  kategori: z.enum(KATEGORI).optional(),
});

export const nomorDaruratListQuery = z.object({
  wilayah_id: uuid.optional(),
  kategori: z.enum(KATEGORI).optional(),
  q: z.string().trim().max(100).optional(),
  ...paging,
});

export const adminListQuery = z.object({
  q: z.string().trim().max(100).optional(),
});

/* ------------------------------------------------------------------ */
/* Body                                                                */
/* ------------------------------------------------------------------ */

const NOMOR_KONTAK = /^[0-9+\-\s()]{6,20}$/;
const NOMOR_TELEPON = /^[0-9+\-\s()]{2,25}$/;

export const pospamBody = z.object({
  nama_pos: teks(150),
  nama_koordinator: opsional(100),
  kontak_koordinator: opsional(20, NOMOR_KONTAK, "Nomor kontak tidak valid"),
  provinsi: teks(100),
  kabupaten_kota: teks(100),
  kecamatan: opsional(100),
  kode_pos: opsional(5, /^\d{5}$/, "Kode pos harus 5 digit"),
  jalan: opsional(250),
  latitude: lat,
  longitude: lng,
  // daftar NAMA fasilitas; yang tidak dikirim lagi akan dihapus
  fasilitas: z.array(teks(60)).max(30).optional(),
});
export const pospamUpdateBody = pospamBody.partial();

export const fotoBody = z.object({
  urutan: z.coerce.number().int().min(1).max(4),
});

export const nomorDaruratBody = z.object({
  nama_instansi: teks(150),
  nomor_telepon: z.string().trim().regex(NOMOR_TELEPON, "Nomor telepon tidak valid"),
  kategori: z.array(z.enum(KATEGORI)).min(1, "Pilih minimal satu kategori").max(5),
  provinsi: teks(100),
  kabupaten_kota: teks(100),
  kecamatan: opsional(100),
  kode_pos: opsional(5, /^\d{5}$/, "Kode pos harus 5 digit"),
  jalan: opsional(250),
  latitude: lat,
  longitude: lng,
});
export const nomorDaruratUpdateBody = nomorDaruratBody.partial();

export const nomorNasionalBody = z.object({
  nama: teks(100),
  nomor: z.string().trim().regex(NOMOR_TELEPON, "Nomor tidak valid"),
  logo_url: opsional(300),
  urutan: z.coerce.number().int().min(0).optional(),
  aktif: z.boolean().optional(),
});
export const nomorNasionalUpdateBody = nomorNasionalBody.partial();

export const adminCreateBody = z.object({
  nama_wilayah: teks(100),
  email,
  password: z.string().min(8, "Password minimal 8 karakter").max(72),
});

export const adminUpdateBody = z.object({
  nama_wilayah: teks(100).optional(),
  email: email.optional(),
  aktif: z.boolean().optional(),
});
