
import { supabase } from '../supabaseClient';
import { portfolioData as fileData } from '../data/portfolio';
import type { PortfolioItem } from '../types';

const mapDbToItem = (row: any): PortfolioItem => ({
    id: row.id,
    partnerId: row.partnerId || 'admin-user',
    imageUrl: row.imageUrl,
    alt: row.alt || '',
    title: { en: row.title_en, ar: row.title_ar },
    category: { en: row.category_en, ar: row.category_ar },
    price: row.price,
    dimensions: row.dimensions,
    availability: row.availability as 'In Stock' | 'Made to Order',
    createdAt: row.createdAt
});

export const getAllPortfolioItems = async (): Promise<PortfolioItem[]> => {
    if (!supabase) return fileData;

    try {
        const { data, error } = await supabase
            .from('PortfolioItem')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) {
            console.error('Error fetching portfolio:', error.message || error);
            return fileData;
        }
        return (data || []).map(mapDbToItem);
    } catch (e) {
        console.error('Unexpected error in getAllPortfolioItems:', e);
        return fileData;
    }
};

export const getPortfolioByPartnerId = async (partnerId: string): Promise<PortfolioItem[]> => {
    if (!supabase) return fileData.filter(i => i.partnerId === partnerId);

    try {
        const { data, error } = await supabase
            .from('PortfolioItem')
            .select('*')
            .eq('partnerId', partnerId)
            .order('createdAt', { ascending: false });

        if (error) {
             console.error('Error fetching partner portfolio:', error.message || error);
             return [];
        }
        return (data || []).map(mapDbToItem);
    } catch (e) {
        return [];
    }
};

export const addPortfolioItem = async (item: Omit<PortfolioItem, 'id'>): Promise<PortfolioItem> => {
    if (!supabase) throw new Error("Supabase not initialized");

    const dbPayload = {
        partnerId: item.partnerId,
        imageUrl: item.imageUrl,
        alt: item.alt,
        title_en: item.title.en,
        title_ar: item.title.ar,
        category_en: item.category.en,
        category_ar: item.category.ar,
        price: item.price,
        dimensions: item.dimensions,
        availability: item.availability
    };

    const { data, error } = await supabase.from('PortfolioItem').insert(dbPayload).select().single();
    if (error) throw error;
    return mapDbToItem(data);
};

export const updatePortfolioItem = async (itemId: string, updates: Partial<PortfolioItem>): Promise<PortfolioItem | undefined> => {
    if (!supabase) return undefined;

    const dbUpdates: any = {};
    if (updates.title) { dbUpdates.title_en = updates.title.en; dbUpdates.title_ar = updates.title.ar; }
    if (updates.category) { dbUpdates.category_en = updates.category.en; dbUpdates.category_ar = updates.category.ar; }
    if (updates.imageUrl) dbUpdates.imageUrl = updates.imageUrl;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.dimensions !== undefined) dbUpdates.dimensions = updates.dimensions;
    if (updates.availability !== undefined) dbUpdates.availability = updates.availability;

    const { data, error } = await supabase.from('PortfolioItem').update(dbUpdates).eq('id', itemId).select().single();
    if (error) throw error;
    return mapDbToItem(data);
};

export const deletePortfolioItem = async (itemId: string): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await supabase.from('PortfolioItem').delete().eq('id', itemId);
    if (error) throw error;
    return true;
};
