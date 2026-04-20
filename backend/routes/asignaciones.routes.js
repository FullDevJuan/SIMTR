import { Router } from 'express';
import { requireRole } from '../middleware/role.middleware.js';
import { getAsignaciones, createAsignacion } from '../controllers/asignaciones.controller.js';

const router = Router();

router.get('/', getAsignaciones);
router.post('/', requireRole(['ADMIN', 'OPERADOR']), createAsignacion);

export default router;
