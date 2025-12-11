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
  console.log('Start seeding...');

  // --- CLEANUP ---
  console.log('Cleaning up existing data...');
  const deleteOrder = [
      'Notification', 'LeadMessage', 'Lead', 'Request', 'AmenitiesOnProperties',
      'Property', 'Project', 'PortfolioItem', 'Transaction', 'User',
      'Amenity', 'PropertyType', 'FinishingStatus', 'DecorationCategory',
      'Banner', 'Quote', 'StaticPage', 'SystemSetting', 'RoutingRule'
  ];

  for (const model of deleteOrder) {
      try {
          await (prisma as any)[model.charAt(0).toLowerCase() + model.slice(1)].deleteMany();
      } catch (e) {
          console.log(`Skipping delete for ${model} (might not exist yet or error)`);
      }
  }

  // --- LOOKUP TABLES ---
  console.log('Seeding lookup tables...');
  
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
      applicableTo: fs.applicableTo,
    })),
  });

  await prisma.amenity.createMany({
    data: amenitiesData.map((a) => ({
      id: a.id,
      name_en: a.en,
      name_ar: a.ar,
      applicableTo: a.applicableTo,
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

  // --- USERS (Partners & Admins) ---
  console.log('Seeding users...');
  
  // Use a map to track roles based on type string from legacy data
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
      const enInfo = (enTranslations.partnerInfo as any)[p.id];
      const arInfo = (arTranslations.partnerInfo as any)[p.id];
      const role = roleMap[p.type] || 'AGENCY_PARTNER';
      const status = statusMap[p.status] || 'PENDING';

      await prisma.user.create({
          data: {
            id: p.id,
            email: p.email,
            password: p.password!,
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
            contactMethods: p.contactMethods ? JSON.stringify(p.contactMethods) : undefined,
          }
      });
  }

  // --- PROJECTS ---
  console.log('Seeding projects...');
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
      features: JSON.stringify(p.features),
    })),
  });

  // --- PROPERTIES ---
  console.log('Seeding properties...');
  for (const prop of propertiesData) {
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
        
        installments: prop.installments ? JSON.stringify(prop.installments) : undefined,
        location: JSON.stringify(prop.location),
        
        listingStartDate: prop.listingStartDate ? new Date(prop.listingStartDate) : null,
        contactMethod: prop.contactMethod,
        ownerPhone: prop.ownerPhone,
        
        amenities: {
          create: (prop.amenities?.en || []).map(amenityName => {
            const amenity = amenitiesData.find(a => a.en === amenityName);
            if (amenity) {
               return { amenity: { connect: { id: amenity.id } } };
            }
            return null; // Skip unknown amenities
          }).filter(Boolean) as any
        }
      },
    });
  }

  // --- PORTFOLIO ---
  console.log('Seeding portfolio...');
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
        // Try to link category relation if match found
        categoryId: decorationCategoriesData.find(c => c.name.en === item.category.en)?.id
    }))
  });

  // --- CMS: QUOTES ---
  console.log('Seeding quotes...');
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

  // --- CMS: STATIC PAGES ---
  console.log('Seeding static pages...');
  const pages = [
      { slug: 'privacy-policy', data: siteContentData.privacyPolicy },
      { slug: 'terms-of-use', data: siteContentData.termsOfUse }
  ];
  
  for (const page of pages) {
      if (page.data) {
          // Flatten complex objects to string for simple storage or use JSON
          // Here we assume content is markdown/html string, but data has sections.
          // We will store the structure as JSON in a "content" field for simplicity or stringify it.
          await prisma.staticPage.create({
              data: {
                  slug: page.slug,
                  title_en: page.data.en.title,
                  title_ar: page.data.ar.title,
                  content_en: JSON.stringify(page.data.en.sections),
                  content_ar: JSON.stringify(page.data.ar.sections),
              }
          });
      }
  }

  // --- CMS: SETTINGS ---
  console.log('Seeding system settings...');
  const settings = [
      { key: 'contact_email', value: siteContentData.footer.email, group: 'contact' },
      { key: 'contact_phone', value: siteContentData.footer.phone, group: 'contact' },
      { key: 'social_facebook', value: siteContentData.footer.social.facebook, group: 'social' },
      { key: 'social_instagram', value: siteContentData.footer.social.instagram, group: 'social' },
  ];
  await prisma.systemSetting.createMany({ data: settings });

  // --- BANNERS ---
  console.log('Seeding banners...');
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

  // --- CRM: LEADS ---
  console.log('Seeding leads...');
  for (const lead of leadsData) {
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
  }

  // --- AUTOMATION ---
  console.log('Seeding routing rules...');
  await prisma.routingRule.createMany({
      data: routingRulesData.map(rule => ({
          id: rule.id,
          name_en: rule.name.en,
          name_ar: rule.name.ar,
          active: rule.active,
          conditions: JSON.stringify(rule.conditions),
          action: JSON.stringify(rule.action)
      }))
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    (process as any).exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });