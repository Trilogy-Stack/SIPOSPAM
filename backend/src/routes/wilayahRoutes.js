import { Router } from "express";
import { authRole } from "../middleware/authAdmin.js";
import { listWilayah, listDaerah, rekapWilayah } from "../controller/wilayahController.js";

const router = Router();

router.get("/", listWilayah);
router.get("/daerah", listDaerah);
router.get("/rekap", authRole("super_admin"), rekapWilayah);

export default router;
