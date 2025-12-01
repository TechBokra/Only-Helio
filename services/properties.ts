
import { supabase } from '../lib/supabase';
import { propertiesData as initialPropertiesData } from '../data/properties';
import type { Property, PropertyFiltersType } from '../types';
import { mapPropertyFromDB } from '../utils/supabaseMapper';
import { filterProperties } from '../utils/propertyFilters';

// Helper to get partner info (could be optimized with joins later)
const populatePropertyDetails = async (property: Property): Promise<Property> => {
    // In a real Supabase query, we would use .select('*, partners(*)') to join.
    // For now, we'll return as is, or fetch partner separately if needed.
    // To keep it fast, let's rely on the basic data first.
    
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
        console.error("Error fetching properties:", error);
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
    // For now, fetch all and filter client-side to maintain complex filter logic
    // without writing complex SQL queries immediately.
    const allProps = await getAllProperties();
    
    // Apply existing filter logic
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
    // Simplification: We are not handling all nested relations (amenities) perfectly here for the mock DB
    // In a real implementation, you would insert into 'properties' then into 'amenities_on_properties'
    
    const dbData = {
        partner_id: property.partnerId,
        project_id: property.projectId,
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
        price: property.priceNumeric,
        area: property.area,
        beds: property.beds,
        baths: property.baths,
        floor: property.floor,
        image_url: property.imageUrl,
        gallery: property.gallery,
        location: property.location,
        listing_status: property.listingStatus,
        listing_start_date: property.listingStartDate,
        installments_available: property.installmentsAvailable,
        is_in_compound: property.isInCompound,
        real_estate_finance_available: property.realEstateFinanceAvailable,
        // JSON fields
        amenities: property.amenities, 
        installments: property.installments
    };

    const { data, error } = await supabase!
        .from('properties')
        .insert([dbData])
        .select()
        .single();

    if (error) throw error;
    return mapPropertyFromDB(data);
};

export const updateProperty = async (id: string, updates: Partial<Property>): Promise<Property> => {
    // Map Partial<Property> to DB columns
    const dbUpdates: any = {};
    if (updates.listingStatus) dbUpdates.listing_status = updates.listingStatus;
    if (updates.listingStartDate) dbUpdates.listing_start_date = updates.listingStartDate;
    if (updates.listingEndDate) dbUpdates.listing_end_date = updates.listingEndDate;
    if (updates.title) {
        if (updates.title.ar) dbUpdates.title_ar = updates.title.ar;
        if (updates.title.en) dbUpdates.title_en = updates.title.en;
    }
    // Add other fields as needed
    
    const { data, error } = await supabase!
        .from('properties')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
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
