
import type { Partner, AdminPartner, Property, Project } from '../types';

export const mapPartnerFromDB = (row: any): AdminPartner => {
    return {
        id: row.id,
        email: row.email,
        name: row.name, // English name
        nameAr: row.name_ar,
        description: row.description_en,
        descriptionAr: row.description_ar,
        imageUrl: row.image_url || '',
        imageUrl_small: row.image_url, // Fallback
        imageUrl_medium: row.image_url, // Fallback
        imageUrl_large: row.image_url, // Fallback
        type: row.type,
        role: row.role, // We might need to map string to enum if strict
        status: row.status,
        subscriptionPlan: row.subscription_plan,
        displayType: row.display_type || 'standard',
        contactMethods: row.contact_methods || { whatsapp: { enabled: false }, phone: { enabled: false }, form: { enabled: true } },
        createdAt: row.created_at,
    } as AdminPartner;
};

export const mapPropertyFromDB = (row: any): Property => {
    // Ensure amenities has the correct structure even if null or partial in DB
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
        address: { ar: row.address_ar || '', en: row.address_en || '' }, // Fallback if missing
        type: { ar: row.type_ar || 'شقة', en: row.type_en || 'Apartment' }, // Assuming we store types or map them
        status: { ar: row.status_ar || 'للبيع', en: row.status_en || 'For Sale' },
        price: { ar: `${(row.price || 0).toLocaleString()} ج.م`, en: `${(row.price || 0).toLocaleString()} EGP` },
        priceNumeric: row.price || 0,
        area: row.area || 0,
        beds: row.beds || 0,
        baths: row.baths || 0,
        imageUrl: row.image_url || '',
        gallery: row.gallery || [],
        location: row.location || { lat: 30.0, lng: 31.0 },
        amenities: safeAmenities,
        listingStatus: row.listing_status || 'draft',
        listingStartDate: row.created_at,
        delivery: { isImmediate: true }, // Simplification for now
        installmentsAvailable: false,
        isInCompound: false,
        realEstateFinanceAvailable: false,
    } as Property;
};
