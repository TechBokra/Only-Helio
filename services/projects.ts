
import { supabase } from '../supabaseClient';
import { projectsData as mockProjects } from '../data/projects';
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
    // Safely parse JSONB or use existing object
    features: row.features || [],
    partnerName: row.partner?.name
});

export const getAllProjects = async (): Promise<Project[]> => {
    if (!supabase) return mockProjects;

    const { data, error } = await supabase
        .from('Project')
        .select(`*, partner:User!partnerId (name)`)
        .order('createdAt', { ascending: false });

    if (error) {
        console.warn('Supabase projects fetch failed, using mock data:', error.message);
        return mockProjects;
    }
    return data.map(mapDbToProject);
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
    if (!supabase) return mockProjects.find(p => p.id === id);

    const { data, error } = await supabase
        .from('Project')
        .select(`*, partner:User!partnerId (name)`)
        .eq('id', id)
        .single();

    if (error) return mockProjects.find(p => p.id === id);
    return mapDbToProject(data);
};

export const getProjectsByPartnerId = async (partnerId: string): Promise<Project[]> => {
    if (!supabase) return mockProjects.filter(p => p.partnerId === partnerId);

    const { data, error } = await supabase
        .from('Project')
        .select(`*, partner:User!partnerId (name)`)
        .eq('partnerId', partnerId);

    if (error) return mockProjects.filter(p => p.partnerId === partnerId);
    return data.map(mapDbToProject);
};

export const addProject = async (project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    if (!supabase) {
        const newMock = { ...project, id: `proj-${Date.now()}`, createdAt: new Date().toISOString() } as Project;
        mockProjects.unshift(newMock);
        return newMock;
    }

    const dbPayload = {
        partnerId: project.partnerId,
        name_en: project.name.en,
        name_ar: project.name.ar,
        description_en: project.description.en,
        description_ar: project.description.ar,
        imageUrl: project.imageUrl,
        features: project.features, // Sends as JSONB
        createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase.from('Project').insert(dbPayload).select().single();
    if (error) throw error;
    return mapDbToProject(data);
};

export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<Project | undefined> => {
    if (!supabase) return undefined;

    const dbUpdates: any = {};
    if (updates.name) { dbUpdates.name_en = updates.name.en; dbUpdates.name_ar = updates.name.ar; }
    if (updates.description) { dbUpdates.description_en = updates.description.en; dbUpdates.description_ar = updates.description.ar; }
    if (updates.imageUrl) dbUpdates.imageUrl = updates.imageUrl;
    if (updates.features) dbUpdates.features = updates.features;

    const { data, error } = await supabase.from('Project').update(dbUpdates).eq('id', projectId).select().single();
    if (error) { console.error('Error updating project:', error); return undefined; }
    return mapDbToProject(data);
};

export const deleteProject = async (projectId: string): Promise<boolean> => {
    if (!supabase) return true;
    const { error } = await supabase.from('Project').delete().eq('id', projectId);
    return !error;
};
