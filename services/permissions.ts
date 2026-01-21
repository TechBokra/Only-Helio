
import { supabase } from '../supabaseClient';
import { Role, Permission } from '../types';
import { rolePermissions as defaultPermissions } from '../data/permissions';

const PERMISSIONS_KEY = 'role_permissions_config';

// Helper to serialize Map to JSON-friendly format (Array of entries)
const serializeMap = (map: Map<Role, Permission[]>) => {
    return Array.from(map.entries());
};

// Helper to deserialize JSON to Map
const deserializeMap = (entries: any[]): Map<Role, Permission[]> => {
    return new Map(entries as [Role, Permission[]][]);
};

export const getRolePermissions = async (): Promise<Map<Role, Permission[]>> => {
    try {
        const { data, error } = await supabase
            .from('SystemSetting')
            .select('value')
            .eq('key', PERMISSIONS_KEY)
            .single();

        if (data && data.value) {
            // Determine if value is string (needs parsing) or object (already parsed by Supabase client)
            const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            return deserializeMap(parsed);
        }
    } catch (error) {
        console.error("Error fetching permissions from DB, falling back to default.", error);
    }
    
    // Fallback to static data if DB is empty or error
    return new Map(defaultPermissions);
};

export const updateRolePermissions = async (updatedPermissions: Map<Role, Permission[]>): Promise<boolean> => {
    const value = serializeMap(updatedPermissions);
    
    const { error } = await supabase
        .from('SystemSetting')
        .upsert({ 
            key: PERMISSIONS_KEY, 
            value: JSON.stringify(value), // Ensure it's stored as JSON string
            group: 'system' 
        }, { onConflict: 'key' });

    if (error) {
        console.error("Error saving permissions:", error);
        return false;
    }
    return true;
};
