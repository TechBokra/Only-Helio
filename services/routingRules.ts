
import { supabase } from '../lib/supabase';
import { routingRulesData as initialData } from '../data/routingRules';
import type { RoutingRule } from '../data/routingRules';

// Fallback
let localRoutingRulesData: RoutingRule[] = [...initialData];

const mapRuleFromDB = (row: any): RoutingRule => ({
    id: row.id,
    name: { ar: row.name_ar, en: row.name_en },
    active: row.active,
    conditions: row.conditions,
    action: row.action,
    // Priority handling if needed
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
    return JSON.parse(JSON.stringify(localRoutingRulesData));
};

export const addRoutingRule = async (rule: Omit<RoutingRule, 'id'>): Promise<RoutingRule> => {
    const newId = `rule-${Date.now()}`;
    
    if (supabase) {
        const { data, error } = await supabase.from('routing_rules').insert([{
            id: newId,
            name_en: rule.name.en,
            name_ar: rule.name.ar,
            active: rule.active,
            conditions: rule.conditions,
            action: rule.action,
            priority: 99 // Default to end
        }]).select().single();
        
        if (!error && data) return mapRuleFromDB(data);
    }

    const newRule = { ...rule, id: newId };
    localRoutingRulesData.push(newRule);
    return newRule;
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
    localRoutingRulesData = localRoutingRulesData.filter(r => r.id !== id);
    return true;
};

export const reorderRoutingRules = async (id: string, direction: 'up' | 'down'): Promise<RoutingRule[]> => {
    // Reordering in DB usually requires swapping priority integers. 
    // This simple implementation assumes fetching all, reordering in memory, and updating priorities.
    // For production, use a stored procedure or separate optimized logic.
    if (supabase) {
        const allRules = await getAllRoutingRules();
        const index = allRules.findIndex(r => r.id === id);
        if (index === -1) return allRules;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < allRules.length) {
            const item = allRules[index];
            allRules.splice(index, 1);
            allRules.splice(newIndex, 0, item);
            
            // Update priorities in DB
            const updates = allRules.map((r, idx) => ({ id: r.id, priority: idx + 1 }));
            await supabase.from('routing_rules').upsert(updates);
            
            return allRules;
        }
        return allRules;
    }
    return [];
};
