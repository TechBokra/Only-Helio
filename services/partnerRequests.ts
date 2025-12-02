
import { getAllRequests, addRequest, updateRequest } from './requests';
import type { PartnerRequest } from '../types';
import { RequestType } from '../types';

// Wrapper service to filter general requests for Partner Applications
// This ensures we read from the same database source (Supabase) via the central service

export const getAllPartnerRequests = async (): Promise<PartnerRequest[]> => {
  const all = await getAllRequests();
  return all
    .filter(r => r.type === RequestType.PARTNER_APPLICATION)
    .map(r => ({
        ...r.payload as PartnerRequest,
        id: r.id,
        status: r.status,
        createdAt: r.createdAt
    }));
};

export const addPartnerRequest = async (data: Omit<PartnerRequest, 'id' | 'status' | 'createdAt'>): Promise<PartnerRequest> => {
    const req = await addRequest(RequestType.PARTNER_APPLICATION, {
        requesterInfo: { 
            name: data.contactName, 
            phone: data.contactPhone, 
            email: data.contactEmail 
        },
        payload: data
    });
    // Use 'as any' to merge payload with top-level props safely
    return { ...(req.payload as any), id: req.id, status: req.status, createdAt: req.createdAt };
};

export const updatePartnerRequestStatus = async (id: string, status: 'approved' | 'rejected'): Promise<boolean> => {
    const updated = await updateRequest(id, { status });
    return !!updated;
};
