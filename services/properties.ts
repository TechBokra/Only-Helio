import { supabase } from '../supabaseClient';
import type { Property, PropertyFiltersType } from '../types';
import { filterProperties } from '../utils/propertyFilters';
import { propertiesData as mockProperties } from '../data/properties';

// Helper: Map DB Row to Frontend Type
const mapDbToProperty = (row: any): Property => {
    return {
        id: row.id,
        partnerId: row.partnerId,
        partnerName: row.partner?.name || 'Unknown Partner',
        partnerImageUrl: row.partner?.imageUrl,
        projectId: row.projectId,
        projectName: row.project ? { en: row.project.name_en, ar: row.project.name_ar } : undefined,
        title: { en: row.title_en, ar: row.title_ar },
        description: { en: row.description_en, ar: row.description_ar },
        address: { en: row.address_en, ar: row.address_ar },
        
        // Ensure image URL is valid or fallback
        imageUrl: row.imageUrl || 'https://via.placeholder.com/800x600?text=No+Image',
        imageUrl_small: row.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image', 
        imageUrl_medium: row.imageUrl || 'https://via.placeholder.com/800x600?text=No+Image',
        imageUrl_large: row.imageUrl || 'https://via.placeholder.com/1200x900?text=No+Image',
        
        // Handle Arrays (Supabase returns text[] correctly)
        gallery: row.gallery || [],
        
        status: { 
            en: (row.listingStatus || 'active') === 'active' ? (row.status === 'For Rent' ? 'For Rent' : 'For Sale') : 'Inactive',
            ar: (row.listingStatus || 'active') === 'active' ? (row.status === 'For Rent' ? 'إيجار' : 'للبيع') : 'غير نشط'
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
        
        // Handle Amenities (Stored as text[] in DB now based on SQL update)
        amenities: {
            en: row.amenities || [],
            ar: row.amenities || [] // In a real app, you'd map these to localized strings
        },
        
        // Handle JSONB fields
        location: row.location || { lat: 30.0, lng: 31.0 },
        installments: row.installments, // Supabase returns JSON automatically
        
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
    if (!supabase) return mockProperties;

    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name, imageUrl), project:Project (name_en, name_ar)`)
        .order('createdAt', { ascending: false });

    if (error) { 
        console.warn('Supabase fetch failed:', error.message); 
        return mockProperties; 
    }
    return data.map(mapDbToProperty);
};

export const getProperties = async (): Promise<Property[]> => {
    if (!supabase) return mockProperties.filter(p => p.listingStatus === 'active');

    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name, imageUrl), project:Project (name_en, name_ar)`)
        .eq('listingStatus', 'active')
        .order('createdAt', { ascending: false });

    if (error) return mockProperties.filter(p => p.listingStatus === 'active'); 
    return data.map(mapDbToProperty);
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
    if (!supabase) return mockProperties.filter(p => p.partnerId === partnerId);

    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name, imageUrl), project:Project (name_en, name_ar)`)
        .eq('partnerId', partnerId);

    if (error) return mockProperties.filter(p => p.partnerId === partnerId);
    return data.map(mapDbToProperty);
};

export const getPropertiesByProjectId = async (projectId: string): Promise<Property[]> => {
    if (!supabase) return mockProperties.filter(p => p.projectId === projectId);

    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name, imageUrl), project:Project (name_en, name_ar)`)
        .eq('projectId', projectId);

    if (error) return mockProperties.filter(p => p.projectId === projectId);
    return data.map(mapDbToProperty);
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
    if (!supabase) return mockProperties.find(p => p.id === id);

    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name, imageUrl), project:Project (name_en, name_ar)`)
        .eq('id', id)
        .single();

    if (error || !data) return mockProperties.find(p => p.id === id);
    return mapDbToProperty(data);
};

export const getFeaturedProperties = async (): Promise<Property[]> => {
    if (!supabase) return mockProperties.filter(p => p.listingStatus === 'active').slice(0, 4);

    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name, imageUrl), project:Project (name_en, name_ar)`)
        .eq('listingStatus', 'active')
        .order('createdAt', { ascending: false })
        .limit(4);

    if (error) return mockProperties.filter(p => p.listingStatus === 'active').slice(0, 4);
    return data.map(mapDbToProperty);
};

export const addProperty = async (property: Omit<Property, 'id' | 'partnerName' | 'partnerImageUrl'>): Promise<Property> => {
    if (!supabase) {
        console.log("Mock add:", property);
        const newMock = { ...property, id: `prop-${Date.now()}` } as Property;
        mockProperties.unshift(newMock);
        return newMock;
    }

    // Ensure we are sending valid JSON for location and installments
    const locationJson = property.location ? property.location : { lat: 30.0, lng: 31.0 };
    const installmentsJson = property.installments ? property.installments : null;
    const amenitiesArray = property.amenities?.en || [];

    const dbPayload = {
        partnerId: property.partnerId,
        projectId: property.projectId || null, // Ensure null if undefined
        title_en: property.title.en,
        title_ar: property.title.ar,
        description_en: property.description.en,
        description_ar: property.description.ar,
        address_en: property.address.en, // Ensure address is passed
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
        gallery: property.gallery || [], // Ensure array
        
        // Complex objects
        location: locationJson, 
        amenities: amenitiesArray, 
        installments: installmentsJson,
        
        // Booleans
        isInCompound: !!property.isInCompound, 
        installmentsAvailable: !!property.installmentsAvailable, 
        realEstateFinanceAvailable: !!property.realEstateFinanceAvailable, 
        
        // Delivery
        deliveryImmediate: !!property.delivery.isImmediate, 
        deliveryDate: property.delivery.date ? new Date(property.delivery.date).toISOString() : null,
        
        // Finishing
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
        console.error("Supabase Add Property Error Details:", error);
        throw new Error(error.message);
    }
    return mapDbToProperty(data);
};

export const updateProperty = async (propertyId: string, updates: Partial<Property>): Promise<Property | undefined> => {
    if (!supabase) return undefined;

    const dbUpdates: any = {};
    
    // Map Localized fields
    if (updates.title) { dbUpdates.title_en = updates.title.en; dbUpdates.title_ar = updates.title.ar; }
    if (updates.description) { dbUpdates.description_en = updates.description.en; dbUpdates.description_ar = updates.description.ar; }
    if (updates.address) { dbUpdates.address_en = updates.address.en; dbUpdates.address_ar = updates.address.ar; }
    
    // Map Numeric/Simple fields
    if (updates.priceNumeric !== undefined) {
         dbUpdates.price = updates.priceNumeric;
         // Regenerate formatted price strings if not explicitly provided
         if(!updates.price) {
             dbUpdates.price_en = `EGP ${updates.priceNumeric.toLocaleString('en-US')}`;
             dbUpdates.price_ar = `${updates.priceNumeric.toLocaleString('ar-EG')} ج.م`;
         }
    }
    
    if (updates.listingStatus) dbUpdates.listingStatus = updates.listingStatus;
    
    // Image Handling - Explicitly set imageUrl
    if (updates.imageUrl) dbUpdates.imageUrl = updates.imageUrl;
    if (updates.gallery) dbUpdates.gallery = updates.gallery;
    
    // JSON/Complex Fields
    if (updates.location) dbUpdates.location = updates.location;
    if (updates.amenities) dbUpdates.amenities = updates.amenities.en;
    if (updates.installments) dbUpdates.installments = updates.installments;
    
    // Booleans & Delivery
    if (updates.isInCompound !== undefined) dbUpdates.isInCompound = updates.isInCompound;
    if (updates.installmentsAvailable !== undefined) dbUpdates.installmentsAvailable = updates.installmentsAvailable;
    if (updates.realEstateFinanceAvailable !== undefined) dbUpdates.realEstateFinanceAvailable = updates.realEstateFinanceAvailable;
    
    // CRITICAL FIX: Flatten Delivery Object
    if (updates.delivery) {
        dbUpdates.deliveryImmediate = updates.delivery.isImmediate;
        // Ensure date is a valid string or null
        dbUpdates.deliveryDate = updates.delivery.date ? new Date(updates.delivery.date).toISOString() : null;
    }
    
    // Simple fields
    if (updates.beds !== undefined) dbUpdates.beds = updates.beds;
    if (updates.baths !== undefined) dbUpdates.baths = updates.baths;
    if (updates.area !== undefined) dbUpdates.area = updates.area;
    if (updates.floor !== undefined) dbUpdates.floor = updates.floor;
    
    const { data, error } = await supabase.from('Property').update(dbUpdates).eq('id', propertyId).select().single();
    
    if (error) {
        console.error('Error updating property:', error);
        throw new Error(error.message);
    }
    return mapDbToProperty(data);
};

export const deleteProperty = async (propertyId: string): Promise<boolean> => {
    if (!supabase) return true;

    const { error } = await supabase.from('Property').delete().eq('id', propertyId);
    if (error) {
        console.error('Error deleting property:', error);
        return false;
    }
    return true;
};