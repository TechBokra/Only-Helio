
import type { PartnerRequest } from '../types';

export let partnerRequestsData: PartnerRequest[] = [
    {
        id: `req-${Date.now() + 1}`,
        companyName: 'MarketPro Agency',
        companyType: 'agency',
        contactName: 'Ali Hassan',
        contactPhone: '01011223344',
        contactEmail: 'ali@marketpro.com',
        description: 'A leading real estate marketing agency.',
        subscriptionPlan: 'professional',
        status: 'new',
        createdAt: new Date().toISOString(),
    }
];
