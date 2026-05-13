import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const TABLE = 'potholes';

export async function insertPothole(data) {
  const { data: row, error } = await supabaseAdmin
    .from(TABLE)
    .insert(data)
    .select()
    .single();

  if (error) throw Object.assign(new Error(error.message), { code: 'DB_INSERT_ERROR' });
  return row;
}

export async function findAll({ limit = 100, offset = 0, severity, status, bbox } = {}) {
  let query = supabaseAdmin.from(TABLE).select('*').order('created_at', { ascending: false });

  if (severity) query = query.eq('severity', severity);
  if (status)   query = query.eq('status', status);
  if (bbox) {
    // bbox = { minLat, maxLat, minLon, maxLon }
    query = query
      .gte('latitude', bbox.minLat)
      .lte('latitude', bbox.maxLat)
      .gte('longitude', bbox.minLon)
      .lte('longitude', bbox.maxLon);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw Object.assign(new Error(error.message), { code: 'DB_QUERY_ERROR' });
  return { rows: data, count };
}

export async function findById(id) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw Object.assign(new Error(error.message), { code: 'DB_QUERY_ERROR' });
  return data;
}

export async function updateStatus(id, status) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw Object.assign(new Error(error.message), { code: 'DB_UPDATE_ERROR' });
  return data;
}

export async function deleteById(id) {
  // .select() after .delete() returns the deleted rows — lets us verify something was actually removed
  const { data, error } = await supabaseAdmin.from(TABLE).delete().eq('id', id).select();
  if (error) throw Object.assign(new Error(error.message), { code: 'DB_DELETE_ERROR' });
  if (!data || data.length === 0) throw Object.assign(new Error(`No row found with id=${id}`), { code: 'NOT_FOUND' });
}

export async function getStats() {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('severity, status');

  if (error) throw Object.assign(new Error(error.message), { code: 'DB_QUERY_ERROR' });

  const stats = {
    total: data.length,
    bySeverity: { low: 0, medium: 0, severe: 0 },
    byStatus: { pending: 0, verified: 0, resolved: 0 },
  };

  for (const row of data) {
    if (stats.bySeverity[row.severity] !== undefined) stats.bySeverity[row.severity]++;
    if (stats.byStatus[row.status] !== undefined) stats.byStatus[row.status]++;
  }

  return stats;
}
