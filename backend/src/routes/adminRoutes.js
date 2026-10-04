import { Router } from "express";
import { authRole } from "../middleware/authAdmin.js";
import { validate, idParam, adminListQuery, adminCreateBody, adminUpdateBody } from "../middleware/validate.js";
import { listAdmin, createAdmin, updateAdmin, deleteAdmin } from "../controller/adminController.js";

const router = Router();

// Semua route di file ini khusus super admin
router.use(authRole("super_admin"));

router.get("/", validate({ query: adminListQuery }), listAdmin);
router.post("/", validate({ body: adminCreateBody }), createAdmin);
router.put("/:id", validate({ params: idParam, body: adminUpdateBody }), updateAdmin);
router.delete("/:id", validate({ params: idParam }), deleteAdmin);

export default router;
