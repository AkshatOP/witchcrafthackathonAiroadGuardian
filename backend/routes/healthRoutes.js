import { Router } from 'express';
import { successResponse } from '../utils/response.js';
import { supabase } from '../config/supabase.js';
import { env } from '../config/env.js';

const router = Router();

router.get('/', async (req, res) => {
  let dbStatus = 'unknown';
  let dbError = null;
  try {
    if (!supabase) throw new Error('Supabase client not initialized (missing env vars)');
    const { error } = await supabase.from('potholes').select('id').limit(1);
    dbStatus = error ? 'error' : 'ok';
    if (error) dbError = error.message;
  } catch (e) {
    dbStatus = 'error';
    dbError = e.message;
  }

  return successResponse(res, {
    status: 'ok',
    service: 'ai-road-guardian-backend',
    env: env.nodeEnv,
    database: dbStatus,
    ...(dbError && { database_error: dbError }),
    aiService: env.aiServiceUrl,
  });
});

export default router;
