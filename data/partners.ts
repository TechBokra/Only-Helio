
import type { Partner } from '../types';

// نبقي فقط على حساب المدير العام لتتمكن من الدخول والبدء في الإدخال اليدوي
// Email: admin@onlyhelio.com
// Password: password
export let partnersData: (Omit<Partner, 'name' | 'description' | 'role'> & { password?: string })[] = [
    {
        id: 'admin-user',
        imageUrl: 'https://via.placeholder.com/150',
        email: 'admin@onlyhelio.com',
        password: 'password', 
        type: 'admin', 
        status: 'active', 
        subscriptionPlan: 'elite',
        subscriptionEndDate: '2099-12-31T00:00:00Z', 
        displayType: 'standard',
        contactMethods: { 
            whatsapp: { enabled: false, number: '' }, 
            phone: { enabled: false, number: '' }, 
            form: { enabled: true } 
        },
        createdAt: '2023-01-01T00:00:00Z',
    },
    {
        id: 'individual-listings',
        imageUrl: 'https://via.placeholder.com/150?text=Individual',
        email: 'listings@onlyhelio.com',
        password: 'password', 
        type: 'agency', 
        status: 'active', 
        subscriptionPlan: 'basic',
        subscriptionEndDate: '2099-12-31T00:00:00Z', 
        displayType: 'standard',
        contactMethods: { 
            whatsapp: { enabled: false, number: '' }, 
            phone: { enabled: false, number: '' }, 
            form: { enabled: true } 
        },
        createdAt: '2023-01-01T00:00:00Z',
    },
];
