
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
    // Provide defaults for responsive images if not in DB
    imageUrl_small: row.imageUrl,
    imageUrl_medium: row.imageUrl,
    imageUrl_large: row.imageUrl,
    createdAt: row.createdAt,
    features: row.features ? (typeof row.features === 'string' ? JSON.parse(row.features) : row.features) : [],
    // Add partnerName if joined
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
        id: `proj-${Date.now()}`,
        partnerId: project.partnerId,
        name_en: project.name.en,
        name_ar: project.name.ar,
        description_en: project.description.en,
        description_ar: project.description.ar,
        imageUrl: project.imageUrl,
        features: project.features,
        createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase.from('Project').insert(dbPayload).select().single();
    if (error) throw error;
    return mapDbToProject(data);
};

export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<Project | undefined> => {
    if (!supabase) {
        const idx = mockProjects.findIndex(p => p.id === projectId);
        if (idx > -1) {
            mockProjects[idx] = { ...mockProjects[idx], ...updates };
            return mockProjects[idx];
        }
        return undefined;
    }

    // Mapping partial updates to DB columns would go here
    // For MVP/Demo purposes, complex update mapping is simplified
    console.warn("Update project via Supabase not fully implemented in this demo step.");
    return undefined;
};

export const deleteProject = async (projectId: string): Promise<boolean> => {
    if (!supabase) {
        const idx = mockProjects.findIndex(p => p.id === projectId);
        if (idx > -1) {
            mockProjects.splice(idx, 1);
            return true;
        }
        return false;
    }

    const { error } = await supabase.from('Project').delete().eq('id', projectId);
    return !error;
};
