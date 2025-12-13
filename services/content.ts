
import { supabase } from '../supabaseClient';
import { siteContentData as defaultStructure } from '../data/content';
import type { SiteContent } from '../types';

const DB_KEY = 'global_site_content';

// NOTE: You must create a table named 'SystemSetting' in Supabase with columns: key (text, primary), value (jsonb)
export const getContent = async (): Promise<SiteContent> => {
    if (!supabase) {
        throw new Error("Critical: Supabase client is not initialized. Check environment variables.");
    }

    const { data, error } = await supabase
        .from('SystemSetting')
        .select('value')
        .eq('key', DB_KEY)
        .single();

    if (error) {
        // If the error is "Row not found", we return the default structure so the site loads,
        // BUT we do not fallback to local storage. We just render defaults until saved.
        if (error.code === 'PGRST116') {
            console.warn("Content not found in DB, using default structure. Please save settings to initialize DB.");
            return defaultStructure;
        }
        // If it's a connection error or table missing error, WE THROW IT.
        console.error("Database Error (Content):", error.message);
        throw new Error(`Failed to load site content from DB: ${error.message}`);
    }

    if (data && data.value) {
        // Merge with defaults to ensure new fields added to code exist in data
        return { ...defaultStructure, ...data.value };
    }

    return defaultStructure;
};

export const updateContent = async (updates: Partial<SiteContent>): Promise<SiteContent> => {
    if (!supabase) throw new Error("Supabase not connected");

    // 1. Get current latest from DB to ensure we don't overwrite with stale data
    const current = await getContent();
    const newContent = { ...current, ...updates };

    // 2. Save to DB
    const { error } = await supabase
        .from('SystemSetting')
        .upsert({ key: DB_KEY, value: newContent }, { onConflict: 'key' });
        
    if (error) {
        console.error("Database Save Error:", error);
        throw new Error(`Failed to save content to DB: ${error.message}`);
    }

    return newContent;
};
