import { supabase } from '../lib/supabase';
import { propertyTypesData as initialPropertyTypes, finishingStatusesData as initialFinishingStatuses, amenitiesData as initialAmenitiesData } from '../data/filterOptions';
import type { FilterOption } from '../types';

// Maintain local state for fallback/mock mode
let localPropertyTypes = [...initialPropertyTypes];
let localFinishingStatuses = [...initialFinishingStatuses];
let localAmenities = [...initialAmenitiesData];

// Map DB row to FilterOption
const mapFilterOption = (row: any): FilterOption => ({
    id: row.id,
    en: row.name_en,
    ar: row.name_ar,
    applicableTo: row.applicable_to || undefined,
});

// Generic Fetcher
const fetchOptions = async (table: string, localData: FilterOption[]): Promise<FilterOption[]> => {
    if (!supabase) return localData;
    try {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
            console.warn(`Supabase: Error fetching ${table}, falling back to local data.`, error.message);
            return localData;
        }
        // Update local cache with fresh DB data
        const mappedData = data.map(mapFilterOption);
        
        if (table === 'property_types') localPropertyTypes = mappedData;
        if (table === 'finishing_statuses') localFinishingStatuses = mappedData;
        if (table === 'amenities') localAmenities = mappedData;
        
        return mappedData;
    } catch (e) {
        return localData;
    }
};

// Getters
export const getAllPropertyTypes = () => fetchOptions('property_types', localPropertyTypes);
export const getAllFinishingStatuses = () => fetchOptions('finishing_statuses', localFinishingStatuses);
export const getAllAmenities = () => fetchOptions('amenities', localAmenities);

// Generic Mutator
const mutateOption = async (
    dataType: 'propertyType' | 'finishingStatus', 
    operation: 'add' | 'update' | 'delete',
    item?: FilterOption | Partial<FilterOption>,
    itemId?: string
) => {
    let tableName = '';
    let localList = dataType === 'propertyType' ? localPropertyTypes : localFinishingStatuses;
    
    switch (dataType) {
        case 'propertyType': tableName = 'property_types'; break;
        case 'finishingStatus': tableName = 'finishing_statuses'; break;
        default: return null;
    }

    // --- 1. Perform Local Mutation (Optimistic Update / Fallback) ---
    let resultItem: FilterOption | null = null;

    if (operation === 'add' && item) {
        const newItem = { ...item, id: item.id || `auto-${Date.now()}` } as FilterOption;
        localList.push(newItem);
        resultItem = newItem;
    } 
    else if (operation === 'update' && item && item.id) {
        const index = localList.findIndex(i => i.id === item.id);
        if (index !== -1) {
            localList[index] = { ...localList[index], ...item } as FilterOption;
            resultItem = localList[index];
        }
    } 
    else if (operation === 'delete' && itemId) {
        const index = localList.findIndex(i => i.id === itemId);
        if (index !== -1) {
            localList.splice(index, 1);
            resultItem = null; // Deleted
        }
    }

    // Sync back to module-level variables
    if (dataType === 'propertyType') localPropertyTypes = localList;
    else localFinishingStatuses = localList;

    // --- 2. Attempt Supabase Mutation ---
    if (!supabase) return resultItem; 

    try {
        if (operation === 'add' && item) {
            const payload: any = {
                id: resultItem?.id, // Use the ID generated locally if needed
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
    } catch (e: any) {
        // If RLS policy fails (42501), we log it but return the local result so the app doesn't crash for the user.
        if (e?.code === '42501') {
            console.warn("Supabase RLS Policy Blocked Action. Falling back to local mock mode.");
            return resultItem || true; 
        }
        console.error(`Error performing ${operation} on ${tableName}:`, e);
        // We intentionally return the local result to keep the UI working in dev mode
        return resultItem || true;
    }
    return resultItem;
};

export const addFilterOption = (dataType: 'propertyType' | 'finishingStatus', item: Omit<FilterOption, 'id'>) => mutateOption(dataType, 'add', item);
export const updateFilterOption = (dataType: 'propertyType' | 'finishingStatus', item: FilterOption) => mutateOption(dataType, 'update', item);
export const deleteFilterOption = (dataType: 'propertyType' | 'finishingStatus', itemId: string) => mutateOption(dataType, 'delete', undefined, itemId);