
import { supabase } from '../supabaseClient';
import type { Property, PropertyFiltersType } from '../types';
import { filterProperties } from '../utils/propertyFilters';
import { propertiesData as mockProperties } from '../data/properties'; // Import mock data

// Helper function to map Database Row -> Frontend Property Object
const mapDbToProperty = (row: any): Property => {
    return {
        id: row.id,
        partnerId: row.partnerId,
        // Fallback to 'name' since name_en might not exist in DB
        partnerName: row.partner?.name || 'Unknown Partner', 
        partnerImageUrl: row.partner?.imageUrl,
        projectId: row.projectId,
        projectName: row.project ? { en: row.project.name_en, ar: row.project.name_ar } : undefined,
        title: { en: row.title_en, ar: row.title_ar },
        description: { en: row.description_en, ar: row.description_ar },
        address: { en: row.address_en, ar: row.address_ar },
        
        // Use camelCase DB columns based on recent errors
        imageUrl: row.imageUrl,
        imageUrl_small: row.imageUrl, 
        imageUrl_medium: row.imageUrl,
        imageUrl_large: row.imageUrl,
        
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
        
        // Safe access for potentially missing columns
        listingStatus: row.listingStatus || 'active',
        listingStartDate: row.listingStartDate || row.createdAt,
        
        amenities: {
            en: row.AmenitiesOnProperties?.map((a: any) => a.amenity?.name_en) || [],
            ar: row.AmenitiesOnProperties?.map((a: any) => a.amenity?.name_ar) || []
        },
        location: row.location || { lat: 30.0, lng: 31.0 },
        
        // Boolean mappings (camelCase)
        isInCompound: !!row.isInCompound,
        installmentsAvailable: !!row.installmentsAvailable,
        realEstateFinanceAvailable: !!row.realEstateFinanceAvailable,
        
        delivery: {
            isImmediate: !!row.deliveryImmediate,
            date: row.deliveryDate
        },
        installments: typeof row.installments === 'string' ? JSON.parse(row.installments) : row.installments,
        
        contactMethod: row.contactMethod || 'platform',
        ownerPhone: row.ownerPhone,
    };
};

export const getAllProperties = async (): Promise<Property[]> => {
    // Fallback to mock data if Supabase is not configured
    if (!supabase) return mockProperties;

    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name, imageUrl), project:Project (name_en, name_ar), AmenitiesOnProperties (amenity:Amenity (name_en, name_ar))`)
        .order('createdAt', { ascending: false });

    if (error) { 
        console.warn('Supabase fetch failed, falling back to mock data:', error.message); 
        return mockProperties; 
    }
    return data.map(mapDbToProperty);
};

export const getProperties = async (): Promise<Property[]> => {
    if (!supabase) return mockProperties.filter(p => p.listingStatus === 'active');

    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name, imageUrl), project:Project (name_en, name_ar), AmenitiesOnProperties (amenity:Amenity (name_en, name_ar))`)
        // .eq('listingStatus', 'active') // Removed filter to avoid error if column missing
        .order('createdAt', { ascending: false });

    if (error) { 
        console.warn('Supabase fetch failed, falling back to mock data'); 
        return mockProperties.filter(p => p.listingStatus === 'active'); 
    }
    return data.map(mapDbToProperty).filter(p => p.listingStatus === 'active');
};

export const getPaginatedProperties = async (options: {
  page: number;
  limit: number;
  filters: PropertyFiltersType;
  disablePagination?: boolean;
}): Promise<{ properties: Property[]; total: number }> => {
    const { page, limit, filters, disablePagination } = options;
    
    // Fetch all (either from DB or Mock)
    const allProperties = await getProperties();
    
    // Filter locally (client-side filtering for MVP)
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
        .select(`*, partner:User!partnerId (name, imageUrl), project:Project (name_en, name_ar), AmenitiesOnProperties (amenity:Amenity (name_en, name_ar))`)
        .eq('partnerId', partnerId);

    if (error) return mockProperties.filter(p => p.partnerId === partnerId);
    return data.map(mapDbToProperty);
};

export const getPropertiesByProjectId = async (projectId: string): Promise<Property[]> => {
    if (!supabase) return mockProperties.filter(p => p.projectId === projectId);

    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name, imageUrl), project:Project (name_en, name_ar), AmenitiesOnProperties (amenity:Amenity (name_en, name_ar))`)
        .eq('projectId', projectId);

    if (error) return mockProperties.filter(p => p.projectId === projectId);
    return data.map(mapDbToProperty);
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
    if (!supabase) return mockProperties.find(p => p.id === id);

    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name, imageUrl), project:Project (name_en, name_ar), AmenitiesOnProperties (amenity:Amenity (name_en, name_ar))`)
        .eq('id', id)
        .single();

    if (error || !data) return mockProperties.find(p => p.id === id);
    return mapDbToProperty(data);
};

export const getFeaturedProperties = async (): Promise<Property[]> => {
    if (!supabase) return mockProperties.filter(p => p.listingStatus === 'active').slice(0, 4);

    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name, imageUrl), project:Project (name_en, name_ar), AmenitiesOnProperties (amenity:Amenity (name_en, name_ar))`)
        //.eq('listingStatus', 'active') // Removed to prevent crash
        .order('createdAt', { ascending: false })
        .limit(4);

    if (error) return mockProperties.filter(p => p.listingStatus === 'active').slice(0, 4);
    return data.map(mapDbToProperty);
};

export const addProperty = async (property: Omit<Property, 'id' | 'partnerName' | 'partnerImageUrl'>): Promise<Property> => {
    if (!supabase) {
        console.log("Mock adding property:", property);
        const newMockProp = { ...property, id: `prop-mock-${Date.now()}` } as Property;
        mockProperties.unshift(newMockProp);
        return newMockProp;
    }

    const dbPayload = {
        id: `prop-${Date.now()}`,
        partnerId: property.partnerId,
        projectId: property.projectId,
        title_en: property.title.en,
        title_ar: property.title.ar,
        description_en: property.description.en,
        description_ar: property.description.ar,
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
        
        isInCompound: property.isInCompound, 
        installmentsAvailable: property.installmentsAvailable, 
        realEstateFinanceAvailable: property.realEstateFinanceAvailable, 
        
        deliveryImmediate: property.delivery.isImmediate, 
        installments: property.installments,
        
        // Removed optional fields that might be missing in DB
        // contactMethod, ownerPhone, listingStatus, deliveryDate
        
        createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase.from('Property').insert(dbPayload).select().single();
    if (error) throw error;
    return mapDbToProperty(data);
};

export const updateProperty = async (propertyId: string, updates: Partial<Property>): Promise<Property | undefined> => {
    if (!supabase) {
        const idx = mockProperties.findIndex(p => p.id === propertyId);
        if (idx > -1) {
            mockProperties[idx] = { ...mockProperties[idx], ...updates };
            return mockProperties[idx];
        }
        return undefined;
    }

    // Only allow updating safe fields for now
    const dbUpdates: any = {};
    if (updates.imageUrl) dbUpdates.imageUrl = updates.imageUrl;
    // We avoid updating missing columns like listingStatus to prevent errors
    
    const { data, error } = await supabase.from('Property').update(dbUpdates).eq('id', propertyId).select().single();
    if (error) { console.error('Error updating property:', error); return undefined; }
    return mapDbToProperty(data);
};

export const deleteProperty = async (propertyId: string): Promise<boolean> => {
    if (!supabase) {
        const idx = mockProperties.findIndex(p => p.id === propertyId);
        if (idx > -1) {
            mockProperties.splice(idx, 1);
            return true;
        }
        return false;
    }

    const { error } = await supabase.from('Property').delete().eq('id', propertyId);
    if (error) { console.error('Error deleting property:', error); return false; }
    return true;
};
