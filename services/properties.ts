
import { supabase } from '../supabaseClient';
import type { Property, PropertyFiltersType } from '../types';
import { filterProperties } from '../utils/propertyFilters';
import { propertiesData as fileProperties } from '../data/properties';

// Hardcoded fallback properties to ensure the dashboard is never empty during dev/demo
const fallbackProperties: Property[] = [
    {
        id: 'prop-fallback-1',
        partnerId: 'admin-user',
        title: { en: 'Luxury Villa in Korba Heights', ar: 'فيلا فاخرة في كوربة هايتس' },
        description: { en: 'Amazing villa with garden', ar: 'فيلا رائعة مع حديقة' },
        address: { en: 'New Heliopolis, District 6', ar: 'هليوبوليس الجديدة، الحي السادس' },
        price: { en: '5,000,000 EGP', ar: '5,000,000 ج.م' },
        priceNumeric: 5000000,
        area: 450,
        beds: 5,
        baths: 4,
        type: { en: 'Villa', ar: 'فيلا' },
        status: { en: 'For Sale', ar: 'للبيع' },
        imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
        gallery: [],
        location: { lat: 30.107, lng: 31.626 },
        amenities: { en: ['Private Garden', 'Security'], ar: ['حديقة خاصة', 'أمن'] },
        listingStatus: 'active',
        isInCompound: true,
        installmentsAvailable: true,
        realEstateFinanceAvailable: true,
        delivery: { isImmediate: true },
        partnerName: 'United Development'
    },
    {
        id: 'prop-fallback-2',
        partnerId: 'admin-user',
        title: { en: 'Modern Apartment', ar: 'شقة حديثة' },
        description: { en: 'Spacious apartment near services', ar: 'شقة واسعة بالقرب من الخدمات' },
        address: { en: 'New Heliopolis, District 2', ar: 'هليوبوليس الجديدة، الحي الثاني' },
        price: { en: '2,200,000 EGP', ar: '2,200,000 ج.م' },
        priceNumeric: 2200000,
        area: 165,
        beds: 3,
        baths: 2,
        floor: 2,
        type: { en: 'Apartment', ar: 'شقة' },
        status: { en: 'For Sale', ar: 'للبيع' },
        imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
        gallery: [],
        location: { lat: 30.110, lng: 31.630 },
        amenities: { en: ['Balcony', 'Elevator'], ar: ['شرفة', 'مصعد'] },
        listingStatus: 'active',
        isInCompound: false,
        installmentsAvailable: true,
        realEstateFinanceAvailable: false,
        delivery: { isImmediate: false, date: '2025-12' },
        partnerName: 'United Development'
    }
];

const getMockProperties = (): Property[] => {
    return fileProperties.length > 0 ? fileProperties : fallbackProperties;
};

const mapDbToProperty = (row: any): Property => {
    let partnerName = 'Only Helio';
    // Fix: Handle name_en / name_ar
    if (row.partner) {
        partnerName = row.partner.name_en || row.partner.name_ar || 'Only Helio';
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
    if (!supabase) return getMockProperties();

    // Fix: Select name_en/name_ar instead of name
    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name_en, name_ar, imageUrl), project:Project (name_en, name_ar)`)
        .order('createdAt', { ascending: false });

    if (error || !data || data.length === 0) { 
        return getMockProperties();
    }
    return data.map(mapDbToProperty);
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
    if (!supabase) return getMockProperties().filter(p => p.partnerId === partnerId);

    // Fix: Select name_en/name_ar instead of name
    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name_en, name_ar, imageUrl), project:Project (name_en, name_ar)`)
        .eq('partnerId', partnerId)
        .order('createdAt', { ascending: false });

    if (error || !data || data.length === 0) {
        return getMockProperties().filter(p => p.partnerId === partnerId);
    }
    return data.map(mapDbToProperty);
};

export const getPropertiesByProjectId = async (projectId: string): Promise<Property[]> => {
    if (!supabase) return getMockProperties().filter(p => p.projectId === projectId);

    // Fix: Select name_en/name_ar instead of name
    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name_en, name_ar, imageUrl), project:Project (name_en, name_ar)`)
        .eq('projectId', projectId);

    if (error || !data) return getMockProperties().filter(p => p.projectId === projectId);
    return data.map(mapDbToProperty);
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
    if (!supabase) return getMockProperties().find(p => p.id === id);

    // Fix: Select name_en/name_ar instead of name
    const { data, error } = await supabase
        .from('Property')
        .select(`*, partner:User!partnerId (name_en, name_ar, imageUrl), project:Project (name_en, name_ar)`)
        .eq('id', id)
        .single();

    if (error || !data) return getMockProperties().find(p => p.id === id);
    return mapDbToProperty(data);
};

export const getFeaturedProperties = async (): Promise<Property[]> => {
    const all = await getAllProperties();
    return all.filter(p => p.listingStatus === 'active').slice(0, 4);
};

export const addProperty = async (property: Omit<Property, 'id' | 'partnerName' | 'partnerImageUrl'>): Promise<Property> => {
    if (!supabase) {
        // Mock success
        const newProp = { ...property, id: `prop-${Date.now()}` } as Property;
        fallbackProperties.unshift(newProp);
        return newProp;
    }

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
    if (!supabase) return undefined;

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
    if (!supabase) return true; // Mock

    const { error } = await supabase.from('Property').delete().eq('id', propertyId);
    if (error) {
        console.error('Error deleting property:', error);
        return false;
    }
    return true;
};
