import { Router } from 'express';
import { requireRole } from '../middleware/role.middleware.js';
import { getAsignaciones, createAsignacion, deleteAsignacion } from '../controllers/asignaciones.controller.js';

const router = Router();

router.get('/', getAsignaciones);
router.post('/', requireRole(['ADMIN', 'OPERADOR']), createAsignacion);
router.delete('/:id', requireRole(['ADMIN', 'OPERADOR']), deleteAsignacion);

export default router;
