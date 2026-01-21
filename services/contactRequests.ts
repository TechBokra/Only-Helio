
import { supabase } from '../supabaseClient';
import type { ContactRequest, RequestStatus } from '../types';
import { addNotification } from './notifications';

export const getAllContactRequests = async (): Promise<ContactRequest[]> => {
    const { data, error } = await supabase
        .from('ContactRequest')
        .select('*')
        .order('createdAt', { ascending: false });

    if (error) return [];
    return data || [];
};

export const addContactRequest = async (data: Omit<ContactRequest, 'id' | 'status' | 'createdAt' | 'managerId'>): Promise<ContactRequest> => {
    const newRequest = {
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString(),
        managerId: 'customer-relations-manager-1', // Default routing
    };

    const { data: inserted, error } = await supabase
        .from('ContactRequest')
        .insert(newRequest)
        .select()
        .single();

    if (error) throw error;

    // Notify Admin/Manager
    // In a real app, you'd fetch the actual manager ID. For now, defaulting to admin-user fallback if manager not found
    await addNotification({
        userId: 'admin-user', 
        message: {
            ar: `رسالة تواصل جديدة من "${inserted.name}".`,
            en: `New contact message from "${inserted.name}".`,
        },
        link: '/admin/contact-requests',
    });

    return inserted;
};

export const updateContactRequestStatus = async (id: string, status: RequestStatus): Promise<boolean> => {
    const { error } = await supabase
        .from('ContactRequest')
        .update({ status, updatedAt: new Date().toISOString() })
        .eq('id', id);
    return !error;
};

export const deleteContactRequest = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('ContactRequest').delete().eq('id', id);
    return !error;
};
