
import { supabase } from '../lib/supabase';
import { leadsData as initialLeadsData } from '../data/leads';
import type { Lead, LeadStatus, LeadMessage } from '../types';
import { getPartnerById } from './partners';
import { addNotification } from './notifications';

let leadsData: Lead[] = [...initialLeadsData];

const mapLeadFromDB = (row: any): Lead => ({
    id: row.id,
    partnerId: row.partner_id,
    managerId: row.manager_id,
    propertyId: row.property_id,
    serviceType: row.service_type,
    serviceTitle: row.service_title,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerNotes: row.customer_notes,
    contactTime: row.contact_time,
    status: row.status,
    assignedTo: row.assigned_to,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages: [], // Messages are usually in a separate table, but simple array in JSONB or separate fetch can work. For now, empty array or we need a messages table. 
                  // *Simplification*: We will treat messages as local or future implementation since the SQL didn't include a messages table.
});

const populateLeadWithPartnerInfo = async (lead: Lead): Promise<Lead & { partnerName?: string }> => {
    const partner = await getPartnerById(lead.partnerId);
    return { ...lead, partnerName: partner?.name };
};

export const getAllLeads = async (): Promise<(Lead & { partnerName?: string })[]> => {
    let leads: Lead[] = [];
    
    if (supabase) {
        const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (!error && data) {
            leads = data.map(mapLeadFromDB);
        } else {
            leads = [...leadsData]; // Fallback
        }
    } else {
        leads = [...leadsData];
    }

    const populatedLeadsPromises = leads.map(populateLeadWithPartnerInfo);
    return Promise.all(populatedLeadsPromises);
};

export const getLeadsByPartnerId = async (partnerId: string): Promise<Lead[]> => {
    const all = await getAllLeads();
    return all.filter(l => l.partnerId === partnerId);
};

export const getLeadById = async (leadId: string): Promise<Lead | undefined> => {
    if (supabase) {
        const { data, error } = await supabase.from('leads').select('*').eq('id', leadId).single();
        if (!error && data) {
            return await populateLeadWithPartnerInfo(mapLeadFromDB(data));
        }
    }
    const lead = leadsData.find(l => l.id === leadId);
    if(lead) return await populateLeadWithPartnerInfo(lead);
    return undefined;
};

export const addLead = async (leadData: Omit<Lead, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'messages'>): Promise<Lead> => {
    const now = new Date().toISOString();
    
    if (supabase) {
        const { data, error } = await supabase.from('leads').insert([{
            partner_id: leadData.partnerId,
            manager_id: leadData.managerId,
            property_id: leadData.propertyId,
            service_type: leadData.serviceType,
            service_title: leadData.serviceTitle,
            customer_name: leadData.customerName,
            customer_phone: leadData.customerPhone,
            customer_notes: leadData.customerNotes,
            contact_time: leadData.contactTime,
            assigned_to: leadData.assignedTo,
            status: 'new'
        }]).select().single();

        if (!error && data) {
            const newLead = mapLeadFromDB(data);
            // Notify
            const targetUserId = newLead.managerId || newLead.partnerId;
            const link = newLead.managerId 
                ? (newLead.serviceType === 'finishing' ? '/admin/finishing-requests' : '/admin/decoration-requests')
                : '/dashboard/leads';
            
            addNotification({
                userId: targetUserId,
                message: { ar: `طلب جديد: ${newLead.customerName}`, en: `New Lead: ${newLead.customerName}` },
                link
            });
            
            return newLead;
        }
    }

    // Fallback
    const newLead: Lead = {
        ...leadData,
        id: `lead-${Date.now()}`,
        status: 'new',
        createdAt: now,
        updatedAt: now,
        messages: [],
    };
    leadsData.unshift(newLead);
    return newLead;
};

export const updateLead = async (leadId: string, updates: Partial<Omit<Lead, 'id' | 'createdAt'>>): Promise<Lead | undefined> => {
    if (supabase) {
        const dbUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.assignedTo) dbUpdates.assigned_to = updates.assignedTo;
        
        const { data, error } = await supabase.from('leads').update(dbUpdates).eq('id', leadId).select().single();
        if (!error && data) return mapLeadFromDB(data);
    }

    const leadIndex = leadsData.findIndex(l => l.id === leadId);
    if (leadIndex > -1) {
        leadsData[leadIndex] = { ...leadsData[leadIndex], ...updates, updatedAt: new Date().toISOString() };
        return leadsData[leadIndex];
    }
    return undefined;
};

export const deleteLead = async (leadId: string): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase.from('leads').delete().eq('id', leadId);
        if (!error) return true;
    }
    const initialLength = leadsData.length;
    leadsData = leadsData.filter(l => l.id !== leadId);
    return leadsData.length < initialLength;
};

// Mock implementation for messages since we don't have a DB table for them yet in this simplified SQL
export const addMessageToLead = async (leadId: string, messageData: Omit<LeadMessage, 'id' | 'timestamp'>): Promise<Lead | undefined> => {
    // In a real full implementation, create a 'lead_messages' table.
    // For now, we assume the 'messages' array is handled in memory for the session or we just update the `updated_at`.
    // To keep it simple and working without migration complexity:
    console.log("Message added (stored in-memory/logs only for now):", messageData);
    return getLeadById(leadId);
};
