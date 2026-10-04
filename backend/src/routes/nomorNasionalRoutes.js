import { Router } from "express";
import { authRole } from "../middleware/authAdmin.js";
import { validate, idParam, nomorNasionalBody, nomorNasionalUpdateBody } from "../middleware/validate.js";
import {
  listNomorNasional, listSemuaNomorNasional, createNomorNasional,
  updateNomorNasional, deleteNomorNasional,
} from "../controller/nomorNasionalController.js";

const router = Router();

router.get("/", listNomorNasional);

// Kelola: super admin
router.get("/semua", authRole("super_admin"), listSemuaNomorNasional);
router.post("/", authRole("super_admin"), validate({ body: nomorNasionalBody }), createNomorNasional);
router.put("/:id", authRole("super_admin"), validate({ params: idParam, body: nomorNasionalUpdateBody }), updateNomorNasional);
router.delete("/:id", authRole("super_admin"), validate({ params: idParam }), deleteNomorNasional);

export default router;
