
import { supabase } from '../supabaseClient';
import type { Partner, PartnerStatus, PartnerRequest, AdminPartner, PartnerType, SubscriptionPlan } from '../types';
import { mapPartnerTypeToRole } from '../data/permissions';
import { Role } from '../types';

// Define the Database Shape for User
interface UserRow {
    id: string;
    email: string;
    name_en: string | null;
    name_ar: string | null;
    description_en: string | null;
    description_ar: string | null;
    type: string;
    role: string;
    status: string;
    imageUrl: string | null;
    subscriptionPlan: string | null;
    subscriptionEndDate: string | null;
    displayType: string | null;
    contactMethods: any; // JSONB
    createdAt: string;
    password?: string; 
}

// Helper to map DB User to Partner (Database -> Frontend)
const mapDbToPartner = (row: UserRow): Partner => {
    if (!row) return null as unknown as Partner; 

    // 1. Handle Admin special case
    if (row.email === 'admin@onlyhelio.com' || row.email === 'tamer@onlyhelio.com') {
        row.type = 'admin';
        row.role = Role.SUPER_ADMIN;
    }

    // 2. Role Mapping
    let mappedRole = row.role as Role;
    const dbType = row.type as PartnerType;

    if (mappedRole === 'user' as any || !mappedRole) {
        if (dbType) {
            mappedRole = mapPartnerTypeToRole(dbType);
        } else {
             mappedRole = Role.AGENCY_PARTNER; 
        }
    }
    
    // Legacy fix
    if (mappedRole === 'super_admin' as any) mappedRole = Role.SUPER_ADMIN;

    // 3. Contact Methods Parsing
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

    // 4. Construct Partner Object
    return {
        id: row.id,
        email: row.email || '',
        imageUrl: row.imageUrl || 'https://via.placeholder.com/150',
        imageUrl_small: row.imageUrl || undefined,
        imageUrl_medium: row.imageUrl || undefined,
        imageUrl_large: row.imageUrl || undefined,
        
        type: (dbType || 'agency') as PartnerType,
        role: mappedRole, 
        status: (row.status || 'active') as PartnerStatus,
        
        subscriptionPlan: (row.subscriptionPlan || 'basic') as SubscriptionPlan,
        displayType: (row.displayType || 'standard') as any,
        
        // Use localized names directly from DB
        name: row.name_en || 'Unnamed User',
        nameAr: row.name_ar || 'مستخدم',
        
        description: row.description_en || '',
        descriptionAr: row.description_ar || '',
        
        contactMethods: contactMethods,
        subscriptionEndDate: row.subscriptionEndDate || undefined,
        createdAt: row.createdAt || new Date().toISOString()
    } as Partner;
};

// --- READ OPERATIONS ---

export const getAllPartners = async (): Promise<Partner[]> => {
    const { data, error } = await supabase.from('User').select('*').order('createdAt', { ascending: false });
    
    if (error) {
        console.error('Supabase fetch failed (getAllPartners):', error);
        return [];
    }
    return (data || []).map((row) => mapDbToPartner(row as UserRow));
};

export const getAllPartnersForAdmin = async (): Promise<AdminPartner[]> => {
    const { data, error } = await supabase.from('User').select('*').order('createdAt', { ascending: false });
    
    if (error) {
        console.error('Supabase fetch failed (getAllPartnersForAdmin):', error);
        return [];
    }
    return (data || []).map(row => mapDbToPartner(row as UserRow) as AdminPartner);
};

export const getPaginatedPartners = async (
    page: number, 
    limit: number, 
    filters?: { 
        type?: string; 
        status?: string; 
        query?: string;
        plan?: string;
    }
): Promise<{ partners: AdminPartner[]; total: number }> => {
    let query = supabase.from('User').select('*', { count: 'exact' });

    if (filters) {
        if (filters.type && filters.type !== 'all') {
            query = query.eq('type', filters.type);
        }
        if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }
        if (filters.plan && filters.plan !== 'all') {
            query = query.eq('subscriptionPlan', filters.plan);
        }
        if (filters.query) {
            const q = filters.query;
            query = query.or(`name_en.ilike.%${q}%,name_ar.ilike.%${q}%,email.ilike.%${q}%`);
        }
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
        .order('createdAt', { ascending: false })
        .range(from, to);

    if (error) {
        console.error("Error fetching paginated partners:", error);
        return { partners: [], total: 0 };
    }

    return {
        partners: (data || []).map(row => mapDbToPartner(row as UserRow) as AdminPartner),
        total: count || 0
    };
};

export const getPartnerById = async (id: string): Promise<Partner | undefined> => {
    const { data, error } = await supabase.from('User').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return mapDbToPartner(data as UserRow);
};

export const getPartnerByEmail = async (email: string): Promise<Partner | undefined> => {
    const { data, error } = await supabase.from('User').select('*').eq('email', email).single();
    if (error || !data) return undefined;
    return mapDbToPartner(data as UserRow);
};

// --- WRITE OPERATIONS ---

interface PartnerUpdatePayload {
    nameEn?: string;
    nameAr?: string;
    descriptionEn?: string;
    descriptionAr?: string;
    name?: string; // Fallback for nameEn
    description?: string; // Fallback for descriptionEn
    email?: string;
    imageUrl?: string;
    status?: PartnerStatus;
    type?: PartnerType;
    role?: Role;
    subscriptionPlan?: SubscriptionPlan;
    subscriptionEndDate?: string;
    displayType?: any;
    contactMethods?: any;
    password?: string;
}

export const updatePartner = async (id: string, updates: PartnerUpdatePayload): Promise<boolean> => {
    const dbUpdates: any = {};
    
    // Explicitly map frontend keys to DB columns
    if (updates.nameEn !== undefined) dbUpdates.name_en = updates.nameEn;
    if (updates.nameAr !== undefined) dbUpdates.name_ar = updates.nameAr;
    if (updates.descriptionEn !== undefined) dbUpdates.description_en = updates.descriptionEn;
    if (updates.descriptionAr !== undefined) dbUpdates.description_ar = updates.descriptionAr;
    
    // Fallbacks if only 'name' or 'description' is passed (legacy behavior support)
    // IMPORTANT: Check if nameEn/nameAr were explicitly provided first to avoid overwriting.
    if (updates.name !== undefined && updates.nameEn === undefined) dbUpdates.name_en = updates.name;
    if (updates.description !== undefined && updates.descriptionEn === undefined) dbUpdates.description_en = updates.description;

    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.imageUrl !== undefined) dbUpdates.imageUrl = updates.imageUrl;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    
    if (updates.type !== undefined) {
        dbUpdates.type = updates.type;
        dbUpdates.role = mapPartnerTypeToRole(updates.type);
    }
    
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.subscriptionPlan !== undefined) dbUpdates.subscriptionPlan = updates.subscriptionPlan;
    if (updates.subscriptionEndDate !== undefined) dbUpdates.subscriptionEndDate = updates.subscriptionEndDate;
    if (updates.displayType !== undefined) dbUpdates.displayType = updates.displayType;
    
    if (updates.contactMethods !== undefined) dbUpdates.contactMethods = updates.contactMethods;
    if (updates.password !== undefined && updates.password !== '') dbUpdates.password = updates.password;

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
    const newPartnerId = `partner-${Date.now()}`;
    const newPartner = {
        id: newPartnerId,
        name_en: request.companyName,
        name_ar: request.companyName, // Default AR name to company name until edited
        email: request.contactEmail,
        type: request.companyType,
        role: mapPartnerTypeToRole(request.companyType),
        status: initialStatus,
        imageUrl: request.logo || 'https://via.placeholder.com/150',
        subscriptionPlan: request.subscriptionPlan,
        createdAt: new Date().toISOString(),
        description_en: request.description,
        description_ar: request.description,
        password: 'password123' 
    };

    const { data, error } = await supabase.from('User').insert(newPartner).select().single();
    
    if (error) {
        console.error("Supabase Add Partner Error:", error);
        throw new Error(error.message);
    }
    
    return mapDbToPartner(data as UserRow);
};

export const deletePartner = async (userId: string): Promise<boolean> => {
    const { error } = await supabase.from('User').delete().eq('id', userId);
    if (error) throw error;
    return true;
};

export const updatePartnerDisplayType = async (id: string, displayType: any) => updatePartner(id, { displayType });
export const updatePartnerAdmin = async (id: string, updates: any) => updatePartner(id, updates);
export const upgradePartnerPlan = async (id: string, newPlan: SubscriptionPlan) => updatePartner(id, { subscriptionPlan: newPlan });

export const addInternalUser = async (userData: any): Promise<AdminPartner> => {
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
        createdAt: new Date().toISOString(),
        password: userData.password || 'password123'
    };

    const { data, error } = await supabase.from('User').insert(newUser).select().single();
    
    if (error) {
        console.error("Supabase Add Internal User Error:", error);
        throw new Error(error.message);
    }
    
    return mapDbToPartner(data as UserRow) as AdminPartner;
};

export const updateUser = updatePartner;
