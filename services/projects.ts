
import { supabase } from '../lib/supabase';
import type { Project } from '../types';

// Helper to map DB columns to Project type
const mapProjectFromDB = (row: any): Project => ({
    id: row.id,
    partnerId: row.partner_id,
    name: { ar: row.name_ar, en: row.name_en },
    description: { ar: row.description_ar, en: row.description_en },
    imageUrl: row.image_url,
    imageUrl_small: row.image_url, 
    imageUrl_medium: row.image_url,
    imageUrl_large: row.image_url,
    createdAt: row.created_at,
    features: row.features || [],
});

export const getAllProjects = async (): Promise<Project[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('projects').select('*');
        if (!error && data) {
            return data.map(mapProjectFromDB);
        }
    }
    return []; // STRICT: No mock data
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
    if (supabase) {
        const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
        if (!error && data) {
            return mapProjectFromDB(data);
        }
    }
    return undefined;
};

export const getProjectsByPartnerId = async (partnerId: string): Promise<Project[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('projects').select('*').eq('partner_id', partnerId);
        if (!error && data) {
            return data.map(mapProjectFromDB);
        }
    }
    return [];
};

export const addProject = async (project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    if (!supabase) throw new Error("DB Connection required");

    const { data, error } = await supabase.from('projects').insert([{
        partner_id: project.partnerId,
        name_en: project.name.en,
        name_ar: project.name.ar,
        description_en: project.description.en,
        description_ar: project.description.ar,
        image_url: project.imageUrl,
        features: project.features
    }]).select().single();

    if (error) throw error;
    return mapProjectFromDB(data);
};

export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<Project | undefined> => {
    if (supabase) {
        const dbUpdates: any = {};
        if (updates.name) {
            if(updates.name.en) dbUpdates.name_en = updates.name.en;
            if(updates.name.ar) dbUpdates.name_ar = updates.name.ar;
        }
        if (updates.description) {
            if(updates.description.en) dbUpdates.description_en = updates.description.en;
            if(updates.description.ar) dbUpdates.description_ar = updates.description.ar;
        }
        if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
        if (updates.features) dbUpdates.features = updates.features;

        const { data, error } = await supabase.from('projects').update(dbUpdates).eq('id', projectId).select().single();
        if (!error && data) {
            return mapProjectFromDB(data);
        }
    }
    return undefined;
};

export const deleteProject = async (projectId: string): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase.from('projects').delete().eq('id', projectId);
        return !error;
    }
    return false;
};
