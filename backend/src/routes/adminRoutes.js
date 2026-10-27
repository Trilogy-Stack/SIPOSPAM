import { Router } from "express";
import { listAdmin,createAdmin, updateAdmin, deleteAdmin } from "../controller/adminController.js";
import { authRole } from "../middleware/authAdmin.js";
import { validate, idParam, adminListQuery, adminCreateBody, adminUpdateBody, adminDeleteBody } from "../middleware/validate.js";
// import { createAdminSchema } from "../schema/adminSchema.js";

const router = Router();

// Hanya Superadmin yang berhak mengelola akun admin
router.use(authRole("super_admin"));

router.get("/", validate({ query: adminListQuery }), listAdmin);
router.post("/", validate({ body: adminCreateBody }), createAdmin);
router.put("/:id", validate({ params: idParam, body: adminUpdateBody }), updateAdmin);
router.delete("/:id", validate({ params: idParam, body: adminDeleteBody }), deleteAdmin);

export default router;