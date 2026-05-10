import { Router } from 'express';
import { getAuditLogs } from '../controllers/audit.controller.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Solo el ADMIN debería ver los logs de auditoría
router.get('/', requireRole(['ADMIN']), getAuditLogs);

export default router;
