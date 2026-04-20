import { Router } from 'express';
import { requireRole } from '../middleware/role.middleware.js';
import { 
  getDamnificados, 
  getDamnificadoById, 
  createDamnificado, 
  updateDamnificado 
} from '../controllers/damnificados.controller.js';

const router = Router();

router.get('/', getDamnificados);
router.get('/:id', getDamnificadoById);

// ADMIN y OPERADOR pueden escribir
router.post('/', requireRole(['ADMIN', 'OPERADOR']), createDamnificado);
router.patch('/:id', requireRole(['ADMIN', 'OPERADOR']), updateDamnificado);

export default router;
