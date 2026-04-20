import { supabase } from '../repositories/supabase.client.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No se envió token de autenticación (Bearer)' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    // Buscamos el ID interno en nuestra tabla usuarios
    const { data: usuarioLocal } = await supabase
      .from('usuarios')
      .select('id, rol')
      .eq('auth_user_id', user.id)
      .single();

    // Adjuntamos todo al request
    req.user = {
      auth_user_id: user.id,
      id: usuarioLocal?.id || null, // ID de nuestra tabla
      rol: usuarioLocal?.rol || 'VISUALIZADOR',
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Error en Auth Middleware:', error);
    res.status(500).json({ error: 'Error del servidor procesando la autenticación' });
  }
};
