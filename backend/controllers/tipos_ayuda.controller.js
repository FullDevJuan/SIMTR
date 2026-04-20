import { supabase } from '../repositories/supabase.client.js';
import { logAudit } from '../utils/audit.logger.js';

export const getTiposAyuda = async (req, res) => {
  try {
    const { data, error } = await supabase.from('tipos_ayuda').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTipoAyuda = async (req, res) => {
  const { nombre, descripcion, unidad_medida } = req.body;
  if (!nombre || !unidad_medida) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  
  try {
    const { data, error } = await supabase
      .from('tipos_ayuda')
      .insert([{ nombre, descripcion, unidad_medida }])
      .select();
    if (error) throw error;
    
    await logAudit({
      tabla_afectada: 'tipos_ayuda', 
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
