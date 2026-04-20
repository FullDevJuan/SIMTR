import { supabase } from '../repositories/supabase.client.js';

/**
 * Función útil para insertar registros de auditoría de manera programática.
 */
export const logAudit = async ({ tabla_afectada, operacion, registro_id, valor_anterior = null, valor_nuevo = null, usuario_id, ip_origen = null }) => {
  try {
    const { error } = await supabase.from('audit_log').insert([{
      tabla_afectada,
      operacion,
      registro_id,
      valor_anterior, // Puede que enviemos null para simplificar
      valor_nuevo,    // Puede que enviemos null para simplificar
      usuario_id,
      ip_origen
    }]);
    
    if (error) {
      console.error(`[Auditoría] Error registrando operación ${operacion} en tabla ${tabla_afectada}:`, error.message);
    }
  } catch (err) {
    console.error('[Auditoría] Error inesperado en el log', err);
  }
};
