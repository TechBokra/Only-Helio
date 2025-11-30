
import { contactRequestsData as initialContactRequestsData } from '../data/contactRequests';
import type { ContactRequest, RequestStatus } from '../types';
import { addNotification } from './notifications';

// Create a mutable, in-memory copy of the data to simulate a database.
let contactRequestsData: ContactRequest[] = [...initialContactRequestsData];

const SIMULATED_DELAY = 300;

export const getAllContactRequests = (): Promise<ContactRequest[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...contactRequestsData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, SIMULATED_DELAY);
  });
};

export const addContactRequest = (data: Omit<ContactRequest, 'id' | 'status' | 'createdAt' | 'managerId'>): Promise<ContactRequest> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRequest: ContactRequest = {
        ...data,
        id: `contact-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        managerId: 'customer-relations-manager-1',
      };
      contactRequestsData.unshift(newRequest);

      addNotification({
        userId: newRequest.managerId || 'admin-user', // Fallback if managerId is undefined
        message: {
          ar: `رسالة تواصل جديدة من "${newRequest.name}".`,
          en: `New contact message from "${newRequest.name}".`,
        },
        link: '/admin/contact-requests',
      });

      resolve(newRequest);
    }, SIMULATED_DELAY);
  });
};

export const updateContactRequestStatus = (id: string, status: RequestStatus): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const requestIndex = contactRequestsData.findIndex(r => r.id === id);
            if (requestIndex > -1) {
                contactRequestsData[requestIndex].status = status;
                resolve(true);
            }
            resolve(false);
        }, SIMULATED_DELAY);
    });
};

export const deleteContactRequest = (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const initialLength = contactRequestsData.length;
            contactRequestsData = contactRequestsData.filter(r => r.id !== id);
            if (contactRequestsData.length < initialLength) {
                resolve(true);
            } else {
                resolve(false);
            }
        }, SIMULATED_DELAY);
    });
};
