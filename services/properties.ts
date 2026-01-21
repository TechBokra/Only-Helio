
import { supabase } from '../supabaseClient';
import type { Property, PropertyFiltersType } from '../types';
import { filterProperties } from '../utils/propertyFilters';

// Helper to safely parse JSON or return original if already object
const safeParse = (val: any, fallback: any) => {
    if (typeof val === 'string') {
        try { return JSON.parse(val); } catch(e) { return fallback; }
    }
    return val || fallback;
};

const mapDbToProperty = (row: any): Property => {
    let partnerName = 'Only Helio';
    // Handle join relation safely - prioritize EN then AR
    if (row.partner) {
        partnerName = row.partner.name_en || row.partner.name_ar || partnerName;
    }

    const mainImage = row.imageUrl || 'https://via.placeholder.com/800x600?text=No+Image';

    return {
        id: row.id,
        partnerId: row.partnerId,
        partnerName: partnerName,
        partnerImageUrl: row.partner?.imageUrl,
        projectId: row.projectId,
        projectName: row.project ? { en: row.project.name_en, ar: row.project.name_ar } : undefined,
        
        title: { en: row.title_en || '', ar: row.title_ar || '' },
        description: { en: row.description_en || '', ar: row.description_ar || '' },
        address: { en: row.address_en || '', ar: row.address_ar || '' },
        
        imageUrl: mainImage,
        imageUrl_small: mainImage, 
        imageUrl_medium: mainImage,
        imageUrl_large: mainImage,
        
        gallery: safeParse(row.gallery, []),
        
        status: { 
            en: row.status === 'For Rent' ? 'For Rent' : 'For Sale',
            ar: row.status === 'For Rent' ? 'إيجار' : 'للبيع'
        },
        
        price: { en: row.price_en || `${row.price} EGP`, ar: row.price_ar || `${row.price} ج.م` },
        priceNumeric: Number(row.price),
        area: Number(row.area),
        beds: Number(row.beds),
        baths: Number(row.baths),
        floor: Number(row.floor),
        
        type: { en: row.type_en, ar: row.type_ar },
        finishingStatus: row.finishingStatus_en ? { en: row.finishingStatus_en, ar: row.finishingStatus_ar } : undefined,
        
        listingStatus: row.listingStatus || 'active',
        listingStartDate: row.listingStartDate || row.createdAt,
        
        amenities: {
            en: Array.isArray(row.amenities) ? row.amenities : [], // Assuming array of strings
            ar: [] // Ideally fetched or mapped, simplified for now
        },
        
        location: safeParse(row.location, { lat: 30.0, lng: 31.0 }),
        installments: safeParse(row.installments, undefined),
        
        isInCompound: !!row.isInCompound,
        installmentsAvailable: !!row.installmentsAvailable,
        realEstateFinanceAvailable: !!row.realEstateFinanceAvailable,
        
        delivery: {
            isImmediate: !!row.deliveryImmediate,
            date: row.deliveryDate
        },
        
        contactMethod: row.contactMethod || 'platform',
        ownerPhone: row.ownerPhone,
        createdAt: row.createdAt
    };
};

export const getAllProperties = async (): Promise<Property[]> => {
    // Explicit relation loading - Removed 'name' column which caused the error
    // Asking for name_en and name_ar instead
    const { data, error } = await supabase
        .from('Property')
        .select(`
            *, 
            partner:User!Property_partnerId_fkey(name_en, name_ar, imageUrl), 
            project:Project!Property_projectId_fkey(name_en, name_ar)
        `)
        .order('createdAt', { ascending: false });

    if (error) {
        console.error("Error fetching properties:", error);
        return [];
    }
    return (data || []).map(mapDbToProperty);
};

export const getProperties = async (): Promise<Property[]> => {
    return getAllProperties();
};

export const getPaginatedProperties = async (options: {
  page: number;
  limit: number;
  filters: PropertyFiltersType;
  disablePagination?: boolean;
}): Promise<{ properties: Property[]; total: number }> => {
    const { page, limit, filters, disablePagination } = options;
    // Note: In a real production app, filtering should happen on the Database (Supabase) side for performance.
    // Currently, we fetch all and filter in memory as per current architecture.
    const allProperties = await getAllProperties();
    const filtered = filterProperties(allProperties, filters);
    const total = filtered.length;
    
    if (disablePagination) return { properties: filtered, total };
    
    const start = (page - 1) * limit;
    const end = start + limit;
    return { properties: filtered.slice(start, end), total };
};

export const getPropertiesByPartnerId = async (partnerId: string): Promise<Property[]> => {
    // Removed 'name' column
    const { data, error } = await supabase
        .from('Property')
        .select(`
            *, 
            partner:User!Property_partnerId_fkey(name_en, name_ar, imageUrl), 
            project:Project!Property_projectId_fkey(name_en, name_ar)
        `)
        .eq('partnerId', partnerId)
        .order('createdAt', { ascending: false });

    if (error) return [];
    return (data || []).map(mapDbToProperty);
};

export const getPropertiesByProjectId = async (projectId: string): Promise<Property[]> => {
    // Removed 'name' column
    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!Property_partnerId_fkey(name_en, name_ar, imageUrl)`)
        .eq('projectId', projectId);

    if (error) return [];
    return (data || []).map(mapDbToProperty);
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
    // Removed 'name' column
    const { data, error } = await supabase
        .from('Property')
        .select(`
            *, 
            partner:User!Property_partnerId_fkey(name_en, name_ar, imageUrl), 
            project:Project!Property_projectId_fkey(name_en, name_ar)
        `)
        .eq('id', id)
        .single();

    if (error) return undefined;
    return mapDbToProperty(data);
};

export const addProperty = async (property: Omit<Property, 'id' | 'partnerName' | 'partnerImageUrl'>): Promise<Property> => {
    const newId = crypto.randomUUID();
    const dbPayload = {
        id: newId,
        partnerId: property.partnerId,
        projectId: property.projectId || null,
        title_en: property.title.en,
        title_ar: property.title.ar,
        description_en: property.description.en,
        description_ar: property.description.ar,
        address_en: property.address.en,
        address_ar: property.address.ar,
        price: property.priceNumeric,
        price_en: property.price.en,
        price_ar: property.price.ar,
        area: property.area,
        beds: property.beds,
        baths: property.baths,
        floor: property.floor,
        type_en: property.type.en,
        type_ar: property.type.ar,
        status: property.status.en === 'For Sale' ? 'For Sale' : 'For Rent',
        imageUrl: property.imageUrl,
        gallery: property.gallery,
        location: property.location,
        installments: property.installments,
        amenities: property.amenities.en, 
        
        isInCompound: property.isInCompound,
        installmentsAvailable: property.installmentsAvailable,
        realEstateFinanceAvailable: property.realEstateFinanceAvailable,
        deliveryImmediate: property.delivery.isImmediate,
        deliveryDate: property.delivery.date,
        listingStatus: property.listingStatus,
        contactMethod: property.contactMethod,
        ownerPhone: property.ownerPhone,
        createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase.from('Property').insert(dbPayload).select().single();
    if (error) throw error;
    return mapDbToProperty(data);
};

export const updateProperty = async (propertyId: string, updates: Partial<Property>): Promise<Property | undefined> => {
    const dbUpdates: any = { ...updates };
    
    // Map nested objects to DB columns
    if (updates.title) {
        dbUpdates.title_en = updates.title.en;
        dbUpdates.title_ar = updates.title.ar;
        delete dbUpdates.title;
    }
    if (updates.amenities) {
        dbUpdates.amenities = updates.amenities.en;
    }

    const { data, error } = await supabase.from('Property').update(dbUpdates).eq('id', propertyId).select().single();
    if (error) return undefined;
    return mapDbToProperty(data);
};

export const deleteProperty = async (propertyId: string): Promise<boolean> => {
    const { error } = await supabase.from('Property').delete().eq('id', propertyId);
    return !error;
};
