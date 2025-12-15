
import { supabase } from '../supabaseClient';
import { leadsData as fileLeads } from '../data/leads';
import type { Lead, LeadMessage } from '../types';
import { addNotification } from './notifications';

// Hardcoded fallback if file is empty
const fallbackLeads: Lead[] = [
    {
        id: 'lead-1',
        partnerId: 'admin-user',
        serviceType: 'property',
        customerName: 'Dr. Ahmed Mahmoud',
        customerPhone: '01000000000',
        serviceTitle: 'Inquiry about "Luxury Villa in Korba Heights"',
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        propertyId: 'prop-fallback-1',
        partnerName: 'United Development'
    }
];

const getMockLeads = (): Lead[] => {
    return fileLeads.length > 0 ? fileLeads : fallbackLeads;
};

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
    partnerName: row.partner?.name || 'Unknown',
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
    if (!supabase) return getMockLeads().filter(l => l.partnerId === partnerId);
    
    const { data, error } = await supabase
        .from('Lead')
        .select(`*, partner:User!partnerId(name), messages:LeadMessage(*)`)
        .eq('partnerId', partnerId)
        .order('createdAt', { ascending: false });
        
    if (error || !data || data.length === 0) {
        return getMockLeads().filter(l => l.partnerId === partnerId);
    }
    return data.map(mapDbToLead);
};

export const getLeadById = async (leadId: string): Promise<Lead | undefined> => {
    if (!supabase) return getMockLeads().find(l => l.id === leadId);

    const { data, error } = await supabase
        .from('Lead')
        .select(`*, partner:User!partnerId(name), messages:LeadMessage(*)`)
        .eq('id', leadId)
        .single();

    if (error) return getMockLeads().find(l => l.id === leadId);
    return mapDbToLead(data);
};

export const getAllLeads = async (): Promise<(Lead & { partnerName?: string })[]> => {
    if (!supabase) return getMockLeads();

    const { data, error } = await supabase
        .from('Lead')
        .select(`*, partner:User!partnerId(name), messages:LeadMessage(*)`)
        .order('createdAt', { ascending: false });

    if (error || !data || data.length === 0) {
        return getMockLeads();
    }
    return data.map(mapDbToLead);
};

export const addLead = async (leadData: Omit<Lead, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'messages'>): Promise<Lead> => {
    if (!supabase) {
        // Mock
        const newLead = { ...leadData, id: `lead-${Date.now()}`, status: 'new', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Lead;
        fallbackLeads.unshift(newLead);
        return newLead;
    }

    const now = new Date().toISOString();
    const newLead = {
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

    const { data, error } = await supabase.from('Lead').insert(newLead).select().single();
    if (error) throw error;

    // Send notification
    const targetUserId = leadData.managerId || leadData.partnerId;
    const link = leadData.managerId 
        ? (leadData.serviceType === 'finishing' ? '/admin/finishing-requests' : '/admin/decoration-requests')
        : '/dashboard/leads';

    addNotification({
        userId: targetUserId,
        message: {
            ar: `لديك طلب عميل جديد من "${leadData.customerName}".`,
            en: `New lead from "${leadData.customerName}".`,
        },
        link: link,
    });

    return mapDbToLead(data);
};

export const updateLead = async (leadId: string, updates: Partial<Omit<Lead, 'id' | 'createdAt'>>): Promise<Lead | undefined> => {
    if (!supabase) return undefined; // Mock not fully implemented

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
    if (!supabase) return undefined; // Mock not fully implemented

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
    if (!supabase) return true; // Mock
    const { error } = await supabase.from('Lead').delete().eq('id', leadId);
    if (error) throw error;
    return true;
};
