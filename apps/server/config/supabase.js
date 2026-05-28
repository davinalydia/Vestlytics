import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Memuat variabel lingkungan dari file .env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Menginisialisasi klien Supabase untuk interaksi dengan basis data
export const supabase = createClient(supabaseUrl, supabaseKey);
