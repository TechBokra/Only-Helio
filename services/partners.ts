
import { supabase } from '../supabaseClient';
import type { Partner, PartnerStatus, PartnerRequest, AdminPartner, PartnerType, SubscriptionPlan } from '../types';
import { mapPartnerTypeToRole } from '../data/permissions';
import { arTranslations, enTranslations } from '../data/translations';
import { Role } from '../types';

// Helper to map DB User to Partner (Database -> Frontend)
const mapDbToPartner = (row: any): Partner => {
    if (!row) return null as any; 

    // Handle Admin special case (Legacy support)
    if (row.email === 'admin@onlyhelio.com') {
        row.type = 'admin';
        row.role = Role.SUPER_ADMIN;
    }

    const translations = {
        ar: arTranslations.partnerInfo,
        en: enTranslations.partnerInfo
    };
    // @ts-ignore
    const enTrans = translations.en[row.id] || { name: row.name || row.id, description: '' };
    
    // Determine Role
    let mappedRole = row.role;
    if (mappedRole === 'super_admin') mappedRole = Role.SUPER_ADMIN;
    
    let mappedType = row.type;
    if (!mappedType) {
        if (mappedRole === Role.SUPER_ADMIN || row.email?.includes('admin')) {
            mappedType = 'admin';
            mappedRole = Role.SUPER_ADMIN; 
        } else {
            mappedType = 'agency';
        }
    }

    if (!mappedRole && mappedType) {
        mappedRole = mapPartnerTypeToRole(mappedType as PartnerType);
    }

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

    return {
        id: row.id,
        email: row.email || 'no-email@recorded.com',
        imageUrl: row.imageUrl || 'https://via.placeholder.com/150',
        imageUrl_small: row.imageUrl,
        imageUrl_medium: row.imageUrl,
        imageUrl_large: row.imageUrl,
        
        type: mappedType as PartnerType,
        role: mappedRole,
        status: (row.status?.toLowerCase() === 'active' ? 'active' : 'disabled') as PartnerStatus,
        
        subscriptionPlan: row.subscriptionPlan || 'basic',
        displayType: row.displayType || 'standard',
        
        name: row.name_en || row.name || enTrans.name || 'Unnamed User',
        nameAr: row.name_ar || row.name || 'مستخدم بدون اسم',
        
        description: row.description_en || '',
        descriptionAr: row.description_ar || '',
        
        contactMethods: contactMethods,
        subscriptionEndDate: row.subscriptionEndDate,
        createdAt: row.createdAt || new Date().toISOString()
    } as Partner;
};

// --- READ OPERATIONS ---

export const getAllPartners = async (): Promise<Partner[]> => {
    // STRICT MODE: No mock fallback
    if (!supabase) {
        console.error("Supabase not initialized for getAllPartners");
        return [];
    }
    
    const { data, error } = await supabase.from('User').select('*').order('createdAt', { ascending: false });
    
    if (error) {
        console.error('Supabase fetch error (getAllPartners):', error);
        return [];
    }
    return (data || []).map(mapDbToPartner);
};

export const getAllPartnersForAdmin = async (): Promise<AdminPartner[]> => {
    if (!supabase) {
        console.error("Supabase not initialized for getAllPartnersForAdmin");
        return [];
    }
    
    const { data, error } = await supabase.from('User').select('*').order('createdAt', { ascending: false });
    
    if (error) {
        console.error('Supabase fetch error (getAllPartnersForAdmin):', error);
        return [];
    }
    return (data || []).map(row => mapDbToPartner(row) as AdminPartner);
};

export const getPartnerById = async (id: string): Promise<Partner | undefined> => {
    if (!supabase) return undefined;
    
    const { data, error } = await supabase.from('User').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return mapDbToPartner(data);
};

export const getPartnerByEmail = async (email: string): Promise<Partner | undefined> => {
    if (!supabase) return undefined;
    
    const { data, error } = await supabase.from('User').select('*').eq('email', email).single();
    if (error || !data) return undefined;
    return mapDbToPartner(data);
};

// --- WRITE OPERATIONS ---

export const updatePartner = async (id: string, updates: any): Promise<boolean> => {
    if (!supabase) return false;
    
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

export const addPartner = async (request: PartnerRequest): Promise<Partner> => {
    if (!supabase) throw new Error("Supabase not connected");

    const newPartnerId = `partner-${Date.now()}`;
    const newPartner = {
        id: newPartnerId,
        name_en: request.companyName,
        name_ar: request.companyName,
        email: request.contactEmail,
        type: request.companyType,
        status: 'active',
        imageUrl: request.logo || 'https://via.placeholder.com/150',
        subscriptionPlan: request.subscriptionPlan,
        createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase.from('User').insert(newPartner).select().single();
    if (error) throw error;
    
    return mapDbToPartner(data);
};

export const deletePartner = async (userId: string): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await supabase.from('User').delete().eq('id', userId);
    if (error) throw error;
    return true;
};

export const updatePartnerDisplayType = async (id: string, displayType: any) => updatePartner(id, { displayType });
export const updatePartnerAdmin = async (id: string, updates: any) => updatePartner(id, updates);
export const upgradePartnerPlan = async (id: string, newPlan: SubscriptionPlan) => updatePartner(id, { subscriptionPlan: newPlan });

export const addInternalUser = async (userData: any): Promise<AdminPartner> => {
    if (!supabase) throw new Error("Supabase not connected");

    const newUser = {
        id: `user-${Date.now()}`,
        name_en: userData.name,
        name_ar: userData.nameAr,
        email: userData.email,
        type: userData.type,
        role: mapPartnerTypeToRole(userData.type), 
        status: 'active',
        imageUrl: 'https://via.placeholder.com/150', 
        createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase.from('User').insert(newUser).select().single();
    if (error) throw error;
    return mapDbToPartner(data) as AdminPartner;
};

export const updateUser = updatePartner;
