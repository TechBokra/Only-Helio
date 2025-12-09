
import { supabase } from '../lib/supabase';
import type { PartnerApplicationModel, RequestStatus } from '../types';
import { addNotification } from './notifications';

const TABLE_NAME = 'partner_applications';

const mapFromDB = (row: any): PartnerApplicationModel => ({
    id: row.id,
    companyName: row.company_name,
    companyType: row.company_type,
    companyAddress: row.company_address || '', // Added
    description: row.description,
    website: row.website,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    subscriptionPlan: row.subscription_plan,
    paymentStatus: row.payment_status,
    logoUrl: row.logo_url,
    documents: row.documents || [],
    status: row.status as RequestStatus,
    createdAt: row.created_at
});

export const getPartnerApplications = async (): Promise<PartnerApplicationModel[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return [];
    return data.map(mapFromDB);
};

export const addPartnerApplication = async (
    app: Omit<PartnerApplicationModel, 'id' | 'status' | 'createdAt'>
): Promise<PartnerApplicationModel | null> => {
    if (!supabase) return null;

    const payload = {
        company_name: app.companyName,
        company_type: app.companyType,
        company_address: app.companyAddress, // Added
        description: app.description,
        website: app.website,
        contact_name: app.contactName,
        contact_email: app.contactEmail,
        contact_phone: app.contactPhone,
        subscription_plan: app.subscriptionPlan,
        payment_status: app.paymentStatus || 'pending',
        logo_url: app.logoUrl,
        documents: app.documents,
        status: 'new'
    };

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([payload])
        .select()
        .single();

    if (error) throw error;

    const newApp = mapFromDB(data);

    addNotification({
        userId: 'partner-relations-manager-1',
        message: {
            ar: `طلب انضمام شريك جديد: ${newApp.companyName}`,
            en: `New Partner Application: ${newApp.companyName}`
        },
        link: `/admin/partners/requests/${newApp.id}`
    });

    return newApp;
};

export const updatePartnerApplicationStatus = async (id: string, status: RequestStatus): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await supabase.from(TABLE_NAME).update({ status }).eq('id', id);
    return !error;
};
