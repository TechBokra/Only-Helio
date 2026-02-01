
import { supabase } from '../supabaseClient';
import type { Lead, LeadMessage, LeadStatus } from '../types';
import { addNotification } from './notifications';

interface LeadMessageRow {
    id: string;
    leadId: string;
    sender: 'system' | 'admin' | 'partner' | 'client';
    senderId?: string;
    type: 'message' | 'note';
    content: string;
    timestamp: string;
}

interface LeadRow {
    id: string;
    partnerId: string;
    managerId?: string;
    propertyId?: string;
    serviceType: 'finishing' | 'decorations' | 'property' | 'general';
    customerName: string;
    customerPhone: string;
    serviceTitle: string;
    status: LeadStatus;
    contactTime?: string;
    notes?: string;
    assignedTo?: string;
    referenceImage?: string;
    createdAt: string;
    updatedAt: string;
    // Relations
    partner?: {
        name_en: string | null;
        name_ar: string | null;
    };
    messages?: LeadMessageRow[];
}

// Helper to sanitize IDs (empty string -> null)
const sanitizeId = (id?: string | null) => {
    if (!id || id.trim() === '') return null;
    return id;
};

// Helper to map DB row to Lead
const mapDbToLead = (row: LeadRow): Lead => ({
    id: row.id,
    partnerId: row.partnerId,
    managerId: row.managerId,
    propertyId: row.propertyId,
    serviceType: row.serviceType,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    contactTime: row.contactTime,
    serviceTitle: row.serviceTitle,
    customerNotes: row.notes,
    status: row.status,
    assignedTo: row.assignedTo,
    referenceImage: row.referenceImage, 
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    partnerName: row.partner?.name_en || row.partner?.name_ar || 'Unknown',
    messages: (row.messages || []).map((msg) => ({
        id: msg.id || `msg-${Math.random()}`,
        sender: msg.sender,
        senderId: msg.senderId,
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp
    }))
});

export const getLeadsByPartnerId = async (partnerId: string): Promise<Lead[]> => {
    // Removed `messages:LeadMessage(*)` to avoid PGRST200 error since FK was dropped.
    // List views generally don't need full message history.
    const { data, error } = await supabase
        .from('Lead')
        .select(`*, partner:User!Lead_partnerId_fkey(name_en, name_ar)`)
        .eq('partnerId', partnerId)
        .order('createdAt', { ascending: false });
        
    if (error || !data) {
        console.error("Error fetching leads:", JSON.stringify(error, null, 2));
        return [];
    }
    return (data as unknown as LeadRow[]).map(mapDbToLead);
};

export const getLeadById = async (leadId: string): Promise<Lead | undefined> => {
    // 1. Fetch Lead
    const { data, error } = await supabase
        .from('Lead')
        .select(`*, partner:User!Lead_partnerId_fkey(name_en, name_ar)`)
        .eq('id', leadId)
        .single();

    if (error || !data) return undefined;

    // 2. Manual Fetch for Messages (since FK is gone)
    const { data: messages } = await supabase
        .from('LeadMessage')
        .select('*')
        .eq('leadId', leadId)
        .order('timestamp', { ascending: true });

    const leadRow = data as unknown as LeadRow;
    if (messages) {
        leadRow.messages = messages as LeadMessageRow[];
    }

    return mapDbToLead(leadRow);
};

export const getAllLeads = async (): Promise<(Lead & { partnerName?: string })[]> => {
    // Removed `messages:LeadMessage(*)`
    const { data, error } = await supabase
        .from('Lead')
        .select(`*, partner:User!Lead_partnerId_fkey(name_en, name_ar)`)
        .order('createdAt', { ascending: false });

    if (error || !data) {
         console.error("Error fetching all leads:", JSON.stringify(error, null, 2));
         return [];
    }
    return (data as unknown as LeadRow[]).map(mapDbToLead);
};

// NEW: Server-side Pagination for Admin Dashboard
export const getPaginatedLeads = async (
    page: number, 
    limit: number, 
    filters?: { 
        status?: string; 
        serviceType?: string; 
        query?: string;
        partnerId?: string;
        assignedTo?: string; 
    }
): Promise<{ leads: Lead[]; total: number }> => {
    // Removed `messages:LeadMessage(*)`
    let query = supabase
        .from('Lead')
        .select(`*, partner:User!Lead_partnerId_fkey(name_en, name_ar)`, { count: 'exact' });

    if (filters) {
        if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }
        if (filters.serviceType && filters.serviceType !== 'all') {
            query = query.eq('serviceType', filters.serviceType);
        }
        if (filters.partnerId) {
            query = query.eq('partnerId', filters.partnerId);
        }
        if (filters.assignedTo) {
            query = query.eq('assignedTo', filters.assignedTo);
        }
        if (filters.query) {
            const q = filters.query;
            query = query.or(`customerName.ilike.%${q}%,customerPhone.ilike.%${q}%,serviceTitle.ilike.%${q}%`);
        }
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
        .order('createdAt', { ascending: false })
        .range(from, to);

    if (error) {
        console.error("Error fetching paginated leads:", error);
        return { leads: [], total: 0 };
    }

    return {
        leads: (data as unknown as LeadRow[]).map(mapDbToLead),
        total: count || 0
    };
};

export const addLead = async (leadData: Omit<Lead, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'messages'>): Promise<Lead> => {
    const now = new Date().toISOString();
    
    // Safety check: ensure serviceType has a default value if missing
    const safeServiceType = leadData.serviceType || 'general';

    const newLead = {
        partnerId: sanitizeId(leadData.partnerId),
        managerId: sanitizeId(leadData.managerId),
        propertyId: sanitizeId(leadData.propertyId),
        serviceType: safeServiceType,
        customerName: leadData.customerName,
        customerPhone: leadData.customerPhone,
        serviceTitle: leadData.serviceTitle,
        contactTime: leadData.contactTime,
        notes: leadData.customerNotes,
        referenceImage: leadData.referenceImage || null,
        status: 'new',
        createdAt: now,
        updatedAt: now
    };

    const { data, error } = await supabase.from('Lead').insert(newLead).select().single();
    if (error) {
        console.error("Error adding lead:", JSON.stringify(error, null, 2));
        throw error;
    }

    // Send notification
    const targetUserId = leadData.managerId || leadData.partnerId;
    const link = leadData.managerId 
        ? (leadData.serviceType === 'finishing' ? '/admin/finishing-requests' : '/admin/decoration-requests')
        : '/dashboard/leads';

    // Fire and forget notification to avoid blocking
    if (targetUserId) {
        addNotification({
            userId: targetUserId, 
            message: {
                ar: `لديك طلب عميل جديد من "${leadData.customerName}".`,
                en: `New lead from "${leadData.customerName}".`,
            },
            link: link,
        }).catch(err => console.warn("Failed to send notification:", err));
    }

    return mapDbToLead(data as unknown as LeadRow);
};

export const updateLead = async (leadId: string, updates: Partial<Omit<Lead, 'id' | 'createdAt'>>): Promise<Lead | undefined> => {
    const dbUpdates: any = { updatedAt: new Date().toISOString() };
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.assignedTo) dbUpdates.assignedTo = updates.assignedTo;
    if (updates.customerNotes) dbUpdates.notes = updates.customerNotes;

    const { data, error } = await supabase.from('Lead').update(dbUpdates).eq('id', leadId).select().single();
    if (error) throw error;

    // Handle System Note for status change
    if (updates.status) {
         await addMessageToLead(leadId, {
            sender: 'system',
            type: 'note',
            content: `Status changed to "${updates.status}".`
         });
    }

    return mapDbToLead(data as unknown as LeadRow);
};

export const addMessageToLead = async (leadId: string, messageData: Omit<LeadMessage, 'id' | 'timestamp'>): Promise<Lead | undefined> => {
    const newMessage = {
        leadId,
        sender: messageData.sender,
        senderId: messageData.senderId,
        type: messageData.type,
        content: messageData.content,
        timestamp: new Date().toISOString()
    };

    const { error } = await supabase.from('LeadMessage').insert(newMessage);
    if (error) throw error;

    // Try updating updatedAt on parent tables if they exist
    // We ignore errors here because we don't know which table the ID belongs to without querying first, 
    // and for performance we just fire-and-forget or try Lead first.
    
    // 1. Try Lead Table
    const { error: leadError } = await supabase.from('Lead').update({ updatedAt: new Date().toISOString() }).eq('id', leadId);
    
    // If lead updated successfully, we assume it's a lead.
    if (!leadError) {
        if (messageData.sender === 'partner' || messageData.sender === 'admin') {
             const lead = await getLeadById(leadId);
             if (lead && lead.status === 'new') {
                 await updateLead(leadId, { status: 'contacted' });
             }
        }
    }

    // Since we don't have FKs, getting the full object back depends on where it is.
    // Ideally, the UI refetches the specific entity using getRequestById.
    // We return undefined here to signal the caller to refetch their specific context.
    return undefined; 
};

export const deleteLead = async (leadId: string): Promise<boolean> => {
    const { error } = await supabase.from('Lead').delete().eq('id', leadId);
    if (error) throw error;
    return true;
};
