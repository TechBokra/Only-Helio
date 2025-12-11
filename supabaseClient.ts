
import { createClient } from '@supabase/supabase-js';

// Configuration from environment or hardcoded fallback for immediate dev testing
const CONFIG = {
    url: 'https://xyyvgpchkznznwbxbgrp.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5eXZncGNoa3puem53YnhiZ3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTI1MDksImV4cCI6MjA4MTAyODUwOX0.1oRRd_bm3Ug9zXVR5Ae2xelGt0aN6uMP2rKpUu2AGVM'
};

// Helper to safely access environment variables
const getEnv = (key: string) => {
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
            // @ts-ignore
            return import.meta.env[key];
        }
    } catch (e) {
        // Fallback or ignore error
    }
    return '';
};

const envUrl = getEnv('VITE_SUPABASE_URL');
const envKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Prioritize Env vars, fallback to provided config
const supabaseUrl = envUrl || CONFIG.url;
const supabaseKey = envKey || CONFIG.key;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key is missing. The app will run in offline mode.');
}

export const supabase = (supabaseUrl && supabaseKey) 
    ? createClient(supabaseUrl, supabaseKey) 
    : null;
