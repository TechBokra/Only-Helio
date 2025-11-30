
import { requestsData } from '../data/requests';
import { RequestType, Role } from '../types';
import type { Request, RequestStatus, Lead, LeadMessage, LeadStatus } from '../types';
import { addNotification } from './notifications';
import { getAllRoutingRules } from './routingRules';
import { getPartnerById } from './partners';
import { getLeadById, getAllLeads, addLead, updateLead } from './leads';

// Create a mutable, in-memory copy of the data to simulate a database.
let localRequestsData: Request[] = [...requestsData];

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
            // 1. Fetch Leads and convert to Requests
            const leads = await getAllLeads();
            const leadRequests: Request[] = leads.map(lead => ({
                id: lead.id, // Use lead ID as request ID
                type: RequestType.LEAD,
                status: lead.status === 'new' ? 'new' : (['completed', 'cancelled'].includes(lead.status) ? 'closed' : 'in-progress'), // Approximate Status Mapping
                assignedTo: lead.assignedTo || lead.managerId || lead.partnerId,
                assignedToName: lead.partnerName,
                createdAt: lead.createdAt,
                updatedAt: lead.updatedAt,
                requesterInfo: {
                    name: lead.customerName,
                    phone: lead.customerPhone,
                },
                payload: lead
            }));

            // 2. Process local requests (non-leads)
            const populatedRequests = await Promise.all(localRequestsData.map(async (req) => {
                if (req.assignedTo) {
                    const partner = await getPartnerById(req.assignedTo);
                    return { ...req, assignedToName: partner?.name || req.assignedTo };
                }
                return req;
            }));

            // 3. Merge and Sort
            // Filter out any legacy leads in localRequestsData to avoid duplicates if systems were mixed
            const nonLeadLocalRequests = populatedRequests.filter(r => r.type !== RequestType.LEAD);
            
            const allRequests = [...nonLeadLocalRequests, ...leadRequests].sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            resolve(allRequests);
        }, SIMULATED_DELAY);
    });
};

export const getRequestById = (id: string): Promise<Request | undefined> => {
    return new Promise((resolve) => {
        setTimeout(async () => {
            let request = localRequestsData.find(r => r.id === id);
            
            // Fallback: if not found in requestsData, look in leadsData
            if (!request) {
                const lead = await getLeadById(id);
                if (lead) {
                    request = {
                        id: lead.id,
                        type: RequestType.LEAD,
                        status: lead.status === 'new' ? 'new' : 'in-progress',
                        assignedTo: lead.managerId || lead.partnerId,
                        createdAt: lead.createdAt,
                        updatedAt: lead.updatedAt,
                        requesterInfo: {
                            name: lead.customerName,
                            phone: lead.customerPhone,
                        },
                        payload: lead
                    };
                }
            }
            
            resolve(request);
        }, SIMULATED_DELAY);
    });
};

export const addRequest = async (type: RequestType, data: Omit<Request, 'id' | 'type' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Request> => {
    
    // DELEGATION: If it's a LEAD, delegate to addLead service
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
        
        // Return a Request wrapper for the newly created lead
        return {
            id: lead.id,
            type: RequestType.LEAD,
            status: 'new',
            createdAt: lead.createdAt,
            updatedAt: lead.updatedAt,
            requesterInfo: data.requesterInfo,
            payload: lead
        };
    }

    const newRequest: Request = {
        ...data,
        id: `req-${Date.now()}`,
        type,
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    // --- Dynamic Routing Logic ---
    const rules = await getAllRoutingRules();
    const activeRules = rules.filter(r => r.active);
    
    for (const rule of activeRules) {
        const isMatch = rule.conditions.every(condition => checkCondition(newRequest, condition));
        if (isMatch) {
            newRequest.assignedTo = rule.action.assignTo;
            newRequest.status = 'assigned';
            break; // Apply first matching rule
        }
    }
    // --- End Dynamic Routing Logic ---

    // If no rule matched, assign based on type
    if (!newRequest.assignedTo) {
        switch(type) {
            case RequestType.PARTNER_APPLICATION:
                newRequest.assignedTo = 'partner-relations-manager-1';
                break;
            case RequestType.PROPERTY_LISTING_REQUEST:
            case RequestType.PROPERTY_INQUIRY:
            case RequestType.CONTACT_MESSAGE:
            default:
                newRequest.assignedTo = 'customer-relations-manager-1';
                break;
        }
    }
    
    localRequestsData.unshift(newRequest);

    // Notification Logic
    if (newRequest.assignedTo) {
         const assignee = await getPartnerById(newRequest.assignedTo);
        
        const assigneeRole = assignee?.role as string | undefined;
        const isAdminOrManager = (assigneeRole && (assigneeRole.includes('_manager') || assigneeRole === Role.SUPER_ADMIN));
        
        addNotification({
            userId: newRequest.assignedTo,
            message: {
                ar: `لديك طلب جديد من "${data.requesterInfo.name}".`,
                en: `New ${type.toLowerCase().replace(/_/g, ' ')} from "${data.requesterInfo.name}".`,
            },
            link: isAdminOrManager ? `/admin/requests/${newRequest.id}` : `/dashboard/leads`,
        });
    }

    return newRequest;
};

export const updateRequest = (id: string, updates: Partial<Request>): Promise<Request | undefined> => {
    return new Promise(async (resolve) => {
        setTimeout(async () => {
            // Check if it's a lead (basic ID check or check if not in local array)
            const isLocal = localRequestsData.some(r => r.id === id);
            
            if (!isLocal) {
                // Assume it's a lead
                // Map status if provided. 
                // Note: This logic assumes the caller sends a valid LeadStatus string when updating a lead via Request interface.
                const leadUpdates: any = {};
                if (updates.status) leadUpdates.status = updates.status;
                if (updates.assignedTo) leadUpdates.assignedTo = updates.assignedTo;

                await updateLead(id, leadUpdates);
                // Return mocked updated request
                const updatedLead = await getLeadById(id);
                if (updatedLead) {
                    resolve({
                        id: updatedLead.id,
                        type: RequestType.LEAD,
                        status: updatedLead.status as any,
                        createdAt: updatedLead.createdAt,
                        requesterInfo: { name: updatedLead.customerName, phone: updatedLead.customerPhone },
                        payload: updatedLead
                    } as Request);
                    return;
                }
            }

            const requestIndex = localRequestsData.findIndex(r => r.id === id);
            if (requestIndex > -1) {
                localRequestsData[requestIndex] = { ...localRequestsData[requestIndex], ...updates, updatedAt: new Date().toISOString() };
                resolve(localRequestsData[requestIndex]);
            } else {
                resolve(undefined);
            }
        }, SIMULATED_DELAY);
    });
};

export const addMessageToLead = (requestId: string, messageData: Omit<LeadMessage, 'id' | 'timestamp'>): Promise<Request | undefined> => {
    // This function is primarily for the RequestDetailsPage which operates on Request types.
    // It bridges the call to the underlying Lead message logic.
    return new Promise(async (resolve, reject) => {
        setTimeout(async () => {
            try {
                // Try to find it as a lead first since this method is specifically named addMessageTo*Lead*
                // but was placed in requests service for architectural grouping.
                
                // We need to import this dynamically or use the imported one
                // Since we imported `addLeadMessage` (mocked inside `updateLead` logic in leads.ts? No, leads.ts has addMessageToLead)
                // `services/leads.ts` has `addMessageToLead`.
                
                // We must call the leads service directly.
                // But we need to return a Request.
                
                // Re-import to be safe (already imported at top)
                const { addMessageToLead: serviceAddMessage } = await import('./leads');
                
                await serviceAddMessage(requestId, messageData);
                
                // Fetch updated and return as Request
                const updatedReq = await getRequestById(requestId);
                resolve(updatedReq);

            } catch (e) {
                // Fallback for localRequestsData if for some reason a LEAD is stored there (legacy)
                let requestIndex = localRequestsData.findIndex(r => r.id === requestId);
                if (requestIndex > -1) {
                    const request = localRequestsData[requestIndex];
                     if (request.type !== RequestType.LEAD) {
                        return reject(new Error('Request is not a lead'));
                    }
                    const leadPayload = request.payload as Partial<Lead>;
                    if (!leadPayload.messages) leadPayload.messages = [];
                    
                    const newMessage: LeadMessage = {
                        ...messageData,
                        id: `msg-${requestId}-${Date.now()}`,
                        timestamp: new Date().toISOString(),
                    };
                    leadPayload.messages.push(newMessage);
                    request.updatedAt = new Date().toISOString();
                    resolve(request);
                } else {
                    reject(new Error('Lead not found'));
                }
            }
        }, SIMULATED_DELAY);
    });
};
