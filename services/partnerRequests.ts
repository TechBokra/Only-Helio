
import { getPartnerApplications, addPartnerApplication, updatePartnerApplicationStatus } from './partnerApps';
import type { PartnerRequest } from '../types';

// MAPPING
const mapToUI = (item: any): PartnerRequest => ({
    id: item.id,
    companyName: item.companyName,
    companyType: item.companyType,
    companyAddress: item.companyAddress || '', // Ensure mapping includes address
    description: item.description,
    website: item.website,
    contactName: item.contactName,
    contactEmail: item.contactEmail,
    contactPhone: item.contactPhone,
    subscriptionPlan: item.subscriptionPlan,
    status: item.status,
    createdAt: item.createdAt,
    logo: item.logoUrl,
    documents: item.documents.map((d: string) => ({ fileName: 'Document', fileContent: d }))
});

export const getAllPartnerRequests = async (): Promise<PartnerRequest[]> => {
    const raw = await getPartnerApplications();
    return raw.map(mapToUI);
};

export const addPartnerRequest = async (data: Omit<PartnerRequest, 'id' | 'status' | 'createdAt'>): Promise<PartnerRequest> => {
    const res = await addPartnerApplication({
        companyName: data.companyName,
        companyType: data.companyType as any,
        companyAddress: data.companyAddress, // Added
        description: data.description,
        website: data.website,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        subscriptionPlan: data.subscriptionPlan,
        logoUrl: data.logo,
        documents: data.documents?.map(d => d.fileContent) || [],
        paymentStatus: (data as any).paymentStatus || 'pending'
    });
    
    if(!res) throw new Error("Failed to add partner request");
    return mapToUI(res);
};

export const updatePartnerRequestStatus = async (id: string, status: 'approved' | 'rejected'): Promise<boolean> => {
    return updatePartnerApplicationStatus(id, status);
};
