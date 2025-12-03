import { supabase } from '../lib/supabase';
import { propertyTypesData as initialPropertyTypes, finishingStatusesData as initialFinishingStatuses } from '../data/filterOptions';
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
        return initialData;
    }
};

// Getters
export const getAllPropertyTypes = () => fetchOptions('property_types', initialPropertyTypes);
export const getAllFinishingStatuses = () => fetchOptions('finishing_statuses', initialFinishingStatuses);

// Stub for amenities to prevent import errors, returning empty typed array
// FIX: Explicitly return Promise<FilterOption[]> to prevent 'never[]' inference errors in hooks
export const getAllAmenities = async (): Promise<FilterOption[]> => [];

// Generic Mutator
const mutateOption = async (
    dataType: 'propertyType' | 'finishingStatus', // Removed amenity
    operation: 'add' | 'update' | 'delete',
    item?: FilterOption | Partial<FilterOption>,
    itemId?: string
) => {
    let tableName = '';
    switch (dataType) {
        case 'propertyType': tableName = 'property_types'; break;
        case 'finishingStatus': tableName = 'finishing_statuses'; break;
        default: return null;
    }

    if (!supabase) return item; 

    try {
        if (operation === 'add' && item) {
            const payload: any = {
                id: item.id || `auto-${Date.now()}`, 
                name_en: item.en,
                name_ar: item.ar,
            };

            // Only add applicable_to if it's finishingStatus, as property_types table doesn't have this column
            if (dataType === 'finishingStatus' && item.applicableTo) {
                payload.applicable_to = item.applicableTo;
            }

            const { data, error } = await supabase.from(tableName).insert([payload]).select().single();
            if (error) throw error;
            return mapFilterOption(data);
        }
        
        if (operation === 'update' && item && item.id) {
            const payload: any = {};
            if (item.en) payload.name_en = item.en;
            if (item.ar) payload.name_ar = item.ar;
            
            // Only add applicable_to if it's finishingStatus
            if (dataType === 'finishingStatus' && item.applicableTo) {
                payload.applicable_to = item.applicableTo;
            }

            const { data, error } = await supabase.from(tableName).update(payload).eq('id', item.id).select().maybeSingle();
            if (error) throw error;
            return data ? mapFilterOption(data) : null;
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

export const addFilterOption = (dataType: 'propertyType' | 'finishingStatus', item: Omit<FilterOption, 'id'>) => mutateOption(dataType, 'add', item);
export const updateFilterOption = (dataType: 'propertyType' | 'finishingStatus', item: FilterOption) => mutateOption(dataType, 'update', item);
export const deleteFilterOption = (dataType: 'propertyType' | 'finishingStatus', itemId: string) => mutateOption(dataType, 'delete', undefined, itemId);