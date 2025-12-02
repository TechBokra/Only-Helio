
import { supabase } from '../lib/supabase';
import { requestsData } from '../data/requests';
import { RequestType, Role } from '../types';
import type { Request, RequestStatus, Lead, LeadMessage } from '../types';
import { addNotification } from './notifications';
import { getAllRoutingRules } from './routingRules';
import { getPartnerById } from './partners';
import { getLeadById, getAllLeads, addLead, updateLead } from './leads';
import { mapRequestFromDB } from '../utils/supabaseMapper';

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
    // 1. Try Fetch from Supabase
    if (supabase) {
        try {
            const { data, error } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
            if (!error && data) {
                 // Also fetch leads as they are treated as requests in the dashboard
                 const leads = await getAllLeads();
                 const leadRequests: Request[] = leads.map(lead => ({
                    id: lead.id, 
                    type: RequestType.LEAD,
                    status: lead.status === 'new' ? 'new' : (['completed', 'cancelled'].includes(lead.status) ? 'closed' : 'in-progress') as RequestStatus,
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

                const dbRequests = data.map(mapRequestFromDB);
                return [...dbRequests, ...leadRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            }
        } catch (e) {
            console.error("Error fetching requests:", e);
        }
    }

    // 2. Fallback to local data (if no DB)
    console.warn("Fetching requests from local fallback");
    const leads = await getAllLeads();
    const leadRequests: Request[] = leads.map(lead => ({
        id: lead.id,
        type: RequestType.LEAD,
        status: lead.status === 'new' ? 'new' : (['completed', 'cancelled'].includes(lead.status) ? 'closed' : 'in-progress') as RequestStatus,
        assignedTo: lead.assignedTo || lead.managerId || lead.partnerId,
        assignedToName: lead.partnerName,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
        requesterInfo: { name: lead.customerName, phone: lead.customerPhone },
        payload: lead
    }));
    return [...requestsData, ...leadRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getRequestById = async (id: string): Promise<Request | undefined> => {
    if (supabase) {
        const { data, error } = await supabase.from('requests').select('*').eq('id', id).single();
        if (!error && data) return mapRequestFromDB(data);
    }
    
    // Check if it is a lead
    const lead = await getLeadById(id);
    if (lead) {
        return {
            id: lead.id,
            type: RequestType.LEAD,
            status: lead.status === 'new' ? 'new' : 'in-progress',
            assignedTo: lead.managerId || lead.partnerId,
            createdAt: lead.createdAt,
            updatedAt: lead.updatedAt,
            requesterInfo: { name: lead.customerName, phone: lead.customerPhone },
            payload: lead
        };
    }

    return requestsData.find(r => r.id === id);
};

export const addRequest = async (type: RequestType, data: Omit<Request, 'id' | 'type' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Request> => {
    
    // DELEGATION: If it's a LEAD, delegate to addLead service (which handles its own DB insert)
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

    // Build the new request object
    const newRequest: any = {
        ...data,
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
            break; 
        }
    }

    // Default Assignment Fallback
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

    // Persist to DB (PRIORITY: Supabase)
    if (supabase) {
        const { data: insertedData, error } = await supabase.from('requests').insert([{
            type: newRequest.type,
            requester_info: newRequest.requesterInfo, // Pass object directly, Supabase client handles JSON stringify if needed for jsonb
            payload: newRequest.payload,             // Pass object directly
            status: newRequest.status,
            assigned_to: newRequest.assignedTo,
            created_at: newRequest.createdAt,
            updated_at: newRequest.updatedAt
        }]).select().single();

        if (error) {
            console.error("Supabase Insert Error:", error);
        } else {
             newRequest.id = insertedData.id;
        }
    } 
    
    // Local fallback if ID not set (DB failed or not connected)
    if (!newRequest.id) {
        newRequest.id = `req-${Date.now()}`;
        requestsData.unshift(newRequest);
    }

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

export const updateRequest = async (id: string, updates: Partial<Request>): Promise<Request | undefined> => {
    if (supabase) {
        const dbUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.assignedTo) dbUpdates.assigned_to = updates.assignedTo;
        if (updates.payload) dbUpdates.payload = updates.payload; // Pass object

        // Try to update 'requests' table first
        const { data, error } = await supabase.from('requests').update(dbUpdates).eq('id', id).select().single();
        
        if (!error && data) {
            return mapRequestFromDB(data);
        }
        
        // If not found in requests table, try updating lead table (since getAllRequests merges them)
        const leadUpdates: any = {};
        if (updates.status) leadUpdates.status = updates.status;
        if (updates.assignedTo) leadUpdates.assignedTo = updates.assignedTo;
        
        await updateLead(id, leadUpdates);
        
        // Fetch updated lead and return wrapped as request
        const updatedLead = await getLeadById(id);
        if (updatedLead) {
             return {
                id: updatedLead.id,
                type: RequestType.LEAD,
                status: updatedLead.status as any,
                createdAt: updatedLead.createdAt,
                requesterInfo: { name: updatedLead.customerName, phone: updatedLead.customerPhone },
                payload: updatedLead
            } as Request;
        }
    } else {
        // Local fallback
        const requestIndex = requestsData.findIndex(r => r.id === id);
        if (requestIndex > -1) {
            requestsData[requestIndex] = { ...requestsData[requestIndex], ...updates, updatedAt: new Date().toISOString() };
            return requestsData[requestIndex];
        }
    }
    return undefined;
};

export const addMessageToLead = (requestId: string, messageData: Omit<LeadMessage, 'id' | 'timestamp'>): Promise<Request | undefined> => {
    return new Promise(async (resolve, reject) => {
        // Bridge to Lead Service
        try {
            const { addMessageToLead: serviceAddMessage } = await import('./leads');
            await serviceAddMessage(requestId, messageData);
            const updatedReq = await getRequestById(requestId);
            resolve(updatedReq);
        } catch (e) {
            reject(e);
        }
    });
};
