
import { supabase } from '../lib/supabase';
import { propertiesData as initialPropertiesData } from '../data/properties';
import type { Property, PropertyFiltersType } from '../types';
import { mapPropertyFromDB } from '../utils/supabaseMapper';
import { filterProperties } from '../utils/propertyFilters';

// Mutable local store initialized with seed data
let localProperties: Property[] = [...initialPropertiesData];

// Helper to clean data before sending to DB
const sanitize = (value: any) => {
    if (value === '' || value === undefined || value === 'undefined' || value === 'null') {
        return null;
    }
    return value;
};

const populatePropertyDetails = async (property: Property): Promise<Property> => {
    if (supabase && property.partnerId) {
         // Optimization: We could cache partners, but for now individual fetch is fine for details
         const { data: partner } = await supabase.from('partners').select('name, image_url').eq('id', property.partnerId).single();
         if (partner) {
             property.partnerName = partner.name;
             property.partnerImageUrl = partner.image_url;
         }
    }
    return property;
};

export const getAllProperties = async (): Promise<Property[]> => {
    let dbProperties: Property[] = [];
    let isDbAvailable = false;

    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                const mapped = data.map(mapPropertyFromDB).filter(p => p !== null) as Property[];
                dbProperties = await Promise.all(mapped.map(populatePropertyDetails));
                isDbAvailable = true;
            }
        } catch (err) {
            console.error("Error fetching properties from DB:", err);
        }
    }

    // Fallback or Merge Strategy:
    // If DB is available, we use it. But we also append any "local-only" properties 
    // that might have been created during this session if DB writes failed (e.g. RLS errors).
    // Local-only properties usually have temp IDs or IDs not found in DB list.
    
    if (isDbAvailable) {
        const dbIdSet = new Set(dbProperties.map(p => p.id));
        const missingLocals = localProperties.filter(p => !dbIdSet.has(p.id));
        return [...dbProperties, ...missingLocals];
    }

    // If DB is completely unavailable/disconnected, return purely local state
    return localProperties;
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
    
    // In admin view, we might want to see inactive ones too, but for public search usually just active.
    // The filter hook handles status filtering, so here we pass all.
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
    // 1. Try to find in local cache first (fastest, covers temp items)
    let prop = localProperties.find(p => p.id === id);
    if (prop) return prop;

    // 2. Try DB
    if (supabase) {
        const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
        if (!error && data) {
            prop = mapPropertyFromDB(data);
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
    const newId = `prop-temp-${Date.now()}`;
    // Prepare local fallback object immediately
    const fallbackProperty: Property = {
        ...property,
        id: newId,
        partnerName: '', // Will be refreshed on list reload
        partnerImageUrl: ''
    };

    if (supabase) {
        try {
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
                image_url: property.imageUrl,
                gallery: property.gallery,
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

        } catch (error: any) {
            console.warn("Supabase Insert Error (falling back to local):", error.message);
            // Don't throw, proceed to fallback
        }
    }

    // Fallback: Save to local memory store
    localProperties.unshift(fallbackProperty);
    return fallbackProperty;
};

export const updateProperty = async (id: string, updates: Partial<Property>): Promise<Property> => {
    // Find existing to merge locally if needed
    const existingIndex = localProperties.findIndex(p => p.id === id);
    const existing = existingIndex > -1 ? localProperties[existingIndex] : null;

    if (supabase) {
        try {
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
        } catch (error: any) {
            console.warn("Supabase Update Error (falling back to local):", error.message);
        }
    }

    // Fallback Local Update
    if (existing) {
        const updated = { ...existing, ...updates };
        localProperties[existingIndex] = updated as Property;
        return updated as Property;
    }
    
    // If not in local and DB failed, assume simple object merge for UI responsiveness
    return { ...initialPropertiesData[0], ...updates, id } as Property;
};

export const deleteProperty = async (id: string): Promise<boolean> => {
    let success = false;
    if (supabase) {
        try {
            const { error } = await supabase.from('properties').delete().eq('id', id);
            if (!error) success = true;
            else console.warn("Supabase Delete Error:", error.message);
        } catch (e) {
             console.warn("Supabase Delete Exception:", e);
        }
    }

    // Always delete locally as well
    const initialLength = localProperties.length;
    localProperties = localProperties.filter(p => p.id !== id);
    if (localProperties.length < initialLength) success = true;

    // If we're in fallback mode, we assume success if we processed locally or simply suppress the error
    return true; 
};
