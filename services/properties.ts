
import { supabase } from '../lib/supabase';
import { propertiesData as initialPropertiesData } from '../data/properties';
import type { Property, PropertyFiltersType } from '../types';
import { mapPropertyFromDB } from '../utils/supabaseMapper';
import { filterProperties } from '../utils/propertyFilters';

// Helper to clean data before sending to DB
// Converts empty strings, "undefined", or "null" strings to actual null for DB compatibility
const sanitize = (value: any) => {
    if (value === '' || value === undefined || value === 'undefined' || value === 'null') {
        return null;
    }
    return value;
};

// Helper to get partner info (could be optimized with joins later)
const populatePropertyDetails = async (property: Property): Promise<Property> => {
    if (supabase && property.partnerId) {
         const { data: partner } = await supabase.from('partners').select('name, image_url').eq('id', property.partnerId).single();
         if (partner) {
             property.partnerName = partner.name;
             property.partnerImageUrl = partner.image_url;
         }
    }
    return property;
};

export const getAllProperties = async (): Promise<Property[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('properties')
        .select('*');

    if (error) {
        console.error("Error fetching properties:", JSON.stringify(error, null, 2));
        return [];
    }

    if (!data) {
        return [];
    }

    const properties = data.map(mapPropertyFromDB);
    // Populate details in parallel
    return await Promise.all(properties.map(populatePropertyDetails));
};

// Alias for compatibility
export const getProperties = getAllProperties;

export const getPaginatedProperties = async (options: {
  page: number;
  limit: number;
  filters: PropertyFiltersType;
  disablePagination?: boolean;
}): Promise<{ properties: Property[]; total: number }> => {
    const allProps = await getAllProperties();
    
    const activeProps = allProps.filter(p => p.listingStatus === 'active');
    const filtered = filterProperties(activeProps, options.filters);
    const total = filtered.length;

    if (options.disablePagination) {
        return { properties: filtered, total };
    }

    const start = (options.page - 1) * options.limit;
    const end = start + options.limit;
    return { properties: filtered.slice(start, end), total };
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
    if (!supabase) return undefined;
    const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    const prop = mapPropertyFromDB(data);
    return await populatePropertyDetails(prop);
};

export const getPropertiesByPartnerId = async (partnerId: string): Promise<Property[]> => {
    const all = await getAllProperties();
    return all.filter(p => p.partnerId === partnerId);
};

export const getPropertiesByProjectId = async (projectId: string): Promise<Property[]> => {
    const all = await getAllProperties();
    return all.filter(p => p.projectId === projectId);
};

// --- Write Operations ---

export const addProperty = async (property: Omit<Property, 'id' | 'partnerName' | 'partnerImageUrl'>): Promise<Property> => {
    const dbData = {
        partner_id: property.partnerId,
        project_id: sanitize(property.projectId), // Sanitize FK
        title_ar: property.title.ar,
        title_en: property.title.en,
        description_ar: property.description.ar,
        description_en: property.description.en,
        address_ar: property.address.ar,
        address_en: property.address.en,
        type_en: property.type.en,
        type_ar: property.type.ar,
        status_en: property.status.en,
        status_ar: property.status.ar,
        finishing_status_en: property.finishingStatus?.en,
        finishing_status_ar: property.finishingStatus?.ar,
        price: property.priceNumeric,
        area: property.area,
        beds: property.beds,
        baths: property.baths,
        floor: property.floor,
        image_url: property.imageUrl,
        gallery: property.gallery,
        location: property.location,
        listing_status: property.listingStatus,
        listing_start_date: sanitize(property.listingStartDate), // Sanitize Date
        installments_available: property.installmentsAvailable,
        is_in_compound: property.isInCompound,
        real_estate_finance_available: property.realEstateFinanceAvailable,
        delivery_immediate: property.delivery.isImmediate,
        delivery_date: sanitize(property.delivery.date), // Sanitize Date
        contact_method: property.contactMethod,
        owner_phone: property.ownerPhone,
        amenities: property.amenities, 
        installments: property.installments
    };

    const { data, error } = await supabase!
        .from('properties')
        .insert([dbData])
        .select()
        .single();

    if (error) {
        console.error("Supabase Insert Error:", error);
        throw new Error(error.message);
    }
    return mapPropertyFromDB(data);
};

export const updateProperty = async (id: string, updates: Partial<Property>): Promise<Property> => {
    // Fully Map Partial<Property> to DB columns for update
    const dbUpdates: any = {};

    // Basic Info & Metrics
    if (updates.priceNumeric !== undefined) dbUpdates.price = updates.priceNumeric;
    if (updates.area !== undefined) dbUpdates.area = updates.area;
    if (updates.beds !== undefined) dbUpdates.beds = updates.beds;
    if (updates.baths !== undefined) dbUpdates.baths = updates.baths;
    if (updates.floor !== undefined) dbUpdates.floor = updates.floor;

    // Localized Texts
    if (updates.title) {
        if (updates.title.ar !== undefined) dbUpdates.title_ar = updates.title.ar;
        if (updates.title.en !== undefined) dbUpdates.title_en = updates.title.en;
    }
    if (updates.description) {
        if (updates.description.ar !== undefined) dbUpdates.description_ar = updates.description.ar;
        if (updates.description.en !== undefined) dbUpdates.description_en = updates.description.en;
    }
    if (updates.address) {
        if (updates.address.ar !== undefined) dbUpdates.address_ar = updates.address.ar;
        if (updates.address.en !== undefined) dbUpdates.address_en = updates.address.en;
    }
    if (updates.type) {
        if (updates.type.ar !== undefined) dbUpdates.type_ar = updates.type.ar;
        if (updates.type.en !== undefined) dbUpdates.type_en = updates.type.en;
    }
    if (updates.status) {
        if (updates.status.ar !== undefined) dbUpdates.status_ar = updates.status.ar;
        if (updates.status.en !== undefined) dbUpdates.status_en = updates.status.en;
    }
    if (updates.finishingStatus) {
        if (updates.finishingStatus.ar !== undefined) dbUpdates.finishing_status_ar = updates.finishingStatus.ar;
        if (updates.finishingStatus.en !== undefined) dbUpdates.finishing_status_en = updates.finishingStatus.en;
    }

    // JSON Fields
    if (updates.location) dbUpdates.location = updates.location;
    if (updates.amenities) dbUpdates.amenities = updates.amenities;
    if (updates.installments) dbUpdates.installments = updates.installments;
    if (updates.gallery) dbUpdates.gallery = updates.gallery;

    // Media
    if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;

    // Booleans & Status
    if (updates.installmentsAvailable !== undefined) dbUpdates.installments_available = updates.installmentsAvailable;
    if (updates.isInCompound !== undefined) dbUpdates.is_in_compound = updates.isInCompound;
    if (updates.realEstateFinanceAvailable !== undefined) dbUpdates.real_estate_finance_available = updates.realEstateFinanceAvailable;
    
    if (updates.listingStatus) dbUpdates.listing_status = updates.listingStatus;
    
    // Sanitize Dates
    if (updates.listingStartDate !== undefined) dbUpdates.listing_start_date = sanitize(updates.listingStartDate);
    if (updates.listingEndDate !== undefined) dbUpdates.listing_end_date = sanitize(updates.listingEndDate);

    // Delivery
    if (updates.delivery) {
        if (updates.delivery.isImmediate !== undefined) dbUpdates.delivery_immediate = updates.delivery.isImmediate;
        if (updates.delivery.date !== undefined) dbUpdates.delivery_date = sanitize(updates.delivery.date);
    }
    
    // Relations - Sanitize FKs
    if (updates.projectId !== undefined) dbUpdates.project_id = sanitize(updates.projectId);

    // Contact
    if (updates.contactMethod) dbUpdates.contact_method = updates.contactMethod;
    if (updates.ownerPhone) dbUpdates.owner_phone = updates.ownerPhone;
    
    const { data, error } = await supabase!
        .from('properties')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error("Supabase Update Error:", error);
        throw new Error(error.message);
    }
    return mapPropertyFromDB(data);
};

export const deleteProperty = async (id: string): Promise<boolean> => {
    const { error } = await supabase!
        .from('properties')
        .delete()
        .eq('id', id);
    return !error;
};

// --- SEEDING HELPER ---
export const seedPropertiesToSupabase = async () => {
    console.log("Starting seeding properties...");
    const mappedData = initialPropertiesData.map(p => ({
        id: p.id,
        partner_id: p.partnerId,
        project_id: p.projectId,
        title_ar: p.title.ar,
        title_en: p.title.en,
        description_ar: p.description.ar,
        description_en: p.description.en,
        type: p.type.en, 
        status_en: p.status.en,
        status_ar: p.status.ar,
        price: p.priceNumeric,
        area: p.area,
        beds: p.beds,
        baths: p.baths,
        image_url: p.imageUrl,
        gallery: p.gallery,
        location: p.location,
        listing_status: p.listingStatus,
        amenities: p.amenities
    }));

    const { error } = await supabase!.from('properties').upsert(mappedData);
    if (error) console.error("Seeding properties failed:", error);
    else console.log("Properties seeded successfully");
};
