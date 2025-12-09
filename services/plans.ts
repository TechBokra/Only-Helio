
import { supabase } from '../lib/supabase';
import type { SubscriptionPlanDetails, PlanCategory } from '../types';
import { arTranslations, enTranslations } from '../data/translations';

// Fallback data
const getPlansFromTranslations = () => {
    const arPlans = arTranslations.subscriptionPlans;
    const enPlans = enTranslations.subscriptionPlans;
    
    return {
        developer: {
            basic: { ar: arPlans?.developer?.basic, en: enPlans?.developer?.basic },
            professional: { ar: arPlans?.developer?.professional, en: enPlans?.developer?.professional },
            elite: { ar: arPlans?.developer?.elite, en: enPlans?.developer?.elite },
        },
        agency: {
            basic: { ar: arPlans?.agency?.basic, en: enPlans?.agency?.basic },
            professional: { ar: arPlans?.agency?.professional, en: enPlans?.agency?.professional },
            elite: { ar: arPlans?.agency?.elite, en: enPlans?.agency?.elite },
        },
        finishing: {
            commission: { ar: arPlans?.finishing?.commission, en: enPlans?.finishing?.commission },
            professional: { ar: arPlans?.finishing?.professional, en: enPlans?.finishing?.professional },
            elite: { ar: arPlans?.finishing?.elite, en: enPlans?.finishing?.elite },
        },
        individual: {
            sale: {
                paid_listing: { ar: arPlans?.individual?.sale?.paid_listing, en: enPlans?.individual?.sale?.paid_listing },
                commission: { ar: arPlans?.individual?.sale?.commission, en: enPlans?.individual?.sale?.commission },
            },
            rent: {
                paid_listing: { ar: arPlans?.individual?.rent?.paid_listing, en: enPlans?.individual?.rent?.paid_listing },
                commission: { ar: arPlans?.individual?.rent?.commission, en: enPlans?.individual?.rent?.commission },
            }
        }
    } as any;
};

export const getPlans = async (): Promise<Record<PlanCategory, any>> => {
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('subscription_plans')
                .select('*')
                .order('sort_order', { ascending: true });

            if (!error && data && data.length > 0) {
                const plansMap: any = {};

                data.forEach((row: any) => {
                    const category = row.category;
                    if (!plansMap[category]) plansMap[category] = {};

                    const planDetails = {
                        id: row.id, // Capture the ID
                        name: row.name_en,
                        price: row.price_en,
                        description: row.description_en,
                        features: row.features_en || [],
                        commissionRate: row.commission_rate
                    };
                    
                    const arDetails = {
                         id: row.id, // Capture the ID
                         name: row.name_ar,
                        price: row.price_ar,
                        description: row.description_ar,
                        features: row.features_ar || [],
                        commissionRate: row.commission_rate
                    };

                    if (category === 'individual') {
                        // Handle 'sale_paid_listing' -> 'sale' / 'paid_listing'
                        const parts = row.plan_key.split('_'); 
                        if (parts.length >= 2) {
                            const subCategory = parts[0]; // 'sale' or 'rent'
                            const realPlanKey = parts.slice(1).join('_'); // 'paid_listing' or 'commission'

                            if (!plansMap[category][subCategory]) {
                                plansMap[category][subCategory] = {};
                            }
                            plansMap[category][subCategory][realPlanKey] = { en: planDetails, ar: arDetails };
                        } else {
                            // Fallback for malformed keys
                            plansMap[category][row.plan_key] = { en: planDetails, ar: arDetails };
                        }
                    } else {
                        plansMap[category][row.plan_key] = { en: planDetails, ar: arDetails };
                    }
                });
                
                return plansMap;
            }
        } catch (e) {
            console.error("Error fetching plans:", e);
        }
    }
    return getPlansFromTranslations();
};

export const updatePlan = async (
    planType: PlanCategory, 
    planKey: string, 
    updates: { ar: Partial<SubscriptionPlanDetails>, en: Partial<SubscriptionPlanDetails> }, 
    subCategory?: 'sale' | 'rent',
    dbId?: string // Accept ID for reliable updates
): Promise<boolean> => {
    
    if (supabase) {
        const dbUpdates: any = { updated_at: new Date().toISOString() };
        
        if (updates.en.name) dbUpdates.name_en = updates.en.name;
        if (updates.ar.name) dbUpdates.name_ar = updates.ar.name;
        if (updates.en.price) dbUpdates.price_en = updates.en.price;
        if (updates.ar.price) dbUpdates.price_ar = updates.ar.price;
        if (updates.en.description) dbUpdates.description_en = updates.en.description;
        if (updates.ar.description) dbUpdates.description_ar = updates.ar.description;
        if (updates.en.features) dbUpdates.features_en = updates.en.features;
        if (updates.ar.features) dbUpdates.features_ar = updates.ar.features;
        
        // Handle number/undefined correctly
        if (updates.en.commissionRate !== undefined && !isNaN(Number(updates.en.commissionRate))) {
            dbUpdates.commission_rate = Number(updates.en.commissionRate);
        } else if (updates.en.commissionRate === 0) {
             dbUpdates.commission_rate = 0;
        }

        let query = supabase.from('subscription_plans').update(dbUpdates);

        // Prefer updating by ID if available (most reliable)
        if (dbId) {
            const { error } = await query.eq('id', dbId);
            if (error) console.error("Plan update error:", error);
            return !error;
        }

        // Fallback to key matching
        let dbPlanKey = planKey;
        if (planType === 'individual' && subCategory) {
            dbPlanKey = `${subCategory}_${planKey}`;
        }
        
        const { error } = await query.match({ category: planType, plan_key: dbPlanKey });
        if (error) console.error("Plan update error:", error);
        return !error;
    }
    return true;
};
