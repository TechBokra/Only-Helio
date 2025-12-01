
import { createClient } from '@supabase/supabase-js';

// Safely access environment variables
const env = (import.meta as any).env || {};

// Priority: Environment Variables -> Hardcoded Real Credentials (for Dev/Preview)
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://zpcpyxmnqffcmehpfkjl.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwY3B5eG1ucWZmY21laHBma2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NjQyODksImV4cCI6MjA4MDE0MDI4OX0.HMa2X03op-grt2TM8-omgubclObxkm4NIPehL6XZ4KI';

if (!env.VITE_SUPABASE_URL) {
    console.log('⚠️ Using Hardcoded Supabase Credentials (Dev Mode)');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
