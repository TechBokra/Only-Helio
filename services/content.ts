
import { supabase } from '../supabaseClient';
import { siteContentData as initialContentData } from '../data/content';
import type { SiteContent } from '../types';

const CONTENT_KEY = 'site_content_v1';

export const getContent = async (): Promise<SiteContent> => {
    try {
        // Try fetching from Supabase SystemSetting table
        const { data, error } = await supabase
            .from('SystemSetting')
            .select('value')
            .eq('key', CONTENT_KEY)
            .single();

        if (data && data.value) {
            // Parse JSONB value
            return typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        }
        
        // Fallback: If not in DB, try LocalStorage (migration path)
        const stored = localStorage.getItem('onlyhelio_mock_content');
        if (stored) return JSON.parse(stored);

    } catch (e) {
        console.error("Failed to load content from DB:", e);
    }
    
    // Default fallback
    return JSON.parse(JSON.stringify(initialContentData));
};

export const updateContent = async (updates: Partial<SiteContent>): Promise<SiteContent> => {
    // 1. Get current state to merge
    const currentContent = await getContent();
    const newContent = { ...currentContent, ...updates };

    try {
        // 2. Upsert into Supabase
        const { error } = await supabase
            .from('SystemSetting')
            .upsert({ 
                key: CONTENT_KEY, 
                value: JSON.stringify(newContent),
                group: 'cms' 
            }, { onConflict: 'key' });

        if (error) throw error;

        // 3. Update LocalStorage as backup/cache
        localStorage.setItem('onlyhelio_mock_content', JSON.stringify(newContent));

    } catch (e) {
        console.error("Failed to save content to DB:", e);
        throw e;
    }

    return newContent;
};
