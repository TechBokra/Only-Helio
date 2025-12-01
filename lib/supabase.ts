
import { createClient } from '@supabase/supabase-js';

// Safely access environment variables
const env = (import.meta as any).env || {};

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase Environment Variables. Please check your .env file or Vercel settings.');
}

// Use fallback values to prevent app crash on load if keys are missing.
// This allows the UI to render even if the DB connection is not yet configured.
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseAnonKey || 'placeholder-key'
);
