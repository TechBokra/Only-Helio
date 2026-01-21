
import type { Lead } from '../types';

export let leadsData: Lead[] = [
    {
        id: 'lead-1',
        partnerId: 'dev-partner-1',
        propertyId: 'prop-1',
        serviceType: 'property',
        customerName: 'Ahmed Mohamed',
        customerPhone: '01012345678',
        serviceTitle: 'Inquiry about Luxury Apartment with Garden View',
        status: 'new',
        contactTime: 'Evening',
        customerNotes: 'Interested in payment plans.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        messages: []
    },
    {
        id: 'lead-2',
        partnerId: 'finish-partner-1',
        managerId: 'platform-finishing-manager-1', // Shared with platform manager
        serviceType: 'finishing',
        customerName: 'Sara Ahmed',
        customerPhone: '01123456789',
        serviceTitle: 'Finishing Request for Villa',
        status: 'contacted',
        contactTime: 'Morning',
        customerNotes: 'Needs 3D design first.',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
        messages: [
            {
                id: 'msg-1',
                sender: 'partner',
                senderId: 'finish-partner-1',
                type: 'note',
                content: 'Called customer, she is interested in the Ultra Lux package.',
                timestamp: new Date(Date.now() - 86400000 * 4).toISOString()
            }
        ]
    }
];
