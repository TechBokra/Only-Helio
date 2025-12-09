
import { supabase } from '../lib/supabase';
import type { ContactMessageModel, RequestStatus } from '../types';
import { addNotification } from './notifications';

const TABLE_NAME = 'contact_messages';

const mapFromDB = (row: any): ContactMessageModel => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    message: row.message,
    inquiryType: row.inquiry_type,
    status: row.status as RequestStatus,
    createdAt: row.created_at
});

export const getContactMessages = async (): Promise<ContactMessageModel[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return [];
    return data.map(mapFromDB);
};

export const getContactMessageById = async (id: string): Promise<ContactMessageModel | null> => {
    if (!supabase) return null;
    
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return mapFromDB(data);
};

export const addContactMessage = async (
    msg: Omit<ContactMessageModel, 'id' | 'status' | 'createdAt'>
): Promise<ContactMessageModel | null> => {
    if (!supabase) return null;

    const payload = {
        name: msg.name,
        phone: msg.phone,
        email: msg.email,
        message: msg.message,
        inquiry_type: msg.inquiryType,
        status: 'new'
    };

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([payload])
        .select()
        .single();

    if (error) throw error;

    const newMsg = mapFromDB(data);

    addNotification({
        userId: 'customer-relations-manager-1',
        message: {
            ar: `رسالة جديدة من ${newMsg.name}`,
            en: `New message from ${newMsg.name}`
        },
        link: `/admin/communication/messages/${newMsg.id}`
    });

    return newMsg;
};

export const updateMessageStatus = async (id: string, status: RequestStatus): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await supabase.from(TABLE_NAME).update({ status }).eq('id', id);
    return !error;
};
