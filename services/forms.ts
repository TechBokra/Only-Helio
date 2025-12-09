
import { supabase } from '../lib/supabase';
import { formsData as initialData } from '../data/forms';
import type { FormDefinition } from '../types';

let formsData: FormDefinition[] = [...initialData];

const mapFormFromDB = (row: any): FormDefinition => ({
    id: row.id,
    slug: row.slug,
    title: typeof row.title === 'string' ? JSON.parse(row.title) : row.title,
    description: typeof row.description === 'string' ? JSON.parse(row.description) : row.description,
    category: row.category,
    destination: row.destination,
    isActive: row.is_active,
    submitButtonLabel: typeof row.submit_button_label === 'string' ? JSON.parse(row.submit_button_label) : row.submit_button_label,
    fields: typeof row.fields === 'string' ? JSON.parse(row.fields) : (row.fields || []),
    createdAt: row.created_at,
    updatedAt: row.updated_at
});

export const getAllForms = async (): Promise<FormDefinition[]> => {
    if (supabase) {
        const { data, error } = await supabase.from('forms').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data.map(mapFormFromDB);
    }
    return [...formsData];
};

export const getFormById = async (id: string): Promise<FormDefinition | undefined> => {
    if (supabase) {
        const { data, error } = await supabase.from('forms').select('*').eq('id', id).single();
        if (!error && data) return mapFormFromDB(data);
    }
    return formsData.find(f => f.id === id);
};

export const getFormBySlug = async (slug: string): Promise<FormDefinition | undefined> => {
    if (supabase) {
        const { data, error } = await supabase.from('forms').select('*').eq('slug', slug).single();
        if (!error && data) return mapFormFromDB(data);
    }
    return formsData.find(f => f.slug === slug);
};

export const saveForm = async (form: FormDefinition): Promise<FormDefinition> => {
    if (supabase) {
        const payload = {
            slug: form.slug,
            title: form.title,
            description: form.description,
            category: form.category,
            destination: form.destination,
            is_active: form.isActive,
            submit_button_label: form.submitButtonLabel,
            fields: form.fields,
            updated_at: new Date().toISOString()
        };

        if (form.id && !form.id.startsWith('form-')) {
            // Update
            const { data, error } = await supabase.from('forms').update(payload).eq('id', form.id).select().single();
            if (!error && data) return mapFormFromDB(data);
        } else {
            // Insert (Remove temp ID)
            const { data, error } = await supabase.from('forms').insert([payload]).select().single();
            if (!error && data) return mapFormFromDB(data);
        }
    }

    // Fallback Local Update
    const index = formsData.findIndex(f => f.id === form.id);
    const now = new Date().toISOString();
    if (index > -1) {
        formsData[index] = { ...form, updatedAt: now };
        return formsData[index];
    } else {
        const newForm = { ...form, id: `form-${Date.now()}`, createdAt: now, updatedAt: now };
        formsData.push(newForm);
        return newForm;
    }
};

export const deleteForm = async (id: string): Promise<boolean> => {
    if (supabase) {
        const { error } = await supabase.from('forms').delete().eq('id', id);
        if (!error) return true;
    }
    const initialLength = formsData.length;
    formsData = formsData.filter(f => f.id !== id);
    return formsData.length < initialLength;
};
