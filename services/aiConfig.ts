import { supabase } from '../lib/supabase';
import { aiEstimatorConfigData as initialConfig } from '../data/aiConfig';
import type { AIEstimatorConfig } from '../types';

// Local fallback
let aiEstimatorConfigData: AIEstimatorConfig = JSON.parse(JSON.stringify(initialConfig));

export const getAIEstimatorConfig = async (): Promise<AIEstimatorConfig> => {
    if (supabase) {
        // We store AI config in the 'site_content' table under a special ID to avoid creating a tiny table
        const { data, error } = await supabase
            .from('site_content')
            .select('content')
            .eq('id', 'ai_estimator_config')
            .maybeSingle();
        
        if (!error && data?.content) {
            return data.content as AIEstimatorConfig;
        }
    }
    return JSON.parse(JSON.stringify(aiEstimatorConfigData));
};

export const updateAIEstimatorConfig = async (updates: Partial<AIEstimatorConfig>): Promise<AIEstimatorConfig> => {
    const current = await getAIEstimatorConfig();
    const newConfig = { ...current, ...updates };

    if (supabase) {
        const { error } = await supabase.from('site_content').upsert({
            id: 'ai_estimator_config',
            content: newConfig,
            updated_at: new Date().toISOString()
        });
        
        if (error) console.error("Failed to update AI config in DB:", error);
    }

    aiEstimatorConfigData = newConfig;
    return newConfig;
};