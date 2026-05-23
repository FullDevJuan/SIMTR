import { supabase } from '../repositories/supabase.client.js';
import { logAudit } from '../utils/audit.logger.js';

export const getEntregasAyuda = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('entregas_ayuda')
      .select('*, damnificados(nombres, apellidos, numero_documento), tipos_ayuda(nombre, unidad_medida)')
      .order('fecha_entrega', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEntregaAyudaById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('entregas_ayuda')
      .select('*, damnificados(*), tipos_ayuda(*), usuarios!registrado_por(nombre_completo)')
      .eq('id', id)
      .single();
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
      .insert([{ 
        damnificado_id, 
        tipo_ayuda_id, 
        cantidad, 
        descripcion_detalle, 
        fecha_entrega: fecha_entrega || new Date(), 
        fuente_recurso, 
        observaciones, 
        estado, 
        motivo_anulacion, 
        registrado_por 
      }])
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

export const updateEntregaAyuda = async (req, res) => {
  const { id } = req.params;
  const { 
    damnificado_id, 
    tipo_ayuda_id, 
    cantidad, 
    descripcion_detalle, 
    fecha_entrega, 
    fuente_recurso, 
    observaciones, 
    estado, 
    motivo_anulacion 
  } = req.body;
  
  // Build a sanitized updates object containing only allowed table columns
  const updates = {};
  if (damnificado_id !== undefined) updates.damnificado_id = damnificado_id;
  if (tipo_ayuda_id !== undefined) updates.tipo_ayuda_id = tipo_ayuda_id;
  if (cantidad !== undefined) updates.cantidad = cantidad;
  if (descripcion_detalle !== undefined) updates.descripcion_detalle = descripcion_detalle;
  if (fecha_entrega !== undefined) updates.fecha_entrega = fecha_entrega;
  if (fuente_recurso !== undefined) updates.fuente_recurso = fuente_recurso;
  if (observaciones !== undefined) updates.observaciones = observaciones;
  if (estado !== undefined) updates.estado = estado;
  if (motivo_anulacion !== undefined) updates.motivo_anulacion = motivo_anulacion;
  
  try {
    const { data, error } = await supabase
      .from('entregas_ayuda')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;

    await logAudit({
      tabla_afectada: 'entregas_ayuda', 
      operacion: 'UPDATE', 
      registro_id: id, 
      usuario_id: req.user?.id,
      ip_origen: req.ip
    });

    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteEntregaAyuda = async (req, res) => {
  const { id } = req.params;
  const { motivo_anulacion } = req.body;

  try {
    const { data, error } = await supabase
      .from('entregas_ayuda')
      .update({ estado: 'anulada', motivo_anulacion })
      .eq('id', id)
      .select();
    if (error) throw error;

    await logAudit({
      tabla_afectada: 'entregas_ayuda', 
      operacion: 'DELETE', 
      registro_id: id, 
      usuario_id: req.user?.id,
      ip_origen: req.ip,
      detalles: `Anulación: ${motivo_anulacion}`
    });

    res.json({ message: 'Entrega anulada correctamente', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
