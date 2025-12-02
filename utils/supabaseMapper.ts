
import type { Partner, AdminPartner, Property, Project, Request } from '../types';
import { Role, RequestType } from '../types';

export const mapPartnerFromDB = (row: any): AdminPartner => {
    // Fix: Normalize DB role (e.g., 'super_admin') to Enum format ('SUPER_ADMIN')
    // This prevents the redirection loop where admins are treated as guests/agencies.
    let role = row.role ? row.role.toUpperCase() : Role.AGENCY_PARTNER;

    return {
        id: row.id,
        email: row.email,
        password: row.password, // Added password mapping
        name: row.name, // English name
        nameAr: row.name_ar,
        description: row.description_en,
        descriptionAr: row.description_ar,
        imageUrl: row.image_url || '',
        imageUrl_small: row.image_url,
        imageUrl_medium: row.image_url,
        imageUrl_large: row.image_url,
        type: row.type,
        role: role as Role,
        status: row.status,
        subscriptionPlan: row.subscription_plan,
        displayType: row.display_type || 'standard',
        contactMethods: row.contact_methods || { whatsapp: { enabled: false }, phone: { enabled: false }, form: { enabled: true } },
        createdAt: row.created_at,
    } as AdminPartner;
};

export const mapPropertyFromDB = (row: any): Property => {
    const amenities = row.amenities || {};
    const safeAmenities = {
        ar: Array.isArray(amenities.ar) ? amenities.ar : [],
        en: Array.isArray(amenities.en) ? amenities.en : [],
    };

    return {
        id: row.id,
        partnerId: row.partner_id,
        projectId: row.project_id,
        title: { ar: row.title_ar || '', en: row.title_en || '' },
        description: { ar: row.description_ar || '', en: row.description_en || '' },
        address: { ar: row.address_ar || '', en: row.address_en || '' },
        type: { ar: row.type_ar || 'شقة', en: row.type_en || 'Apartment' },
        status: { ar: row.status_ar || 'للبيع', en: row.status_en || 'For Sale' },
        price: { ar: `${(row.price || 0).toLocaleString()} ج.م`, en: `${(row.price || 0).toLocaleString()} EGP` },
        priceNumeric: row.price || 0,
        area: row.area || 0,
        beds: row.beds || 0,
        baths: row.baths || 0,
        floor: row.floor,
        imageUrl: row.image_url || '',
        gallery: row.gallery || [],
        location: row.location || { lat: 30.0, lng: 31.0 },
        amenities: safeAmenities,
        listingStatus: row.listing_status || 'draft',
        listingStartDate: row.listing_start_date || row.created_at,
        listingEndDate: row.listing_end_date,
        delivery: { 
            isImmediate: row.delivery_immediate, 
            date: row.delivery_date 
        },
        installmentsAvailable: row.installments_available,
        isInCompound: row.is_in_compound,
        realEstateFinanceAvailable: row.real_estate_finance_available,
        installments: row.installments,
        contactMethod: row.contact_method,
        ownerPhone: row.owner_phone,
        finishingStatus: {
            en: row.finishing_status_en,
            ar: row.finishing_status_ar
        }
    } as Property;
};

export const mapRequestFromDB = (row: any): Request => {
    return {
        id: row.id,
        type: row.type as RequestType,
        requesterInfo: typeof row.requester_info === 'string' ? JSON.parse(row.requester_info) : row.requester_info,
        payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
        status: row.status,
        assignedTo: row.assigned_to,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    } as Request;
};
