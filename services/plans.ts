
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

        const planDetails = {
            ar: {
                name: row.name_ar,
                price: row.price_ar,
                description: row.description_ar,
                features: row.features_ar || [],
                commissionRate: row.commissionRate
            },
            en: {
                name: row.name_en,
                price: row.price_en,
                description: row.description_en,
                features: row.features_en || [],
                commissionRate: row.commissionRate
            }
        };

        if (subCat) {
            if (!plans[cat][subCat]) plans[cat][subCat] = {};
            plans[cat][subCat][tier] = planDetails;
        } else {
            plans[cat][tier] = planDetails;
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
    updates: { ar: Partial<SubscriptionPlanDetails>, en: Partial<SubscriptionPlanDetails> }, 
    subCategory?: 'sale' | 'rent'
): Promise<boolean> => {
    
    // Construct the update query based on provided fields
    const dbUpdates: any = { updatedAt: new Date().toISOString() };
    
    // Arabic Updates
    if (updates.ar.price) dbUpdates.price_ar = updates.ar.price;
    if (updates.ar.description) dbUpdates.description_ar = updates.ar.description;
    if (updates.ar.features) dbUpdates.features_ar = updates.ar.features;
    
    // English Updates
    if (updates.en.price) dbUpdates.price_en = updates.en.price;
    if (updates.en.description) dbUpdates.description_en = updates.en.description;
    if (updates.en.features) dbUpdates.features_en = updates.en.features;
    
    // Shared
    if (updates.en.commissionRate !== undefined) dbUpdates.commissionRate = updates.en.commissionRate;

    let query = supabase.from('PlanConfiguration').update(dbUpdates).eq('category', planType).eq('tier', planKey);
    
    if (subCategory) {
        query = query.eq('subCategory', subCategory);
    } else {
        query = query.is('subCategory', null);
    }

    const { error } = await query;

    if (error) {
        console.error("Error updating plan:", error);
        return false;
    }
    return true;
};
