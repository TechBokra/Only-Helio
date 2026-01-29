
import { supabase } from '../supabaseClient';
import type { SubscriptionPlan, SubscriptionPlanDetails, PlanCategory } from '../types';

// Helper to construct the nested object structure from flat DB rows
const buildPlansObject = (rows: any[]) => {
    const plans: any = {};

    rows.forEach(row => {
        const cat = row.category;
        const tier = row.tier;
        const subCat = row.subCategory;

        if (!plans[cat]) plans[cat] = {};
        
        // Parse Limits JSONB or default to Infinity (Unlimited) if not set
        const limits = typeof row.limits === 'string' ? JSON.parse(row.limits) : (row.limits || {});

        const planDetails: SubscriptionPlanDetails = {
            name: row.name_en, 
            price: row.price_en,
            description: row.description_en,
            features: row.features_en || [],
            commissionRateSale: row.commissionRateSale,
            commissionRateRent: row.commissionRateRent,
            limits: {
                projects: limits.projects !== undefined ? limits.projects : -1,
                units: limits.units !== undefined ? limits.units : -1,
                propertiesTotal: limits.propertiesTotal !== undefined ? limits.propertiesTotal : -1,
                propertiesSale: limits.propertiesSale !== undefined ? limits.propertiesSale : -1,
                propertiesRent: limits.propertiesRent !== undefined ? limits.propertiesRent : -1,
                portfolio: limits.portfolio !== undefined ? limits.portfolio : -1,
            },
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

export const updatePlan = async (
    planType: PlanCategory, 
    planKey: SubscriptionPlan, 
    updates: { 
        ar: Partial<SubscriptionPlanDetails>, 
        en: Partial<SubscriptionPlanDetails>,
        limits: any,
        commissions: { sale?: number, rent?: number }
    }, 
    subCategory?: 'sale' | 'rent'
): Promise<boolean> => {
    
    const dbUpdates: any = { updatedAt: new Date().toISOString() };
    
    // Arabic Updates
    if (updates.ar.price) dbUpdates.price_ar = updates.ar.price;
    if (updates.ar.description) dbUpdates.description_ar = updates.ar.description;
    if (updates.ar.features) dbUpdates.features_ar = updates.ar.features;
    
    // English Updates
    if (updates.en.price) dbUpdates.price_en = updates.en.price;
    if (updates.en.description) dbUpdates.description_en = updates.en.description;
    if (updates.en.features) dbUpdates.features_en = updates.en.features;
    
    // Shared Technical Configs
    if (updates.commissions.sale !== undefined) dbUpdates.commissionRateSale = updates.commissions.sale;
    if (updates.commissions.rent !== undefined) dbUpdates.commissionRateRent = updates.commissions.rent;
    
    // Ensure limits are stored as JSONB
    dbUpdates.limits = updates.limits;

    let query = supabase.from('PlanConfiguration').update(dbUpdates).eq('category', planType).eq('tier', planKey);
    
    // Handle subCategory strictly (NULL vs Empty String)
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
    
    // Check if any row was actually updated
    if (!data || data.length === 0) {
        console.warn("No plan row found to update. Check category/tier match.");
        return false;
    }

    return true;
};
