import { createClient } from '@supabase/supabase-js';

// Mengambil konfigurasi dari Environment Variables
// Saat di local, dia ambil dari file .env
// Saat di Vercel, dia ambil dari settingan Project Settings
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL dan Anon Key belum disetting di file .env atau Environment Variables Vercel.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);