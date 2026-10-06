import { Router } from "express";
import { authRole } from "../middleware/authAdmin.js";
import { uploadFoto } from "../middleware/upload.js";
import {
  validate,
  idParam,
  pospamListQuery,
  petaQuery,
  pospamBody,
  pospamUpdateBody,
} from "../middleware/validate.js";
import {
  listPospam,
  petaPospam,
  getPospam,
  createPospam,
  updatePospam,
  deletePospam,
  uploadFotoPospam,
} from "../controller/pospamController.js";

const router = Router();

/* ------------------------------------------------------------------ */
/* RUTE PUBLIK (Bisa diakses siapapun)                                */
/* ------------------------------------------------------------------ */

// Catatan: Route statis (/peta) WAJIB ditaruh sebelum "/:id"
router.get("/", validate({ query: pospamListQuery }), listPospam);
router.get("/peta", validate({ query: petaQuery }), petaPospam);
router.get("/:id", validate({ params: idParam }), getPospam);

/* ------------------------------------------------------------------ */
/* RUTE TERPROTEKSI (Superadmin & Admin Wilayah)                       */
/* ------------------------------------------------------------------ */

router.use(authRole("super_admin", "admin_wilayah"));

// Unggah foto fasilitas ke Storage (Mengembalikan URL gambar)
router.post("/upload", uploadFoto, uploadFotoPospam);

// CRUD Pospam
router.post("/", validate({ body: pospamBody }), createPospam);
router.put("/:id", validate({ params: idParam, body: pospamUpdateBody }), updatePospam);
router.delete("/:id", validate({ params: idParam }), deletePospam);

export default router;