
import { supabase } from '../lib/supabase';
import type { PortfolioItem } from '../types';

const mapPortfolioFromDB = (row: any): PortfolioItem => ({
    id: row.id,
    partnerId: row.partner_id,
    imageUrl: row.image_url,
    alt: row.alt || '',
    title: { ar: row.title_ar, en: row.title_en },
    category: { ar: row.category_ar, en: row.category_en },
    price: row.price,
    dimensions: row.dimensions,
    availability: row.availability,
});

export const getAllPortfolioItems = async (): Promise<PortfolioItem[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('portfolio_items').select('*');
        if (!error && data) {
            return data.map(mapPortfolioFromDB);
        }
    }
    return [];
};

export const getPortfolioByPartnerId = async (partnerId: string): Promise<PortfolioItem[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('portfolio_items').select('*').eq('partner_id', partnerId);
        if (!error && data) {
            return data.map(mapPortfolioFromDB);
        }
    }
    return [];
};

export const addPortfolioItem = async (item: Omit<PortfolioItem, 'id'>): Promise<PortfolioItem> => {
    if (!supabase) throw new Error("DB Connection required");

    const { data, error } = await supabase.from('portfolio_items').insert([{
        partner_id: item.partnerId,
        title_en: item.title.en,
        title_ar: item.title.ar,
        category_en: item.category.en,
        category_ar: item.category.ar,
        image_url: item.imageUrl,
        alt: item.alt,
        price: item.price,
        dimensions: item.dimensions,
        availability: item.availability
    }]).select().single();

    if (error) throw error;
    return mapPortfolioFromDB(data);
};

export const updatePortfolioItem = async (itemId: string, updates: Partial<PortfolioItem>): Promise<PortfolioItem | undefined> => {
    if (supabase) {
        const dbUpdates: any = {};
        if (updates.title) { dbUpdates.title_en = updates.title.en; dbUpdates.title_ar = updates.title.ar; }
        if (updates.category) { dbUpdates.category_en = updates.category.en; dbUpdates.category_ar = updates.category.ar; }
        if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.dimensions) dbUpdates.dimensions = updates.dimensions;
        if (updates.availability) dbUpdates.availability = updates.availability;

        const { data, error } = await supabase.from('portfolio_items').update(dbUpdates).eq('id', itemId).select().single();
        if (!error && data) return mapPortfolioFromDB(data);
    }
    return undefined;
};

export const deletePortfolioItem = async (itemId: string): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase.from('portfolio_items').delete().eq('id', itemId);
        return !error;
    }
    return false;
};
