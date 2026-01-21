
import { supabase } from '../supabaseClient';
import type { RoutingRule } from '../data/routingRules';

// Helper to map DB row to frontend RoutingRule
const mapDbToRule = (row: any): RoutingRule => ({
    id: row.id,
    name: { 
        en: row.name_en || '', 
        ar: row.name_ar || '' 
    },
    active: row.active,
    conditions: typeof row.conditions === 'string' ? JSON.parse(row.conditions) : (row.conditions || []),
    action: typeof row.action === 'string' ? JSON.parse(row.action) : (row.action || { assignTo: '' })
});

export const getAllRoutingRules = async (): Promise<RoutingRule[]> => {
    const { data, error } = await supabase
        .from('RoutingRule')
        .select('*')
        .order('createdAt', { ascending: true });

    if (error) {
        console.error('Error fetching routing rules:', error);
        return [];
    }
    return data.map(mapDbToRule);
};

export const addRoutingRule = async (rule: Omit<RoutingRule, 'id'>): Promise<RoutingRule> => {
    const dbPayload = {
        name_en: rule.name.en,
        name_ar: rule.name.ar,
        active: rule.active,
        conditions: rule.conditions,
        action: rule.action,
        createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase.from('RoutingRule').insert(dbPayload).select().single();
    if (error) throw error;
    return mapDbToRule(data);
};

export const updateRoutingRule = async (id: string, updates: Partial<RoutingRule>): Promise<RoutingRule | null> => {
    const dbUpdates: any = {};
    if (updates.name) {
        if (updates.name.en !== undefined) dbUpdates.name_en = updates.name.en;
        if (updates.name.ar !== undefined) dbUpdates.name_ar = updates.name.ar;
    }
    if (updates.active !== undefined) dbUpdates.active = updates.active;
    if (updates.conditions !== undefined) dbUpdates.conditions = updates.conditions;
    if (updates.action !== undefined) dbUpdates.action = updates.action;

    const { data, error } = await supabase.from('RoutingRule').update(dbUpdates).eq('id', id).select().single();
    if (error) {
        console.error('Error updating routing rule:', error);
        return null;
    }
    return mapDbToRule(data);
};

export const deleteRoutingRule = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('RoutingRule').delete().eq('id', id);
    if (error) {
        console.error('Error deleting routing rule:', error);
        return false;
    }
    return true;
};

export const reorderRoutingRules = async (id: string, direction: 'up' | 'down'): Promise<RoutingRule[]> => {
    // In a real implementation with 'order' column, we would update DB indices here.
    // For now, we return reordered list locally or fetch fresh.
    const rules = await getAllRoutingRules();
    // Reordering logic can be implemented if DB has an 'orderIndex' column.
    return rules;
};
