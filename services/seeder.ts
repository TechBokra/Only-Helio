
import { supabase } from '../supabaseClient';
import { partnersData } from '../data/partners';
import { projectsData } from '../data/projects';
import { propertiesData } from '../data/properties';
import { decorationCategoriesData } from '../data/decorationCategories';
import { portfolioData } from '../data/portfolio';
import { leadsData } from '../data/leads';
import { bannersData } from '../data/banners';
import { routingRulesData } from '../data/routingRules';
import { transactionsData } from '../data/finance'; 
import { enTranslations } from '../data/translations';
import { mapPartnerTypeToRole } from '../data/permissions';
import { Role } from '../types';

// Explicitly ensure system users exist first with CORRECT ROLES
const ensureSystemUsers = async (logs: string[]) => {
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
            password: 'password123',
            type: 'agency',
            role: 'AGENCY_PARTNER',
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
            password: 'password123',
            type: 'admin',
            role: 'SUPER_ADMIN',
            status: 'active',
            subscriptionPlan: 'elite',
            createdAt: new Date().toISOString()
        },
        // Ensure Finishing Partner
        {
            id: 'finishing-partner-1',
            name_en: 'Elite Finishing Co.',
            name_ar: 'شركة تشطيبات النخبة',
            email: 'finish@onlyhelio.com',
            password: 'password123',
            type: 'finishing',
            role: 'FINISHING_PARTNER',
            status: 'active',
            subscriptionPlan: 'professional',
            displayType: 'featured',
            contactMethods: JSON.stringify({ whatsapp: { enabled: true, number: '01012345678' }, phone: { enabled: true, number: '01012345678' }, form: { enabled: true } }),
            createdAt: new Date().toISOString()
        }
    ];

    for (const user of systemUsers) {
        // Use upsert to create or update if exists
        const { error } = await supabase.from('User').upsert(user, { onConflict: 'id' });
        if (error) {
             console.error(`Failed to create system user ${user.id}:`, error);
             logs.push(`CRITICAL: Failed to create system user ${user.id}: ${error.message}`);
             // If system users fail, subsequent inserts (Properties) will fail due to FKs. Stop here.
             throw new Error(`Failed to create critical system user: ${user.id}. Reason: ${error.message}`);
        } else {
             logs.push(`System user ${user.email} ensured.`);
        }
    }
};

export const seedDatabase = async () => {
    if (!supabase) throw new Error("Supabase connection not initialized.");

    console.log("Starting database seed...");
    let logs: string[] = [];

    // 0. Ensure System Users (Critical for FKs)
    try {
        await ensureSystemUsers(logs);
    } catch (e: any) {
        return `Seed Failed: ${e.message}`;
    }

    // 1. Sync Users/Partners (From mock data)
    try {
        const usersPayload = partnersData.map(p => {
            // @ts-ignore
            const info = enTranslations.partnerInfo[p.id] || { name: p.id };
            let role = p.type === 'admin' ? Role.SUPER_ADMIN : mapPartnerTypeToRole(p.type);
            
            return {
                id: p.id,
                name_en: info.name, 
                name_ar: info.name, // Simplified fallback
                email: p.email,
                type: p.type,
                role: role,
                imageUrl: p.imageUrl,
                status: p.status,
                password: p.password || 'password123', 
                subscriptionPlan: p.subscriptionPlan,
                contactMethods: p.contactMethods ? JSON.stringify(p.contactMethods) : undefined
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

    // 3. Sync Properties
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
            gallery: JSON.stringify(p.gallery),
            location: JSON.stringify(p.location),
            installments: JSON.stringify(p.installments), 
            isInCompound: p.isInCompound,
            installmentsAvailable: p.installmentsAvailable,
            realEstateFinanceAvailable: p.realEstateFinanceAvailable,
            listingStatus: p.listingStatus || 'active',
            createdAt: p.createdAt || new Date().toISOString(),
        }));
        
        const { error: propError } = await supabase.from('Property').upsert(propsPayload, { onConflict: 'id' });
        
        if (propError) {
            logs.push(`Properties Failed: ${propError.message}`);
        } else {
            logs.push("Properties Synced");
        }
    } catch (e: any) {
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

    // 7. Sync Banners
    try {
        const bannersPayload = bannersData.map(b => ({
            id: b.id,
            title: b.title,
            imageUrl: b.imageUrl,
            link: b.link,
            locations: b.locations,
            status: b.status,
            startDate: b.startDate,
            endDate: b.endDate
        }));
        await supabase.from('Banner').upsert(bannersPayload, { onConflict: 'id' });
        logs.push("Banners Synced");
    } catch (e) { logs.push("Banners Skipped"); }

    // 8. Sync Routing Rules
    try {
        const rulesPayload = routingRulesData.map(r => ({
            id: r.id,
            name_en: r.name.en,
            name_ar: r.name.ar,
            active: r.active,
            conditions: JSON.stringify(r.conditions),
            action: JSON.stringify(r.action)
        }));
        await supabase.from('RoutingRule').upsert(rulesPayload, { onConflict: 'id' });
        logs.push("Routing Rules Synced");
    } catch (e) { logs.push("Routing Rules Skipped"); }

    // 9. Sync Transactions
    try {
        if (transactionsData.length > 0) {
            const txnsPayload = transactionsData.map(t => ({
                id: t.id,
                userId: t.userId,
                userName: t.userName,
                amount: t.amount,
                currency: t.currency,
                type: t.type,
                status: t.status,
                method: t.method,
                description: t.description,
                relatedEntityId: t.relatedEntityId,
                receiptUrl: t.receiptUrl,
                referenceNumber: t.referenceNumber,
                createdAt: t.createdAt,
                updatedAt: t.updatedAt
            }));
            await supabase.from('Transaction').upsert(txnsPayload, { onConflict: 'id' });
            logs.push("Transactions Synced");
        }
    } catch (e) { logs.push("Transactions Skipped"); }

    return `Sync Complete. Details: ${logs.join(", ")}`;
};
