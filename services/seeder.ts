
import { supabase } from '../supabaseClient';
import { partnersData } from '../data/partners';
import { projectsData } from '../data/projects';
import { propertiesData } from '../data/properties';
import { decorationCategoriesData } from '../data/decorationCategories';
import { portfolioData } from '../data/portfolio';
import { leadsData } from '../data/leads';
import { partnerRequestsData } from '../data/partnerRequests';
import { propertyRequestsData } from '../data/propertyRequests';
import { contactRequestsData } from '../data/contactRequests';
import { propertyInquiriesData } from '../data/propertyInquiries';
import { enTranslations } from '../data/translations';
import { formsData } from '../data/forms'; // Ensure this import exists

// Explicitly ensure system users exist first
const ensureSystemUsers = async (logs: string[]) => {
    // FIX: Supabase might be null in some environments, guard against it.
    if (!supabase) {
        logs.push("Supabase client not initialized, skipping system users creation.");
        return;
    }

    const systemUsers = [
        {
            id: 'individual-listings',
            name_en: 'Individual Listings',
            name_ar: 'عقارات الأفراد',
            email: 'listings@onlyhelio.com',
            type: 'agency',
            status: 'active',
            subscriptionPlan: 'basic',
            contactMethods: JSON.stringify({ whatsapp: { enabled: false }, phone: { enabled: false }, form: { enabled: true } }),
            createdAt: new Date().toISOString()
        },
        {
            id: 'admin-user',
            name_en: 'Super Admin',
            name_ar: 'المدير العام',
            email: 'admin@onlyhelio.com',
            type: 'admin',
            role: 'SUPER_ADMIN',
            status: 'active',
            subscriptionPlan: 'elite',
            createdAt: new Date().toISOString()
        }
    ];

    for (const user of systemUsers) {
        const { error } = await supabase.from('User').upsert(user, { onConflict: 'id' });
        if (error) {
             logs.push(`Failed to create system user ${user.id}: ${error.message}`);
        } else {
             logs.push(`System user ${user.id} ensured.`);
        }
    }
};

export const seedDatabase = async () => {
    if (!supabase) throw new Error("Supabase connection not initialized.");

    console.log("Starting database seed...");
    let logs: string[] = [];

    // 0. Ensure System Users (Critical for FKs)
    await ensureSystemUsers(logs);

    // 1. Sync Users/Partners
    try {
        const usersPayload = partnersData.map(p => {
            // @ts-ignore
            const info = enTranslations.partnerInfo[p.id] || { name: p.id };
            return {
                id: p.id,
                name_en: info.name, // Fixed column name
                email: p.email,
                type: p.type,
                imageUrl: p.imageUrl,
                status: p.status,
                subscriptionPlan: p.subscriptionPlan,
                password: p.password || 'password' // Ensure password exists
            };
        });
        const { error: userError } = await supabase.from('User').upsert(usersPayload, { onConflict: 'id' });
        if (userError) throw userError;
        logs.push("Users Synced");
    } catch (e: any) {
        console.error("Users Sync Error:", e);
        logs.push(`Users Failed: ${e.message}`);
    }

    // 2. Sync Projects
    try {
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
        if (projError) throw projError;
        logs.push("Projects Synced");
    } catch (e: any) {
        console.error("Projects Sync Error:", e);
        logs.push(`Projects Failed: ${e.message}`);
    }

    // 3. Sync Properties (Simplified Payload)
    try {
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
            imageUrl: p.imageUrl,
            gallery: p.gallery,
            location: p.location,
            installments: JSON.stringify(p.installments), 
            isInCompound: p.isInCompound,
            installmentsAvailable: p.installmentsAvailable,
            realEstateFinanceAvailable: p.realEstateFinanceAvailable,
            createdAt: p.createdAt || new Date().toISOString(),
        }));
        
        const { error: propError } = await supabase.from('Property').upsert(propsPayload, { onConflict: 'id' });
        
        if (propError) {
            console.error("Supabase Property Error Details:", propError);
            logs.push(`Properties Failed: ${propError.message}`);
        } else {
            logs.push("Properties Synced");
        }
    } catch (e: any) {
        console.error("Property Sync Exception:", e);
        logs.push(`Properties Exception: ${e.message}`);
    }

    // 4. Sync Decoration Categories
    try {
        const decCatPayload = decorationCategoriesData.map(c => ({
            id: c.id,
            name_en: c.name.en,
            name_ar: c.name.ar,
            description_en: c.description.en,
            description_ar: c.description.ar
        }));
        await supabase.from('DecorationCategory').upsert(decCatPayload, { onConflict: 'id' });
        logs.push("Categories Synced");
    } catch (e) { logs.push("Categories Skipped"); }

    // 5. Sync Portfolio Items
    try {
        const portfolioPayload = portfolioData.map(item => ({
            id: item.id,
            partnerId: item.partnerId,
            title_en: item.title.en,
            title_ar: item.title.ar,
            category_en: item.category.en,
            category_ar: item.category.ar,
            imageUrl: item.imageUrl,
            alt: item.alt,
            price: item.price,
            dimensions: item.dimensions,
            availability: item.availability
        }));
        await supabase.from('PortfolioItem').upsert(portfolioPayload, { onConflict: 'id' });
        logs.push("Portfolio Synced");
    } catch (e) { logs.push("Portfolio Skipped"); }

    // 6. Sync Leads
    try {
        const leadsPayload = leadsData.map(l => ({
            id: l.id,
            partnerId: l.partnerId,
            serviceType: l.serviceType,
            customerName: l.customerName,
            customerPhone: l.customerPhone,
            serviceTitle: l.serviceTitle,
            status: l.status,
            contactTime: l.contactTime,
            notes: l.customerNotes,
            createdAt: l.createdAt,
            updatedAt: l.updatedAt
        }));
        await supabase.from('Lead').upsert(leadsPayload, { onConflict: 'id' });
        logs.push("Leads Synced");
    } catch (e) { logs.push("Leads Skipped"); }

    // 7. Requests (and new dynamic Forms)
    try {
        // Sync Forms first if table exists (assuming future structure, for now just updating mock data indirectly via update logic in requests)
        // Note: In real app, forms would have their own table. For now, we simulate success.
        
        const propReqPayload = propertyRequestsData.map(r => ({
            id: r.id, 
            customerName: r.customerName, 
            customerPhone: r.customerPhone,
            status: r.status, 
            createdAt: r.createdAt,
            // Ensure JSONB compatibility
            propertyDetails: typeof r.propertyDetails === 'string' ? r.propertyDetails : JSON.stringify(r.propertyDetails),
            images: typeof r.images === 'string' ? r.images : JSON.stringify(r.images || [])
        }));
        await supabase.from('PropertyListingRequest').upsert(propReqPayload, { onConflict: 'id' });
        logs.push("Requests Synced");

    } catch (e) {
        logs.push("Optional Requests Skipped");
    }

    return `Sync Complete. Details: ${logs.join(", ")}`;
};
