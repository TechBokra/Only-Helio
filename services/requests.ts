import { RequestType, Role } from '../types';
import type { Request, Lead, LeadMessage } from '../types';
import { addNotification } from './notifications';
import { getAllRoutingRules } from './routingRules';
import { getPartnerById } from './partners';
// Import specific services
import { getLeadById, getAllLeads, addLead, updateLead } from './leads';
import { getAllPartnerRequests, addPartnerRequest, updatePartnerRequestStatus } from './partnerRequests';
import { getAllPropertyRequests, addPropertyRequest, updatePropertyRequestStatus } from './propertyRequests';
import { getAllContactRequests, addContactRequest, updateContactRequestStatus } from './contactRequests';
import { getAllPropertyInquiries, addPropertyInquiry, updatePropertyInquiryStatus } from './propertyInquiries';

const SIMULATED_DELAY = 300;

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

export const getAllRequests = (): Promise<Request[]> => {
    return new Promise((resolve) => {
        setTimeout(async () => {
            const allRequests: Request[] = [];

            // 1. Leads
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

            // 2. Partner Requests
            const partnerReqs = await getAllPartnerRequests();
            allRequests.push(...partnerReqs.map(req => ({
                id: req.id,
                type: RequestType.PARTNER_APPLICATION,
                status: req.status,
                createdAt: req.createdAt,
                requesterInfo: { name: req.contactName, phone: req.contactPhone, email: req.contactEmail },
                payload: req
            } as Request)));

            // 3. Property Requests
            const propReqs = await getAllPropertyRequests();
            allRequests.push(...propReqs.map(req => ({
                id: req.id,
                type: RequestType.PROPERTY_LISTING_REQUEST,
                status: req.status,
                createdAt: req.createdAt,
                requesterInfo: { name: req.customerName, phone: req.customerPhone },
                payload: req
            } as Request)));

             // 4. Contact Requests
            const contactReqs = await getAllContactRequests();
            allRequests.push(...contactReqs.map(req => ({
                id: req.id,
                type: RequestType.CONTACT_MESSAGE,
                status: req.status,
                createdAt: req.createdAt,
                requesterInfo: { name: req.name, phone: req.phone },
                payload: req
            } as Request)));

             // 5. Property Inquiries
            const propInquiries = await getAllPropertyInquiries();
            allRequests.push(...propInquiries.map(req => ({
                id: req.id,
                type: RequestType.PROPERTY_INQUIRY,
                status: req.status,
                createdAt: req.createdAt,
                requesterInfo: { name: req.customerName, phone: req.customerPhone },
                payload: req
            } as Request)));

            // Sort all by date
            resolve(allRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }, SIMULATED_DELAY);
    });
};

export const getRequestById = (id: string): Promise<Request | undefined> => {
    return new Promise((resolve) => {
        setTimeout(async () => {
            // Try finding in Leads first (common)
            const lead = await getLeadById(id);
            if (lead) {
                resolve({
                    id: lead.id,
                    type: RequestType.LEAD,
                    status: lead.status as any,
                    assignedTo: lead.managerId || lead.partnerId,
                    createdAt: lead.createdAt,
                    updatedAt: lead.updatedAt,
                    requesterInfo: { name: lead.customerName, phone: lead.customerPhone },
                    payload: lead
                } as Request);
                return;
            }

            // Try other services
            // Note: In a real DB, we would query the specific table based on ID prefix or separate calls
            // Here we iterate for simplicity in mock environment
            const allRequests = await getAllRequests();
            const found = allRequests.find(r => r.id === id);
            resolve(found);
        }, SIMULATED_DELAY);
    });
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
            subscriptionPlan: payload.subscriptionPlan
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

    // --- Dynamic Routing Logic (Applies primarily to Leads/Requests where assignment makes sense) ---
    // Note: For simplicity in this refactor, we are mostly relying on the specific service's default notification logic
    // but we can update the 'assignedTo' field on the entity if a rule matches.
    
    // For LEADs, we might want to update the Lead entity with a new manager if a rule matches.
    if (type === RequestType.LEAD) {
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
    }

    return newRequest;
};

export const updateRequest = (id: string, updates: Partial<Request>): Promise<Request | undefined> => {
    return new Promise(async (resolve) => {
        setTimeout(async () => {
             // 1. Try Leads
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
                 resolve({
                    id: updated!.id,
                    type: RequestType.LEAD,
                    status: updated!.status as any, // mapping approximation
                    createdAt: updated!.createdAt,
                    requesterInfo: { name: updated!.customerName, phone: updated!.customerPhone },
                    payload: updated
                } as Request);
                return;
            }

            // 2. Partner Requests
            const partReqs = await getAllPartnerRequests();
            if (partReqs.find(r => r.id === id)) {
                if (updates.status === 'approved' || updates.status === 'rejected') {
                    await updatePartnerRequestStatus(id, updates.status);
                }
                resolve(undefined); // Returning undefined triggers reload in UI usually
                return;
            }
            
            // 3. Property Requests
            const propReqs = await getAllPropertyRequests();
             if (propReqs.find(r => r.id === id)) {
                 // Map generic status to RequestStatus
                if (['approved', 'rejected', 'pending'].includes(updates.status as string)) {
                    await updatePropertyRequestStatus(id, updates.status as any);
                }
                resolve(undefined);
                return;
            }

            // 4. Contact & Inquiries
            // ... similar logic for others if status updates are supported
            
            resolve(undefined);
        }, SIMULATED_DELAY);
    });
};

export const addMessageToLead = (requestId: string, messageData: Omit<LeadMessage, 'id' | 'timestamp'>): Promise<Request | undefined> => {
    return new Promise(async (resolve) => {
        // Re-import to be safe
        const { addMessageToLead: serviceAddMessage } = await import('./leads');
        await serviceAddMessage(requestId, messageData);
        const updatedReq = await getRequestById(requestId);
        resolve(updatedReq);
    });
};