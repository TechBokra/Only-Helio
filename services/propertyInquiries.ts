
import { supabase } from '../supabaseClient';
import type { PropertyInquiryRequest, RequestStatus } from '../types';
import { addNotification } from './notifications';

export const getAllPropertyInquiries = async (): Promise<PropertyInquiryRequest[]> => {
    const { data, error } = await supabase
        .from('PropertyInquiry')
        .select('*')
        .order('createdAt', { ascending: false });

    if (error) return [];
    return data || [];
};

export const addPropertyInquiry = async (data: Omit<PropertyInquiryRequest, 'id' | 'status' | 'createdAt'>): Promise<PropertyInquiryRequest> => {
    const newRequest = {
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
        .from('PropertyInquiry')
        .insert(newRequest)
        .select()
        .single();

    if (error) throw error;

    await addNotification({
        userId: 'admin-user',
        message: {
            ar: `طلب بحث عقاري جديد من "${inserted.customerName}".`,
            en: `New property search request from "${inserted.customerName}".`,
        },
        link: '/admin/property-inquiries',
    });

    return inserted;
};

export const updatePropertyInquiryStatus = async (id: string, status: RequestStatus): Promise<boolean> => {
    const { error } = await supabase
        .from('PropertyInquiry')
        .update({ status, updatedAt: new Date().toISOString() })
        .eq('id', id);
    return !error;
};

export const deletePropertyInquiry = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('PropertyInquiry').delete().eq('id', id);
    return !error;
};
