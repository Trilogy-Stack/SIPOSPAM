import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('PERINGATAN: SUPABASE_URL atau SUPABASE_ANON_KEY belum diatur di file .env!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const BUCKET_FOTO = "foto-pospam";
export default supabase;