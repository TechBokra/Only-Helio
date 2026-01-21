
import { supabase } from '../supabaseClient';
import type { DecorationCategory } from '../types';

// Helper to map DB row to frontend type
const mapDbToCategory = (row: any): DecorationCategory => ({
    id: row.id,
    name: { 
        ar: row.name_ar, 
        en: row.name_en 
    },
    description: { 
        ar: row.description_ar, 
        en: row.description_en 
    }
});

export const getDecorationCategories = async (): Promise<DecorationCategory[]> => {
    const { data, error } = await supabase
        .from('DecorationCategory')
        .select('*');

    if (error) {
        console.error("Error fetching decoration categories:", error);
        return [];
    }
    return data.map(mapDbToCategory);
};

export const addDecorationCategory = async (category: Omit<DecorationCategory, 'id'>): Promise<DecorationCategory> => {
    const dbPayload = {
        name_ar: category.name.ar,
        name_en: category.name.en,
        description_ar: category.description.ar,
        description_en: category.description.en,
    };

    const { data, error } = await supabase
        .from('DecorationCategory')
        .insert(dbPayload)
        .select()
        .single();

    if (error) throw error;
    return mapDbToCategory(data);
};

export const updateDecorationCategory = async (categoryId: string, updates: Partial<DecorationCategory>): Promise<DecorationCategory | undefined> => {
    const dbUpdates: any = {};
    
    if (updates.name) {
        if (updates.name.ar) dbUpdates.name_ar = updates.name.ar;
        if (updates.name.en) dbUpdates.name_en = updates.name.en;
    }
    
    if (updates.description) {
        if (updates.description.ar) dbUpdates.description_ar = updates.description.ar;
        if (updates.description.en) dbUpdates.description_en = updates.description.en;
    }

    const { data, error } = await supabase
        .from('DecorationCategory')
        .update(dbUpdates)
        .eq('id', categoryId)
        .select()
        .single();

    if (error) {
        console.error("Error updating category:", error);
        return undefined;
    }
    return mapDbToCategory(data);
};

export const deleteDecorationCategory = async (categoryId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('DecorationCategory')
        .delete()
        .eq('id', categoryId);

    if (error) {
        console.error("Error deleting category:", error);
        return false;
    }
    return true;
};
