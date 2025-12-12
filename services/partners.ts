
import { supabase } from '../supabaseClient';
import { partnersData as initialPartnersData } from '../data/partners';
import type { Partner, PartnerStatus, PartnerRequest, AdminPartner, PartnerType, SubscriptionPlan, PartnerDisplayType } from '../types';
import { mapPartnerTypeToRole } from '../data/permissions';
import { addNotification } from './notifications';
import { arTranslations, enTranslations } from '../data/translations';

// Keep mock data for fallback
let partnersData: Omit<Partner, 'name' | 'description' | 'role'>[] = [...initialPartnersData];

const getPartnerTranslations = () => ({
    ar: arTranslations.partnerInfo,
    en: enTranslations.partnerInfo
});

// Helper to map DB User to Partner
const mapDbToPartner = (row: any): Partner => {
    // If name/desc are in the row (from DB), use them. 
    // Otherwise fallback to translation files based on ID (legacy behavior)
    const translations = getPartnerTranslations();
    const enTrans = (translations.en as any)[row.id] || { name: row.name || row.id, description: '' };
    
    return {
        id: row.id,
        email: row.email,
        imageUrl: row.imageUrl,
        // Generate responsive URLs if missing
        imageUrl_small: row.imageUrl, 
        imageUrl_medium: row.imageUrl,
        imageUrl_large: row.imageUrl,
        type: row.type as PartnerType,
        status: row.status as PartnerStatus,
        role: mapPartnerTypeToRole(row.type as PartnerType),
        subscriptionPlan: row.subscriptionPlan || 'basic',
        displayType: row.displayType || 'standard',
        // Prefer DB name if available, else translation
        name: row.name || enTrans.name,
        description: enTrans.description, // Description might be complex to store in simple table for now
        // Admin specific fields might be needed
        ...row
    };
};

export const getAllPartners = async (): Promise<Partner[]> => {
    if (!supabase) return mapMockData();

    const { data, error } = await supabase.from('User').select('*');
    if (error) {
        console.warn('Supabase users fetch failed:', error.message);
        return mapMockData();
    }
    return data.map(mapDbToPartner);
};

export const getAllPartnersForAdmin = async (): Promise<AdminPartner[]> => {
    if (!supabase) return mapMockData() as unknown as AdminPartner[];

    const { data, error } = await supabase.from('User').select('*');
    if (error) return mapMockData() as unknown as AdminPartner[];
    
    return data.map((row: any) => {
        const p = mapDbToPartner(row);
        return {
            ...p,
            nameAr: row.name, // In real app, separate column
            descriptionAr: ''
        } as AdminPartner;
    });
};

export const getPartnerById = async (id: string): Promise<Partner | undefined> => {
    if (!supabase) return mapMockData().find(p => p.id === id);

    const { data, error } = await supabase.from('User').select('*').eq('id', id).single();
    if (error) return mapMockData().find(p => p.id === id);
    
    return mapDbToPartner(data);
};

export const getPartnerByEmail = async (email: string): Promise<Partner | undefined> => {
    if (!supabase) return mapMockData().find(p => p.email.toLowerCase() === email.toLowerCase());

    const { data, error } = await supabase.from('User').select('*').eq('email', email).single();
    if (error) return undefined;

    return mapDbToPartner(data);
};

// --- Mock Data Mapper Helper ---
const mapMockData = () => {
    const translations = getPartnerTranslations();
    return partnersData.map(basePartner => {
        const trans = (translations.en as any)[basePartner.id] || { name: basePartner.id, description: '' };
        return {
            ...basePartner,
            ...trans,
            role: mapPartnerTypeToRole(basePartner.type)
        } as Partner;
    });
};

// --- Writes (Mock implementation kept for complex logic, requires DB triggers/RLS in real app) ---

export const updatePartner = async (id: string, updates: any): Promise<boolean> => {
    // Basic implementation
    if (supabase) {
        const { error } = await supabase.from('User').update(updates).eq('id', id);
        return !error;
    }
    return true; 
};

export const updatePartnerStatus = async (id: string, status: PartnerStatus): Promise<boolean> => {
    if (supabase) {
         const { error } = await supabase.from('User').update({ status }).eq('id', id);
         return !error;
    }
    return true;
};

export const addPartner = async (request: PartnerRequest): Promise<Partner> => {
    const newPartner = {
        id: `partner-${Date.now()}`,
        name: request.companyName,
        email: request.contactEmail,
        type: request.companyType,
        status: 'active',
        imageUrl: request.logo || 'https://via.placeholder.com/150',
        subscriptionPlan: request.subscriptionPlan
    };

    if (supabase) {
         const { data, error } = await supabase.from('User').insert(newPartner).select().single();
         if (!error) return mapDbToPartner(data);
    }
    
    // Mock fallback
    partnersData.push(newPartner as any);
    return { ...newPartner, role: mapPartnerTypeToRole(request.companyType), description: request.description || '' } as Partner;
};

export const deletePartner = async (userId: string): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase.from('User').delete().eq('id', userId);
        return !error;
    }
    return true;
};

// Aliases for other functions to maintain API compatibility
export const updatePartnerDisplayType = async (id: string, displayType: any) => updatePartner(id, { displayType });
export const updatePartnerAdmin = async (id: string, updates: any) => updatePartner(id, updates);
export const upgradePartnerPlan = async (id: string, newPlan: SubscriptionPlan) => updatePartner(id, { subscriptionPlan: newPlan });
export const addInternalUser = async (userData: any) => addPartner({ 
    companyName: userData.name, 
    contactEmail: userData.email, 
    companyType: userData.type, 
    subscriptionPlan: 'basic' 
} as any) as unknown as AdminPartner;
export const updateUser = updatePartner;
