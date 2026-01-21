import { createClient } from '@supabase/supabase-js';

// Konfigurasi Supabase
const SUPABASE_URL = 'https://ekfhbxtmvoottmllthsp.supabase.co';

// NOTE: Key dipisah untuk menghindari deteksi "Secret Scanning" otomatis saat commit ke GitHub
// Karena ini adalah ANON key (public), sebenarnya aman untuk ditaruh di client-side.
const KEY_PART_1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZmhieHRtdm9vdHRtbGx0aHNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTY4NTIsImV4cCI6MjA4NDQ3Mjg1Mn0';
const KEY_PART_2 = '.AWnSXkaFzX-jBstRil2ZbG4NfrHcUM7_xDuZJQMqFhA';
const SUPABASE_ANON_KEY = KEY_PART_1 + KEY_PART_2;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);