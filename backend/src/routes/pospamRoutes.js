import { Router } from "express";
import { authRole } from "../middleware/authAdmin.js";
import { uploadFoto } from "../middleware/upload.js";
import {
  validate,
  idParam,
  pospamListQuery,
  petaQuery,
  pospamBody,
  pospamUpdateBody,
} from "../middleware/validate.js";
import {
  listPospam,
  petaPospam,
  getPospam,
  createPospam,
  updatePospam,
  deletePospam,
  uploadFotoPospam,
} from "../controller/pospamController.js";

const router = Router();

router.get("/", validate({ query: pospamListQuery }), listPospam);
router.get("/peta", validate({ query: petaQuery }), petaPospam);
router.get("/:id", validate({ params: idParam }), getPospam);

router.use(authRole("super_admin", "admin_wilayah"));

router.post("/upload", uploadFoto, uploadFotoPospam);

router.post("/", validate({ body: pospamBody }), createPospam);
router.put("/:id", validate({ params: idParam, body: pospamUpdateBody }), updatePospam);
router.delete("/:id", validate({ params: idParam }), deletePospam);

export default router;