
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
    {
        id: 'finishing-partner-1',
        imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=150&h=150&fit=crop',
        email: 'finish@onlyhelio.com',
        password: 'password', 
        type: 'finishing', 
        status: 'active', 
        subscriptionPlan: 'professional',
        subscriptionEndDate: '2025-12-31T00:00:00Z', 
        displayType: 'featured',
        contactMethods: { 
            whatsapp: { enabled: true, number: '01012345678' }, 
            phone: { enabled: true, number: '01012345678' }, 
            form: { enabled: true } 
        },
        createdAt: '2023-06-01T00:00:00Z',
    },
];
