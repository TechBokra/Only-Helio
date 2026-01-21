
import { supabase } from '../supabaseClient';
import type { FilterOption } from '../types';

// Helper to map DB rows to FilterOption type
const mapRowToOption = (row: any): FilterOption => ({
    id: row.id,
    en: row.name_en,
    ar: row.name_ar,
    // Some tables might have 'applicableTo' stored as an array or jsonb if you added it, 
    // otherwise default to undefined or parse if exists.
    applicableTo: row.applicableTo || undefined 
});

// --- READ OPERATIONS ---

export const getAllPropertyTypes = async (): Promise<FilterOption[]> => {
    const { data, error } = await supabase
        .from('PropertyType')
        .select('*')
        .order('name_en');

    if (error) {
        console.error('Error fetching PropertyTypes:', error);
        return [];
    }
    return data.map(mapRowToOption);
};

export const getAllFinishingStatuses = async (): Promise<FilterOption[]> => {
    const { data, error } = await supabase
        .from('FinishingStatus')
        .select('*')
        .order('name_en');

    if (error) {
        console.error('Error fetching FinishingStatus:', error);
        return [];
    }
    return data.map(mapRowToOption);
};

export const getAllAmenities = async (): Promise<FilterOption[]> => {
    const { data, error } = await supabase
        .from('Amenity')
        .select('*')
        .order('name_en');

    if (error) {
        console.error('Error fetching Amenities:', error);
        return [];
    }
    return data.map(mapRowToOption);
};

// --- WRITE OPERATIONS (Admin Dashboard) ---

export const addFilterOption = async (
    dataType: 'propertyType' | 'finishingStatus' | 'amenity', 
    item: Omit<FilterOption, 'id'>
): Promise<FilterOption> => {
    
    let tableName = '';
    switch (dataType) {
        case 'propertyType': tableName = 'PropertyType'; break;
        case 'finishingStatus': tableName = 'FinishingStatus'; break;
        case 'amenity': tableName = 'Amenity'; break;
    }

    const newId = crypto.randomUUID();
    const payload = {
        id: newId,
        name_en: item.en,
        name_ar: item.ar,
        // Only include applicableTo if the table supports it (based on your schema check)
        // Assuming you might add this column later or use JSONB, keeping simple for now
        // applicableTo: item.applicableTo 
    };

    const { data, error } = await supabase.from(tableName).insert(payload).select().single();
    
    if (error) throw error;
    return mapRowToOption(data);
};

export const updateFilterOption = async (
    dataType: 'propertyType' | 'finishingStatus' | 'amenity', 
    item: FilterOption
): Promise<FilterOption | null> => {
    
    let tableName = '';
    switch (dataType) {
        case 'propertyType': tableName = 'PropertyType'; break;
        case 'finishingStatus': tableName = 'FinishingStatus'; break;
        case 'amenity': tableName = 'Amenity'; break;
    }

    const updates = {
        name_en: item.en,
        name_ar: item.ar,
        // applicableTo: item.applicableTo
    };

    const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', item.id)
        .select()
        .single();

    if (error) {
        console.error(`Error updating ${dataType}:`, error);
        return null;
    }
    return mapRowToOption(data);
};

export const deleteFilterOption = async (
    dataType: 'propertyType' | 'finishingStatus' | 'amenity', 
    itemId: string
): Promise<boolean> => {
    
    let tableName = '';
    switch (dataType) {
        case 'propertyType': tableName = 'PropertyType'; break;
        case 'finishingStatus': tableName = 'FinishingStatus'; break;
        case 'amenity': tableName = 'Amenity'; break;
    }

    const { error } = await supabase.from(tableName).delete().eq('id', itemId);
    
    if (error) {
        console.error(`Error deleting from ${tableName}:`, error);
        return false;
    }
    return true;
};
