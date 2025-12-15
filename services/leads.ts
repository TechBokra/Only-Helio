
import { supabase } from '../supabaseClient';
import { leadsData as fileLeads } from '../data/leads';
import type { Lead, LeadMessage } from '../types';
import { addNotification } from './notifications';

// Helper to map DB row to Lead
const mapDbToLead = (row: any): Lead => ({
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
    // Fix: Use name_en or name_ar as fallback since 'name' column doesn't exist
    partnerName: row.partner?.name_en || row.partner?.name_ar || 'Unknown',
    messages: (row.messages || []).map((msg: any) => ({
        id: msg.id || `msg-${Math.random()}`,
        sender: msg.sender,
        senderId: msg.senderId,
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp || msg.createdAt
    }))
});

export const getLeadsByPartnerId = async (partnerId: string): Promise<Lead[]> => {
    if (!supabase) return [];
    
    // Fix: Select name_en and name_ar instead of name
    const { data, error } = await supabase
        .from('Lead')
        .select(`*, partner:User!partnerId(name_en, name_ar), messages:LeadMessage(*)`)
        .eq('partnerId', partnerId)
        .order('createdAt', { ascending: false });
        
    if (error) {
        console.error('Error fetching leads:', error);
        return [];
    }
    return (data || []).map(mapDbToLead);
};

export const getLeadById = async (leadId: string): Promise<Lead | undefined> => {
    if (!supabase) return undefined;

    // Fix: Select name_en and name_ar instead of name
    const { data, error } = await supabase
        .from('Lead')
        .select(`*, partner:User!partnerId(name_en, name_ar), messages:LeadMessage(*)`)
        .eq('id', leadId)
        .single();

    if (error) {
        console.error('Error fetching lead:', error);
        return undefined;
    }
    return mapDbToLead(data);
};

export const getAllLeads = async (): Promise<(Lead & { partnerName?: string })[]> => {
    if (!supabase) return [];

    // Fix: Select name_en and name_ar instead of name
    const { data, error } = await supabase
        .from('Lead')
        .select(`*, partner:User!partnerId(name_en, name_ar), messages:LeadMessage(*)`)
        .order('createdAt', { ascending: false });

    if (error) {
        console.error('Error fetching all leads:', error);
        return [];
    }
    return (data || []).map(mapDbToLead);
};

export const addLead = async (leadData: Omit<Lead, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'messages'>): Promise<Lead> => {
    if (!supabase) throw new Error('Supabase client not initialized');

    const now = new Date().toISOString();
    const newLead = {
        id: `lead-${Date.now()}`, // Temporary ID logic if DB doesn't auto-gen UUID, but DB should handle this ideally.
        partnerId: leadData.partnerId,
        managerId: leadData.managerId,
        propertyId: leadData.propertyId,
        serviceType: leadData.serviceType,
        customerName: leadData.customerName,
        customerPhone: leadData.customerPhone,
        serviceTitle: leadData.serviceTitle,
        contactTime: leadData.contactTime,
        notes: leadData.customerNotes,
        status: 'new',
        createdAt: now,
        updatedAt: now
    };
    
    // Remove ID if let DB handle it (UUID)
    const { id, ...payload } = newLead;

    const { data, error } = await supabase.from('Lead').insert(payload).select().single();
    if (error) throw error;

    // Send notification
    const targetUserId = leadData.managerId || leadData.partnerId;
    // Determine correct link based on role
    let link = '/dashboard/leads';
    if (leadData.managerId) {
         link = leadData.serviceType === 'finishing' ? '/admin/finishing-requests' : '/admin/decoration-requests';
    }

    // We use the fire-and-forget approach for notifications to not block the lead creation
    addNotification({
        userId: targetUserId,
        message: {
            ar: `لديك طلب عميل جديد من "${leadData.customerName}".`,
            en: `New lead from "${leadData.customerName}".`,
        },
        link: link,
    }).catch(console.error);

    return mapDbToLead(data);
};

export const updateLead = async (leadId: string, updates: Partial<Omit<Lead, 'id' | 'createdAt'>>): Promise<Lead | undefined> => {
    if (!supabase) return undefined;

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

    return mapDbToLead(data);
};

export const addMessageToLead = async (leadId: string, messageData: Omit<LeadMessage, 'id' | 'timestamp'>): Promise<Lead | undefined> => {
    if (!supabase) return undefined;

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

    await supabase.from('Lead').update({ updatedAt: new Date().toISOString() }).eq('id', leadId);

    if (messageData.sender === 'partner' || messageData.sender === 'admin') {
         const lead = await getLeadById(leadId);
         if (lead && lead.status === 'new') {
             await updateLead(leadId, { status: 'contacted' });
         }
    }

    return getLeadById(leadId);
};

export const deleteLead = async (leadId: string): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await supabase.from('Lead').delete().eq('id', leadId);
    if (error) throw error;
    return true;
};
