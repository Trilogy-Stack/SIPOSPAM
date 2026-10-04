import { Router } from "express";
import { authRole } from "../middleware/authAdmin.js";
import { uploadFoto } from "../middleware/upload.js";
import {
  validate, idParam, idFotoParam, pospamListQuery, pospamTerdekatQuery,
  petaQuery, pospamBody, pospamUpdateBody, fotoBody,
} from "../middleware/validate.js";
import {
  listPospam, petaPospam, getPospamTerdekat, getPospam,
  listPospamSaya, createPospam, updatePospam, deletePospam,
} from "../controller/pospamController.js";
import { unggahFoto, hapusFoto } from "../controller/fotoPospamController.js";

const router = Router();

// PENTING: route statis (/peta, /terdekat, /saya) harus sebelum "/:id"
router.get("/", validate({ query: pospamListQuery }), listPospam);
router.get("/peta", validate({ query: petaQuery }), petaPospam);
router.get("/terdekat", validate({ query: pospamTerdekatQuery }), getPospamTerdekat);
router.get("/saya", authRole("admin"), validate({ query: pospamListQuery }), listPospamSaya);
router.get("/:id", validate({ params: idParam }), getPospam);

// Admin (wilayah sendiri)
router.post("/", authRole("admin"), validate({ body: pospamBody }), createPospam);
router.put("/:id", authRole("admin"), validate({ params: idParam, body: pospamUpdateBody }), updatePospam);
router.delete("/:id", authRole("admin"), validate({ params: idParam }), deletePospam);

// Foto: uploadFoto (multer) harus sebelum validate agar req.body terisi
router.post("/:id/foto", authRole("admin"), uploadFoto, validate({ params: idParam, body: fotoBody }), unggahFoto);
router.delete("/:id/foto/:fotoId", authRole("admin"), validate({ params: idFotoParam }), hapusFoto);

export default router;
