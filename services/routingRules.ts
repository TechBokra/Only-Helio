
import { supabase } from '../supabaseClient';
import { routingRulesData as initialData } from '../data/routingRules';
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
    const newId = `rule-${Date.now()}`;
    const dbPayload = {
        id: newId,
        name_en: rule.name.en,
        name_ar: rule.name.ar,
        active: rule.active,
        // Pass objects directly for JSONB
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
    // Pass objects directly for JSONB
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
    const rules = await getAllRoutingRules();
    const index = rules.findIndex(r => r.id === id);
    if (index < 0) return rules;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < rules.length) {
        const item = rules[index];
        rules.splice(index, 1);
        rules.splice(newIndex, 0, item);
        
        // Note: Actual DB reordering would require an 'orderIndex' column updates here.
        // For MVP, we modify in-memory return but data won't persist order without that column.
    }
    return rules;
};
