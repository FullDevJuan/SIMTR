import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

import authRoutes from "./auth.routes.js";
import usuariosRoutes from "./usuarios.routes.js";
import alberguesRoutes from "./albergues.routes.js";
import damnificadosRoutes from "./damnificados.routes.js";
import alertasRoutes from "./alertas.routes.js";
import asignacionesRoutes from "./asignaciones.routes.js";
import tiposAyudaRoutes from "./tipos_ayuda.routes.js";
import entregasAyudaRoutes from "./entregas_ayuda.routes.js";
import zonasRiesgoRoutes from "./zonas_riesgo.routes.js";
import auditRoutes from "./audit.routes.js";

const router = Router();

// Rutas Públicas (Sin Token)
router.use("/auth", authRoutes);

// Aplicar middleware de autenticación a TODAS las rutas de abajo
router.use(requireAuth);

router.use("/usuarios", usuariosRoutes);
router.use("/albergues", alberguesRoutes);
router.use("/damnificados", damnificadosRoutes);
router.use("/alertas", alertasRoutes);
router.use("/asignaciones", asignacionesRoutes);
router.use("/tipos_ayuda", tiposAyudaRoutes);
router.use("/entregas_ayuda", entregasAyudaRoutes);
router.use("/zonas_riesgo", zonasRiesgoRoutes);
router.use("/audit", auditRoutes);

export default router;
