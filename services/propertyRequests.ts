
import { getAllRequests, addRequest, updateRequest } from './requests';
import type { AddPropertyRequest, RequestStatus } from '../types';
import { RequestType } from '../types';

// Wrapper service to filter general requests for Property Listing Requests

export const getAllPropertyRequests = async (): Promise<AddPropertyRequest[]> => {
  const all = await getAllRequests();
  return all
    .filter(r => r.type === RequestType.PROPERTY_LISTING_REQUEST)
    .map(r => ({
        ...r.payload as AddPropertyRequest,
        id: r.id,
        status: r.status,
        createdAt: r.createdAt
    }));
};

export const addPropertyRequest = async (data: Omit<AddPropertyRequest, 'id' | 'status' | 'createdAt' | 'managerId'>): Promise<AddPropertyRequest> => {
    const req = await addRequest(RequestType.PROPERTY_LISTING_REQUEST, {
        requesterInfo: { name: data.customerName, phone: data.customerPhone },
        payload: data
    });
    // Use 'as any' to merge payload with top-level props safely
    return { ...(req.payload as any), id: req.id, status: req.status, createdAt: req.createdAt };
};

export const updatePropertyRequestStatus = async (id: string, status: RequestStatus): Promise<boolean> => {
    const updated = await updateRequest(id, { status });
    return !!updated;
};

export const deletePropertyRequest = async (id: string): Promise<boolean> => {
    // Soft delete by setting status to closed/rejected or implement hard delete in requests.ts if needed
    const updated = await updateRequest(id, { status: 'closed' });
    return !!updated;
};
