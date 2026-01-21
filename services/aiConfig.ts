
import { supabase } from '../supabaseClient';
import type { AIEstimatorConfig } from '../types';
import { aiEstimatorConfigData as defaultConfig } from '../data/aiConfig';

const CONFIG_KEY = 'ai_estimator_config';

export const getAIEstimatorConfig = async (): Promise<AIEstimatorConfig> => {
    // Changed .single() to .maybeSingle()
    const { data, error } = await supabase
        .from('SystemSetting')
        .select('value')
        .eq('key', CONFIG_KEY)
        .maybeSingle();

    if (error || !data) {
        return JSON.parse(JSON.stringify(defaultConfig));
    }

    return typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
};

export const updateAIEstimatorConfig = async (updates: Partial<AIEstimatorConfig>): Promise<AIEstimatorConfig> => {
    const currentConfig = await getAIEstimatorConfig();
    const newConfig = { ...currentConfig, ...updates };

    const { error } = await supabase
        .from('SystemSetting')
        .upsert({ 
            key: CONFIG_KEY, 
            value: JSON.stringify(newConfig),
            group: 'ai' 
        }, { onConflict: 'key' });

    if (error) throw error;
    return newConfig;
};
