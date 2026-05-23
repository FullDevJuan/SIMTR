import { Router } from 'express';
import { requireRole } from '../middleware/role.middleware.js';
import { 
  getEntregasAyuda, 
  createEntregaAyuda, 
  getEntregaAyudaById, 
  updateEntregaAyuda, 
  deleteEntregaAyuda 
} from '../controllers/entregas_ayuda.controller.js';

const router = Router();

router.get('/', getEntregasAyuda);
router.get('/:id', getEntregaAyudaById);
router.post('/', requireRole(['ADMIN', 'OPERADOR']), createEntregaAyuda);
router.patch('/:id', requireRole(['ADMIN', 'OPERADOR']), updateEntregaAyuda);
router.delete('/:id', requireRole(['ADMIN', 'OPERADOR']), deleteEntregaAyuda);

export default router;
