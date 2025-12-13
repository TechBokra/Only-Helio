
import { supabase } from '../supabaseClient';
import { projectsData as initialProjectsData } from '../data/projects';
import type { Project } from '../types';

// Create a local mutable copy for mock operations
let projectsData: Project[] = [...initialProjectsData];
const SIMULATED_DELAY = 300;

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
    if (!supabase) {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...projectsData]), SIMULATED_DELAY);
        });
    }

    const { data, error } = await supabase
        .from('Project')
        .select(`*, partner:User!partnerId (name)`)
        .order('createdAt', { ascending: false });

    if (error) {
        console.warn('Supabase projects fetch failed:', error.message);
        return [...projectsData];
    }
    return (data || []).map(mapDbToProject);
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
    if (!supabase) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(projectsData.find(p => p.id === id)), SIMULATED_DELAY);
        });
    }

    const { data, error } = await supabase
        .from('Project')
        .select(`*, partner:User!partnerId (name)`)
        .eq('id', id)
        .single();

    if (error) return projectsData.find(p => p.id === id);
    return mapDbToProject(data);
};

export const getProjectsByPartnerId = async (partnerId: string): Promise<Project[]> => {
    if (!supabase) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(projectsData.filter(p => p.partnerId === partnerId)), SIMULATED_DELAY);
        });
    }

    const { data, error } = await supabase
        .from('Project')
        .select(`*, partner:User!partnerId (name)`)
        .eq('partnerId', partnerId);

    if (error) return projectsData.filter(p => p.partnerId === partnerId);
    return data.map(mapDbToProject);
};

export const addProject = async (project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    if (!supabase) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newProject: Project = { 
                    ...project, 
                    id: `proj-${Date.now()}`, 
                    createdAt: new Date().toISOString(),
                    // Ensure fallback images if missing
                    imageUrl_small: project.imageUrl,
                    imageUrl_medium: project.imageUrl,
                    imageUrl_large: project.imageUrl
                };
                projectsData.unshift(newProject);
                resolve(newProject);
            }, SIMULATED_DELAY);
        });
    }

    // FIX: Generate ID client-side to satisfy NOT NULL constraint
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
    
    if (error) {
        console.error("Supabase Add Project Error:", error);
        throw error;
    }
    return mapDbToProject(data);
};

export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<Project | undefined> => {
    if (!supabase) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = projectsData.findIndex(p => p.id === projectId);
                if (index > -1) {
                    projectsData[index] = { ...projectsData[index], ...updates };
                    resolve(projectsData[index]);
                } else {
                    resolve(undefined);
                }
            }, SIMULATED_DELAY);
        });
    }

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
    if (!supabase) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const initialLen = projectsData.length;
                projectsData = projectsData.filter(p => p.id !== projectId);
                resolve(projectsData.length < initialLen);
            }, SIMULATED_DELAY);
        });
    }
    
    const { error } = await supabase.from('Project').delete().eq('id', projectId);
    return !error;
};
