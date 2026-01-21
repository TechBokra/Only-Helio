
import type { Partner } from '../types';

export let partnersData: (Omit<Partner, 'name' | 'description' | 'role'> & { password?: string })[] = [
    // 1. Super Admin
    {
        id: 'admin-user',
        imageUrl: 'https://ui-avatars.com/api/?name=Super+Admin&background=f59e0b&color=fff&size=256',
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
    // 2. Individual Listings Account (Platform)
    {
        id: 'individual-listings',
        imageUrl: 'https://ui-avatars.com/api/?name=Indiv&background=333&color=fff',
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
    // 3. Developer Partner
    {
        id: 'dev-partner-1',
        imageUrl: 'https://images.unsplash.com/photo-1486406149226-8fc5f2e293a0?w=150&h=150&fit=crop',
        email: 'dev@heliopolis.com',
        password: 'password',
        type: 'developer',
        status: 'active',
        subscriptionPlan: 'elite',
        displayType: 'mega_project',
        contactMethods: {
            whatsapp: { enabled: true, number: '01000000001' },
            phone: { enabled: true, number: '01000000001' },
            form: { enabled: true }
        },
        createdAt: '2023-05-15T00:00:00Z',
    },
    // 4. Finishing Partner
    {
        id: 'finish-partner-1',
        imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=150&h=150&fit=crop',
        email: 'finish@decor.com',
        password: 'password', 
        type: 'finishing', 
        status: 'active', 
        subscriptionPlan: 'professional',
        subscriptionEndDate: '2025-12-31T00:00:00Z', 
        displayType: 'featured',
        contactMethods: { 
            whatsapp: { enabled: true, number: '01222222222' }, 
            phone: { enabled: true, number: '01222222222' }, 
            form: { enabled: true } 
        },
        createdAt: '2023-06-01T00:00:00Z',
    },
    // 5. Real Estate Agency
    {
        id: 'agency-partner-1',
        imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop',
        email: 'sales@broker.com',
        password: 'password',
        type: 'agency',
        status: 'active',
        subscriptionPlan: 'basic',
        displayType: 'standard',
        contactMethods: {
            whatsapp: { enabled: true, number: '01111111111' },
            phone: { enabled: true, number: '01111111111' },
            form: { enabled: true }
        },
        createdAt: '2023-06-15T00:00:00Z',
    },
    // 6. Internal Managers
    {
        id: 'decoration-manager-1',
        imageUrl: 'https://ui-avatars.com/api/?name=Decor+Mgr&background=ec4899&color=fff',
        email: 'decor@onlyhelio.com',
        password: 'password',
        type: 'decoration_manager',
        status: 'active',
        subscriptionPlan: 'basic',
        displayType: 'standard',
        contactMethods: { whatsapp: { enabled: false, number: '' }, phone: { enabled: false, number: '' }, form: { enabled: true } },
        createdAt: '2023-01-01T00:00:00Z',
    },
    {
        id: 'platform-finishing-manager-1',
        imageUrl: 'https://ui-avatars.com/api/?name=Finish+Mgr&background=f59e0b&color=fff',
        email: 'finishing-mgr@onlyhelio.com',
        password: 'password',
        type: 'platform_finishing_manager',
        status: 'active',
        subscriptionPlan: 'basic',
        displayType: 'standard',
        contactMethods: { whatsapp: { enabled: false, number: '' }, phone: { enabled: false, number: '' }, form: { enabled: true } },
        createdAt: '2023-01-01T00:00:00Z',
    },
    {
        id: 'partner-relations-manager-1',
        imageUrl: 'https://ui-avatars.com/api/?name=Partner+Rel&background=3b82f6&color=fff',
        email: 'partners@onlyhelio.com',
        password: 'password',
        type: 'partner_relations_manager',
        status: 'active',
        subscriptionPlan: 'basic',
        displayType: 'standard',
        contactMethods: { whatsapp: { enabled: false, number: '' }, phone: { enabled: false, number: '' }, form: { enabled: true } },
        createdAt: '2023-01-01T00:00:00Z',
    },
    {
        id: 'customer-relations-manager-1',
        imageUrl: 'https://ui-avatars.com/api/?name=CRM&background=10b981&color=fff',
        email: 'crm@onlyhelio.com',
        password: 'password',
        type: 'customer_relations_manager',
        status: 'active',
        subscriptionPlan: 'basic',
        displayType: 'standard',
        contactMethods: { whatsapp: { enabled: false, number: '' }, phone: { enabled: false, number: '' }, form: { enabled: true } },
        createdAt: '2023-01-01T00:00:00Z',
    },
    {
        id: 'listings-manager-1',
        imageUrl: 'https://ui-avatars.com/api/?name=Listings&background=6366f1&color=fff',
        email: 'listings-mgr@onlyhelio.com',
        password: 'password',
        type: 'listings_manager',
        status: 'active',
        subscriptionPlan: 'basic',
        displayType: 'standard',
        contactMethods: { whatsapp: { enabled: false, number: '' }, phone: { enabled: false, number: '' }, form: { enabled: true } },
        createdAt: '2023-01-01T00:00:00Z',
    }
];
