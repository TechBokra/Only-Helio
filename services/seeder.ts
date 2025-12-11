
import { supabase } from '../supabaseClient';
import { partnersData } from '../data/partners';
import { projectsData } from '../data/projects';
import { propertiesData } from '../data/properties';
import { enTranslations } from '../data/translations';

export const seedDatabase = async () => {
    if (!supabase) throw new Error("Supabase connection not initialized.");

    console.log("Starting database seed...");

    // 1. Sync Users/Partners
    // We merge the static data (IDs, emails) with the translation data (Names)
    const usersPayload = partnersData.map(p => {
        // @ts-ignore
        const info = enTranslations.partnerInfo[p.id] || { name: p.id };
        return {
            id: p.id,
            name: info.name,
            email: p.email,
            type: p.type,
            imageUrl: p.imageUrl,
            status: p.status,
            // Add fallback for optional fields if your DB schema requires them or leave them null
        };
    });

    const { error: userError } = await supabase.from('User').upsert(usersPayload, { onConflict: 'id' });
    if (userError) throw new Error(`Users Sync Error: ${userError.message}`);

    // 2. Sync Projects
    const projectsPayload = projectsData.map(p => ({
        id: p.id,
        partnerId: p.partnerId,
        name_en: p.name.en,
        name_ar: p.name.ar,
        description_en: p.description.en,
        description_ar: p.description.ar,
        imageUrl: p.imageUrl,
        createdAt: p.createdAt || new Date().toISOString()
    }));

    const { error: projError } = await supabase.from('Project').upsert(projectsPayload, { onConflict: 'id' });
    if (projError) throw new Error(`Projects Sync Error: ${projError.message}`);

    // 3. Sync Properties
    const propsPayload = propertiesData.map(p => ({
        id: p.id,
        partnerId: p.partnerId,
        projectId: p.projectId,
        title_en: p.title.en,
        title_ar: p.title.ar,
        description_en: p.description.en,
        description_ar: p.description.ar,
        price: p.priceNumeric,
        price_en: p.price.en,
        price_ar: p.price.ar,
        area: p.area,
        beds: p.beds,
        baths: p.baths,
        floor: p.floor,
        type_en: p.type.en,
        type_ar: p.type.ar,
        status: p.status.en === 'For Sale' ? 'For Sale' : 'For Rent',
        listingStatus: p.listingStatus,
        imageUrl: p.imageUrl,
        gallery: p.gallery,
        location: p.location,
        isInCompound: p.isInCompound,
        installmentsAvailable: p.installmentsAvailable,
        realEstateFinanceAvailable: p.realEstateFinanceAvailable,
        deliveryImmediate: p.delivery.isImmediate,
        deliveryDate: p.delivery.date,
        // Convert object to string if your DB column is text/json, or use JSON column type
        installments: JSON.stringify(p.installments), 
        createdAt: p.createdAt || new Date().toISOString()
    }));

    const { error: propError } = await supabase.from('Property').upsert(propsPayload, { onConflict: 'id' });
    if (propError) throw new Error(`Properties Sync Error: ${propError.message}`);

    return "Database synchronized successfully! (Users, Projects, Properties)";
};
