import { Router } from 'express';
import { requireRole } from '../middleware/role.middleware.js';
import { getEntregasAyuda, createEntregaAyuda } from '../controllers/entregas_ayuda.controller.js';

const router = Router();

router.get('/', getEntregasAyuda);
router.post('/', requireRole(['ADMIN', 'OPERADOR']), createEntregaAyuda);

export default router;
