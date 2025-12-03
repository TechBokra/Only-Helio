
import { createClient } from '@supabase/supabase-js';

// -------------------------------------------------------------------------
// CONFIGURATION
// -------------------------------------------------------------------------

// Priority: Environment Variables -> Hardcoded Fallback (For immediate functionality)
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://zpcpyxmnqffcmehpfkjl.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwY3B5eG1ucWZmY21laHBma2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NjQyODksImV4cCI6MjA4MDE0MDI4OX0.HMa2X03op-grt2TM8-omgubclObxkm4NIPehL6XZ4KI';

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
    console.warn('Supabase is not initialized. Please check your environment variables.');
} else {
    console.log('✅ Supabase connected successfully.');
}
