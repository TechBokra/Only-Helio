import { propertyInquiriesData as initialPropertyInquiriesData } from '../data/propertyInquiries';
import type { PropertyInquiryRequest, RequestStatus } from '../types';

// Create a mutable, in-memory copy of the data to simulate a database.
let propertyInquiriesData: PropertyInquiryRequest[] = [...initialPropertyInquiriesData];

const SIMULATED_DELAY = 300;

export const getAllPropertyInquiries = (): Promise<PropertyInquiryRequest[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...propertyInquiriesData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, SIMULATED_DELAY);
  });
};

export const addPropertyInquiry = (data: Omit<PropertyInquiryRequest, 'id' | 'status' | 'createdAt'>): Promise<PropertyInquiryRequest> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRequest: PropertyInquiryRequest = {
        ...data,
        id: `inquiry-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      propertyInquiriesData.unshift(newRequest);
      resolve(newRequest);
    }, SIMULATED_DELAY);
  });
};

export const updatePropertyInquiryStatus = (id: string, status: RequestStatus): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const requestIndex = propertyInquiriesData.findIndex(r => r.id === id);
            if (requestIndex > -1) {
                propertyInquiriesData[requestIndex].status = status;
                resolve(true);
            }
            resolve(false);
        }, SIMULATED_DELAY);
    });
};

export const deletePropertyInquiry = (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const initialLength = propertyInquiriesData.length;
            propertyInquiriesData = propertyInquiriesData.filter(r => r.id !== id);
            if (propertyInquiriesData.length < initialLength) {
                resolve(true);
            } else {
                resolve(false);
            }
        }, SIMULATED_DELAY);
    });
};
