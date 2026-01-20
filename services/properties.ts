import { supabase } from '../supabaseClient';
import type { Property, PropertyFiltersType } from '../types';
import { filterProperties } from '../utils/propertyFilters';

const mapDbToProperty = (row: any): Property => {
    let partnerName = 'Only Helio';
    // Handle join relation safely using the explicit alias
    if (row.partner) {
        partnerName = row.partner.name_en || row.partner.name || partnerName;
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
        // JSONB/Array fields are automatically parsed by Supabase client, but we add checks for safety
        gallery: Array.isArray(row.gallery) ? row.gallery : (typeof row.gallery === 'string' ? JSON.parse(row.gallery) : []),
        status: { 
            en: row.status === 'For Rent' ? 'For Rent' : 'For Sale',
            ar: row.status === 'For Rent' ? 'إيجار' : 'للبيع'
        },
        price: { en: row.price_en || `${row.price} EGP`, ar: row.price_ar || `${row.price} ج.م` },
        priceNumeric: row.price,
        area: row.area,
        beds: row.beds,
        baths: row.baths,
        floor: row.floor,
        type: { en: row.type_en, ar: row.type_ar },
        finishingStatus: row.finishingStatus_en ? { en: row.finishingStatus_en, ar: row.finishingStatus_ar } : undefined,
        listingStatus: row.listingStatus || 'active',
        listingStartDate: row.listingStartDate || row.createdAt,
        amenities: {
            en: Array.isArray(row.amenities) ? row.amenities : [],
            ar: [] 
        },
        location: typeof row.location === 'object' ? row.location : (typeof row.location === 'string' ? JSON.parse(row.location) : { lat: 30.0, lng: 31.0 }),
        installments: typeof row.installments === 'object' ? row.installments : (typeof row.installments === 'string' ? JSON.parse(row.installments) : row.installments),
        isInCompound: !!row.isInCompound,
        installmentsAvailable: !!row.installmentsAvailable,
        realEstateFinanceAvailable: !!row.realEstateFinanceAvailable,
        delivery: {
            isImmediate: !!row.deliveryImmediate,
            date: row.deliveryDate
        },
        contactMethod: row.contactMethod || 'platform',
        ownerPhone: row.ownerPhone,
    };
};

export const getAllProperties = async (): Promise<Property[]> => {
    // We use User!Property_partnerId_fkey to explicitly tell Supabase which relation to use
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
    const allProperties = await getAllProperties();
    const filtered = filterProperties(allProperties, filters);
    const total = filtered.length;
    
    if (disablePagination) return { properties: filtered, total };
    
    const start = (page - 1) * limit;
    const end = start + limit;
    return { properties: filtered.slice(start, end), total };
};

export const getPropertiesByPartnerId = async (partnerId: string): Promise<Property[]> => {
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
    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!Property_partnerId_fkey(name_en, name_ar, imageUrl)`)
        .eq('projectId', projectId);

    if (error) return [];
    return (data || []).map(mapDbToProperty);
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
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
        area: property.area,
        beds: property.beds,
        baths: property.baths,
        floor: property.floor,
        type_en: property.type.en,
        type_ar: property.type.ar,
        status: property.status.en === 'For Sale' ? 'For Sale' : 'For Rent',
        imageUrl: property.imageUrl,
        // Pass arrays and objects directly for Supabase to handle JSONB/ARRAY types
        gallery: property.gallery,
        location: property.location,
        installments: property.installments,
        amenities: property.amenities.en, // Storing English keys array in 'amenities' column
        
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
    // Map partial frontend Property type to DB columns if needed
    const dbUpdates: any = { ...updates };
    
    // Remap specific nested objects to DB columns if present in updates
    if (updates.title) {
        dbUpdates.title_en = updates.title.en;
        dbUpdates.title_ar = updates.title.ar;
        delete dbUpdates.title;
    }
    if (updates.listingStatus) {
        dbUpdates.listingStatus = updates.listingStatus;
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