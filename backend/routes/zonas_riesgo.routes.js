import { Router } from 'express';
import { requireRole } from '../middleware/role.middleware.js';
import { getZonasRiesgo, createZonaRiesgo, updateZonaRiesgo } from '../controllers/zonas_riesgo.controller.js';

const router = Router();

router.get('/', getZonasRiesgo);
router.post('/', requireRole(['ADMIN']), createZonaRiesgo);
router.patch('/:id', requireRole(['ADMIN']), updateZonaRiesgo);

export default router;
