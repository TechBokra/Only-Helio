
import type { AddPropertyRequest } from '../types';

export let propertyRequestsData: AddPropertyRequest[] = [
    {
        id: `prop-req-${Date.now() + 2}`,
        customerName: 'Sara Karim',
        customerPhone: '01122334455',
        cooperationType: 'commission',
        status: 'new',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        images: [],
        contactTime: 'morning',
        propertyDetails: {
            price: 7500000,
            address: 'Luxury Villa in Talala',
            propertyType: { en: 'Villa', ar: 'فيلا' },
            area: 500,
            description: { en: 'A great villa', ar: 'فيلا رائعة' }
        }
    },
    {
        id: `prop-req-${Date.now() + 3}`,
        customerName: 'Mohamed Fathy',
        customerPhone: '01233445566',
        cooperationType: 'paid_listing',
        status: 'new',
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        images: [],
        contactTime: 'evening',
        propertyDetails: {
            price: 2500000,
            address: 'Apartment 180m',
            propertyType: { en: 'Apartment', ar: 'شقة' },
            area: 180,
             description: { en: 'Nice apartment', ar: 'شقة جميلة' }
        }
    }
];
