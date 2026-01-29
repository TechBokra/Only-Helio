
import type { SubscriptionPlan, PartnerType, SubscriptionPlanDetails } from '../types';

/**
 * Gets the limit for a specific usage type based on the Plan Details object.
 * This effectively delegates the logic to the Database config loaded into the `planDetails` object.
 */
export const getLimitFromPlan = (
    planDetails: SubscriptionPlanDetails | undefined,
    usageType: 'projects' | 'units' | 'properties' | 'portfolio' | 'propertiesSale' | 'propertiesRent'
): number => {
    if (!planDetails || !planDetails.limits) {
        return Infinity; // Fallback to unlimited if no config found (safe default for MVP, or restrict to 0 based on business need)
    }

    const { limits } = planDetails;

    switch (usageType) {
        case 'projects':
            return limits.projects ?? Infinity;
        case 'units':
            return limits.units ?? Infinity;
        case 'properties':
             // If a generic total is set, use it. Otherwise rely on specific sub-limits.
            return limits.propertiesTotal ?? Infinity;
        case 'propertiesSale':
            return limits.propertiesSale ?? Infinity;
        case 'propertiesRent':
            return limits.propertiesRent ?? Infinity;
        case 'portfolio':
            return limits.portfolio ?? Infinity;
        default:
            return Infinity;
    }
};
