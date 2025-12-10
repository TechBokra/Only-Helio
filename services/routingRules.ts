
import { supabase } from '../lib/supabase';
import type { RoutingRule } from '../data/routingRules';

const mapRuleFromDB = (row: any): RoutingRule => ({
    id: row.id,
    name: { ar: row.name_ar, en: row.name_en },
    active: row.active,
    conditions: row.conditions,
    action: row.action,
});

export const getAllRoutingRules = async (): Promise<RoutingRule[]> => {
    if (supabase) {
        const { data, error } = await supabase
            .from('routing_rules')
            .select('*')
            .order('priority', { ascending: true });
            
        if (!error && data) {
            return data.map(mapRuleFromDB);
        }
    }
    return [];
};

export const addRoutingRule = async (rule: Omit<RoutingRule, 'id'>): Promise<RoutingRule> => {
    if (!supabase) throw new Error("DB Connection required");

    const { data, error } = await supabase.from('routing_rules').insert([{
        name_en: rule.name.en,
        name_ar: rule.name.ar,
        active: rule.active,
        conditions: rule.conditions,
        action: rule.action,
        priority: 99 // Default to end
    }]).select().single();
    
    if (error) throw error;
    return mapRuleFromDB(data);
};

export const updateRoutingRule = async (id: string, updates: Partial<RoutingRule>): Promise<RoutingRule | null> => {
    if (supabase) {
        const dbUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.name) {
            if(updates.name.en) dbUpdates.name_en = updates.name.en;
            if(updates.name.ar) dbUpdates.name_ar = updates.name.ar;
        }
        if (updates.active !== undefined) dbUpdates.active = updates.active;
        if (updates.conditions) dbUpdates.conditions = updates.conditions;
        if (updates.action) dbUpdates.action = updates.action;

        const { data, error } = await supabase
            .from('routing_rules')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (!error && data) return mapRuleFromDB(data);
    }
    return null;
};

export const deleteRoutingRule = async (id: string): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase.from('routing_rules').delete().eq('id', id);
        return !error;
    }
    return false;
};

export const reorderRoutingRules = async (id: string, direction: 'up' | 'down'): Promise<RoutingRule[]> => {
    if (supabase) {
        // Fetch all, reorder in JS, and batch update priority.
        const allRules = await getAllRoutingRules();
        const index = allRules.findIndex(r => r.id === id);
        if (index === -1) return allRules;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < allRules.length) {
            const item = allRules[index];
            allRules.splice(index, 1);
            allRules.splice(newIndex, 0, item);
            
            const updates = allRules.map((r, idx) => ({ id: r.id, priority: idx + 1 }));
            await supabase.from('routing_rules').upsert(updates);
            
            return allRules;
        }
        return allRules;
    }
    return [];
};
