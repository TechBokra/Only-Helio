
import { supabase } from '../supabaseClient';
import type { Project } from '../types';

interface ProjectRow {
    id: string;
    partnerId: string;
    name_en: string;
    name_ar: string;
    description_en: string;
    description_ar: string;
    imageUrl: string;
    features: any; // JSONB
    createdAt: string;
    // Joined partner data
    partner?: {
        name_en: string | null;
        name_ar: string | null;
    };
}

// Helper to map DB row to Project type
const mapDbToProject = (row: ProjectRow): Project => ({
    id: row.id,
    partnerId: row.partnerId,
    name: { ar: row.name_ar, en: row.name_en },
    description: { ar: row.description_ar, en: row.description_en },
    imageUrl: row.imageUrl,
    imageUrl_small: row.imageUrl,
    imageUrl_medium: row.imageUrl,
    imageUrl_large: row.imageUrl,
    createdAt: row.createdAt,
    // Safely handle both string (legacy) and object (new) formats
    features: typeof row.features === 'string' ? JSON.parse(row.features) : (row.features || []),
    partnerName: row.partner?.name_en || row.partner?.name_ar || 'Unknown'
});

export const getAllProjects = async (): Promise<Project[]> => {
    // Explicit constraint name: Project_partnerId_fkey
    // Fetch name_en and name_ar instead of 'name'
    const { data, error } = await supabase
        .from('Project')
        .select(`*, partner:User!Project_partnerId_fkey(name_en, name_ar)`)
        .order('createdAt', { ascending: false });

    if (error) {
        console.error("Error fetching projects:", JSON.stringify(error, null, 2));
        // Fallback for cases where constraint might be named differently or join fails
        if (error.code === 'PGRST200') {
             const { data: fallbackData } = await supabase.from('Project').select('*').order('createdAt', { ascending: false });
             return (fallbackData || []).map((row) => mapDbToProject(row as ProjectRow));
        }
        return [];
    }
    return (data || []).map((row) => mapDbToProject(row as ProjectRow));
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
    const { data, error } = await supabase
        .from('Project')
        .select(`*, partner:User!Project_partnerId_fkey(name_en, name_ar)`)
        .eq('id', id)
        .single();

    if (error) return undefined;
    return mapDbToProject(data as ProjectRow);
};

export const getProjectsByPartnerId = async (partnerId: string): Promise<Project[]> => {
    const { data, error } = await supabase
        .from('Project')
        .select(`*, partner:User!Project_partnerId_fkey(name_en, name_ar)`)
        .eq('partnerId', partnerId)
        .order('createdAt', { ascending: false });

    if (error) return [];
    return (data || []).map((row) => mapDbToProject(row as ProjectRow));
};

export const addProject = async (project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    const newId = crypto.randomUUID();

    const dbPayload = {
        id: newId,
        partnerId: project.partnerId,
        name_en: project.name.en,
        name_ar: project.name.ar,
        description_en: project.description.en,
        description_ar: project.description.ar,
        imageUrl: project.imageUrl,
        // Pass array directly for JSONB
        features: project.features || [], 
        createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase.from('Project').insert(dbPayload).select().single();
    if (error) throw error;
    return mapDbToProject(data as ProjectRow);
};

export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<Project | undefined> => {
    const dbUpdates: any = {};
    if (updates.name) { dbUpdates.name_en = updates.name.en; dbUpdates.name_ar = updates.name.ar; }
    if (updates.description) { dbUpdates.description_en = updates.description.en; dbUpdates.description_ar = updates.description.ar; }
    if (updates.imageUrl) dbUpdates.imageUrl = updates.imageUrl;
    // Pass array directly for JSONB
    if (updates.features) dbUpdates.features = updates.features;

    const { data, error } = await supabase.from('Project').update(dbUpdates).eq('id', projectId).select().single();
    if (error) { console.error('Error updating project:', error); return undefined; }
    return mapDbToProject(data as ProjectRow);
};

export const deleteProject = async (projectId: string): Promise<boolean> => {
    const { error } = await supabase.from('Project').delete().eq('id', projectId);
    return !error;
};
