import { Router } from 'express';
import { requireRole } from '../middleware/role.middleware.js';
import { getTiposAyuda, createTipoAyuda } from '../controllers/tipos_ayuda.controller.js';

const router = Router();

router.get('/', getTiposAyuda);

// Tipos de ayuda es configuración, quizas solo ADMIN
router.post('/', requireRole(['ADMIN']), createTipoAyuda);

export default router;
