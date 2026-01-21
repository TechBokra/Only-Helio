
import { supabase } from '../supabaseClient';
import type { Banner } from '../types';

export const getAllBanners = async (): Promise<Banner[]> => {
    const { data, error } = await supabase
        .from('Banner')
        .select('*')
        .order('createdAt', { ascending: false });

    if (error) {
        console.error("Error fetching banners:", error);
        return [];
    }
    return data || [];
};

export const addBanner = async (banner: Omit<Banner, 'id'>): Promise<Banner> => {
    const { data, error } = await supabase
        .from('Banner')
        .insert({
            ...banner,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateBanner = async (bannerId: string, updates: Partial<Banner>): Promise<Banner | undefined> => {
    const { data, error } = await supabase
        .from('Banner')
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq('id', bannerId)
        .select()
        .single();

    if (error) return undefined;
    return data;
};

export const deleteBanner = async (bannerId: string): Promise<boolean> => {
    const { error } = await supabase.from('Banner').delete().eq('id', bannerId);
    return !error;
};
