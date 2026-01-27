
import { supabase } from '../supabaseClient';
import type { PartnerService } from '../types';

// Helper to map DB row to frontend type
const mapDbToService = (row: any): PartnerService => ({
    id: row.id,
    partnerId: row.partnerId,
    title: { ar: row.title_ar, en: row.title_en },
    description: { ar: row.description_ar, en: row.description_en },
    priceRange: row.priceRange_ar ? { ar: row.priceRange_ar, en: row.priceRange_en } : undefined,
    estimatedTime: row.estimatedTime_ar ? { ar: row.estimatedTime_ar, en: row.estimatedTime_en } : undefined,
    imageUrl: row.imageUrl,
    isActive: row.isActive,
    createdAt: row.createdAt
});

export const getPartnerServices = async (partnerId: string): Promise<PartnerService[]> => {
    const { data, error } = await supabase
        .from('PartnerService')
        .select('*')
        .eq('partnerId', partnerId)
        .order('createdAt', { ascending: false });

    if (error) {
        console.error('Error fetching partner services:', error);
        return [];
    }
    
    return data.map(mapDbToService);
};

export const addPartnerService = async (service: any): Promise<PartnerService> => {
    // Determine title/description based on object structure or flatten it
    // The form usually sends title: {ar, en}
    
    const dbPayload = {
        partnerId: service.partnerId,
        title_ar: service.title?.ar || service.titleAr,
        title_en: service.title?.en || service.titleEn,
        description_ar: service.description?.ar || service.descAr,
        description_en: service.description?.en || service.descEn,
        priceRange_ar: service.priceRange?.ar,
        priceRange_en: service.priceRange?.en,
        estimatedTime_ar: service.estimatedTime?.ar,
        estimatedTime_en: service.estimatedTime?.en,
        isActive: service.isActive ?? true,
        createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('PartnerService')
        .insert(dbPayload)
        .select()
        .single();

    if (error) throw error;
    return mapDbToService(data);
};

export const updatePartnerService = async (id: string, updates: any): Promise<void> => {
    const dbUpdates: any = {};
    
    if (updates.title) {
        dbUpdates.title_ar = updates.title.ar;
        dbUpdates.title_en = updates.title.en;
    }
    if (updates.description) {
        dbUpdates.description_ar = updates.description.ar;
        dbUpdates.description_en = updates.description.en;
    }
    if (updates.priceRange) {
        dbUpdates.priceRange_ar = updates.priceRange.ar;
        dbUpdates.priceRange_en = updates.priceRange.en;
    }
    if (updates.estimatedTime) {
        dbUpdates.estimatedTime_ar = updates.estimatedTime.ar;
        dbUpdates.estimatedTime_en = updates.estimatedTime.en;
    }
    if (updates.isActive !== undefined) dbUpdates.isActive = updates.isActive;

    const { error } = await supabase
        .from('PartnerService')
        .update(dbUpdates)
        .eq('id', id);

    if (error) throw error;
};

export const deletePartnerService = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('PartnerService')
        .delete()
        .eq('id', id);

    if (error) throw error;
};
