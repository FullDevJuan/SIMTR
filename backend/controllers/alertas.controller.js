import { supabase } from '../repositories/supabase.client.js';
import { logAudit } from '../utils/audit.logger.js';

export const getAlertas = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('alertas')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createAlerta = async (req, res) => {
  const { mensaje, nivel, leida } = req.body;
  if (!mensaje) {
    return res.status(400).json({ error: 'Falta campo requerido (mensaje)' });
  }
  
  if (nivel && !['info', 'warning', 'critical'].includes(nivel)) {
    return res.status(400).json({ error: 'Nivel inválido' });
  }
  
  try {
    const { data, error } = await supabase
      .from('alertas')
      .insert([{ mensaje, nivel, leida }])
      .select();
    if (error) throw error;
    
    await logAudit({
      tabla_afectada: 'alertas', 
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

export const updateAlerta = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  try {
    const { data, error } = await supabase.from('alertas').update(updates).eq('id', id).select();
    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: 'Alerta no encontrada' });
    
    await logAudit({
      tabla_afectada: 'alertas', 
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
