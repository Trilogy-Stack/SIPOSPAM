import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// Gunakan Service Role Key agar backend memiliki akses penuh (bypass RLS)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('PERINGATAN: SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diatur di file .env!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const BUCKET_FOTO = "foto-pospam";
export default supabase;