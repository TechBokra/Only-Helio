
import { getListingRequests, getListingRequestById, updateListingRequestStatus, addListingRequest } from './listingRequests';
import { getPartnerApplications, updatePartnerApplicationStatus, addPartnerApplication } from './partnerApps';
import { getContactMessages, updateMessageStatus, addContactMessage } from './messages';
import { getAllLeads, getLeadById, updateLead, addLead } from './leads';
import type { Request, RequestStatus, LeadMessage } from '../types';
import { RequestType } from '../types';
import { getAllRoutingRules } from './routingRules'; // Import the rules service

// --- MAPPING HELPERS ---
const mapListingToRequest = (item: any): Request => ({
    id: item.id,
    type: RequestType.PROPERTY_LISTING_REQUEST,
    status: item.status,
    assignedTo: 'customer-relations-manager-1',
    assignedToName: 'Customer Relations',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    requesterInfo: {
        name: item.ownerName,
        phone: item.ownerPhone,
    },
    payload: {
        cooperationType: item.cooperationType,
        paymentStatus: item.paymentStatus,
        contactTime: item.contactTime,
        propertyDetails: {
            price: item.price,
            area: item.area,
            address: item.address,
            description: item.description,
            propertyType: item.propertyType,
            listingPurpose: item.listingPurpose,
            bedrooms: item.bedrooms,
            bathrooms: item.bathrooms,
            floor: item.floorNumber,
            finishingStatus: item.finishingStatus,
            isInCompound: item.isInCompound,
            location: item.location
        },
        images: item.images
    }
});

const mapAppToRequest = (item: any): Request => ({
    id: item.id,
    type: RequestType.PARTNER_APPLICATION,
    status: item.status,
    assignedTo: 'partner-relations-manager-1',
    assignedToName: 'Partner Relations',
    createdAt: item.createdAt,
    updatedAt: item.createdAt,
    requesterInfo: {
        name: item.contactName,
        phone: item.contactPhone,
        email: item.contactEmail
    },
    payload: {
        companyName: item.companyName,
        companyType: item.companyType,
        companyAddress: item.companyAddress,
        description: item.description,
        website: item.website,
        subscriptionPlan: item.subscriptionPlan,
        paymentStatus: item.paymentStatus,
        logo: item.logoUrl,
        documents: item.documents.map((d: string) => ({ fileName: 'Document', fileContent: d }))
    }
});

const mapMsgToRequest = (item: any): Request => ({
    id: item.id,
    type: RequestType.CONTACT_MESSAGE,
    status: item.status,
    assignedTo: 'customer-relations-manager-1',
    assignedToName: 'Customer Relations',
    createdAt: item.createdAt,
    updatedAt: item.createdAt,
    requesterInfo: {
        name: item.name,
        phone: item.phone,
        email: item.email
    },
    payload: {
        message: item.message,
        inquiryType: item.inquiryType
    }
});

const mapLeadToRequest = (item: any): Request => ({
    id: item.id,
    type: RequestType.LEAD,
    status: item.status === 'new' ? 'new' : (['completed', 'cancelled'].includes(item.status) ? 'closed' : 'in-progress') as RequestStatus,
    assignedTo: item.assignedTo || item.managerId || item.partnerId,
    assignedToName: item.partnerName,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    requesterInfo: {
        name: item.customerName,
        phone: item.customerPhone,
    },
    payload: item 
});

// --- HELPER: ROUTING ENGINE ---
// This function evaluates the request against all active routing rules
const determineAssignee = async (type: RequestType, payload: any): Promise<string | undefined> => {
    try {
        const rules = await getAllRoutingRules();
        const activeRules = rules.filter(r => r.active);

        // Flatten data for easier condition checking
        const requestContext = {
            type,
            payload
        };

        const getValue = (obj: any, path: string) => {
            return path.split('.').reduce((o, i) => o?.[i], obj);
        };

        for (const rule of activeRules) {
            let match = true;
            for (const condition of rule.conditions) {
                const actualValue = getValue(requestContext, condition.field);
                const targetValue = condition.value;
                
                // Type-safe comparison
                switch (condition.operator) {
                    case 'equals':
                        if (String(actualValue) != String(targetValue)) match = false;
                        break;
                    case 'not_equals':
                        if (String(actualValue) == String(targetValue)) match = false;
                        break;
                    case 'contains':
                        if (!String(actualValue).toLowerCase().includes(String(targetValue).toLowerCase())) match = false;
                        break;
                    case 'greater_than':
                        if (Number(actualValue) <= Number(targetValue)) match = false;
                        break;
                    case 'less_than':
                        if (Number(actualValue) >= Number(targetValue)) match = false;
                        break;
                }
                if (!match) break; // Rule failed, move to next rule
            }

            if (match) {
                console.log(`[Routing] Rule matched: "${rule.name.en}". Assigning to ${rule.action.assignTo}`);
                return rule.action.assignTo;
            }
        }
    } catch (error) {
        console.error("Error in routing engine:", error);
    }
    return undefined; // No rule matched
};


// --- AGGREGATOR FUNCTIONS ---

export const getAllRequests = async (): Promise<Request[]> => {
    const [listings, apps, msgs, leads] = await Promise.all([
        getListingRequests(),
        getPartnerApplications(),
        getContactMessages(),
        getAllLeads()
    ]);

    const requests = [
        ...listings.map(mapListingToRequest),
        ...apps.map(mapAppToRequest),
        ...msgs.map(mapMsgToRequest),
        ...leads.map(mapLeadToRequest)
    ];

    return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getRequestById = async (id: string): Promise<Request | undefined> => {
    const lead = await getLeadById(id);
    if (lead) return mapLeadToRequest(lead);

    const listing = await getListingRequestById(id);
    if (listing) return mapListingToRequest(listing);

    const apps = await getPartnerApplications();
    const app = apps.find(a => a.id === id);
    if (app) return mapAppToRequest(app);

    const msgs = await getContactMessages();
    const msg = msgs.find(m => m.id === id);
    if (msg) return mapMsgToRequest(msg);

    return undefined;
};

export const updateRequest = async (id: string, updates: Partial<Request>): Promise<Request | undefined> => {
    // 1. Try Lead
    const lead = await getLeadById(id);
    if (lead) {
        const leadUpdates: any = {};
        if (updates.status === 'new') leadUpdates.status = 'new';
        else if (updates.status === 'closed') leadUpdates.status = 'completed';
        else if (updates.status === 'rejected') leadUpdates.status = 'cancelled';
        else if (updates.status) leadUpdates.status = 'in-progress';
        
        if (updates.assignedTo) leadUpdates.assignedTo = updates.assignedTo;
        if (updates.payload) {
             // Allow updating specific payload fields like internal notes if simulated
        }

        await updateLead(id, leadUpdates);
        const updated = await getLeadById(id);
        return updated ? mapLeadToRequest(updated) : undefined;
    }

    // 2. Try Listing
    const listing = await getListingRequestById(id);
    if (listing) {
        await updateListingRequestStatus(id, updates.status || listing.status);
        const updated = await getListingRequestById(id);
        return updated ? mapListingToRequest(updated) : undefined;
    }

    // 3. Partner App
    const apps = await getPartnerApplications();
    const app = apps.find(a => a.id === id);
    if (app) {
         await updatePartnerApplicationStatus(id, updates.status || app.status);
         return { ...mapAppToRequest(app), status: updates.status || app.status };
    }

    // 4. Message
    const msgs = await getContactMessages();
    const msg = msgs.find(m => m.id === id);
    if (msg) {
        await updateMessageStatus(id, updates.status || msg.status);
        return { ...mapMsgToRequest(msg), status: updates.status || msg.status };
    }

    return undefined;
};

export const addRequest = async (type: RequestType, data: any): Promise<any> => {
    const { requesterInfo, payload } = data;
    
    // 1. Execute Routing Engine to get Assignee
    // This allows the Admin > Automation Rules to effectively route the request
    const assignedTo = await determineAssignee(type, payload);

    switch (type) {
        case RequestType.LEAD:
            return addLead({
                ...payload,
                customerName: requesterInfo.name,
                customerPhone: requesterInfo.phone,
                assignedTo: assignedTo || payload.managerId || payload.partnerId, // Use routed assignee or fallback
            });
            
        case RequestType.PROPERTY_LISTING_REQUEST:
            return addListingRequest({
                ownerName: requesterInfo.name,
                ownerPhone: requesterInfo.phone,
                contactTime: payload.contactTime,
                cooperationType: payload.cooperationType,
                propertyType: payload.propertyDetails.propertyType,
                listingPurpose: payload.propertyDetails.purpose?.en || 'For Sale',
                price: payload.propertyDetails.price,
                area: payload.propertyDetails.area,
                address: payload.propertyDetails.address,
                description: payload.propertyDetails.description,
                bedrooms: payload.propertyDetails.bedrooms,
                bathrooms: payload.propertyDetails.bathrooms,
                floorNumber: payload.propertyDetails.floor,
                finishingStatus: payload.propertyDetails.finishingStatus,
                isInCompound: payload.propertyDetails.isInCompound,
                images: payload.images,
                location: payload.propertyDetails.location,
                paymentStatus: payload.paymentStatus
                // Note: Listing Requests don't strictly support 'assignedTo' column in this mock yet, 
                // but if they did, we would pass `assignedTo` here.
            });

        case RequestType.PARTNER_APPLICATION:
             return addPartnerApplication({
                 companyName: payload.companyName,
                 companyType: payload.companyType,
                 companyAddress: payload.companyAddress || '',
                 description: payload.description,
                 website: payload.website,
                 contactName: requesterInfo.name,
                 contactEmail: requesterInfo.email,
                 contactPhone: requesterInfo.phone,
                 subscriptionPlan: payload.subscriptionPlan,
                 logoUrl: payload.logo,
                 documents: payload.documents?.map((d: any) => d.fileContent) || [],
                 paymentStatus: payload.paymentStatus
             });

        case RequestType.CONTACT_MESSAGE:
             return addContactMessage({
                 name: requesterInfo.name,
                 phone: requesterInfo.phone,
                 email: requesterInfo.email,
                 message: payload.message,
                 inquiryType: payload.inquiryType
             });

        default:
            console.warn("Unknown request type:", type);
            return null;
    }
};

export const addMessageToLead = async (leadId: string, messageData: Omit<LeadMessage, 'id' | 'timestamp'>): Promise<void> => {
    const { addMessageToLead: serviceAddMsg } = await import('./leads');
    await serviceAddMsg(leadId, messageData);
};
