import { Router } from 'express';
import { requireRole } from '../middleware/role.middleware.js';
import { getAlertas, createAlerta, updateAlerta } from '../controllers/alertas.controller.js';

const router = Router();

router.get('/', getAlertas);
router.post('/', requireRole(['ADMIN', 'OPERADOR']), createAlerta);
router.patch('/:id', requireRole(['ADMIN', 'OPERADOR']), updateAlerta);

export default router;
