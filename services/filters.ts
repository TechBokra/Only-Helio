
import { supabase } from '../lib/supabase';
import { propertyTypesData as initialPropertyTypes, finishingStatusesData as initialFinishingStatuses, amenitiesData as initialAmenities } from '../data/filterOptions';
import type { FilterOption } from '../types';

// Map DB row to FilterOption
const mapFilterOption = (row: any): FilterOption => ({
    id: row.id,
    en: row.name_en,
    ar: row.name_ar,
    applicableTo: row.applicable_to || undefined,
});

// Generic Fetcher
const fetchOptions = async (table: string, initialData: FilterOption[]): Promise<FilterOption[]> => {
    if (!supabase) return initialData;
    
    try {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
            console.warn(`Supabase: Error fetching ${table}, falling back to local data.`);
            return initialData;
        }
        return data && data.length > 0 ? data.map(mapFilterOption) : initialData;
    } catch (e) {
        console.error(`Critical error fetching ${table}:`, e);
        return initialData;
    }
};

// Getters
export const getAllPropertyTypes = () => fetchOptions('property_types', initialPropertyTypes);
export const getAllFinishingStatuses = () => fetchOptions('finishing_statuses', initialFinishingStatuses);
export const getAllAmenities = () => fetchOptions('amenities', initialAmenities);

// Generic Mutator
const mutateOption = async (
    dataType: 'propertyType' | 'finishingStatus' | 'amenity',
    operation: 'add' | 'update' | 'delete',
    item?: FilterOption | Partial<FilterOption>,
    itemId?: string
) => {
    let tableName = '';
    switch (dataType) {
        case 'propertyType': tableName = 'property_types'; break;
        case 'finishingStatus': tableName = 'finishing_statuses'; break;
        case 'amenity': tableName = 'amenities'; break;
    }

    if (!supabase) {
        console.warn("Supabase not configured. Changes will not persist.");
        return operation === 'delete' ? true : item; // Mock success
    }

    try {
        if (operation === 'add' && item) {
            const payload = {
                name_en: item.en,
                name_ar: item.ar,
                applicable_to: item.applicableTo
            };
            const { data, error } = await supabase.from(tableName).insert([payload]).select().single();
            if (error) throw error;
            return mapFilterOption(data);
        }
        
        if (operation === 'update' && item && item.id) {
            const payload: any = {};
            if (item.en) payload.name_en = item.en;
            if (item.ar) payload.name_ar = item.ar;
            if (item.applicableTo) payload.applicable_to = item.applicableTo;

            // Changed .single() to .maybeSingle() to avoid PGRST116 error if row doesn't exist
            const { data, error } = await supabase.from(tableName).update(payload).eq('id', item.id).select().maybeSingle();
            
            if (error) throw error;
            if (!data) {
                console.warn(`Item with ID ${item.id} not found in ${tableName} for update.`);
                return null; 
            }
            return mapFilterOption(data);
        }

        if (operation === 'delete' && itemId) {
            const { error } = await supabase.from(tableName).delete().eq('id', itemId);
            if (error) throw error;
            return true;
        }
    } catch (e) {
        console.error(`Error performing ${operation} on ${tableName}:`, e);
        throw e;
    }
    return null;
};

export const addFilterOption = (dataType: 'propertyType' | 'finishingStatus' | 'amenity', item: Omit<FilterOption, 'id'>): Promise<FilterOption> => {
    return mutateOption(dataType, 'add', item) as Promise<FilterOption>;
};
export const updateFilterOption = (dataType: 'propertyType' | 'finishingStatus' | 'amenity', item: FilterOption): Promise<FilterOption | null> => {
    return mutateOption(dataType, 'update', item) as Promise<FilterOption | null>;
};
export const deleteFilterOption = (dataType: 'propertyType' | 'finishingStatus' | 'amenity', itemId: string): Promise<boolean> => {
    return mutateOption(dataType, 'delete', undefined, itemId) as Promise<boolean>;
};
