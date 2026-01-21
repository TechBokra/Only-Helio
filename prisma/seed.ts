
import { propertiesData } from '../data/properties';
import { partnersData } from '../data/partners';
import { projectsData } from '../data/projects';
import { portfolioData } from '../data/portfolio';
import { decorationCategoriesData } from '../data/decorationCategories';
import {
    propertyTypesData,
    finishingStatusesData,
    amenitiesData,
} from '../data/filterOptions';
import { siteContentData } from '../data/content';
import { bannersData } from '../data/banners';
import { leadsData } from '../data/leads';
import { requestsData } from '../data/requests';
import { arTranslations, enTranslations } from '../data/translations';
import { routingRulesData } from '../data/routingRules';

// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // --- 1. CLEANUP (Order matters for foreign keys) ---
  console.log('🧹 Cleaning up existing data...');
  const deleteOrder = [
      'Notification', 'LeadMessage', 'Lead', 'Request', 'AmenitiesOnProperties',
      'Property', 'Project', 'PortfolioItem', 'Transaction', 'User',
      'Amenity', 'PropertyType', 'FinishingStatus', 'DecorationCategory',
      'Banner', 'Quote', 'StaticPage', 'SystemSetting', 'RoutingRule'
  ];

  for (const model of deleteOrder) {
      try {
          // @ts-ignore
          if (prisma[model.charAt(0).toLowerCase() + model.slice(1)]) {
              // @ts-ignore
              await prisma[model.charAt(0).toLowerCase() + model.slice(1)].deleteMany();
          }
      } catch (e) {
          console.log(`⚠️  Skipping delete for ${model} (might not exist yet or error)`);
      }
  }

  // --- 2. LOOKUP TABLES (Filters) ---
  console.log('📝 Seeding lookup tables (Types, Amenities, Statuses)...');
  
  await prisma.propertyType.createMany({
    data: propertyTypesData.map((pt) => ({
      id: pt.id,
      name_en: pt.en,
      name_ar: pt.ar,
    })),
  });

  await prisma.finishingStatus.createMany({
    data: finishingStatusesData.map((fs) => ({
      id: fs.id,
      name_en: fs.en,
      name_ar: fs.ar,
      // Ensure applicableTo is passed as array/json
      applicableTo: fs.applicableTo || [], 
    })),
  });

  await prisma.amenity.createMany({
    data: amenitiesData.map((a) => ({
      id: a.id,
      name_en: a.en,
      name_ar: a.ar,
      applicableTo: a.applicableTo || [],
    })),
  });

  await prisma.decorationCategory.createMany({
      data: decorationCategoriesData.map(dc => ({
          id: dc.id,
          name_en: dc.name.en,
          name_ar: dc.name.ar,
          description_en: dc.description.en,
          description_ar: dc.description.ar,
      }))
  });

  // --- 3. USERS (Partners & Admins) ---
  console.log('busts in silhouette Seeding users...');
  
  const roleMap: Record<string, string> = {
      'admin': 'SUPER_ADMIN',
      'developer': 'DEVELOPER_PARTNER',
      'finishing': 'FINISHING_PARTNER',
      'agency': 'AGENCY_PARTNER',
      'decoration_manager': 'DECORATION_MANAGER',
      'platform_finishing_manager': 'PLATFORM_FINISHING_MANAGER',
      'finishing_market_manager': 'FINISHING_MARKET_MANAGER',
      'platform_real_estate_manager': 'PLATFORM_REAL_ESTATE_MANAGER',
      'real_estate_market_manager': 'REAL_ESTATE_MARKET_MANAGER',
      'partner_relations_manager': 'PARTNER_RELATIONS_MANAGER',
      'content_manager': 'CONTENT_MANAGER',
      'service_manager': 'SERVICE_MANAGER',
      'customer_relations_manager': 'CUSTOMER_RELATIONS_MANAGER',
      'listings_manager': 'LISTINGS_MANAGER'
  };

  const statusMap: Record<string, string> = {
      'active': 'ACTIVE',
      'pending': 'PENDING',
      'disabled': 'DISABLED'
  };

  for (const p of partnersData) {
      // @ts-ignore
      const enInfo = enTranslations.partnerInfo[p.id];
      // @ts-ignore
      const arInfo = arTranslations.partnerInfo[p.id];
      
      const role = roleMap[p.type] || 'AGENCY_PARTNER';
      const status = statusMap[p.status] || 'PENDING';

      await prisma.user.create({
          data: {
            id: p.id,
            email: p.email,
            password: p.password || 'password123',
            imageUrl: p.imageUrl,
            role: role as any,
            status: status as any,
            subscriptionPlan: p.subscriptionPlan,
            subscriptionEndDate: p.subscriptionEndDate ? new Date(p.subscriptionEndDate) : null,
            displayType: p.displayType,
            name_en: enInfo?.name || p.id,
            name_ar: arInfo?.name || p.id,
            description_en: enInfo?.description || '',
            description_ar: arInfo?.description || '',
            // Pass the object directly, Prisma/Postgres handles JSONB
            contactMethods: p.contactMethods as any, 
          }
      });
  }

  // --- 4. PROJECTS ---
  console.log('🏗️  Seeding projects...');
  await prisma.project.createMany({
    data: projectsData.map((p) => ({
      id: p.id,
      partnerId: p.partnerId,
      name_en: p.name.en,
      name_ar: p.name.ar,
      description_en: p.description.en,
      description_ar: p.description.ar,
      imageUrl: p.imageUrl,
      createdAt: new Date(p.createdAt),
      // Pass the object/array directly
      features: p.features as any, 
    })),
  });

  // --- 5. PROPERTIES ---
  console.log('🏠 Seeding properties...');
  for (const prop of propertiesData) {
    try {
        await prisma.property.create({
        data: {
            id: prop.id,
            partnerId: prop.partnerId,
            projectId: prop.projectId,
            imageUrl: prop.imageUrl,
            gallery: prop.gallery,
            listingStatus: prop.listingStatus,
            price: prop.priceNumeric,
            price_en: prop.price.en,
            price_ar: prop.price.ar,
            area: prop.area,
            beds: prop.beds,
            baths: prop.baths,
            floor: prop.floor,
            
            type_en: prop.type.en,
            type_ar: prop.type.ar,
            title_en: prop.title.en,
            title_ar: prop.title.ar,
            address_en: prop.address.en,
            address_ar: prop.address.ar,
            description_en: prop.description.en,
            description_ar: prop.description.ar,
            
            finishingStatus_en: prop.finishingStatus?.en,
            finishingStatus_ar: prop.finishingStatus?.ar,
            
            installmentsAvailable: prop.installmentsAvailable,
            isInCompound: prop.isInCompound,
            realEstateFinanceAvailable: prop.realEstateFinanceAvailable,
            
            deliveryImmediate: prop.delivery.isImmediate,
            deliveryDate: prop.delivery.date ? new Date(prop.delivery.date) : null,
            
            // JSONB fields - passed directly
            installments: prop.installments as any, 
            location: prop.location as any, 
            
            listingStartDate: prop.listingStartDate ? new Date(prop.listingStartDate) : new Date(),
            contactMethod: prop.contactMethod,
            ownerPhone: prop.ownerPhone,
            
            // Handle Relation for Amenities
            amenities: {
            create: (prop.amenities?.en || []).map(amenityName => {
                const amenity = amenitiesData.find(a => a.en === amenityName);
                if (amenity) {
                    return { amenity: { connect: { id: amenity.id } } };
                }
                return null;
            }).filter(Boolean) as any
            }
        },
        });
    } catch (e) {
        console.warn(`Failed to seed property ${prop.id}, possibly missing dependencies (Partner/Project).`);
    }
  }

  // --- 6. PORTFOLIO ---
  console.log('🎨 Seeding portfolio...');
  await prisma.portfolioItem.createMany({
    data: portfolioData.map(item => ({
        id: item.id,
        partnerId: item.partnerId,
        imageUrl: item.imageUrl,
        alt: item.alt,
        title_en: item.title.en,
        title_ar: item.title.ar,
        category_en: item.category.en,
        category_ar: item.category.ar,
        price: item.price,
        dimensions: item.dimensions,
        availability: item.availability,
        // Optional: link category if ID matches
        categoryId: decorationCategoriesData.find(c => c.name.en === item.category.en)?.id
    }))
  });

  // --- 7. CMS: QUOTES & PAGES ---
  console.log('📄 Seeding CMS content...');
  
  if (siteContentData.quotes) {
      await prisma.quote.createMany({
          data: siteContentData.quotes.map(q => ({
              quote_en: q.quote.en,
              quote_ar: q.quote.ar,
              author_en: q.author.en,
              author_ar: q.author.ar,
          }))
      });
  }

  const pages = [
      { slug: 'privacy-policy', data: siteContentData.privacyPolicy },
      { slug: 'terms-of-use', data: siteContentData.termsOfUse }
  ];
  
  for (const page of pages) {
      if (page.data) {
          await prisma.staticPage.create({
              data: {
                  slug: page.slug,
                  title_en: page.data.en.title,
                  title_ar: page.data.ar.title,
                  // Store section structure as JSON
                  content_en: JSON.stringify(page.data.en.sections),
                  content_ar: JSON.stringify(page.data.ar.sections),
              }
          });
      }
  }

  // --- 8. SETTINGS ---
  console.log('⚙️  Seeding system settings...');
  // We store the large siteContentData blobs in SystemSettings for easy retrieval
  const settings = [
      { key: 'contact_email', value: siteContentData.footer.email, group: 'contact' },
      { key: 'contact_phone', value: siteContentData.footer.phone, group: 'contact' },
      // Store the whole content blobs
      { key: 'site_content_v1', value: JSON.stringify(siteContentData), group: 'cms' }
  ];
  
  for (const s of settings) {
      await prisma.systemSetting.upsert({
          where: { key: s.key },
          update: { value: s.value, group: s.group },
          create: { key: s.key, value: s.value, group: s.group }
      });
  }


  // --- 9. BANNERS ---
  console.log('🚩 Seeding banners...');
  await prisma.banner.createMany({
    data: bannersData.map(b => ({
      id: b.id,
      title: b.title,
      imageUrl: b.imageUrl,
      link: b.link,
      locations: b.locations,
      status: b.status,
      startDate: b.startDate ? new Date(b.startDate) : null,
      endDate: b.endDate ? new Date(b.endDate) : null,
    }))
  });

  // --- 10. LEADS & REQUESTS ---
  console.log('📩 Seeding leads...');
  for (const lead of leadsData) {
      try {
        await prisma.lead.create({
            data: {
                id: lead.id,
                partnerId: lead.partnerId,
                managerId: lead.managerId,
                propertyId: lead.propertyId,
                customerName: lead.customerName,
                customerPhone: lead.customerPhone,
                contactTime: lead.contactTime,
                serviceTitle: lead.serviceTitle,
                serviceType: lead.serviceType,
                status: lead.status,
                notes: lead.customerNotes,
                createdAt: new Date(lead.createdAt),
                updatedAt: new Date(lead.updatedAt),
                messages: {
                    create: (lead.messages || []).map(msg => ({
                        sender: msg.sender,
                        senderId: msg.senderId,
                        type: msg.type,
                        content: msg.content,
                        timestamp: new Date(msg.timestamp)
                    }))
                }
            }
        });
      } catch (e) {
          console.warn(`Skipping lead ${lead.id} due to missing parent data.`);
      }
  }

  // --- 11. AUTOMATION RULES ---
  console.log('🤖 Seeding automation rules...');
  await prisma.routingRule.createMany({
      data: routingRulesData.map(rule => ({
          id: rule.id,
          name_en: rule.name.en,
          name_ar: rule.name.ar,
          active: rule.active,
          conditions: rule.conditions as any, 
          action: rule.action as any 
      }))
  });

  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    (process as any).exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
