
import { supabase } from '../supabaseClient';
import type { PortfolioItem } from '../types';

interface PortfolioItemRow {
    id: string;
    partnerId: string;
    title_en: string;
    title_ar: string;
    category_en: string;
    category_ar: string;
    imageUrl: string;
    alt: string | null;
    price?: number;
    dimensions?: string;
    availability?: 'In Stock' | 'Made to Order';
    createdAt: string;
    categoryId?: string;
    // Joined partner data
    partner?: {
        name_en: string | null;
        name_ar: string | null;
    };
}

const mapDbToPortfolioItem = (row: PortfolioItemRow): PortfolioItem => ({
    id: row.id,
    partnerId: row.partnerId,
    title: { en: row.title_en, ar: row.title_ar },
    category: { en: row.category_en, ar: row.category_ar },
    imageUrl: row.imageUrl,
    alt: row.alt || '',
    price: row.price,
    dimensions: row.dimensions,
    availability: row.availability,
    createdAt: row.createdAt,
    partnerName: row.partner?.name_en || row.partner?.name_ar,
    categoryId: row.categoryId
});

export const getAllPortfolioItems = async (): Promise<PortfolioItem[]> => {
    // Explicit constraint: PortfolioItem_partnerId_fkey
    const { data, error } = await supabase
        .from('PortfolioItem')
        .select(`*, partner:User!PortfolioItem_partnerId_fkey(name_en, name_ar)`)
        .order('createdAt', { ascending: false });

    if (error) {
        console.error("Error fetching portfolio items:", error);
        if (error.code === 'PGRST200') {
            const { data: fallback } = await supabase.from('PortfolioItem').select('*');
            return (fallback || []).map((row) => mapDbToPortfolioItem(row as PortfolioItemRow));
        }
        return [];
    }
    return (data || []).map((row) => mapDbToPortfolioItem(row as PortfolioItemRow));
};

export const getPortfolioByPartnerId = async (partnerId: string): Promise<PortfolioItem[]> => {
    const { data, error } = await supabase
        .from('PortfolioItem')
        .select(`*, partner:User!PortfolioItem_partnerId_fkey(name_en, name_ar)`)
        .eq('partnerId', partnerId)
        .order('createdAt', { ascending: false });

    if (error) return [];
    return (data || []).map((row) => mapDbToPortfolioItem(row as PortfolioItemRow));
};

export const addPortfolioItem = async (item: Omit<PortfolioItem, 'id'>): Promise<PortfolioItem> => {
    const newId = `port-${Date.now()}`;
    const dbPayload = {
        id: newId,
        partnerId: item.partnerId,
        imageUrl: item.imageUrl,
        alt: item.alt,
        title_en: item.title.en,
        title_ar: item.title.ar,
        category_en: item.category.en,
        category_ar: item.category.ar,
        price: item.price,
        dimensions: item.dimensions,
        availability: item.availability,
        createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase.from('PortfolioItem').insert(dbPayload).select().single();
    if (error) throw error;
    return mapDbToPortfolioItem(data as PortfolioItemRow);
};

export const updatePortfolioItem = async (itemId: string, updates: Partial<PortfolioItem>): Promise<PortfolioItem | undefined> => {
    const dbUpdates: any = {};
    if (updates.title) {
        dbUpdates.title_en = updates.title.en;
        dbUpdates.title_ar = updates.title.ar;
    }
    if (updates.category) {
        dbUpdates.category_en = updates.category.en;
        dbUpdates.category_ar = updates.category.ar;
    }
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.dimensions !== undefined) dbUpdates.dimensions = updates.dimensions;
    if (updates.availability !== undefined) dbUpdates.availability = updates.availability;
    if (updates.imageUrl !== undefined) dbUpdates.imageUrl = updates.imageUrl;

    const { data, error } = await supabase.from('PortfolioItem').update(dbUpdates).eq('id', itemId).select().single();
    if (error) return undefined;
    return mapDbToPortfolioItem(data as PortfolioItemRow);
};

export const deletePortfolioItem = async (itemId: string): Promise<boolean> => {
    const { error } = await supabase.from('PortfolioItem').delete().eq('id', itemId);
    if (error) {
        console.error("Error deleting portfolio item:", error);
        return false;
    }
    return true;
};
