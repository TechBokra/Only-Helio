
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

// Helper to format loose dates (e.g. "2025-12") to full ISO dates ("2025-12-01T...")
const formatDBDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    // If it's just YYYY-MM, append -01
    if (/^\d{4}-\d{2}$/.test(dateStr)) {
        return new Date(`${dateStr}-01`).toISOString();
    }
    return new Date(dateStr).toISOString();
};

export const seedDatabase = async () => {
    if (!supabase) throw new Error("Supabase connection not initialized.");

    console.log("Starting database seed...");
    let logs: string[] = [];

    // 1. Sync Users/Partners
    try {
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
                subscriptionPlan: p.subscriptionPlan
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

    // 3. Sync Properties (Using camelCase columns)
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
            
            // Switch to camelCase to match DB Schema
            listingStatus: p.listingStatus,
            imageUrl: p.imageUrl, 
            
            gallery: p.gallery,
            location: p.location,
            
            isInCompound: p.isInCompound,
            installmentsAvailable: p.installmentsAvailable,
            realEstateFinanceAvailable: p.realEstateFinanceAvailable,
            
            deliveryImmediate: p.delivery.isImmediate,
            deliveryDate: formatDBDate(p.delivery.date),
            
            installments: JSON.stringify(p.installments), 
            createdAt: p.createdAt || new Date().toISOString(),
            
            listingStartDate: formatDBDate(p.listingStartDate),
            contactMethod: p.contactMethod,
            ownerPhone: p.ownerPhone
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

    // 7. Requests (Best Effort)
    try {
        const pReqPayload = partnerRequestsData.map(r => ({
            id: r.id, companyName: r.companyName, companyType: r.companyType, 
            contactName: r.contactName, contactPhone: r.contactPhone, contactEmail: r.contactEmail,
            status: r.status, createdAt: r.createdAt
        }));
        await supabase.from('PartnerRequest').upsert(pReqPayload, { onConflict: 'id' });

        const propReqPayload = propertyRequestsData.map(r => ({
            id: r.id, customerName: r.customerName, customerPhone: r.customerPhone,
            status: r.status, createdAt: r.createdAt,
            propertyDetails: JSON.stringify(r.propertyDetails) 
        }));
        await supabase.from('PropertyListingRequest').upsert(propReqPayload, { onConflict: 'id' });

        const contactPayload = contactRequestsData.map(r => ({
            id: r.id, name: r.name, phone: r.phone, message: r.message,
            inquiryType: r.inquiryType, status: r.status, createdAt: r.createdAt
        }));
        await supabase.from('ContactRequest').upsert(contactPayload, { onConflict: 'id' });
        
         const inquiryPayload = propertyInquiriesData.map(r => ({
            id: r.id, customerName: r.customerName, customerPhone: r.customerPhone, details: r.details,
            status: r.status, createdAt: r.createdAt
        }));
        await supabase.from('PropertyInquiry').upsert(inquiryPayload, { onConflict: 'id' });
        logs.push("Requests Synced");

    } catch (e) {
        logs.push("Optional Requests Skipped");
    }

    return `Sync Complete. Details: ${logs.join(", ")}`;
};
