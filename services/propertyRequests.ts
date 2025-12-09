
import { getListingRequests, addListingRequest, updateListingRequestStatus } from './listingRequests';
import type { AddPropertyRequest, RequestStatus } from '../types';

// MAPPING: ListingRequestModel -> AddPropertyRequest (UI Model)
const mapToUI = (item: any): AddPropertyRequest => ({
    id: item.id,
    customerName: item.ownerName,
    customerPhone: item.ownerPhone,
    contactTime: item.contactTime,
    status: item.status,
    createdAt: item.createdAt,
    cooperationType: item.cooperationType,
    images: item.images,
    propertyDetails: {
        price: item.price,
        area: item.area,
        address: item.address,
        description: item.description,
        propertyType: item.propertyType,
        purpose: item.listingPurpose ? { en: item.listingPurpose, ar: item.listingPurpose === 'For Sale' ? 'للبيع' : 'إيجار' } : undefined,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        floor: item.floorNumber,
        finishingStatus: item.finishingStatus,
        isInCompound: item.isInCompound,
        location: item.location
    }
});

export const getAllPropertyRequests = async (): Promise<AddPropertyRequest[]> => {
    const raw = await getListingRequests();
    return raw.map(mapToUI);
};

export const addPropertyRequest = async (data: Omit<AddPropertyRequest, 'id' | 'status' | 'createdAt' | 'managerId'>): Promise<AddPropertyRequest> => {
    // Map UI payload to DB payload
    const res = await addListingRequest({
        ownerName: data.customerName,
        ownerPhone: data.customerPhone,
        contactTime: data.contactTime,
        cooperationType: data.cooperationType as 'commission' | 'paid_listing',
        propertyType: data.propertyDetails.propertyType || { en: '', ar: '' },
        listingPurpose: (data.propertyDetails.purpose?.en as 'For Sale' | 'For Rent') || 'For Sale',
        price: data.propertyDetails.price || 0,
        area: data.propertyDetails.area || 0,
        address: data.propertyDetails.address || '',
        description: data.propertyDetails.description || { en: '', ar: '' },
        bedrooms: data.propertyDetails.bedrooms || 0,
        bathrooms: data.propertyDetails.bathrooms || 0,
        floorNumber: data.propertyDetails.floor || 0,
        finishingStatus: data.propertyDetails.finishingStatus,
        isInCompound: data.propertyDetails.isInCompound || false,
        images: data.images || [],
        location: data.propertyDetails.location,
        paymentStatus: (data as any).paymentStatus || 'pending' // passed from payment flow
    });

    if (!res) throw new Error("Failed to add listing request");
    return mapToUI(res);
};

export const updatePropertyRequestStatus = async (id: string, status: RequestStatus): Promise<boolean> => {
    return updateListingRequestStatus(id, status);
};

export const deletePropertyRequest = async (id: string): Promise<boolean> => {
    return updateListingRequestStatus(id, 'closed'); // Soft delete
};
