import { Router } from "express";
import { login, me, gantiPassword } from "../controller/authController.js";
import { authRole } from "../middleware/authAdmin.js";
import { validate } from "../middleware/validate.js";
import { loginBody, gantiPasswordBody } from "../middleware/validate.js";

const router = Router();

router.post("/login", validate({ body: loginBody }), login);
router.get("/me", authRole(), me);
router.put("/ganti-password", authRole(), validate({ body: gantiPasswordBody }), gantiPassword);

export default router;