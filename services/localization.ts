
import { supabase } from '../lib/supabase';

export interface UIOverride {
    key: string;
    value_ar: string;
    value_en: string;
}

export const getUIOverrides = async (): Promise<Record<string, { ar: string, en: string }>> => {
    if (!supabase) return {};

    try {
        const { data, error } = await supabase.from('ui_translations').select('*');
        if (error || !data) return {};

        const overrides: Record<string, { ar: string, en: string }> = {};
        data.forEach((row: UIOverride) => {
            overrides[row.key] = { ar: row.value_ar, en: row.value_en };
        });
        return overrides;
    } catch (e) {
        console.error("Failed to load translations", e);
        return {};
    }
};

export const saveUIOverride = async (key: string, values: { ar: string, en: string }) => {
    if (!supabase) return;
    await supabase.from('ui_translations').upsert({
        key,
        value_ar: values.ar,
        value_en: values.en,
        updated_at: new Date().toISOString()
    });
};
