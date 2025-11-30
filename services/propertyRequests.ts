
import { propertyRequestsData as initialPropertyRequestsData } from '../data/propertyRequests';
import type { AddPropertyRequest, RequestStatus } from '../types';
import { addNotification } from './notifications';

// Create a mutable, in-memory copy of the data to simulate a database.
let propertyRequestsData: AddPropertyRequest[] = [...initialPropertyRequestsData];

const SIMULATED_DELAY = 300;

export const getAllPropertyRequests = (): Promise<AddPropertyRequest[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...propertyRequestsData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, SIMULATED_DELAY);
  });
};

export const addPropertyRequest = (data: Omit<AddPropertyRequest, 'id' | 'status' | 'createdAt' | 'managerId'>): Promise<AddPropertyRequest> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRequest: AddPropertyRequest = {
        ...data,
        id: `prop-req-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        managerId: 'customer-relations-manager-1',
      };
      propertyRequestsData.unshift(newRequest);
      
      addNotification({
        userId: newRequest.managerId || 'admin-user', // Fallback
        message: {
          ar: `طلب عرض عقار جديد من "${newRequest.customerName}".`,
          en: `New property listing request from "${newRequest.customerName}".`,
        },
        link: `/admin/property-requests/${newRequest.id}`,
      });

      resolve(newRequest);
    }, SIMULATED_DELAY);
  });
};

export const updatePropertyRequestStatus = (id: string, status: RequestStatus): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const requestIndex = propertyRequestsData.findIndex(r => r.id === id);
            if (requestIndex > -1) {
                propertyRequestsData[requestIndex].status = status;
                resolve(true);
            }
            resolve(false);
        }, SIMULATED_DELAY);
    });
};

export const deletePropertyRequest = (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const initialLength = propertyRequestsData.length;
            propertyRequestsData = propertyRequestsData.filter(r => r.id !== id);
            if (propertyRequestsData.length < initialLength) {
                resolve(true);
            } else {
                resolve(false);
            }
        }, SIMULATED_DELAY);
    });
};
