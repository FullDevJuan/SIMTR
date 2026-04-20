import { supabase } from '../repositories/supabase.client.js';
import { logAudit } from '../utils/audit.logger.js';

export const getEntregasAyuda = async (req, res) => {
  try {
    const { data, error } = await supabase.from('entregas_ayuda').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createEntregaAyuda = async (req, res) => {
  const { damnificado_id, tipo_ayuda_id, cantidad, descripcion_detalle, fecha_entrega, fuente_recurso, observaciones, estado, motivo_anulacion } = req.body;
  const registrado_por = req.user?.id;
  
  if (!damnificado_id || !tipo_ayuda_id || !cantidad || !fuente_recurso || !estado) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  
  try {
    const { data, error } = await supabase
      .from('entregas_ayuda')
      .insert([{ damnificado_id, tipo_ayuda_id, cantidad, descripcion_detalle, fecha_entrega, fuente_recurso, observaciones, estado, motivo_anulacion, registrado_por }])
      .select();
    if (error) throw error;
    
    await logAudit({
      tabla_afectada: 'entregas_ayuda', 
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
