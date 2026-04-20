import { supabase } from '../repositories/supabase.client.js';
import { logAudit } from '../utils/audit.logger.js';

export const getAsignaciones = async (req, res) => {
  try {
    // Si queremos traer relaciones hay que usar la estructura real:
    const { data, error } = await supabase
      .from('asignaciones_albergue')
      .select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createAsignacion = async (req, res) => {
  const { damnificado_id, albergue_id, fecha_ingreso, fecha_salida, motivo_salida } = req.body;
  const registrado_por = req.user?.id;
  
  if (!damnificado_id || !albergue_id) {
    return res.status(400).json({ error: 'Faltan IDs requeridos: damnificado_id y albergue_id' });
  }
  
  try {
    const { data, error } = await supabase
      .from('asignaciones_albergue')
      .insert([{ damnificado_id, albergue_id, fecha_ingreso, fecha_salida, motivo_salida, registrado_por }])
      .select();
    if (error) throw error;
    
    await logAudit({
      tabla_afectada: 'asignaciones_albergue', 
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
