import { supabase } from '../repositories/supabase.client.js';
import { logAudit } from '../utils/audit.logger.js';

export const getAlbergues = async (req, res) => {
  try {
    const { data, error } = await supabase.from('albergues').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAlbergueById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('albergues').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Albergue no encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createAlbergue = async (req, res) => {
  const { nombre, tipo, direccion, barrio, latitud, longitud, capacidad_maxima, capacidad_actual, estado, condiciones_sanitarias, fecha_apertura, fecha_cierre, imagen_url } = req.body;
  const responsable_id = req.user?.id; // sacado del middleware
  
  if (!nombre || !tipo || !direccion || !barrio || latitud === undefined || longitud === undefined || !capacidad_maxima || !condiciones_sanitarias) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  
  try {
    const { data, error } = await supabase
      .from('albergues')
      .insert([{ nombre, tipo, direccion, barrio, latitud, longitud, capacidad_maxima, capacidad_actual, estado, condiciones_sanitarias, fecha_apertura, fecha_cierre, responsable_id, imagen_url }])
      .select();
    if (error) throw error;
    
    await logAudit({
      tabla_afectada: 'albergues', 
      operacion: 'INSERT', 
      registro_id: data[0].id, 
      usuario_id: responsable_id,
      ip_origen: req.ip
    });

    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAlbergue = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  try {
    const { data, error } = await supabase.from('albergues').update(updates).eq('id', id).select();
    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: 'Albergue no encontrado' });
    
    await logAudit({
      tabla_afectada: 'albergues', 
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
