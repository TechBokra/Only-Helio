
import { supabase } from '../lib/supabase';
import type { PropertyListingRequestModel, RequestStatus } from '../types';
import { addNotification } from './notifications';

const TABLE_NAME = 'property_listing_requests';

// Mapping from DB (Snake Case) to App (Camel Case)
const mapFromDB = (row: any): PropertyListingRequestModel => ({
    id: row.id,
    ownerName: row.owner_name,
    ownerPhone: row.owner_phone,
    contactTime: row.contact_time,
    cooperationType: row.cooperation_type,
    paymentStatus: row.payment_status,
    propertyType: {
        en: row.property_type_en,
        ar: row.property_type_ar
    },
    listingPurpose: row.listing_purpose,
    price: row.price,
    area: row.area,
    address: row.address,
    description: {
        en: row.description_en,
        ar: row.description_ar
    },
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    floorNumber: row.floor_number,
    finishingStatus: row.finishing_status_en ? {
        en: row.finishing_status_en,
        ar: row.finishing_status_ar
    } : undefined,
    isInCompound: row.is_in_compound,
    images: row.images || [],
    location: row.location_lat && row.location_lng ? {
        lat: row.location_lat,
        lng: row.location_lng
    } : undefined,
    status: row.status as RequestStatus,
    internalNotes: row.internal_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
});

export const getListingRequests = async (): Promise<PropertyListingRequestModel[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`Error fetching ${TABLE_NAME}:`, error);
        return [];
    }
    return data.map(mapFromDB);
};

export const getListingRequestById = async (id: string): Promise<PropertyListingRequestModel | null> => {
    if (!supabase) return null;
    
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return mapFromDB(data);
};

export const addListingRequest = async (
    request: Omit<PropertyListingRequestModel, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<PropertyListingRequestModel | null> => {
    if (!supabase) return null;

    const payload = {
        owner_name: request.ownerName,
        owner_phone: request.ownerPhone,
        contact_time: request.contactTime,
        cooperation_type: request.cooperationType,
        payment_status: request.paymentStatus || 'pending',
        property_type_en: request.propertyType.en,
        property_type_ar: request.propertyType.ar,
        listing_purpose: request.listingPurpose,
        price: request.price,
        area: request.area,
        address: request.address,
        description_en: request.description?.en,
        description_ar: request.description?.ar,
        bedrooms: request.bedrooms,
        bathrooms: request.bathrooms,
        floor_number: request.floorNumber,
        finishing_status_en: request.finishingStatus?.en,
        finishing_status_ar: request.finishingStatus?.ar,
        is_in_compound: request.isInCompound,
        images: request.images,
        location_lat: request.location?.lat,
        location_lng: request.location?.lng,
        status: 'new'
    };

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error(`Error adding to ${TABLE_NAME}:`, error);
        throw error;
    }

    const newRequest = mapFromDB(data);
    
    // Notify Admins
    addNotification({
        userId: 'admin-user', // or customer-relations-manager
        message: {
            ar: `طلب عرض عقار جديد من ${newRequest.ownerName}`,
            en: `New Property Listing Request from ${newRequest.ownerName}`
        },
        link: `/admin/properties/requests/${newRequest.id}`
    });

    return newRequest;
};

export const updateListingRequestStatus = async (id: string, status: RequestStatus, notes?: string): Promise<boolean> => {
    if (!supabase) return false;

    const updates: any = { status, updated_at: new Date().toISOString() };
    if (notes !== undefined) updates.internal_notes = notes;

    const { error } = await supabase
        .from(TABLE_NAME)
        .update(updates)
        .eq('id', id);

    return !error;
};
