
import { RequestType } from '../types';
import type { Request, LeadMessage } from '../types';
import { addNotification } from './notifications';
import { getAllRoutingRules } from './routingRules';
import { getLeadById, getAllLeads, addLead, updateLead } from './leads';
import { getAllPartnerRequests, addPartnerRequest, updatePartnerRequestStatus } from './partnerRequests';
import { getAllPropertyRequests, addPropertyRequest, updatePropertyRequestStatus } from './propertyRequests';
import { getAllContactRequests, addContactRequest } from './contactRequests';
import { getAllPropertyInquiries, addPropertyInquiry } from './propertyInquiries';

// Helper to access nested properties of an object using a string path
const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const checkCondition = (request: Request, condition: any): boolean => {
    const value = getNestedValue(request, condition.field);
    const conditionValue = condition.value;

    switch (condition.operator) {
        case 'equals': return value == conditionValue;
        case 'not_equals': return value != conditionValue;
        case 'contains': return String(value).toLowerCase().includes(String(conditionValue).toLowerCase());
        case 'greater_than':
        case 'less_than':
             const numValue = parseFloat(value);
             const numConditionValue = parseFloat(conditionValue);
             if (isNaN(numValue) || isNaN(numConditionValue)) return false;
             return condition.operator === 'greater_than' ? numValue > numConditionValue : numValue < numConditionValue;
        default: return false;
    }
}

export const getAllRequests = async (): Promise<Request[]> => {
    const allRequests: Request[] = [];

    // 1. Leads
    try {
        const leads = await getAllLeads();
        allRequests.push(...leads.map(lead => ({
            id: lead.id,
            type: RequestType.LEAD,
            status: lead.status === 'new' ? 'new' : (['completed', 'cancelled'].includes(lead.status) ? 'closed' : 'in-progress'),
            assignedTo: lead.assignedTo || lead.managerId || lead.partnerId,
            assignedToName: lead.partnerName,
            createdAt: lead.createdAt,
            updatedAt: lead.updatedAt,
            requesterInfo: { name: lead.customerName, phone: lead.customerPhone },
            payload: lead
        } as Request)));
    } catch (e) { console.error("Error fetching leads for requests", e); }

    // 2. Partner Requests
    try {
        const partnerReqs = await getAllPartnerRequests();
        allRequests.push(...partnerReqs.map(req => ({
            id: req.id,
            type: RequestType.PARTNER_APPLICATION,
            status: req.status,
            createdAt: req.createdAt,
            requesterInfo: { name: req.contactName, phone: req.contactPhone, email: req.contactEmail },
            payload: req
        } as Request)));
    } catch (e) { console.error("Error fetching partner requests", e); }

    // 3. Property Requests
    try {
        const propReqs = await getAllPropertyRequests();
        allRequests.push(...propReqs.map(req => ({
            id: req.id,
            type: RequestType.PROPERTY_LISTING_REQUEST,
            status: req.status,
            createdAt: req.createdAt,
            requesterInfo: { name: req.customerName, phone: req.customerPhone },
            payload: req
        } as Request)));
    } catch (e) { console.error("Error fetching property requests", e); }

    // 4. Contact Requests
    try {
        const contactReqs = await getAllContactRequests();
        allRequests.push(...contactReqs.map(req => ({
            id: req.id,
            type: RequestType.CONTACT_MESSAGE,
            status: req.status,
            createdAt: req.createdAt,
            requesterInfo: { name: req.name, phone: req.phone },
            payload: req
        } as Request)));
    } catch (e) { console.error("Error fetching contact requests", e); }

    // 5. Property Inquiries
    try {
        const propInquiries = await getAllPropertyInquiries();
        allRequests.push(...propInquiries.map(req => ({
            id: req.id,
            type: RequestType.PROPERTY_INQUIRY,
            status: req.status,
            createdAt: req.createdAt,
            requesterInfo: { name: req.customerName, phone: req.customerPhone },
            payload: req
        } as Request)));
    } catch (e) { console.error("Error fetching property inquiries", e); }

    // Sort all by date
    return allRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getRequestById = async (id: string): Promise<Request | undefined> => {
    // Try finding in Leads first (common)
    try {
        const lead = await getLeadById(id);
        if (lead) {
            return {
                id: lead.id,
                type: RequestType.LEAD,
                status: lead.status as any,
                assignedTo: lead.managerId || lead.partnerId,
                createdAt: lead.createdAt,
                updatedAt: lead.updatedAt,
                requesterInfo: { name: lead.customerName, phone: lead.customerPhone },
                payload: lead
            } as Request;
        }
    } catch (e) { /* ignore */ }

    // Fallback: Fetch all and find (not optimal but works for varied types in MVP)
    const allRequests = await getAllRequests();
    return allRequests.find(r => r.id === id);
};

export const addRequest = async (type: RequestType, data: Omit<Request, 'id' | 'type' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Request> => {
    let newRequest: Request;

    // DELEGATION: Route to specific service based on type
    if (type === RequestType.LEAD) {
        const payload = data.payload as any;
        const lead = await addLead({
            serviceType: payload.serviceType,
            serviceTitle: payload.serviceTitle,
            customerName: data.requesterInfo.name,
            customerPhone: data.requesterInfo.phone,
            customerNotes: payload.customerNotes,
            contactTime: payload.contactTime,
            partnerId: payload.partnerId,
            managerId: payload.managerId,
            propertyId: payload.propertyId,
            referenceImage: payload.referenceImage
        });
        // Wrap as Request
        newRequest = {
            id: lead.id,
            type: RequestType.LEAD,
            status: 'new',
            createdAt: lead.createdAt,
            updatedAt: lead.updatedAt,
            requesterInfo: data.requesterInfo,
            payload: lead
        };

    } else if (type === RequestType.PARTNER_APPLICATION) {
        const payload = data.payload as any;
        const req = await addPartnerRequest({
            companyName: payload.companyName,
            companyType: payload.companyType,
            contactName: data.requesterInfo.name,
            contactEmail: data.requesterInfo.email || '',
            contactPhone: data.requesterInfo.phone,
            description: payload.description,
            website: payload.website,
            companyAddress: payload.companyAddress,
            logo: payload.logo,
            documents: payload.documents,
            subscriptionPlan: payload.subscriptionPlan,
            managementContacts: payload.managementContacts // Pass management contacts
        });
        newRequest = { id: req.id, type, status: 'pending', createdAt: req.createdAt, requesterInfo: data.requesterInfo, payload: req } as Request;

    } else if (type === RequestType.PROPERTY_LISTING_REQUEST) {
        const payload = data.payload as any;
        const req = await addPropertyRequest({
            customerName: data.requesterInfo.name,
            customerPhone: data.requesterInfo.phone,
            propertyDetails: payload.propertyDetails,
            images: payload.images,
            cooperationType: payload.cooperationType,
            contactTime: payload.contactTime
        });
        newRequest = { id: req.id, type, status: 'pending', createdAt: req.createdAt, requesterInfo: data.requesterInfo, payload: req } as Request;

    } else if (type === RequestType.CONTACT_MESSAGE) {
        const payload = data.payload as any;
        const req = await addContactRequest({
            name: data.requesterInfo.name,
            phone: data.requesterInfo.phone,
            message: payload.message,
            inquiryType: payload.inquiryType
        });
        newRequest = { id: req.id, type, status: 'pending', createdAt: req.createdAt, requesterInfo: data.requesterInfo, payload: req } as Request;

    } else if (type === RequestType.PROPERTY_INQUIRY) {
        const payload = data.payload as any;
        const req = await addPropertyInquiry({
            customerName: data.requesterInfo.name,
            customerPhone: data.requesterInfo.phone,
            details: payload.details
        });
        newRequest = { id: req.id, type, status: 'pending', createdAt: req.createdAt, requesterInfo: data.requesterInfo, payload: req } as Request;
    } else {
        throw new Error("Unknown request type");
    }

    // --- Dynamic Routing Logic ---
    if (type === RequestType.LEAD) {
        try {
            const rules = await getAllRoutingRules();
            const activeRules = rules.filter(r => r.active);
            for (const rule of activeRules) {
                const isMatch = rule.conditions.every(condition => checkCondition(newRequest, condition));
                if (isMatch) {
                    // Update the underlying Lead
                    await updateLead(newRequest.id, { assignedTo: rule.action.assignTo, status: 'in-progress' });
                    // Notify the new assignee
                    addNotification({
                        userId: rule.action.assignTo,
                        message: { ar: `تم تعيين طلب جديد لك.`, en: `A new request has been assigned to you.` },
                        link: `/dashboard/leads/${newRequest.id}`
                    });
                    break; 
                }
            }
        } catch (e) {
            console.warn("Routing rule execution failed", e);
        }
    }

    return newRequest;
};

export const updateRequest = async (id: string, updates: Partial<Request>): Promise<Request | undefined> => {
    // 1. Try Leads
    try {
        const lead = await getLeadById(id);
        if (lead) {
            const leadUpdates: any = {};
            // Map status back to lead status
            if (updates.status === 'in-progress') leadUpdates.status = 'in-progress';
            if (updates.status === 'closed') leadUpdates.status = 'completed';
            if (updates.status === 'rejected') leadUpdates.status = 'cancelled';
            if (updates.assignedTo) leadUpdates.assignedTo = updates.assignedTo;
            
            await updateLead(id, leadUpdates);
            const updated = await getLeadById(id);
            return {
                id: updated!.id,
                type: RequestType.LEAD,
                status: updated!.status as any, 
                createdAt: updated!.createdAt,
                requesterInfo: { name: updated!.customerName, phone: updated!.customerPhone },
                payload: updated
            } as Request;
        }
    } catch(e) { /* not a lead or fetch error */ }

    // 2. Partner Requests
    try {
        const partReqs = await getAllPartnerRequests();
        if (partReqs.find(r => r.id === id)) {
            if (updates.status === 'approved' || updates.status === 'rejected') {
                await updatePartnerRequestStatus(id, updates.status);
            }
            return undefined;
        }
    } catch (e) { /* ignore */ }
    
    // 3. Property Requests
    try {
        const propReqs = await getAllPropertyRequests();
        if (propReqs.find(r => r.id === id)) {
            if (['approved', 'rejected', 'pending'].includes(updates.status as string)) {
                await updatePropertyRequestStatus(id, updates.status as any);
            }
            return undefined;
        }
    } catch (e) { /* ignore */ }

    return undefined;
};

export const addMessageToLead = async (requestId: string, messageData: Omit<LeadMessage, 'id' | 'timestamp'>): Promise<Request | undefined> => {
    // Re-import to be safe or use direct module reference
    const { addMessageToLead: serviceAddMessage } = await import('./leads');
    await serviceAddMessage(requestId, messageData);
    return getRequestById(requestId);
};
