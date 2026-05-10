import { supabase } from '../repositories/supabase.client.js';

export const getAuditLogs = async (req, res) => {
  try {
    let query = supabase
      .from('audit_log')
      .select('*, usuarios(nombre_completo)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (req.query.usuario_id) {
      query = query.eq('usuario_id', req.query.usuario_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
