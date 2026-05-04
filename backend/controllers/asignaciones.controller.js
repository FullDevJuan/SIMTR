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
  
  // Limpiamos los datos para no enviar campos ausentes y romper los DEFAULT de Postgres
  const payload = { damnificado_id, albergue_id, registrado_por };
  if (fecha_ingreso) payload.fecha_ingreso = fecha_ingreso;
  if (fecha_salida) payload.fecha_salida = fecha_salida;
  if (motivo_salida) payload.motivo_salida = motivo_salida;

  try {
    const { data, error } = await supabase
      .from('asignaciones_albergue')
      .insert([payload])
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

export const deleteAsignacion = async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.user?.id;

  console.log(`[Backend] Intentando eliminar asignación ID: ${id} por usuario: ${usuario_id}`);

  try {
    const { data, error, status } = await supabase
      .from('asignaciones_albergue')
      .delete()
      .eq('id', id)
      .select(); // Agregamos .select() para confirmar qué se borró

    if (error) {
      console.error('[Backend] Error de Supabase al borrar:', error);
      throw error;
    }

    console.log(`[Backend] Resultado del borrado (status ${status}):`, data);

    if (!data || data.length === 0) {
      console.warn(`[Backend] No se encontró ninguna asignación con ID: ${id} para borrar.`);
    }

    try {
      await logAudit({
        tabla_afectada: 'asignaciones_albergue',
        operacion: 'DELETE',
        registro_id: id,
        usuario_id,
        ip_origen: req.ip
      });
    } catch (auditError) {
      console.error('[Backend] Error logging audit:', auditError.message);
    }

    res.json({ 
      message: 'Asignación procesada', 
      deleted: data && data.length > 0,
      data: data ? data[0] : null
    });
  } catch (error) {
    console.error('[Backend] Error en deleteAsignacion:', error.message);
    res.status(500).json({ error: error.message });
  }
};
