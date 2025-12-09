import { supabase } from '../lib/supabase';
import { bannersData as initialBannersData } from '../data/banners';
import type { Banner } from '../types';

// Fallback local data
let bannersData: Banner[] = [...initialBannersData];

const mapBannerFromDB = (row: any): Banner => ({
    id: row.id,
    title: row.title,
    imageUrl: row.image_url,
    link: row.link,
    locations: row.locations || [],
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
});

export const getAllBanners = async (): Promise<Banner[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
        if (!error && data) {
            return data.map(mapBannerFromDB);
        }
    }
    return [...bannersData];
};

export const addBanner = async (banner: Omit<Banner, 'id'>): Promise<Banner> => {
    if (supabase) {
        const { data, error } = await supabase.from('banners').insert([{
            title: banner.title,
            image_url: banner.imageUrl,
            link: banner.link,
            locations: banner.locations,
            status: banner.status,
            start_date: banner.startDate,
            end_date: banner.endDate
        }]).select().single();

        if (!error && data) return mapBannerFromDB(data);
    }

    const newBanner: Banner = {
        ...banner,
        id: `banner-${Date.now()}`,
    };
    bannersData.unshift(newBanner);
    return newBanner;
};

export const updateBanner = async (bannerId: string, updates: Partial<Banner>): Promise<Banner | undefined> => {
    if (supabase) {
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
        if (updates.link) dbUpdates.link = updates.link;
        if (updates.locations) dbUpdates.locations = updates.locations;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
        if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;

        const { data, error } = await supabase.from('banners').update(dbUpdates).eq('id', bannerId).select().single();
        if (!error && data) return mapBannerFromDB(data);
    }

    const bannerIndex = bannersData.findIndex(b => b.id === bannerId);
    if (bannerIndex > -1) {
        bannersData[bannerIndex] = { ...bannersData[bannerIndex], ...updates };
        return bannersData[bannerIndex];
    }
    return undefined;
};

export const deleteBanner = async (bannerId: string): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase.from('banners').delete().eq('id', bannerId);
        if (!error) return true;
    }
    const initialLength = bannersData.length;
    bannersData = bannersData.filter(b => b.id !== bannerId);
    return bannersData.length < initialLength;
};