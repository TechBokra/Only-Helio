

import { partnerRequestsData as initialPartnerRequestsData } from '../data/partnerRequests';
import type { PartnerRequest } from '../types';
import { addNotification } from './notifications';

// Create a mutable, in-memory copy of the data to simulate a database.
let partnerRequestsData: PartnerRequest[] = [...initialPartnerRequestsData];

const SIMULATED_DELAY = 300;

export const getAllPartnerRequests = (): Promise<PartnerRequest[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...partnerRequestsData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, SIMULATED_DELAY);
  });
};

export const addPartnerRequest = (data: Omit<PartnerRequest, 'id' | 'status' | 'createdAt'>): Promise<PartnerRequest> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRequest: PartnerRequest = {
        ...data,
        id: `preq-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      partnerRequestsData.unshift(newRequest);
      
      addNotification({
        userId: 'partner-relations-manager-1',
        message: {
          ar: `لديك طلب انضمام شريك جديد من "${newRequest.companyName}".`,
          en: `New partner request from "${newRequest.companyName}".`,
        },
        link: `/admin/partner-requests/${newRequest.id}`,
      });

      resolve(newRequest);
    }, SIMULATED_DELAY);
  });
};

export const updatePartnerRequestStatus = (id: string, status: 'approved' | 'rejected'): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const requestIndex = partnerRequestsData.findIndex(r => r.id === id);
            if (requestIndex > -1) {
                partnerRequestsData[requestIndex].status = status;
                resolve(true);
            }
            resolve(false);
        }, SIMULATED_DELAY);
    });
};
