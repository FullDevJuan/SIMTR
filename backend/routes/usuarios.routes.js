import { Router } from 'express';
import { requireRole } from '../middleware/role.middleware.js';
import { getUsuarios, getUsuarioById, createUsuario, updateUsuario } from '../controllers/usuarios.controller.js';

const router = Router();

// Asumimos que todos pueden al menos listar usuarios si están logueados
router.get('/', getUsuarios);
router.get('/:id', getUsuarioById);

// Solo ADMIN puede crear y modificar usuarios
router.post('/', requireRole(['ADMIN']), createUsuario);
router.patch('/:id', requireRole(['ADMIN']), updateUsuario);

export default router;
