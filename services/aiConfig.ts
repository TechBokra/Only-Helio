

import { aiEstimatorConfigData as initialConfig } from '../data/aiConfig';
import type { AIEstimatorConfig } from '../types';

// Create a mutable, in-memory copy of the data to simulate a database.
let aiEstimatorConfigData: AIEstimatorConfig = JSON.parse(JSON.stringify(initialConfig));

const SIMULATED_DELAY = 200;

export const getAIEstimatorConfig = (): Promise<AIEstimatorConfig> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(aiEstimatorConfigData)));
        }, SIMULATED_DELAY);
    });
};

export const updateAIEstimatorConfig = (updates: Partial<AIEstimatorConfig>): Promise<AIEstimatorConfig> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Update the local, in-memory data store.
            aiEstimatorConfigData = { ...aiEstimatorConfigData, ...updates };
            resolve(JSON.parse(JSON.stringify(aiEstimatorConfigData)));
        }, SIMULATED_DELAY);
    });
};