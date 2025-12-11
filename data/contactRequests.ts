
import type { ContactRequest } from '../types';

export let contactRequestsData: ContactRequest[] = [
    {
        id: `cont-req-${Date.now() + 4}`,
        name: 'Hala Mostafa',
        phone: '01544332211',
        message: 'I would like to inquire about partnership packages for developers.',
        inquiryType: 'partner',
        status: 'new',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    }
];
