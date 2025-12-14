
import { siteContentData as initialContentData } from '../data/content';
import type { SiteContent } from '../types';

const STORAGE_KEY = 'onlyhelio_mock_content';

// Helper to get initial data (Storage -> Mock)
const getLocalData = (): SiteContent => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) { 
        console.error("Failed to load mock content", e); 
    }
    return JSON.parse(JSON.stringify(initialContentData));
};

// Initialize with data from storage or fallback to static data
let siteContentData: SiteContent = getLocalData();

const SIMULATED_DELAY = 300;

export const getContent = (): Promise<SiteContent> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Always refresh from storage in case another tab updated it
            siteContentData = getLocalData();
            resolve(siteContentData);
        }, SIMULATED_DELAY);
    });
};

export const updateContent = (updates: Partial<SiteContent>): Promise<SiteContent> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Update the local, in-memory data store.
            siteContentData = { ...siteContentData, ...updates };
            
            // Persist to LocalStorage
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(siteContentData));
            } catch (e) {
                console.error("Failed to save content to storage", e);
            }

            resolve(JSON.parse(JSON.stringify(siteContentData)));
        }, SIMULATED_DELAY);
    });
};
