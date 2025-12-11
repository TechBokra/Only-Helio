
import type { Partner, AdminPartner, Property, Project, Request } from '../types';
import { Role, RequestType } from '../types';

export const mapPartnerFromDB = (row: any): AdminPartner => {
    // Normalize DB role to Enum format
    // Fallback: If role column is missing/null, default to AGENCY_PARTNER
    let role = row.role ? row.role.toUpperCase() : Role.AGENCY_PARTNER;

    // Handle name mapping: Prefer 'name' column, fallback to combining first/last name
    let displayName = row.name;
    if (!displayName && (row.first_name || row.last_name)) {
        displayName = `${row.first_name || ''} ${row.last_name || ''}`.trim();
    }
    if (!displayName) displayName = 'User';

    return {
        id: row.id,
        email: row.email,
        password: row.password, 
        name: displayName,
        nameAr: row.name_ar || displayName, // Fallback to EN name if AR missing
        description: row.description_en || row.bio, // Map bio to description if needed
        descriptionAr: row.description_ar || row.bio,
        imageUrl: row.image_url || row.company_logo_url || '', // Support both image columns
        imageUrl_small: row.image_url || row.company_logo_url,
        imageUrl_medium: row.image_url || row.company_logo_url,
        imageUrl_large: row.image_url || row.company_logo_url,
        type: row.type || row.account_type || 'agency', // Map account_type if type is missing
        role: role as Role,
        status: row.status || (row.is_active ? 'active' : 'pending'),
        subscriptionPlan: row.subscription_plan || 'basic',
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
