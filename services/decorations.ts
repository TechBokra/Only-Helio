
import { supabase } from '../supabaseClient';
import { decorationCategoriesData as fileData } from '../data/decorationCategories';
import type { DecorationCategory } from '../types';

// Helper to map DB row to frontend type
const mapDbToCategory = (row: any): DecorationCategory => ({
    id: row.id,
    name: { en: row.name_en, ar: row.name_ar },
    description: { en: row.description_en, ar: row.description_ar }
});

export const getDecorationCategories = async (): Promise<DecorationCategory[]> => {
    if (!supabase) return fileData;

    try {
        const { data, error } = await supabase
            .from('DecorationCategory')
            .select('*')
            .order('createdAt', { ascending: true });

        if (error) {
            console.error('Error fetching categories:', error.message || error);
            return fileData;
        }
        return (data || []).map(mapDbToCategory);
    } catch (e) {
        console.error('Unexpected error in getDecorationCategories:', e);
        return fileData;
    }
};

export const addDecorationCategory = async (category: Omit<DecorationCategory, 'id'>): Promise<DecorationCategory> => {
    if (!supabase) throw new Error("Supabase not initialized");

    const dbPayload = {
        name_en: category.name.en,
        name_ar: category.name.ar,
        description_en: category.description.en,
        description_ar: category.description.ar
    };

    const { data, error } = await supabase.from('DecorationCategory').insert(dbPayload).select().single();
    if (error) throw error;
    return mapDbToCategory(data);
};

export const updateDecorationCategory = async (categoryId: string, updates: Partial<DecorationCategory>): Promise<DecorationCategory | undefined> => {
    if (!supabase) return undefined;

    const dbUpdates: any = {};
    if (updates.name) {
        dbUpdates.name_en = updates.name.en;
        dbUpdates.name_ar = updates.name.ar;
    }
    if (updates.description) {
        dbUpdates.description_en = updates.description.en;
        dbUpdates.description_ar = updates.description.ar;
    }

    const { data, error } = await supabase.from('DecorationCategory').update(dbUpdates).eq('id', categoryId).select().single();
    if (error) throw error;
    return mapDbToCategory(data);
};

export const deleteDecorationCategory = async (categoryId: string): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await supabase.from('DecorationCategory').delete().eq('id', categoryId);
    if (error) throw error;
    return true;
};
