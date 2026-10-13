import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Helper Validasi                                                    */
/* ------------------------------------------------------------------ */

export const validate = (skema) => (req, res, next) => {
  req.valid = {};

  for (const bagian of ["params", "query", "body"]) {
    if (!skema[bagian]) continue;

    let masukan = req[bagian];
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
/* Potongan Skema Reusable                                            */
/* ------------------------------------------------------------------ */

export const KATEGORI = ["bencana", "medis", "keamanan", "bbm", "bengkel"];

const uuid = z.string().uuid("ID tidak valid");
const teks = (maks) => z.string().trim().min(1, "Wajib diisi").max(maks);

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
  limit: z.coerce.number().int().min(1).max(1000).default(1000),
};

const email = z.string().trim().toLowerCase().email("Email tidak valid");
const NOMOR_KONTAK = /^[0-9+\-\s()]{6,20}$/;
const NOMOR_TELEPON = /^[0-9+\-\s()]{2,25}$/;

/* ------------------------------------------------------------------ */
/* Params                                                             */
/* ------------------------------------------------------------------ */

export const idParam = z.object({ id: uuid });
export const idFotoParam = z.object({ id: uuid, fotoId: uuid });

/* ------------------------------------------------------------------ */
/* Auth Body Schema                                                   */
/* ------------------------------------------------------------------ */

export const loginBody = z.object({
  email,
  password: z.string().min(1, "Password wajib diisi"),
});

export const gantiPasswordBody = z.object({
  password_baru: z.string().min(8, "Password minimal 8 karakter").max(72),
});

/* ------------------------------------------------------------------ */
/* Query                                                              */
/* ------------------------------------------------------------------ */

export const pospamListQuery = z.object({
  region: z.string().trim().max(100).optional(),
  q: z.string().trim().max(100).optional(),
  ...paging,
});

export const pospamTerdekatQuery = z.object({
  lat: latQ,
  lng: lngQ,
  batas: z.coerce.number().int().min(1).max(20).default(10),
});

export const petaQuery = z.object({
  region: z.string().trim().max(100).optional(),
});

export const nomorDaruratTerdekatQuery = z.object({
  lat: latQ,
  lng: lngQ,
  radius_m: z.coerce.number().int().min(100).max(50000).default(5000),
  batas: z.coerce.number().int().min(1).max(20).default(5),
  category: z.string().optional(),
});

export const nomorDaruratListQuery = z.object({
  region: z.string().trim().max(100).optional(),
  category: z.string().optional(),
  q: z.string().trim().max(100).optional(),
  ...paging,
});

export const adminListQuery = z.object({
  q: z.string().trim().max(100).optional(),
});

/* ------------------------------------------------------------------ */
/* Body                                                               */
/* ------------------------------------------------------------------ */

export const pospamBody = z.object({
  name: teks(150),
  koor_name: opsional(100),
  koor_phone: opsional(20, NOMOR_KONTAK, "Nomor kontak tidak valid"),
  region: teks(100),
  location: teks(250),
  area: opsional(100),
  latitude: lat,
  longitude: lng,
  facility: z.array(teks(60)).max(30).optional().default([]),
  photo: z.array(z.string().url("URL photo tidak valid")).optional().default([]),
});
export const pospamUpdateBody = pospamBody.partial();

export const fotoBody = z.object({
  urutan: z.coerce.number().int().min(1).max(4),
});

// Skema dasar nomor darurat sebelum penambahan logika kondisional
const baseNomorDaruratSchema = z.object({
  agency_name: teks(150),
  telephone: z.string().trim().regex(NOMOR_TELEPON, "Nomor telepon tidak valid"), 
  region: teks(100),
  icon: opsional(500),
  category: opsional(50),
  location: opsional(250),
  area: opsional(100),
  latitude: lat.optional().nullable(),
  longitude: lng.optional().nullable(),
});

export const nomorDaruratBody = baseNomorDaruratSchema.superRefine((data, ctx) => {
  // Validasi tambahan khusus jika BUKAN nomor darurat nasional
  if (data.region !== "NASIONAL") {
    if (!data.category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Kategori wajib diisi untuk nomor darurat wilayah",
        path: ["category"],
      });
    }
    if (!data.location) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Lokasi/alamat wajib diisi untuk nomor darurat wilayah",
        path: ["location"],
      });
    }
    if (data.latitude === undefined || data.latitude === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Latitude wajib diisi untuk nomor darurat wilayah",
        path: ["latitude"],
      });
    }
    if (data.longitude === undefined || data.longitude === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Longitude wajib diisi untuk nomor darurat wilayah",
        path: ["longitude"],
      });
    }
  }
});

export const nomorDaruratUpdateBody = baseNomorDaruratSchema.partial();

export const nomorNasionalBody = z.object({
  nama: teks(100),
  nomor: z.string().trim().regex(NOMOR_TELEPON, "Nomor tidak valid"),
  logo_url: opsional(300),
  urutan: z.coerce.number().int().min(0).optional(),
  aktif: z.boolean().optional(),
});
export const nomorNasionalUpdateBody = nomorNasionalBody.partial();

export const adminCreateBody = z.object({
  name: teks(100),
  email,
  password: z.string().min(8, "Password minimal 8 karakter").max(72),
  region: teks(100),
  role: z.enum(["super_admin", "admin_wilayah"]).default("admin_wilayah"),
});

export const adminUpdateBody = z.object({
  name: teks(100).optional(),
  email: email.optional(),
  region: teks(100).optional(),
  role: z.enum(["super_admin", "admin_wilayah"]).optional(),
  is_active: z.boolean().optional(),
});