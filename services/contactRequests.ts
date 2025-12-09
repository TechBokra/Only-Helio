
import { getContactMessages, addContactMessage, updateMessageStatus } from './messages';
import type { ContactRequest, RequestStatus } from '../types';

const mapToUI = (item: any): ContactRequest => ({
    id: item.id,
    name: item.name,
    phone: item.phone,
    message: item.message,
    inquiryType: item.inquiryType || 'general',
    status: item.status,
    createdAt: item.createdAt
});

export const getAllContactRequests = async (): Promise<ContactRequest[]> => {
    const raw = await getContactMessages();
    return raw.map(mapToUI);
};

export const addContactRequest = async (data: Omit<ContactRequest, 'id' | 'status' | 'createdAt' | 'managerId'>): Promise<ContactRequest> => {
    const res = await addContactMessage({
        name: data.name,
        phone: data.phone,
        email: '', // ContactRequest UI type doesn't have email, but DB does. Can be added later.
        message: data.message,
        inquiryType: data.inquiryType
    });
    
    if(!res) throw new Error("Failed to add contact message");
    return mapToUI(res);
};

export const updateContactRequestStatus = async (id: string, status: RequestStatus): Promise<boolean> => {
    return updateMessageStatus(id, status);
};

export const deleteContactRequest = async (id: string): Promise<boolean> => {
    // Soft delete or implement hard delete in messages service
    return updateMessageStatus(id, 'closed');
};
