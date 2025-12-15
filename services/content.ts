
import { supabase } from '../supabaseClient';
import { siteContentData as initialContentData } from '../data/content';
import type { SiteContent } from '../types';

// Fallback in-memory cache
let cachedContent: SiteContent = { ...initialContentData };

export const getContent = async (): Promise<SiteContent> => {
    if (!supabase) return cachedContent;

    try {
        const { data, error } = await supabase
            .from('SiteContent')
            .select('content')
            .eq('id', 1)
            .single();

        if (error || !data) {
            // If no content exists in DB, initialize it with default data
            if (error?.code === 'PGRST116' || !data) { // PGRST116 is JSON code for "no rows returned"
                console.log("Initializing DB with default site content...");
                await supabase.from('SiteContent').upsert({ id: 1, content: initialContentData });
                return initialContentData;
            }
            console.warn("Error fetching content, using fallback:", error);
            return cachedContent;
        }

        // Merge DB content with initial structure to ensure type safety if schema changes
        cachedContent = { ...initialContentData, ...data.content };
        return cachedContent;
    } catch (e) {
        console.error("Unexpected error fetching content:", e);
        return cachedContent;
    }
};

export const updateContent = async (updates: Partial<SiteContent>): Promise<SiteContent> => {
    // 1. Get current latest state
    const current = await getContent();
    
    // 2. Merge updates
    const newContent = { ...current, ...updates };

    if (!supabase) {
        cachedContent = newContent;
        return newContent;
    }

    // 3. Save to DB
    const { error } = await supabase
        .from('SiteContent')
        .upsert({ id: 1, content: newContent, updatedAt: new Date().toISOString() });

    if (error) {
        console.error("Failed to save content to DB:", error);
        throw error;
    }

    cachedContent = newContent;
    return newContent;
};
