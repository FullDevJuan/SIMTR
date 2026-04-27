import { supabase } from '../repositories/supabase.client.js';
import { logAudit } from '../utils/audit.logger.js';

export const getDamnificados = async (req, res) => {
  try {
    const { data, error } = await supabase.from('damnificados').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDamnificadoById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('damnificados').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Damnificado no encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDamnificado = async (req, res) => {
  const { numero_documento, tipo_documento, nombres, apellidos, fecha_nacimiento, genero, telefono, barrio_afectado, estado_actual, total_miembros, activo } = req.body;
  const registrado_por = req.user?.id; // del token
  
  if (!numero_documento || !tipo_documento || !nombres || !apellidos || !genero || !barrio_afectado || !estado_actual) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  
  // Limpiamos los datos para no enviar strings vacíos que rompan PostgreSQL y asignamos default a activo
  const payload = {
    numero_documento, tipo_documento, nombres, apellidos, genero, 
    barrio_afectado, estado_actual, total_miembros, 
    activo: activo !== undefined ? activo : true,
    registrado_por
  };
  
  if (fecha_nacimiento) payload.fecha_nacimiento = fecha_nacimiento;
  if (telefono) payload.telefono = telefono;

  try {
    const { data, error } = await supabase
      .from('damnificados')
      .insert([payload])
      .select();
    if (error) throw error;
    
    await logAudit({
      tabla_afectada: 'damnificados', 
      operacion: 'INSERT', 
      registro_id: data[0].id, 
      usuario_id: registrado_por,
      ip_origen: req.ip
    });

    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDamnificado = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  // Limpiar vacíos para evitar errores de tipo en la base de datos
  if (updates.fecha_nacimiento === '') updates.fecha_nacimiento = null;
  if (updates.telefono === '') updates.telefono = null;

  try {
    const { data, error } = await supabase
      .from('damnificados')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: 'Damnificado no encontrado' });
    
    await logAudit({
      tabla_afectada: 'damnificados', 
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
