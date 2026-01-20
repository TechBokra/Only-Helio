
import { supabase } from '../supabaseClient';
import type { PartnerRequest } from '../types';
import { addNotification } from './notifications';

// Helper to map DB row to PartnerRequest
const mapDbToRequest = (row: any): PartnerRequest => ({
    id: row.id,
    companyName: row.companyName,
    companyType: row.companyType,
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    description: row.description,
    website: row.website,
    companyAddress: row.companyAddress,
    logo: row.logo,
    documents: typeof row.documents === 'string' ? JSON.parse(row.documents) : (row.documents || []),
    managementContacts: typeof row.managementContacts === 'string' ? JSON.parse(row.managementContacts) : (row.managementContacts || []),
    subscriptionPlan: row.subscriptionPlan,
    status: row.status,
    createdAt: row.createdAt
});

export const getAllPartnerRequests = async (): Promise<PartnerRequest[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('PartnerRequest')
        .select('*')
        .order('createdAt', { ascending: false });

    if (error) {
        console.error("Error fetching partner requests:", error);
        return [];
    }
    return data.map(mapDbToRequest);
};

export const addPartnerRequest = async (data: Omit<PartnerRequest, 'id' | 'status' | 'createdAt'>): Promise<PartnerRequest> => {
    if (!supabase) throw new Error("Supabase not initialized");

    const newRequest = {
        ...data,
        id: `preq-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        // Pass objects directly for JSONB columns
        documents: data.documents || [],
        managementContacts: data.managementContacts || []
    };

    const { data: inserted, error } = await supabase.from('PartnerRequest').insert(newRequest).select().single();
    if (error) throw error;

    // Notification
    addNotification({
        userId: 'partner-relations-manager-1',
        message: {
            ar: `لديك طلب انضمام شريك جديد من "${data.companyName}".`,
            en: `New partner request from "${data.companyName}".`,
        },
        link: `/admin/partner-requests/${inserted.id}`,
    });

    return mapDbToRequest(inserted);
};

export const updatePartnerRequestStatus = async (id: string, status: 'approved' | 'rejected'): Promise<boolean> => {
    if (!supabase) return false;

    const { error } = await supabase
        .from('PartnerRequest')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error("Error updating partner request:", error);
        return false;
    }
    return true;
};
