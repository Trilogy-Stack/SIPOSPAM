import { Router } from "express";
import {
  listNomorDarurat,
  createNomorDarurat,
  updateNomorDarurat,
  deleteNomorDarurat,
} from "../controller/nomorDaruratController.js";
import { authRole } from "../middleware/authAdmin.js";
import {
  validate,
  idParam,
  nomorDaruratListQuery,
  nomorDaruratBody,
  nomorDaruratUpdateBody,
} from "../middleware/validate.js";

const router = Router();

// Rute Publik
router.get("/", validate({ query: nomorDaruratListQuery }), listNomorDarurat);

// Rute Terproteksi (Superadmin & Admin Wilayah)
router.use(authRole("super_admin", "admin_wilayah"));

router.post("/", validate({ body: nomorDaruratBody }), createNomorDarurat);
router.put("/:id", validate({ params: idParam, body: nomorDaruratUpdateBody }), updateNomorDarurat);
router.delete("/:id", validate({ params: idParam }), deleteNomorDarurat);

export default router;