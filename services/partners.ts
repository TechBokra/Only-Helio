import { supabase } from '../supabaseClient';
import { partnersData as initialPartnersData } from '../data/partners';
import type { Partner, PartnerStatus, PartnerRequest, AdminPartner, PartnerType, SubscriptionPlan, PartnerDisplayType } from '../types';
import { mapPartnerTypeToRole } from '../data/permissions';
import { arTranslations, enTranslations } from '../data/translations';

// Helper to map DB User to Partner
const mapDbToPartner = (row: any): Partner => {
    if (!row) return null as any; // Guard clause

    // Fail-safe: Force Super Admin type for the main admin email
    // This ensures access even if the DB record was created with a default 'agency' type
    if (row.email === 'admin@onlyhelio.com') {
        row.type = 'admin';
    }

    // Legacy support for static translations if name is missing in DB row (during migration)
    const translations = {
        ar: arTranslations.partnerInfo,
        en: enTranslations.partnerInfo
    };
    const enTrans = (translations.en as any)[row.id] || { name: row.name || row.id, description: '' };
    
    return {
        id: row.id,
        email: row.email,
        imageUrl: row.imageUrl || 'https://via.placeholder.com/150', // Added fallback
        imageUrl_small: row.imageUrl || 'https://via.placeholder.com/150', 
        imageUrl_medium: row.imageUrl || 'https://via.placeholder.com/150',
        imageUrl_large: row.imageUrl || 'https://via.placeholder.com/150',
        type: row.type as PartnerType,
        status: row.status as PartnerStatus,
        role: mapPartnerTypeToRole(row.type as PartnerType),
        subscriptionPlan: row.subscriptionPlan || 'basic',
        displayType: row.displayType || 'standard',
        name: row.name_en || row.name || enTrans.name, // Prefer localized column if available
        nameAr: row.name_ar, // For AdminPartner type
        description: row.description_en || '',
        descriptionAr: row.description_ar || '',
        contactMethods: typeof row.contactMethods === 'string' ? JSON.parse(row.contactMethods) : row.contactMethods,
        subscriptionEndDate: row.subscriptionEndDate,
        createdAt: row.createdAt
    } as Partner;
};

// --- READ OPERATIONS ---

export const getAllPartners = async (): Promise<Partner[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('User').select('*').order('createdAt', { ascending: false });
    if (error) {
        console.error('Fetch partners failed:', error.message);
        return [];
    }
    return data.map(mapDbToPartner);
};

export const getAllPartnersForAdmin = async (): Promise<AdminPartner[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('User').select('*').order('createdAt', { ascending: false });
    if (error) {
        console.error('Fetch admin partners failed:', error.message);
        return [];
    }
    return data.map(row => mapDbToPartner(row) as AdminPartner);
};

export const getPartnerById = async (id: string): Promise<Partner | undefined> => {
    if (!supabase) return undefined;
    const { data, error } = await supabase.from('User').select('*').eq('id', id).single();
    if (error) return undefined;
    return mapDbToPartner(data);
};

export const getPartnerByEmail = async (email: string): Promise<Partner | undefined> => {
    if (!supabase) return undefined;
    const { data, error } = await supabase.from('User').select('*').eq('email', email).single();
    if (error) return undefined;
    return mapDbToPartner(data);
};

// --- WRITE OPERATIONS ---

export const updatePartner = async (id: string, updates: any): Promise<boolean> => {
    if (!supabase) return false;
    
    // Map frontend fields to DB columns if necessary
    const dbUpdates: any = { ...updates };
    
    // Handle localized name/desc splitting if passed as composite
    if (updates.nameEn) dbUpdates.name_en = updates.nameEn;
    if (updates.nameAr) dbUpdates.name_ar = updates.nameAr;
    if (updates.descriptionEn) dbUpdates.description_en = updates.descriptionEn;
    if (updates.descriptionAr) dbUpdates.description_ar = updates.descriptionAr;

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

    // 1. Create Auth User (Backend/Edge Function usually handles this, but simulating client-side for MVP)
    // Note: In a real secure app, creating the Auth user should happen via an Admin Edge Function 
    // to avoid exposing service_role keys. For this MVP, we assume the user might already exist or we just insert into public.User
    
    const newPartnerId = `partner-${Date.now()}`;
    
    const newPartner = {
        id: newPartnerId,
        name_en: request.companyName,
        name_ar: request.companyName, // Default AR name to same until edited
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

// --- ALIASES & HELPERS ---
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
        status: 'active',
        imageUrl: 'https://via.placeholder.com/150', // Default avatar
        // password: userData.password // Removing direct password insert for now to avoid schema conflict if column missing
    };

    const { data, error } = await supabase.from('User').insert(newUser).select().single();
    if (error) throw error;
    return mapDbToPartner(data) as AdminPartner;
};

export const updateUser = updatePartner;