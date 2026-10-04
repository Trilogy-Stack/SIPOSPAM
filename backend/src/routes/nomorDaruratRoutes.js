import { Router } from "express";
import { authRole } from "../middleware/authAdmin.js";
import {
  validate, idParam, nomorDaruratTerdekatQuery, nomorDaruratListQuery,
  nomorDaruratBody, nomorDaruratUpdateBody,
} from "../middleware/validate.js";
import {
  getNomorDaruratTerdekat, getNomorDarurat, listNomorDarurat, listNomorDaruratSaya,
  createNomorDarurat, updateNomorDarurat, deleteNomorDarurat,
} from "../controller/nomorDaruratController.js";

const router = Router();

// PENTING: route statis (/terdekat, /saya) harus sebelum "/:id"
router.get("/terdekat", validate({ query: nomorDaruratTerdekatQuery }), getNomorDaruratTerdekat);
router.get("/saya", authRole("admin"), validate({ query: nomorDaruratListQuery }), listNomorDaruratSaya);
router.get("/", authRole("super_admin"), validate({ query: nomorDaruratListQuery }), listNomorDarurat);
router.get("/:id", validate({ params: idParam }), getNomorDarurat);

router.post("/", authRole("admin"), validate({ body: nomorDaruratBody }), createNomorDarurat);
router.put("/:id", authRole("admin"), validate({ params: idParam, body: nomorDaruratUpdateBody }), updateNomorDarurat);
router.delete("/:id", authRole("admin"), validate({ params: idParam }), deleteNomorDarurat);

export default router;
