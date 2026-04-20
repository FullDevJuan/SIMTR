/**
 * Middleware para restringir rutas en base a roles.
 * Debe ir SIEMPRE después del middleware requireAuth en la cadena de express.
 * @param {string[]} allowedRoles - Array de roles permitidos ej: ['ADMIN', 'OPERADOR']
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // req.user debió ser inyectado por requireAuth
    if (!req.user || !req.user.rol) {
      return res.status(403).json({ error: 'Acceso denegado: No se pudo verificar tu rol actual.' });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ 
        error: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};
