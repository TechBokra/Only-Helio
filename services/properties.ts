
import { supabase } from '../supabaseClient';
import type { Property, PropertyFiltersType } from '../types';
import { filterProperties } from '../utils/propertyFilters';

const mapDbToProperty = (row: any): Property => {
    let partnerName = 'Only Helio';
    if (row.partner && row.partner.name) {
        partnerName = row.partner.name;
    }

    const mainImage = row.imageUrl || 'https://via.placeholder.com/800x600?text=No+Image';

    return {
        id: row.id,
        partnerId: row.partnerId,
        partnerName: partnerName,
        partnerImageUrl: row.partner?.imageUrl,
        projectId: row.projectId,
        projectName: row.project ? { en: row.project.name_en, ar: row.project.name_ar } : undefined,
        title: { en: row.title_en, ar: row.title_ar },
        description: { en: row.description_en, ar: row.description_ar },
        address: { en: row.address_en, ar: row.address_ar },
        
        imageUrl: mainImage,
        imageUrl_small: mainImage, 
        imageUrl_medium: mainImage,
        imageUrl_large: mainImage,
        
        gallery: row.gallery || [],
        
        status: { 
            en: row.status === 'For Rent' ? 'For Rent' : 'For Sale',
            ar: row.status === 'For Rent' ? 'إيجار' : 'للبيع'
        },
        price: { en: row.price_en, ar: row.price_ar },
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
            en: row.amenities || [],
            ar: row.amenities || [] 
        },
        
        location: row.location || { lat: 30.0, lng: 31.0 },
        installments: row.installments,
        
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
    if (!supabase) throw new Error("Supabase client is not initialized.");

    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name, imageUrl), project:Project (name_en, name_ar)`)
        .order('createdAt', { ascending: false });

    if (error) { 
        console.error('SUPABASE ERROR (getAllProperties):', error); 
        return []; 
    }
    return (data || []).map(mapDbToProperty);
};

export const getProperties = async (): Promise<Property[]> => {
    if (!supabase) {
        console.error("Supabase client missing.");
        return [];
    }

    // DEBUG: Removed .eq('listingStatus', 'active') to see ALL properties
    // This helps verify connection even if data is incomplete
    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name, imageUrl), project:Project (name_en, name_ar)`)
        .order('createdAt', { ascending: false });

    if (error) {
        console.error("SUPABASE ERROR (getProperties):", error);
        return []; 
    }

    console.log("SUPABASE DATA RECEIVED:", data); // Check your browser console for this

    if (!data || data.length === 0) {
        console.warn("Supabase returned empty array. Check RLS policies in Supabase Dashboard.");
    }

    return (data || []).map(mapDbToProperty);
};

export const getPaginatedProperties = async (options: {
  page: number;
  limit: number;
  filters: PropertyFiltersType;
  disablePagination?: boolean;
}): Promise<{ properties: Property[]; total: number }> => {
    const { page, limit, filters, disablePagination } = options;
    const allProperties = await getProperties();
    const filtered = filterProperties(allProperties, filters);
    const total = filtered.length;
    
    if (disablePagination) return { properties: filtered, total };
    
    const start = (page - 1) * limit;
    const end = start + limit;
    return { properties: filtered.slice(start, end), total };
};

export const getPropertiesByPartnerId = async (partnerId: string): Promise<Property[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name, imageUrl), project:Project (name_en, name_ar)`)
        .eq('partnerId', partnerId);

    if (error) return [];
    return (data || []).map(mapDbToProperty);
};

export const getPropertiesByProjectId = async (projectId: string): Promise<Property[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name, imageUrl), project:Project (name_en, name_ar)`)
        .eq('projectId', projectId);

    if (error) return [];
    return (data || []).map(mapDbToProperty);
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
    if (!supabase) return undefined;

    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name, imageUrl), project:Project (name_en, name_ar)`)
        .eq('id', id)
        .single();

    if (error || !data) return undefined;
    return mapDbToProperty(data);
};

export const getFeaturedProperties = async (): Promise<Property[]> => {
    if (!supabase) return [];

    // DEBUG: Removed active filter here too
    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name, imageUrl), project:Project (name_en, name_ar)`)
        .order('createdAt', { ascending: false })
        .limit(4);

    if (error) return [];
    return (data || []).map(mapDbToProperty);
};

export const addProperty = async (property: Omit<Property, 'id' | 'partnerName' | 'partnerImageUrl'>): Promise<Property> => {
    if (!supabase) throw new Error("Database connection required.");

    const newId = crypto.randomUUID();

    const dbPayload = {
        id: newId,
        partnerId: property.partnerId,
        projectId: property.projectId ? property.projectId : null, 
        
        title_en: property.title.en,
        title_ar: property.title.ar,
        description_en: property.description.en,
        description_ar: property.description.ar,
        address_en: property.address.en,
        address_ar: property.address.ar,
        
        price: Number(property.priceNumeric),
        price_en: property.price.en,
        price_ar: property.price.ar,
        
        area: Number(property.area),
        beds: Number(property.beds),
        baths: Number(property.baths),
        floor: Number(property.floor),
        
        type_en: property.type.en,
        type_ar: property.type.ar,
        status: property.status.en === 'For Sale' ? 'For Sale' : 'For Rent',
        
        imageUrl: property.imageUrl,
        gallery: property.gallery || [],
        
        location: property.location ? property.location : { lat: 30.0, lng: 31.0 }, 
        amenities: property.amenities?.en || [], 
        installments: property.installments ? property.installments : null,
        
        isInCompound: !!property.isInCompound, 
        installmentsAvailable: !!property.installmentsAvailable, 
        realEstateFinanceAvailable: !!property.realEstateFinanceAvailable, 
        
        deliveryImmediate: !!property.delivery.isImmediate, 
        deliveryDate: property.delivery.date ? new Date(property.delivery.date).toISOString() : null,
        
        finishingStatus_en: property.finishingStatus?.en || null,
        finishingStatus_ar: property.finishingStatus?.ar || null,

        listingStatus: property.listingStatus || 'active',
        contactMethod: property.contactMethod || 'platform',
        ownerPhone: property.ownerPhone || null,
        
        listingStartDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase.from('Property').insert(dbPayload).select().single();
    
    if (error) {
        console.error("Supabase Add Property Error:", error);
        throw new Error(error.message); 
    }
    return mapDbToProperty(data);
};

export const updateProperty = async (propertyId: string, updates: Partial<Property>): Promise<Property | undefined> => {
    if (!supabase) throw new Error("Database connection required.");

    const dbUpdates: any = {};
    
    if (updates.title) { dbUpdates.title_en = updates.title.en; dbUpdates.title_ar = updates.title.ar; }
    if (updates.description) { dbUpdates.description_en = updates.description.en; dbUpdates.description_ar = updates.description.ar; }
    if (updates.address) { dbUpdates.address_en = updates.address.en; dbUpdates.address_ar = updates.address.ar; }
    
    if (updates.priceNumeric !== undefined) {
         dbUpdates.price = updates.priceNumeric;
         if(!updates.price) {
             dbUpdates.price_en = `EGP ${updates.priceNumeric.toLocaleString('en-US')}`;
             dbUpdates.price_ar = `${updates.priceNumeric.toLocaleString('ar-EG')} ج.م`;
         }
    }
    
    if (updates.listingStatus) dbUpdates.listingStatus = updates.listingStatus;
    if (updates.imageUrl) dbUpdates.imageUrl = updates.imageUrl;
    if (updates.gallery) dbUpdates.gallery = updates.gallery;
    if (updates.location) dbUpdates.location = updates.location;
    
    if (updates.isInCompound !== undefined) dbUpdates.isInCompound = updates.isInCompound;
    
    if (updates.projectId !== undefined) {
         dbUpdates.projectId = updates.projectId ? updates.projectId : null;
    }
    
    const { data, error } = await supabase.from('Property').update(dbUpdates).eq('id', propertyId).select().single();
    
    if (error) {
        console.error('Error updating property:', error);
        throw new Error(error.message);
    }
    return mapDbToProperty(data);
};

export const deleteProperty = async (propertyId: string): Promise<boolean> => {
    if (!supabase) return false;

    const { error } = await supabase.from('Property').delete().eq('id', propertyId);
    if (error) {
        console.error('Error deleting property:', error);
        return false;
    }
    return true;
};
