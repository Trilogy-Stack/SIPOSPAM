import { Router } from "express";
import { authRole } from "../middleware/authAdmin.js";
import { me } from "../controller/authController.js";

const router = Router();
router.get("/me", authRole(), me);
export default router;
