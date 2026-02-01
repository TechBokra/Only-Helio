
import { supabase } from '../supabaseClient';
import type { SubscriptionPlan, SubscriptionPlanDetails, PlanCategory, BillingCycle, CommissionDisplayConfig } from '../types';

// Helper to construct the nested object structure from flat DB rows
const buildPlansObject = (rows: any[]) => {
    const plans: any = {};

    rows.forEach(row => {
        const cat = row.category;
        const tier = row.tier; // This is now a flexible string (slug)
        const subCat = row.subCategory;

        if (!plans[cat]) plans[cat] = {};
        
        // Parse Limits JSONB or default to Infinity (Unlimited) if not set
        const limits = typeof row.limits === 'string' ? JSON.parse(row.limits) : (row.limits || {});
        
        // Parse Commission Config JSONB
        const commissionConfigRaw = typeof row.commissionConfig === 'string' ? JSON.parse(row.commissionConfig) : (row.commissionConfig || {});
        
        // Smart Fallback for Commission Config
        // If config is missing in JSON, try to populate it from legacy columns
        // This ensures existing plans still show commissions correctly.
        let saleCommConfig: CommissionDisplayConfig = commissionConfigRaw.sale || { type: 'hidden', value: '' };
        let rentCommConfig: CommissionDisplayConfig = commissionConfigRaw.rent || { type: 'hidden', value: '' };

        if (!commissionConfigRaw.sale && row.commissionRateSale) {
            saleCommConfig = { type: 'percentage', value: row.commissionRateSale };
        }
        if (!commissionConfigRaw.rent && row.commissionRateRent) {
             // Heuristic: if value is small (< 100), assume %, else assume fixed/text
             // But usually rent commission is "1 month", let's check legacy
             rentCommConfig = { type: 'percentage', value: row.commissionRateRent };
        }
        
        // Construct relevant commission object for this specific row's context
        // If subCategory is sale, use sale config. If rent, use rent config.
        let displayCommission: CommissionDisplayConfig | undefined = undefined;
        if (subCat === 'sale') displayCommission = saleCommConfig;
        else if (subCat === 'rent') displayCommission = rentCommConfig;
        else {
             // For general categories (developer, agency), we usually don't show commission per unit type like this
             // But if we had to pick one, default to sale or keep undefined
             if (saleCommConfig.type !== 'hidden') displayCommission = saleCommConfig;
        }

        const planDetails: SubscriptionPlanDetails = {
            id: row.id, // Keep track of DB ID for updates/deletes
            tier: tier, // The slug
            name: row.name_en, 
            price: row.price_en,
            description: row.description_en,
            features: row.features_en || [],
            commission: displayCommission, // New consolidated config
            billingCycle: row.billingCycle || 'monthly',
            limits: {
                projects: limits.projects !== undefined ? limits.projects : -1,
                units: limits.units !== undefined ? limits.units : -1,
                propertiesTotal: limits.propertiesTotal !== undefined ? limits.propertiesTotal : -1,
                propertiesSale: limits.propertiesSale !== undefined ? limits.propertiesSale : -1,
                propertiesRent: limits.propertiesRent !== undefined ? limits.propertiesRent : -1,
                portfolio: limits.portfolio !== undefined ? limits.portfolio : -1,
            },
            // Legacy props kept for backward compat if any other component relies on them directly
            commissionRateSale: row.commissionRateSale,
            commissionRateRent: row.commissionRateRent,
        };

        // Attach localized versions for UI consumption
        const arDetails = { ...planDetails, name: row.name_ar, price: row.price_ar, description: row.description_ar, features: row.features_ar || [] };
        const enDetails = { ...planDetails, name: row.name_en, price: row.price_en, description: row.description_en, features: row.features_en || [] };

        const composite = { ar: arDetails, en: enDetails };

        if (subCat) {
            if (!plans[cat][subCat]) plans[cat][subCat] = {};
            plans[cat][subCat][tier] = composite;
        } else {
            plans[cat][tier] = composite;
        }
    });

    return plans;
};

export const getPlans = async (): Promise<Record<PlanCategory, any>> => {
    const { data, error } = await supabase
        .from('PlanConfiguration')
        .select('*')
        .order('category')
        .order('tier');

    if (error) {
        console.error("Error fetching plans:", error);
        return {} as any;
    }

    return buildPlansObject(data);
};

export const createPlan = async (
    planType: PlanCategory,
    tierSlug: string,
    data: { 
        ar: Partial<SubscriptionPlanDetails>, 
        en: Partial<SubscriptionPlanDetails>,
        limits: any,
        commissionConfig: { sale: CommissionDisplayConfig, rent: CommissionDisplayConfig },
        billingCycle: BillingCycle
    },
    subCategory?: string
): Promise<boolean> => {
    
    // Construct DB Payload
    const dbPayload: any = {
        category: planType,
        tier: tierSlug, // The unique slug e.g. "vip-gold"
        subCategory: subCategory || null,
        
        name_ar: data.ar.name,
        name_en: data.en.name,
        price_ar: data.ar.price,
        price_en: data.en.price,
        description_ar: data.ar.description,
        description_en: data.en.description,
        features_ar: data.ar.features || [],
        features_en: data.en.features || [],
        
        limits: data.limits,
        commissionConfig: data.commissionConfig, // Save Full JSON
        billingCycle: data.billingCycle,
        updatedAt: new Date().toISOString()
    };
    
    const { error } = await supabase.from('PlanConfiguration').insert(dbPayload);
    
    if (error) {
        console.error("Error creating plan:", error);
        throw error;
    }
    return true;
};

export const updatePlan = async (
    planType: PlanCategory, 
    planKey: string, 
    updates: { 
        ar: Partial<SubscriptionPlanDetails>, 
        en: Partial<SubscriptionPlanDetails>,
        limits: any,
        commissionConfig: { sale: CommissionDisplayConfig, rent: CommissionDisplayConfig },
        billingCycle?: BillingCycle
    }, 
    subCategory?: 'sale' | 'rent'
): Promise<boolean> => {
    
    const dbUpdates: any = { updatedAt: new Date().toISOString() };
    
    // Arabic Updates
    if (updates.ar.price) dbUpdates.price_ar = updates.ar.price;
    if (updates.ar.description) dbUpdates.description_ar = updates.ar.description;
    if (updates.ar.features) dbUpdates.features_ar = updates.ar.features;
    if (updates.ar.name) dbUpdates.name_ar = updates.ar.name;
    
    // English Updates
    if (updates.en.price) dbUpdates.price_en = updates.en.price;
    if (updates.en.description) dbUpdates.description_en = updates.en.description;
    if (updates.en.features) dbUpdates.features_en = updates.en.features;
    if (updates.en.name) dbUpdates.name_en = updates.en.name;
    
    // Shared Technical Configs
    if (updates.billingCycle !== undefined) dbUpdates.billingCycle = updates.billingCycle;
    
    // Update Commission JSON
    if (updates.commissionConfig) {
        dbUpdates.commissionConfig = updates.commissionConfig;
    }
    
    // Ensure limits are stored as JSONB
    dbUpdates.limits = updates.limits;

    let query = supabase.from('PlanConfiguration').update(dbUpdates).eq('category', planType).eq('tier', planKey);
    
    // Handle subCategory strictly
    if (subCategory) {
        query = query.eq('subCategory', subCategory);
    } else {
        query = query.is('subCategory', null);
    }

    const { data, error } = await query.select();

    if (error) {
        console.error("Error updating plan:", error);
        return false;
    }
    return true;
};

export const deletePlan = async (category: string, tier: string, subCategory?: string): Promise<boolean> => {
    let query = supabase.from('PlanConfiguration').delete().eq('category', category).eq('tier', tier);
    
    if (subCategory) {
        query = query.eq('subCategory', subCategory);
    } else {
        query = query.is('subCategory', null);
    }
    
    const { error } = await query;
    if (error) {
        console.error("Error deleting plan:", error);
        return false;
    }
    return true;
};
