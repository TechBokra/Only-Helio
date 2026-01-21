
import { supabase } from '../supabaseClient';
import type { FormDefinition } from '../types';

const mapDbToForm = (row: any): FormDefinition => ({
    id: row.id,
    slug: row.slug,
    title: { ar: row.title_ar, en: row.title_en },
    description: { ar: row.description_ar, en: row.description_en },
    category: row.category,
    destination: row.destination,
    isActive: row.isActive,
    submitButtonLabel: { ar: row.submitButtonLabel_ar, en: row.submitButtonLabel_en },
    fields: typeof row.fields === 'string' ? JSON.parse(row.fields) : row.fields,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
});

export const getAllForms = async (): Promise<FormDefinition[]> => {
    const { data, error } = await supabase
        .from('FormDefinition')
        .select('*')
        .order('createdAt', { ascending: false });

    if (error) {
        console.error("Error fetching forms:", error);
        return [];
    }
    return data.map(mapDbToForm);
};

export const getFormById = async (id: string): Promise<FormDefinition | undefined> => {
    const { data, error } = await supabase
        .from('FormDefinition')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return undefined;
    return mapDbToForm(data);
};

export const getFormBySlug = async (slug: string): Promise<FormDefinition | undefined> => {
    const { data, error } = await supabase
        .from('FormDefinition')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) return undefined;
    return mapDbToForm(data);
};

export const saveForm = async (form: FormDefinition): Promise<FormDefinition> => {
    const payload = {
        slug: form.slug,
        title_en: form.title.en,
        title_ar: form.title.ar,
        description_en: form.description?.en,
        description_ar: form.description?.ar,
        category: form.category,
        destination: form.destination,
        submitButtonLabel_en: form.submitButtonLabel?.en,
        submitButtonLabel_ar: form.submitButtonLabel?.ar,
        isActive: form.isActive,
        fields: form.fields, // JSONB handled by supabase client usually, or pass as object
        updatedAt: new Date().toISOString()
    };

    let result;
    
    // Update if ID exists and is a UUID (not a temp ID starting with 'form-')
    if (form.id && !form.id.startsWith('form-')) {
         const { data, error } = await supabase
            .from('FormDefinition')
            .update(payload)
            .eq('id', form.id)
            .select()
            .single();
         if (error) throw error;
         result = data;
    } else {
        const { data, error } = await supabase
            .from('FormDefinition')
            .insert({ ...payload, createdAt: new Date().toISOString() })
            .select()
            .single();
        if (error) throw error;
        result = data;
    }

    return mapDbToForm(result);
};

export const deleteForm = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('FormDefinition').delete().eq('id', id);
    return !error;
};
