import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

function makeClient(key) {
  if (!env.supabase.url || !key) {
    return null; // will fail at runtime with a clear error when first used
  }
  return createClient(env.supabase.url, key);
}

// Service client — used for server-side operations (bypasses RLS)
export const supabaseAdmin = makeClient(env.supabase.serviceKey);

// Anon client — used for public read operations
export const supabase = makeClient(env.supabase.anonKey);
