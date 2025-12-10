
import { supabase } from '../lib/supabase';
import type { Property, PropertyFiltersType } from '../types';
import { mapPropertyFromDB } from '../utils/supabaseMapper';
import { filterProperties } from '../utils/propertyFilters';

// Helper to clean data before sending to DB
const sanitize = (value: any) => {
    if (value === '' || value === undefined || value === 'undefined' || value === 'null') {
        return null;
    }
    return value;
};

const populatePropertyDetails = async (property: Property): Promise<Property> => {
    if (supabase && property.partnerId) {
         // Try to fetch partner info, but don't fail if not found
         const { data: partner } = await supabase.from('partners').select('name, image_url').eq('id', property.partnerId).single();
         if (partner) {
             property.partnerName = partner.name;
             property.partnerImageUrl = partner.image_url;
         }
    }
    return property;
};

export const getAllProperties = async (): Promise<Property[]> => {
    if (!supabase) return []; // STRICT: No mock data fallback

    try {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            const mapped = data.map(mapPropertyFromDB).filter(p => p !== null) as Property[];
            return await Promise.all(mapped.map(populatePropertyDetails));
        }
        
        if (error) console.error("Supabase error fetching properties:", error);
    } catch (err) {
        console.error("Error fetching properties from DB:", err);
    }

    return [];
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
    
    const filtered = filterProperties(allProps, options.filters);
    const total = filtered.length;

    if (options.disablePagination) {
        return { properties: filtered, total };
    }

    const start = (options.page - 1) * options.limit;
    const end = start + options.limit;
    return { properties: filtered.slice(start, end), total };
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
    if (supabase) {
        const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
        if (!error && data) {
            let prop = mapPropertyFromDB(data);
            return await populatePropertyDetails(prop);
        }
    }
    return undefined;
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
    if (!supabase) throw new Error("Database connection required to add property");

    const dbData = {
        partner_id: property.partnerId,
        project_id: sanitize(property.projectId), 
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
        image_url: property.imageUrl, // This comes from Cloudinary in the frontend
        gallery: property.gallery,   // These come from Cloudinary in the frontend
        location: property.location,
        listing_status: property.listingStatus,
        listing_start_date: sanitize(property.listingStartDate),
        installments_available: property.installmentsAvailable,
        is_in_compound: property.isInCompound,
        real_estate_finance_available: property.realEstateFinanceAvailable,
        delivery_immediate: property.delivery.isImmediate,
        delivery_date: sanitize(property.delivery.date),
        contact_method: property.contactMethod,
        owner_phone: property.ownerPhone,
        installments: property.installments
    };

    const { data, error } = await supabase
        .from('properties')
        .insert([dbData])
        .select()
        .single();

    if (error) throw error;
    return mapPropertyFromDB(data);
};

export const updateProperty = async (id: string, updates: Partial<Property>): Promise<Property> => {
    if (!supabase) throw new Error("Database connection required to update property");

    const dbUpdates: any = {};
    if (updates.priceNumeric !== undefined) dbUpdates.price = updates.priceNumeric;
    if (updates.area !== undefined) dbUpdates.area = updates.area;
    if (updates.beds !== undefined) dbUpdates.beds = updates.beds;
    if (updates.baths !== undefined) dbUpdates.baths = updates.baths;
    if (updates.floor !== undefined) dbUpdates.floor = updates.floor;
    if (updates.listingStatus) dbUpdates.listing_status = updates.listingStatus;
    if (updates.listingStartDate !== undefined) dbUpdates.listing_start_date = sanitize(updates.listingStartDate);
    if (updates.listingEndDate !== undefined) dbUpdates.listing_end_date = sanitize(updates.listingEndDate);
    
    // Allow updating other fields too
    if (updates.title?.en) dbUpdates.title_en = updates.title.en;
    if (updates.title?.ar) dbUpdates.title_ar = updates.title.ar;
    if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;

    const { data, error } = await supabase
        .from('properties')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return mapPropertyFromDB(data);
};

export const deleteProperty = async (id: string): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) {
        console.warn("Supabase Delete Error:", error.message);
        return false;
    }
    return true; 
};
