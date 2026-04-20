import { supabase } from '../repositories/supabase.client.js';
import { logAudit } from '../utils/audit.logger.js';

export const getZonasRiesgo = async (req, res) => {
  try {
    const { data, error } = await supabase.from('zonas_riesgo').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createZonaRiesgo = async (req, res) => {
  const { nombre, nivel_riesgo, descripcion, geojson_poligono, activa } = req.body;
  const actualizado_por = req.user?.id;
  
  if (!nombre || !nivel_riesgo || !geojson_poligono) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  
  try {
    const { data, error } = await supabase
      .from('zonas_riesgo')
      .insert([{ nombre, nivel_riesgo, descripcion, geojson_poligono, activa, actualizado_por }])
      .select();
    if (error) throw error;
    
    await logAudit({
      tabla_afectada: 'zonas_riesgo', 
      operacion: 'INSERT', 
      registro_id: data[0].id, 
      usuario_id: actualizado_por,
      ip_origen: req.ip
    });

    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateZonaRiesgo = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body, actualizado_por: req.user?.id };
  
  try {
    const { data, error } = await supabase.from('zonas_riesgo').update(updates).eq('id', id).select();
    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: 'Zona de riesgo no encontrada' });
    
    await logAudit({
      tabla_afectada: 'zonas_riesgo', 
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
