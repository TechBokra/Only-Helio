
import { supabase } from '../supabaseClient';
import type { AddPropertyRequest, RequestStatus } from '../types';
import { addNotification } from './notifications';

// Helper
const mapDbToPropRequest = (row: any): AddPropertyRequest => ({
    id: row.id,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    contactTime: row.contactTime,
    status: row.status,
    createdAt: row.createdAt,
    managerId: row.managerId,
    // Handle JSONB fields
    propertyDetails: typeof row.propertyDetails === 'string' ? JSON.parse(row.propertyDetails) : row.propertyDetails,
    images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []),
    cooperationType: row.cooperationType
});

export const getAllPropertyRequests = async (): Promise<AddPropertyRequest[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('PropertyListingRequest')
        .select('*')
        .order('createdAt', { ascending: false });

    if (error) {
        console.error("Error fetching property requests:", error);
        return [];
    }
    return data.map(mapDbToPropRequest);
};

export const addPropertyRequest = async (data: Omit<AddPropertyRequest, 'id' | 'status' | 'createdAt' | 'managerId'>): Promise<AddPropertyRequest> => {
    if (!supabase) throw new Error("Supabase not initialized");

    const newRequest = {
        id: `prop-req-${Date.now()}`,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        contactTime: data.contactTime,
        cooperationType: data.cooperationType,
        status: 'pending',
        createdAt: new Date().toISOString(),
        managerId: 'customer-relations-manager-1',
        propertyDetails: JSON.stringify(data.propertyDetails),
        images: JSON.stringify(data.images || [])
    };

    const { data: inserted, error } = await supabase.from('PropertyListingRequest').insert(newRequest).select().single();
    if (error) throw error;
    
    addNotification({
        userId: newRequest.managerId,
        message: {
            ar: `طلب عرض عقار جديد من "${newRequest.customerName}".`,
            en: `New property listing request from "${newRequest.customerName}".`,
        },
        link: `/admin/property-requests/${inserted.id}`,
    });

    return mapDbToPropRequest(inserted);
};

export const updatePropertyRequestStatus = async (id: string, status: RequestStatus): Promise<boolean> => {
    if (!supabase) return false;

    const { error } = await supabase
        .from('PropertyListingRequest')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error("Error updating property request:", error);
        return false;
    }
    return true;
};

export const deletePropertyRequest = async (id: string): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await supabase.from('PropertyListingRequest').delete().eq('id', id);
    return !error;
};
