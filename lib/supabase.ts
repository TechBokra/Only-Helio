
import { createClient } from '@supabase/supabase-js';

// -------------------------------------------------------------------------
// CONFIGURATION
// -------------------------------------------------------------------------

// We check environment variables first, but fall back to the provided instance
// to ensure the application connects to the live database immediately for the demo/production.
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || "https://eytbyxqtkeutonlkadbl.supabase.co";
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5dGJ5eHF0a2V1dG9ubGthZGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzOTY1ODMsImV4cCI6MjA4MDk3MjU4M30.FmWNGJP_yEeIJpWKLoP7_07rFo5S5hv4A4yD7DOnF00";

// Initialize the Supabase client
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        }
      })
    : null;

if (!supabase) {
    console.error('🔴 Supabase is not initialized. Please check your configuration.');
} else {
    console.log('✅ Supabase client initialized.');
}
