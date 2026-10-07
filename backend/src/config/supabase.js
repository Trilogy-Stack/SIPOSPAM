import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  console.error('PERINGATAN: SUPABASE_URL, SUPABASE_ANON_KEY, atau SUPABASE_SERVICE_ROLE_KEY belum diatur di file .env!');
}

// Client reguler (menghormati RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client admin (bypass RLS & akses Supabase Auth Admin API)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export const BUCKET_FOTO = "foto-pospam";
export default supabase;