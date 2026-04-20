import { Router } from "express";
import { requireRole } from "../middleware/role.middleware.js";
import {
  getAlbergues,
  getAlbergueById,
  createAlbergue,
  updateAlbergue,
} from "../controllers/albergues.controller.js";

const router = Router();

router.get("/", getAlbergues);
router.get("/:id", getAlbergueById);

router.post("/", requireRole(["ADMIN", "OPERADOR"]), createAlbergue);
// router.patch('/:id', requireRole(['ADMIN', 'OPERADOR']), updateAlbergue);
router.patch("/:id", updateAlbergue);

export default router;
