import { Router } from "express";
import authRoutes from "./authRoutes.js";
import adminRoutes from "./adminRoutes.js";
import wilayahRoutes from "./wilayahRoutes.js";
import pospamRoutes from "./pospamRoutes.js";
import nomorDaruratRoutes from "./nomorDaruratRoutes.js";
import nomorNasionalRoutes from "./nomorNasionalRoutes.js";

const router = Router();

router.get("/health", (req, res) => res.json({ ok: true }));

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/wilayah", wilayahRoutes);
router.use("/pospam", pospamRoutes);
router.use("/nomor-darurat", nomorDaruratRoutes);
router.use("/nomor-nasional", nomorNasionalRoutes);

export default router;
