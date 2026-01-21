import { createClient } from '@supabase/supabase-js';

// Fallback values (Diambil dari .env Anda)
// Ini digunakan jika import.meta.env gagal dibaca oleh browser/preview
// sehingga aplikasi TIDAK AKAN layar putih/error.
const FALLBACK_URL = "https://ekfhbxtmvoottmllthsp.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZmhieHRtdm9vdHRtbGx0aHNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTY4NTIsImV4cCI6MjA4NDQ3Mjg1Mn0.AWnSXkaFzX-jBstRil2ZbG4NfrHcUM7_xDuZJQMqFhA";

let supabaseUrl = FALLBACK_URL;
let supabaseKey = FALLBACK_KEY;

try {
  // Coba akses Environment Variables dengan aman
  // Kita cek dulu apakah objek import.meta dan env ada
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    if (import.meta.env.VITE_SUPABASE_URL) {
       // @ts-ignore
       supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    }
    // @ts-ignore
    if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
       // @ts-ignore
       supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    }
  }
} catch (error) {
  console.warn("Gagal membaca env vars, menggunakan fallback otomatis.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);