
import { supabase } from '../lib/supabase';
import { projectsData as initialProjectsData } from '../data/projects';
import type { Project } from '../types';

// Create a mutable, in-memory copy of the data to simulate a database (Fallback).
let projectsData: Project[] = [...initialProjectsData];

// Helper to map DB columns to Project type
const mapProjectFromDB = (row: any): Project => ({
    id: row.id,
    partnerId: row.partner_id,
    name: { ar: row.name_ar, en: row.name_en },
    description: { ar: row.description_ar, en: row.description_en },
    imageUrl: row.image_url,
    imageUrl_small: row.image_url, // In a real app, you'd have resized versions
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
    // Fallback
    return [...projectsData];
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
    if (supabase) {
        const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
        if (!error && data) {
            return mapProjectFromDB(data);
        }
    }
    return projectsData.find(p => p.id === id);
};

export const getProjectsByPartnerId = async (partnerId: string): Promise<Project[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('projects').select('*').eq('partner_id', partnerId);
        if (!error && data) {
            return data.map(mapProjectFromDB);
        }
    }
    return projectsData.filter(p => p.partnerId === partnerId);
};

export const addProject = async (project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    const newProject = {
        ...project,
        id: `proj-${Date.now()}`, // Temp ID if DB fails, otherwise DB generates UUID
        createdAt: new Date().toISOString(),
    };

    if (supabase) {
        const { data, error } = await supabase.from('projects').insert([{
            partner_id: project.partnerId,
            name_en: project.name.en,
            name_ar: project.name.ar,
            description_en: project.description.en,
            description_ar: project.description.ar,
            image_url: project.imageUrl,
            features: project.features
        }]).select().single();

        if (!error && data) {
            return mapProjectFromDB(data);
        } else {
            console.error("Supabase Add Project Error:", error);
        }
    }
    
    projectsData.unshift(newProject);
    return newProject;
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

    const projectIndex = projectsData.findIndex(p => p.id === projectId);
    if (projectIndex > -1) {
        projectsData[projectIndex] = { ...projectsData[projectIndex], ...updates };
        return projectsData[projectIndex];
    }
    return undefined;
};

export const deleteProject = async (projectId: string): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase.from('projects').delete().eq('id', projectId);
        if (!error) return true;
    }

    const initialLength = projectsData.length;
    projectsData = projectsData.filter(p => p.id !== projectId);
    return projectsData.length < initialLength;
};
