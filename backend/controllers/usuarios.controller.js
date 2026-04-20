import { supabase } from '../repositories/supabase.client.js';
import { logAudit } from '../utils/audit.logger.js';

export const getUsuarios = async (req, res) => {
  try {
    const { data, error } = await supabase.from('usuarios').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsuarioById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('usuarios').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createUsuario = async (req, res) => {
  const { auth_user_id, rol, nombre_completo, telefono, activo } = req.body;
  if (!rol || !nombre_completo) {
    return res.status(400).json({ error: 'El rol y nombre_completo son requeridos' });
  }
  
  if (!['ADMIN', 'OPERADOR', 'VISUALIZADOR'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }
  
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ auth_user_id, rol, nombre_completo, telefono, activo }])
      .select();
    if (error) throw error;
    
    await logAudit({
      tabla_afectada: 'usuarios', 
      operacion: 'INSERT', 
      registro_id: data[0].id, 
      usuario_id: req.user?.id,
      ip_origen: req.ip
    });
    
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    await logAudit({
      tabla_afectada: 'usuarios', 
      operacion: 'UPDATE', 
      registro_id: data[0].id, 
      usuario_id: req.user?.id,
      ip_origen: req.ip
    });

    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
