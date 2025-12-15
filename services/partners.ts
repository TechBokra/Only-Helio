
import { supabase } from '../supabaseClient';
import type { Partner, PartnerStatus, PartnerRequest, AdminPartner, PartnerType, SubscriptionPlan } from '../types';
import { mapPartnerTypeToRole } from '../data/permissions';
import { arTranslations, enTranslations } from '../data/translations';
import { Role } from '../types';
// Import mock data as fallback
import { partnersData } from '../data/partners'; 

// Helper to map DB User to Partner (Database -> Frontend)
const mapDbToPartner = (row: any): Partner => {
    if (!row) return null as any; 

    // 1. Handle Admin special case
    if (row.email === 'admin@onlyhelio.com' || row.email === 'tamer@onlyhelio.com') {
        row.type = 'admin';
        row.role = Role.SUPER_ADMIN;
    }

    // 2. Intelligent Role Mapping
    // If the database has "user" as the role (default), we must calculate the correct
    // privilege role based on the 'type' column to allow dashboard access.
    let mappedRole = row.role;
    const dbType = row.type as PartnerType;

    if (mappedRole === 'user' || !mappedRole) {
        if (dbType) {
            mappedRole = mapPartnerTypeToRole(dbType);
        } else {
             // Fallback for very old records without type
             mappedRole = Role.AGENCY_PARTNER; 
        }
    }
    
    // Normalize DB casing if necessary (e.g. 'super_admin' -> 'SUPER_ADMIN')
    if (mappedRole === 'super_admin') mappedRole = Role.SUPER_ADMIN;

    const translations = {
        ar: arTranslations.partnerInfo,
        en: enTranslations.partnerInfo
    };
    
    // SAFETY: Check if translation exists for this ID.
    // @ts-ignore
    const enTrans = translations.en[row.id];
    
    const dbNameEn = row.name_en || row.name || 'Unnamed User';
    const dbNameAr = row.name_ar || row.name || 'مستخدم';
    const dbDescEn = row.description_en || '';
    const dbDescAr = row.description_ar || '';

    // Parse contact methods if stored as JSON string
    let contactMethods = row.contactMethods;
    if (typeof contactMethods === 'string') {
        try {
            contactMethods = JSON.parse(contactMethods);
        } catch (e) {
            contactMethods = { whatsapp: { enabled: false }, phone: { enabled: false }, form: { enabled: true } };
        }
    } else if (!contactMethods) {
        contactMethods = { whatsapp: { enabled: false }, phone: { enabled: false }, form: { enabled: true } };
    }

    // Helper to normalize status strings from DB to frontend enum
    const normalizeStatus = (status: string): PartnerStatus => {
        const s = status?.toLowerCase();
        if (s === 'active') return 'active';
        if (s === 'pending') return 'pending';
        if (s === 'pending_setup') return 'pending_setup';
        if (s === 'disabled') return 'disabled';
        return 'active'; // Default active if unknown to prevent lockout
    };

    return {
        id: row.id,
        email: row.email || 'no-email@recorded.com',
        imageUrl: row.imageUrl || 'https://via.placeholder.com/150',
        imageUrl_small: row.imageUrl,
        imageUrl_medium: row.imageUrl,
        imageUrl_large: row.imageUrl,
        
        type: dbType || 'agency',
        role: mappedRole, // Now contains the correct Enum (e.g., FINISHING_PARTNER)
        status: normalizeStatus(row.status),
        
        subscriptionPlan: row.subscriptionPlan || 'basic',
        displayType: row.displayType || 'standard',
        
        // Prioritize translation file if key matches, otherwise use DB columns
        name: enTrans?.name || dbNameEn,
        nameAr: (translations.ar as any)[row.id]?.name || dbNameAr,
        
        description: enTrans?.description || dbDescEn,
        descriptionAr: (translations.ar as any)[row.id]?.description || dbDescAr,
        
        contactMethods: contactMethods,
        subscriptionEndDate: row.subscriptionEndDate,
        createdAt: row.createdAt || new Date().toISOString()
    } as Partner;
};

// Fallback function for mock data
const getMockPartners = (): AdminPartner[] => {
    return partnersData.map(p => {
        // Mock data usually lacks the 'role' field in the raw array, we derive it
        const role = p.type === 'admin' ? Role.SUPER_ADMIN : mapPartnerTypeToRole(p.type);
        return {
            ...p,
            role,
            name: p.id, // Fallback name
            nameAr: p.id,
            description: '',
            descriptionAr: ''
        } as unknown as AdminPartner;
    });
};

// --- READ OPERATIONS ---

export const getAllPartners = async (): Promise<Partner[]> => {
    if (!supabase) {
        console.warn("Supabase not initialized, returning mock partners.");
        return getMockPartners();
    }
    
    const { data, error } = await supabase.from('User').select('*').order('createdAt', { ascending: false });
    
    if (error || !data || data.length === 0) {
        console.warn('Supabase fetch failed or empty (getAllPartners), using mock data fallback.', error);
        return getMockPartners();
    }
    return (data || []).map(mapDbToPartner);
};

export const getAllPartnersForAdmin = async (): Promise<AdminPartner[]> => {
    if (!supabase) {
        console.warn("Supabase not initialized, returning mock partners.");
        return getMockPartners();
    }
    
    const { data, error } = await supabase.from('User').select('*').order('createdAt', { ascending: false });
    
    if (error || !data || data.length === 0) {
        console.warn('Supabase fetch failed or empty (getAllPartnersForAdmin), using mock data fallback.', error);
        return getMockPartners();
    }
    return (data || []).map(row => mapDbToPartner(row) as AdminPartner);
};

export const getPartnerById = async (id: string): Promise<Partner | undefined> => {
    if (!supabase) return getMockPartners().find(p => p.id === id);
    
    const { data, error } = await supabase.from('User').select('*').eq('id', id).single();
    if (error || !data) return getMockPartners().find(p => p.id === id);
    return mapDbToPartner(data);
};

export const getPartnerByEmail = async (email: string): Promise<Partner | undefined> => {
    if (!supabase) return getMockPartners().find(p => p.email === email);
    
    const { data, error } = await supabase.from('User').select('*').eq('email', email).single();
    if (error || !data) {
        // Fallback for specific hardcoded demo users if not in DB yet
        if (email === 'finish@onlyhelio.com' || email === 'admin@onlyhelio.com') {
             return getMockPartners().find(p => p.email === email);
        }
        return undefined;
    }
    return mapDbToPartner(data);
};

// --- WRITE OPERATIONS ---

export const updatePartner = async (id: string, updates: any): Promise<boolean> => {
    if (!supabase) return true; // Mock success
    
    const dbUpdates: any = {};
    
    if (updates.nameEn !== undefined) dbUpdates.name_en = updates.nameEn;
    if (updates.nameAr !== undefined) dbUpdates.name_ar = updates.nameAr;
    if (updates.descriptionEn !== undefined) dbUpdates.description_en = updates.descriptionEn;
    if (updates.descriptionAr !== undefined) dbUpdates.description_ar = updates.descriptionAr;
    
    if (updates.name !== undefined) dbUpdates.name_en = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.imageUrl !== undefined) dbUpdates.imageUrl = updates.imageUrl;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    
    // Ensure we update role if type changes
    if (updates.type !== undefined) {
         dbUpdates.role = mapPartnerTypeToRole(updates.type);
    }
    
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    
    if (updates.subscriptionPlan !== undefined) dbUpdates.subscriptionPlan = updates.subscriptionPlan;
    if (updates.subscriptionEndDate !== undefined) dbUpdates.subscriptionEndDate = updates.subscriptionEndDate;
    if (updates.displayType !== undefined) dbUpdates.displayType = updates.displayType;
    if (updates.contactMethods !== undefined) dbUpdates.contactMethods = JSON.stringify(updates.contactMethods);

    const { error } = await supabase.from('User').update(dbUpdates).eq('id', id);
    
    if (error) {
        console.error('Update partner failed:', error.message);
        throw error;
    }
    return true;
};

export const updatePartnerStatus = async (id: string, status: PartnerStatus): Promise<boolean> => {
    return updatePartner(id, { status });
};

export const addPartner = async (request: PartnerRequest, initialStatus: PartnerStatus = 'pending'): Promise<Partner> => {
    if (!supabase) throw new Error("Database connection required for adding partners.");

    const newPartnerId = `partner-${Date.now()}`;
    const newPartner = {
        id: newPartnerId,
        name_en: request.companyName,
        name_ar: request.companyName,
        email: request.contactEmail,
        type: request.companyType,
        // CRITICAL: Set the role based on type
        role: mapPartnerTypeToRole(request.companyType),
        status: initialStatus,
        imageUrl: request.logo || 'https://via.placeholder.com/150',
        subscriptionPlan: request.subscriptionPlan,
        createdAt: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('User').insert(newPartner).select().single();
    
    if (error) {
        console.error("Supabase Add Partner Error:", error);
        throw new Error(error.message);
    }
    
    return mapDbToPartner(data);
};

export const deletePartner = async (userId: string): Promise<boolean> => {
    if (!supabase) return true; // Mock success
    const { error } = await supabase.from('User').delete().eq('id', userId);
    if (error) throw error;
    return true;
};

export const updatePartnerDisplayType = async (id: string, displayType: any) => updatePartner(id, { displayType });
export const updatePartnerAdmin = async (id: string, updates: any) => updatePartner(id, updates);
export const upgradePartnerPlan = async (id: string, newPlan: SubscriptionPlan) => updatePartner(id, { subscriptionPlan: newPlan });

export const addInternalUser = async (userData: any): Promise<AdminPartner> => {
    if (!supabase) throw new Error("Database connection required.");

    const role = mapPartnerTypeToRole(userData.type);

    const newUser = {
        id: `user-${Date.now()}`,
        name_en: userData.name,
        name_ar: userData.nameAr,
        email: userData.email,
        type: userData.type,
        role: role, 
        status: userData.status || 'active',
        imageUrl: 'https://via.placeholder.com/150',
        createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase.from('User').insert(newUser).select().single();
    
    if (error) {
        console.error("Supabase Add Internal User Error:", error);
        throw new Error(error.message);
    }
    
    return mapDbToPartner(data) as AdminPartner;
};

export const updateUser = updatePartner;
