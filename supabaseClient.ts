
import { createClient } from '@supabase/supabase-js';

// Configuration based on provided credentials
const CONFIG = {
    url: 'https://xyyvgpchkznznwbxbgrp.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5eXZncGNoa3puem53YnhiZ3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTI1MDksImV4cCI6MjA4MTAyODUwOX0.1oRRd_bm3Ug9zXVR5Ae2xelGt0aN6uMP2rKpUu2AGVM'
};

// Helper to safely access environment variables (priority given to .env if exists, fallback to config)
const getEnv = (key: string) => {
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
            // @ts-ignore
            return import.meta.env[key];
        }
    } catch (e) {
        // Fallback
    }
    return '';
};

const envUrl = getEnv('VITE_SUPABASE_URL');
const envKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Prioritize Env vars, fallback to hardcoded config for immediate usage
const supabaseUrl = envUrl || CONFIG.url;
const supabaseKey = envKey || CONFIG.key;

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: Supabase URL or Key is missing. Database features will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
