
import type { PropertyInquiryRequest } from '../types';

export let propertyInquiriesData: PropertyInquiryRequest[] = [
    {
        id: `inq-req-${Date.now() + 5}`,
        customerName: 'Yasser Amin',
        customerPhone: '01099887766',
        details: 'Looking for a standalone villa, min 400m with private garden, budget around 8M EGP.',
        status: 'new',
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    }
];
