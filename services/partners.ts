
import { supabase } from '../lib/supabase';
import { partnersData as initialPartnersData } from '../data/partners'; // Keep as fallback/seeder source
import type { Partner, AdminPartner, PartnerStatus, PartnerRequest, PartnerType, SubscriptionPlan } from '../types';
import { mapPartnerFromDB } from '../utils/supabaseMapper';
import { Role } from '../types';

// --- SUPABASE IMPLEMENTATION ---

export const getAllPartnersForAdmin = async (): Promise<AdminPartner[]> => {
    if (!supabase) return [];
    
    try {
        const { data, error } = await supabase
            .from('partners')
            .select('*');

        if (error) {
            console.warn('Supabase: Error fetching partners, falling back to local data:', error.message);
            // Fallback to local data for smoother dev experience if DB is empty/broken
            return initialPartnersData.map(p => ({...p, name: (p as any).name || '', description: (p as any).description || '', role: Role.AGENCY_PARTNER} as unknown as AdminPartner));
        }
        
        if (!data || data.length === 0) {
            return [];
        }

        return data.map(mapPartnerFromDB);
    } catch (e) {
        console.error("Critical error in getAllPartnersForAdmin:", e);
        return [];
    }
};

export const getPartnerById = async (id: string): Promise<Partner | undefined> => {
    if (!supabase) return undefined;

    try {
        const { data, error } = await supabase
            .from('partners')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return undefined;
        return mapPartnerFromDB(data);
    } catch (e) {
        console.error("Error in getPartnerById:", e);
        return undefined;
    }
};

export const getPartnerByEmail = async (email: string): Promise<Partner | undefined> => {
    if (!supabase) return undefined;

    try {
        const { data, error } = await supabase
            .from('partners')
            .select('*')
            .ilike('email', email) // Case-insensitive
            .maybeSingle(); // Changed from single() to maybeSingle() to avoid error on not found

        if (error || !data) return undefined;
        return mapPartnerFromDB(data);
    } catch (e) {
        console.error("Error in getPartnerByEmail:", e);
        return undefined;
    }
};

// --- WRITE OPERATIONS ---

export const updatePartner = async (id: string, updates: any): Promise<boolean> => {
    // Map frontend fields to DB fields
    const dbUpdates: any = {};
    if (updates.nameEn) dbUpdates.name = updates.nameEn;
    if (updates.nameAr) dbUpdates.name_ar = updates.nameAr;
    if (updates.descriptionEn) dbUpdates.description_en = updates.descriptionEn;
    if (updates.descriptionAr) dbUpdates.description_ar = updates.descriptionAr;
    if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
    if (updates.subscriptionPlan) dbUpdates.subscription_plan = updates.subscriptionPlan;
    if (updates.subscriptionEndDate) dbUpdates.subscription_end_date = updates.subscriptionEndDate;
    if (updates.displayType) dbUpdates.display_type = updates.displayType;
    if (updates.contactMethods) dbUpdates.contact_methods = updates.contactMethods;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.email) dbUpdates.email = updates.email;

    const { error } = await supabase!
        .from('partners')
        .update(dbUpdates)
        .eq('id', id);

    return !error;
};

export const updatePartnerStatus = async (id: string, status: PartnerStatus): Promise<boolean> => {
    const { error } = await supabase!
        .from('partners')
        .update({ status })
        .eq('id', id);
    return !error;
};

export const addPartner = async (partnerData: PartnerRequest): Promise<AdminPartner> => {
    const { data, error } = await supabase!
        .from('partners')
        .insert([{
            name: partnerData.companyName,
            name_ar: partnerData.companyName, // Default AR name to EN
            description_en: partnerData.description,
            email: partnerData.contactEmail,
            type: partnerData.companyType,
            status: 'active',
            subscription_plan: partnerData.subscriptionPlan,
            role: getRoleForType(partnerData.companyType),
            image_url: partnerData.logo
        }])
        .select()
        .single();
    if (error) throw error;
    return mapPartnerFromDB(data);
};

export const deletePartner = async (id: string): Promise<boolean> => {
    const { error } = await supabase!
        .from('partners')
        .delete()
        .eq('id', id);
    return !error;
};

export const updatePartnerAdmin = async (id: string, updates: Partial<AdminPartner>): Promise<AdminPartner> => {
    // Re-map AdminPartner partial to DB columns for updatePartner
    await updatePartner(id, {
        nameEn: updates.name,
        nameAr: updates.nameAr,
        descriptionEn: updates.description,
        descriptionAr: updates.descriptionAr,
        ...updates
    });
    
    const updated = await getPartnerById(id);
    if (!updated) throw new Error("Partner not found after update");
    return updated as AdminPartner;
};

export const addInternalUser = async (userData: { name: string, nameAr: string, email: string, password?: string, type: PartnerType }): Promise<AdminPartner> => {
    const { data, error } = await supabase!
       .from('partners')
       .insert([{
           name: userData.name,
           name_ar: userData.nameAr,
           email: userData.email,
           password: userData.password || 'password123', 
           type: userData.type,
           role: getRoleForType(userData.type),
           status: 'active'
       }])
       .select()
       .single();
   if (error) throw error;
   return mapPartnerFromDB(data);
}

// Alias for generic user update
export const updateUser = async (id: string, updates: any): Promise<boolean> => {
    return updatePartner(id, updates);
}

export const upgradePartnerPlan = async (partnerId: string, newPlan: SubscriptionPlan): Promise<boolean> => {
    const { error } = await supabase!
        .from('partners')
        .update({ subscription_plan: newPlan })
        .eq('id', partnerId);
    return !error;
}

function getRoleForType(type: PartnerType): Role {
    switch (type) {
        case 'admin': return Role.SUPER_ADMIN;
        case 'developer': return Role.DEVELOPER_PARTNER;
        case 'finishing': return Role.FINISHING_PARTNER;
        case 'agency': return Role.AGENCY_PARTNER;
        
        case 'decoration_manager': return Role.DECORATION_MANAGER;
        case 'platform_finishing_manager': return Role.PLATFORM_FINISHING_MANAGER;
        case 'finishing_market_manager': return Role.FINISHING_MARKET_MANAGER;
        case 'platform_real_estate_manager': return Role.PLATFORM_REAL_ESTATE_MANAGER;
        case 'real_estate_market_manager': return Role.REAL_ESTATE_MARKET_MANAGER;
        
        case 'partner_relations_manager': return Role.PARTNER_RELATIONS_MANAGER;
        case 'content_manager': return Role.CONTENT_MANAGER;

        case 'service_manager': return Role.SERVICE_MANAGER;
        case 'customer_relations_manager': return Role.CUSTOMER_RELATIONS_MANAGER;
        case 'listings_manager': return Role.LISTINGS_MANAGER;
        
        default: return Role.AGENCY_PARTNER; 
    }
}

// --- SEEDING HELPER (Exported for use in Admin) ---
export const seedPartnersToSupabase = async () => {
    if (!supabase) throw new Error("Supabase client not initialized");
    
    console.log("Starting seeding partners...");
    const mappedData = initialPartnersData.map(p => {
        const source = p as any;
        const calculatedRole = source.role || getRoleForType(p.type);
        
        return {
            id: p.id, 
            email: p.email,
            name: source.name || p.id, 
            name_ar: source.nameAr || source.name || p.id,
            description_en: source.description || '',
            description_ar: source.descriptionAr || source.description || '',
            image_url: p.imageUrl,
            type: p.type,
            role: calculatedRole,
            status: p.status,
            subscription_plan: p.subscriptionPlan,
            contact_methods: p.contactMethods
        };
    });

    const { error } = await supabase.from('partners').upsert(mappedData);
    if (error) {
        throw new Error(`Failed to seed partners: ${error.message}`);
    }
    return true;
};
