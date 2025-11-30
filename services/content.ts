import { siteContentData as initialContentData } from '../data/content';
import type { SiteContent } from '../types';

// Create a mutable, in-memory copy of the data to simulate a database.
let siteContentData: SiteContent = JSON.parse(JSON.stringify(initialContentData));

const SIMULATED_DELAY = 300;

export const getContent = (): Promise<SiteContent> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Return a deep copy to prevent direct mutation from outside the service
            resolve(JSON.parse(JSON.stringify(siteContentData)));
        }, SIMULATED_DELAY);
    });
};

export const updateContent = (updates: Partial<SiteContent>): Promise<SiteContent> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Update the local, in-memory data store.
            siteContentData = { ...siteContentData, ...updates };
            resolve(JSON.parse(JSON.stringify(siteContentData)));
        }, SIMULATED_DELAY);
    });
};
