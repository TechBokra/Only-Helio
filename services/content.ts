
import { supabase } from '../lib/supabase';
import { siteContentData as initialContentData } from '../data/content';
import type { SiteContent } from '../types';

// Create a mutable, in-memory copy of the data to simulate a database (Fallback)
let siteContentData: SiteContent = JSON.parse(JSON.stringify(initialContentData));

// Helper to check if item is a plain object
function isObject(item: any) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

// Robust deep merge function
function mergeDeep(target: any, source: any) {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = mergeDeep(target[key], source[key]);
      } else {
        // Only override if source value is not null/undefined/empty, or if we want to allow overwriting
        // For config objects, we usually prefer the DB value if it exists
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

export const getContent = async (): Promise<SiteContent> => {
    // 1. Try to fetch from Supabase
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('site_content')
                .select('content')
                .eq('id', 'main_content') // Ensure we get the specific row
                .maybeSingle();

            if (error) {
                console.warn("⚠️ Supabase content fetch issue:", error.message);
            } else if (data && data.content) {
                // Merge DB content with default content to ensure all keys exist.
                // initialContentData provides the structure (schema).
                // data.content provides the saved values.
                // We merge DB values ON TOP of defaults to preserve structure.
                return mergeDeep(initialContentData, data.content) as SiteContent;
            }
        } catch (err) {
            console.error("⚠️ Unexpected error fetching content:", err);
        }
    }

    // 2. Fallback to local file data if DB fails, is empty, or table missing
    console.log("⚠️ Using local fallback content");
    return JSON.parse(JSON.stringify(siteContentData));
};

export const updateContent = async (updates: Partial<SiteContent>): Promise<SiteContent> => {
    // Update local state immediately (Optimistic UI)
    siteContentData = { ...siteContentData, ...updates };

    // Try to sync with Supabase
    if (supabase) {
        try {
            // Fetch current content first to ensure we don't overwrite other fields if we are only updating a partial
            const current = await getContent();
            const newContent = { ...current, ...updates };
            
            const { error } = await supabase
                .from('site_content')
                .upsert({ 
                    id: 'main_content', 
                    content: newContent,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.warn("Failed to sync content to DB:", error.message);
            } else {
                return newContent;
            }
        } catch (err) {
            console.error("Failed to sync content to DB:", err);
        }
    }

    return JSON.parse(JSON.stringify(siteContentData));
};
