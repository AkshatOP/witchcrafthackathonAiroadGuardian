import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dwbjkdasvfcrfvjvyhqb.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3YmprZGFzdmZjcmZ2anZ5aHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzM1MjQsImV4cCI6MjA5Mzc0OTUyNH0.kBJ_ubPMfouL9BIHnKZrfjlwzZofLhlfPfYowSr_HFk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
