
import { supabase } from '../lib/supabase';
import { partnersData as initialPartnersData } from '../data/partners'; 
import type { Partner, AdminPartner, PartnerStatus, PartnerRequest, PartnerType, SubscriptionPlan } from '../types';
import { mapPartnerFromDB } from '../utils/supabaseMapper';
import { Role } from '../types';

// Helper function defined at the bottom, but hoisted for use
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

// --- Internal Helpers for Filtering ---
const INTERNAL_TYPES = [
    'admin', 'decoration_manager', 'platform_finishing_manager', 'finishing_market_manager',
    'platform_real_estate_manager', 'real_estate_market_manager', 'partner_relations_manager',
    'content_manager', 'service_manager', 'customer_relations_manager', 'listings_manager'
];

const EXTERNAL_TYPES = ['developer', 'agency', 'finishing'];


// --- FETCH FUNCTIONS ---

export const getAllPartnersForAdmin = async (): Promise<AdminPartner[]> => {
    // This returns EVERYONE (Legacy support, use specific functions below preferably)
    if (!supabase) return mapLocalData(initialPartnersData);
    
    try {
        const { data, error } = await supabase.from('partners').select('*');
        if (error || !data) return mapLocalData(initialPartnersData);
        return data.map(mapPartnerFromDB);
    } catch (e) {
        return mapLocalData(initialPartnersData);
    }
};

// 1. Get ONLY Internal Team (Admins, Managers)
export const getInternalUsers = async (): Promise<AdminPartner[]> => {
    if (!supabase) {
        return mapLocalData(initialPartnersData.filter(p => INTERNAL_TYPES.includes(p.type)));
    }
    const { data, error } = await supabase.from('partners').select('*').in('type', INTERNAL_TYPES);
    if (error || !data) return [];
    return data.map(mapPartnerFromDB);
};

// 2. Get ONLY External Partners (Developers, Agencies, Finishing Companies)
export const getExternalPartners = async (): Promise<AdminPartner[]> => {
    if (!supabase) {
        return mapLocalData(initialPartnersData.filter(p => EXTERNAL_TYPES.includes(p.type)));
    }
    const { data, error } = await supabase.from('partners').select('*').in('type', EXTERNAL_TYPES);
    if (error || !data) return [];
    return data.map(mapPartnerFromDB);
};

// --- SINGLE FETCH ---

export const getPartnerById = async (id: string): Promise<AdminPartner | undefined> => {
    if (!supabase) {
        const localUser = initialPartnersData.find(p => p.id === id);
        return localUser ? mapLocalItem(localUser) : undefined;
    }
    try {
        const { data, error } = await supabase.from('partners').select('*').eq('id', id).single();
        if (error || !data) return undefined;
        return mapPartnerFromDB(data);
    } catch (e) { return undefined; }
};

export const getPartnerByEmail = async (email: string): Promise<AdminPartner | undefined> => {
    if (!supabase) {
        const localUser = initialPartnersData.find(p => p.email === email);
        return localUser ? mapLocalItem(localUser) : undefined;
    }
    try {
        const { data, error } = await supabase.from('partners').select('*').ilike('email', email).maybeSingle();
        if (error || !data) return undefined;
        return mapPartnerFromDB(data);
    } catch (e) { return undefined; }
};

// --- WRITE OPERATIONS ---

export const updatePartner = async (id: string, updates: any): Promise<boolean> => {
    if (!supabase) return true;

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
    if (updates.password) dbUpdates.password = updates.password; // In prod, hash this!

    const { error } = await supabase.from('partners').update(dbUpdates).eq('id', id);
    return !error;
};

export const updatePartnerStatus = async (id: string, status: PartnerStatus): Promise<boolean> => {
    if (!supabase) return true;
    const { error } = await supabase.from('partners').update({ status }).eq('id', id);
    return !error;
};

export const addPartner = async (partnerData: PartnerRequest): Promise<AdminPartner> => {
    if (!supabase) throw new Error("DB connection required");
    const { data, error } = await supabase
        .from('partners')
        .insert([{
            name: partnerData.companyName,
            name_ar: partnerData.companyName, 
            description_en: partnerData.description,
            email: partnerData.contactEmail,
            type: partnerData.companyType,
            status: 'active',
            subscription_plan: partnerData.subscriptionPlan,
            role: getRoleForType(partnerData.companyType as PartnerType),
            image_url: partnerData.logo,
            password: 'password123' // Default temp password
        }])
        .select()
        .single();
    if (error) throw error;
    return mapPartnerFromDB(data);
};

export const deletePartner = async (id: string): Promise<boolean> => {
    if (!supabase) return true;
    const { error } = await supabase.from('partners').delete().eq('id', id);
    return !error;
};

export const updatePartnerAdmin = async (id: string, updates: Partial<AdminPartner>): Promise<AdminPartner> => {
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
    if (!supabase) throw new Error("DB connection required");
    const { data, error } = await supabase
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

export const updateUser = async (id: string, updates: any): Promise<boolean> => {
    return updatePartner(id, updates);
}

export const upgradePartnerPlan = async (partnerId: string, newPlan: SubscriptionPlan): Promise<boolean> => {
    if (!supabase) return true;
    const { error } = await supabase.from('partners').update({ subscription_plan: newPlan }).eq('id', partnerId);
    return !error;
}


// --- Local Mappers for Fallback ---
const mapLocalItem = (p: any): AdminPartner => ({
    ...p, 
    name: p.name || '', 
    role: p.role || getRoleForType(p.type),
    nameAr: p.nameAr || p.name || '',
    description: p.description || '',
    descriptionAr: p.descriptionAr || '',
    imageUrl_small: p.imageUrl_small || p.imageUrl,
    imageUrl_medium: p.imageUrl_medium || p.imageUrl,
    imageUrl_large: p.imageUrl_large || p.imageUrl,
    contactMethods: p.contactMethods || { whatsapp: { enabled: false }, phone: { enabled: false }, form: { enabled: true } },
    displayType: p.displayType || 'standard',
    createdAt: p.createdAt || new Date().toISOString()
} as AdminPartner);

const mapLocalData = (list: any[]): AdminPartner[] => list.map(mapLocalItem);
