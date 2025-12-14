
import { supabase } from '../supabaseClient';
import type { Project } from '../types';

// Helper to map DB row to Project type
const mapDbToProject = (row: any): Project => ({
    id: row.id,
    partnerId: row.partnerId,
    name: { ar: row.name_ar, en: row.name_en },
    description: { ar: row.description_ar, en: row.description_en },
    imageUrl: row.imageUrl,
    imageUrl_small: row.imageUrl,
    imageUrl_medium: row.imageUrl,
    imageUrl_large: row.imageUrl,
    createdAt: row.createdAt,
    features: typeof row.features === 'string' ? JSON.parse(row.features) : (row.features || []),
    partnerName: row.partner?.name
});

export const getAllProjects = async (): Promise<Project[]> => {
    // STRICT MODE: If no DB connection, throw error or return empty, DO NOT use mock data.
    if (!supabase) {
        console.error("Supabase client is not initialized.");
        return [];
    }

    const { data, error } = await supabase
        .from('Project')
        .select(`*, partner:User!partnerId (name)`)
        .order('createdAt', { ascending: false });

    if (error) {
        console.error('Supabase projects fetch failed:', error.message);
        return [];
    }
    return (data || []).map(mapDbToProject);
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
    if (!supabase) return undefined;

    const { data, error } = await supabase
        .from('Project')
        .select(`*, partner:User!partnerId (name)`)
        .eq('id', id)
        .single();

    if (error) return undefined;
    return mapDbToProject(data);
};

export const getProjectsByPartnerId = async (partnerId: string): Promise<Project[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('Project')
        .select(`*, partner:User!partnerId (name)`)
        .eq('partnerId', partnerId);

    if (error) return [];
    return data.map(mapDbToProject);
};

export const addProject = async (project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    if (!supabase) throw new Error("Database connection required for adding projects.");

    const newId = crypto.randomUUID();

    const dbPayload = {
        id: newId,
        partnerId: project.partnerId,
        name_en: project.name.en,
        name_ar: project.name.ar,
        description_en: project.description.en,
        description_ar: project.description.ar,
        imageUrl: project.imageUrl,
        features: JSON.stringify(project.features || []), 
        createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase.from('Project').insert(dbPayload).select().single();
    if (error) throw error;
    return mapDbToProject(data);
};

export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<Project | undefined> => {
    if (!supabase) throw new Error("Database connection required.");

    const dbUpdates: any = {};
    if (updates.name) { dbUpdates.name_en = updates.name.en; dbUpdates.name_ar = updates.name.ar; }
    if (updates.description) { dbUpdates.description_en = updates.description.en; dbUpdates.description_ar = updates.description.ar; }
    if (updates.imageUrl) dbUpdates.imageUrl = updates.imageUrl;
    if (updates.features) dbUpdates.features = JSON.stringify(updates.features);

    const { data, error } = await supabase.from('Project').update(dbUpdates).eq('id', projectId).select().single();
    if (error) { console.error('Error updating project:', error); return undefined; }
    return mapDbToProject(data);
};

export const deleteProject = async (projectId: string): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await supabase.from('Project').delete().eq('id', projectId);
    return !error;
};
