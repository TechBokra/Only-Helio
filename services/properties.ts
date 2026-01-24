
import { supabase } from '../supabaseClient';
import type { Property, PropertyFiltersType, ListingStatus } from '../types';

// Define DB Row shape
interface PropertyRow {
    id: string;
    partnerId: string;
    projectId: string | null;
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    address_en: string;
    address_ar: string;
    price: number;
    price_en: string | null;
    price_ar: string | null;
    area: number;
    type_en: string;
    type_ar: string;
    status: string; // 'For Sale' or 'For Rent'
    listingStatus: ListingStatus;
    listingStartDate: string;
    listingEndDate: string | null;
    imageUrl: string;
    gallery: any; // JSONB
    location: any; // JSONB
    beds: number;
    baths: number;
    floor: number;
    finishingStatus_en: string | null;
    finishingStatus_ar: string | null;
    isInCompound: boolean;
    installmentsAvailable: boolean;
    realEstateFinanceAvailable: boolean;
    installments: any; // JSONB
    amenities: any; // JSONB (Array of strings)
    deliveryImmediate: boolean;
    deliveryDate: string | null;
    contactMethod: 'platform' | 'direct';
    ownerPhone: string | null;
    createdAt: string;

    // Joined Data
    partner?: {
        name_en: string | null;
        name_ar: string | null;
        imageUrl: string | null;
    };
    project?: {
        name_en: string;
        name_ar: string;
    };
}

// Helper to safely parse JSON or return original if already object
function safeParse<T>(val: any, fallback: T): T {
    if (typeof val === 'string') {
        try { return JSON.parse(val); } catch(e) { return fallback; }
    }
    return (val as T) || fallback;
}

const mapDbToProperty = (row: PropertyRow): Property => {
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
        partnerImageUrl: row.partner?.imageUrl || undefined,
        projectId: row.projectId || undefined,
        projectName: row.project ? { en: row.project.name_en, ar: row.project.name_ar } : undefined,
        
        title: { en: row.title_en || '', ar: row.title_ar || '' },
        description: { en: row.description_en || '', ar: row.description_ar || '' },
        address: { en: row.address_en || '', ar: row.address_ar || '' },
        
        imageUrl: mainImage,
        imageUrl_small: mainImage, 
        imageUrl_medium: mainImage,
        imageUrl_large: mainImage,
        
        gallery: safeParse<string[]>(row.gallery, []),
        
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
        finishingStatus: row.finishingStatus_en ? { en: row.finishingStatus_en, ar: row.finishingStatus_ar! } : undefined,
        
        listingStatus: row.listingStatus || 'active',
        listingStartDate: row.listingStartDate || row.createdAt,
        
        amenities: {
            en: Array.isArray(row.amenities) ? row.amenities : [], // Assuming array of strings
            ar: [] // Ideally fetched or mapped, simplified for now
        },
        
        location: safeParse<{lat: number, lng: number}>(row.location, { lat: 30.0, lng: 31.0 }),
        installments: safeParse(row.installments, undefined),
        
        isInCompound: !!row.isInCompound,
        installmentsAvailable: !!row.installmentsAvailable,
        realEstateFinanceAvailable: !!row.realEstateFinanceAvailable,
        
        delivery: {
            isImmediate: !!row.deliveryImmediate,
            date: row.deliveryDate || undefined
        },
        
        contactMethod: row.contactMethod || 'platform',
        ownerPhone: row.ownerPhone || undefined,
        createdAt: row.createdAt
    };
};

export const getAllProperties = async (): Promise<Property[]> => {
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
    return (data || []).map(row => mapDbToProperty(row as PropertyRow));
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
    
    // Start building the query
    let query = supabase
        .from('Property')
        .select(`
            *, 
            partner:User!Property_partnerId_fkey(name_en, name_ar, imageUrl), 
            project:Project!Property_projectId_fkey(name_en, name_ar)
        `, { count: 'exact' });

    // 1. Basic Filters
    // Always filter for active listings in public view (unless overridden, but usually handled by calling context)
    // For now, we assume this function is used for public listings mainly.
    query = query.eq('listingStatus', 'active');

    if (filters.status && filters.status !== 'all') {
        // Map frontend status to DB status if needed, or assume direct match
        query = query.eq('status', filters.status);
    }

    if (filters.type && filters.type !== 'all') {
        query = query.eq('type_en', filters.type);
    }

    if (filters.project && filters.project !== 'all') {
        query = query.eq('projectId', filters.project);
    }

    // 2. Numeric Ranges
    if (filters.minPrice) query = query.gte('price', filters.minPrice);
    if (filters.maxPrice) query = query.lte('price', filters.maxPrice);
    
    if (filters.beds) query = query.gte('beds', filters.beds);
    if (filters.baths) query = query.gte('baths', filters.baths);
    
    // 3. Boolean/Specific Filters
    if (filters.finishing && filters.finishing !== 'all') {
        query = query.eq('finishingStatus_en', filters.finishing);
    }

    if (filters.installments && filters.installments !== 'all') {
        query = query.eq('installmentsAvailable', filters.installments === 'yes');
    }

    if (filters.realEstateFinance && filters.realEstateFinance !== 'all') {
        query = query.eq('realEstateFinanceAvailable', filters.realEstateFinance === 'yes');
    }
    
    if (filters.compound && filters.compound !== 'all') {
        query = query.eq('isInCompound', filters.compound === 'yes');
    }
    
    if (filters.delivery && filters.delivery !== 'all') {
        if (filters.delivery === 'immediate') query = query.eq('deliveryImmediate', true);
    }
    
    if (filters.floor) {
        query = query.eq('floor', filters.floor);
    }

    // 4. Array/JSONB Filters (Amenities)
    if (filters.amenities && filters.amenities.length > 0) {
        // Use the contains operator for JSONB array
        query = query.contains('amenities', filters.amenities);
    }

    // 5. Text Search (Search across multiple columns)
    if (filters.query) {
        const q = filters.query;
        // Search in English Title, Arabic Title, English Address, Arabic Address
        query = query.or(`title_en.ilike.%${q}%,title_ar.ilike.%${q}%,address_en.ilike.%${q}%,address_ar.ilike.%${q}%`);
    }

    // 6. Pagination
    if (!disablePagination) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
    }

    // Default Sort
    query = query.order('createdAt', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
        console.error("Error fetching paginated properties:", error);
        return { properties: [], total: 0 };
    }

    const mappedProperties = (data || []).map(row => mapDbToProperty(row as PropertyRow));
    return { properties: mappedProperties, total: count || 0 };
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
    return (data || []).map(row => mapDbToProperty(row as PropertyRow));
};

export const getPropertiesByProjectId = async (projectId: string): Promise<Property[]> => {
    // Removed 'name' column
    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!Property_partnerId_fkey(name_en, name_ar, imageUrl)`)
        .eq('projectId', projectId);

    if (error) return [];
    return (data || []).map(row => mapDbToProperty(row as PropertyRow));
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
    return mapDbToProperty(data as PropertyRow);
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
    return mapDbToProperty(data as PropertyRow);
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
    return mapDbToProperty(data as PropertyRow);
};

export const deleteProperty = async (propertyId: string): Promise<boolean> => {
    const { error } = await supabase.from('Property').delete().eq('id', propertyId);
    return !error;
};
