
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

// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  console.log('Deleting existing data...');
  // Delete in an order that respects foreign key constraints
  await prisma.notification.deleteMany();
  await prisma.leadMessage.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.request.deleteMany();
  await prisma.amenityOnProperty.deleteMany();
  await prisma.property.deleteMany();
  await prisma.project.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.partner.deleteMany(); // Cascades to most things above, but good to be explicit
  await prisma.amenity.deleteMany();
  await prisma.propertyType.deleteMany();
  await prisma.finishingStatus.deleteMany();
  await prisma.decorationCategory.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.siteContent.deleteMany();
  // Legacy tables if they exist
  try {
      await prisma.partnerApplication.deleteMany();
      await prisma.propertyListingRequest.deleteMany();
      await prisma.contactMessage.deleteMany();
  } catch(e) {}


  console.log('Seeding lookup tables...');
  await prisma.propertyType.createMany({
    data: propertyTypesData.map((pt) => ({
      id: pt.id,
      nameEn: pt.en,
      nameAr: pt.ar,
    })),
  });

  await prisma.finishingStatus.createMany({
    data: finishingStatusesData.map((fs) => ({
      id: fs.id,
      nameEn: fs.en,
      nameAr: fs.ar,
      applicableTo: fs.applicableTo ? JSON.stringify(fs.applicableTo) : null,
    })),
  });

  await prisma.amenity.createMany({
    data: amenitiesData.map((a) => ({
      id: a.id,
      nameEn: a.en,
      nameAr: a.ar,
      applicableTo: a.applicableTo ? JSON.stringify(a.applicableTo) : null,
    })),
  });

  await prisma.decorationCategory.createMany({
      data: decorationCategoriesData.map(dc => ({
          id: dc.id,
          nameEn: dc.name.en,
          nameAr: dc.name.ar,
          descriptionEn: dc.description.en,
          descriptionAr: dc.description.ar,
      }))
  });

  console.log('Seeding partners...');
  await prisma.partner.createMany({
    data: partnersData.map((p) => {
      const enInfo = (enTranslations.partnerInfo as any)[p.id];
      const arInfo = (arTranslations.partnerInfo as any)[p.id];
      // Map roles manually or use the simple string
      let role = "AGENCY_PARTNER";
      if (p.type === 'admin') role = 'SUPER_ADMIN';
      else if (p.type === 'developer') role = 'DEVELOPER_PARTNER';
      else if (p.type === 'finishing') role = 'FINISHING_PARTNER';
      else if (p.type.includes('_manager')) role = p.type.toUpperCase();

      return {
        id: p.id,
        email: p.email,
        password: p.password!,
        imageUrl: p.imageUrl,
        type: p.type as any, // Cast to enum
        role: role as any,
        status: p.status as any, // Cast to enum
        subscriptionPlan: p.subscriptionPlan,
        subscriptionEndDate: p.subscriptionEndDate ? new Date(p.subscriptionEndDate) : null,
        displayType: p.displayType || 'standard',
        name: enInfo?.name || p.id,
        nameAr: arInfo?.name || p.id,
        descriptionEn: enInfo?.description || '',
        descriptionAr: arInfo?.description || '',
        contactMethods: p.contactMethods ? JSON.stringify(p.contactMethods) : '{}',
      };
    }),
  });
  
  console.log('Seeding projects...');
  await prisma.project.createMany({
    data: projectsData.map((p) => ({
      id: p.id,
      partnerId: p.partnerId,
      nameEn: p.name.en,
      nameAr: p.name.ar,
      descriptionEn: p.description.en,
      descriptionAr: p.description.ar,
      imageUrl: p.imageUrl,
      createdAt: new Date(p.createdAt),
      features: JSON.stringify(p.features),
    })),
  });
  
  console.log('Seeding properties...');
  for (const prop of propertiesData) {
    await prisma.property.create({
      data: {
        id: prop.id,
        partnerId: prop.partnerId,
        projectId: prop.projectId,
        imageUrl: prop.imageUrl,
        gallery: prop.gallery,
        statusEn: prop.status.en,
        statusAr: prop.status.ar,
        priceEn: prop.price.en,
        priceAr: prop.price.ar,
        price: prop.priceNumeric,
        typeEn: prop.type.en,
        typeAr: prop.type.ar,
        titleEn: prop.title.en,
        titleAr: prop.title.ar,
        addressEn: prop.address.en,
        addressAr: prop.address.ar,
        descriptionEn: prop.description.en,
        descriptionAr: prop.description.ar,
        beds: prop.beds,
        baths: prop.baths,
        area: prop.area,
        floor: prop.floor || 0,
        finishingStatusEn: prop.finishingStatus?.en,
        finishingStatusAr: prop.finishingStatus?.ar,
        installmentsAvailable: prop.installmentsAvailable,
        isInCompound: prop.isInCompound,
        realEstateFinanceAvailable: prop.realEstateFinanceAvailable,
        deliveryImmediate: prop.delivery.isImmediate,
        deliveryDate: prop.delivery.date ? new Date(prop.delivery.date) : null,
        installments: prop.installments ? JSON.stringify(prop.installments) : null,
        location: JSON.stringify(prop.location),
        listingStartDate: prop.listingStartDate ? new Date(prop.listingStartDate) : null,
        listingStatus: prop.listingStatus as any,
        contactMethod: prop.contactMethod,
        ownerPhone: prop.ownerPhone,
        amenities: {
          create: (prop.amenities?.en || []).map(amenityName => {
            const amenity = amenitiesData.find(a => a.en === amenityName);
            if (!amenity) {
               // Skip if not found to avoid crashing seed
               return undefined;
            }
            return {
              amenity: {
                connect: { id: amenity.id }
              }
            };
          }).filter(Boolean) as any
        }
      },
    });
  }
  
  console.log('Seeding portfolio items...');
  await prisma.portfolioItem.createMany({
    data: portfolioData.map(item => ({
        id: item.id,
        partnerId: item.partnerId,
        imageUrl: item.imageUrl,
        alt: item.alt,
        titleEn: item.title.en,
        titleAr: item.title.ar,
        categoryEn: item.category.en,
        categoryAr: item.category.ar,
        price: item.price,
        dimensions: item.dimensions,
        availability: item.availability,
    }))
  });
  
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

  console.log('Seeding site content...');
  const { quotes, ...restOfSiteContent } = siteContentData;
  await prisma.siteContent.create({
      data: {
          id: 'main_content',
          content: JSON.stringify(restOfSiteContent),
      }
  });

  await prisma.quote.createMany({
      data: quotes.map(q => ({
          quoteEn: q.quote.en,
          quoteAr: q.quote.ar,
          authorEn: q.author.en,
          authorAr: q.author.ar,
      }))
  });
  
  console.log('Seeding leads...');
  await prisma.lead.createMany({
      data: leadsData.map(lead => ({
          id: lead.id,
          partnerId: lead.partnerId,
          managerId: lead.managerId,
          propertyId: lead.propertyId,
          serviceType: lead.serviceType,
          serviceTitle: lead.serviceTitle,
          customerName: lead.customerName,
          customerPhone: lead.customerPhone,
          customerNotes: lead.customerNotes,
          contactTime: lead.contactTime,
          status: lead.status as any,
          createdAt: new Date(lead.createdAt),
          updatedAt: new Date(lead.updatedAt),
          assignedTo: lead.assignedTo,
      }))
  });
  
  // Seed Lead Messages
  for (const lead of leadsData) {
      if (lead.messages && lead.messages.length > 0) {
          await prisma.leadMessage.createMany({
              data: lead.messages.map(msg => ({
                  id: msg.id,
                  leadId: lead.id,
                  sender: msg.sender,
                  senderId: msg.senderId,
                  type: msg.type,
                  content: msg.content,
                  timestamp: new Date(msg.timestamp)
              }))
          });
      }
  }

  console.log('Seeding requests...');
  await prisma.request.createMany({
    data: requestsData.map(req => ({
      id: req.id,
      type: req.type as any,
      requesterInfo: JSON.stringify(req.requesterInfo),
      payload: JSON.stringify(req.payload),
      status: req.status as any,
      assignedTo: req.assignedTo,
      createdAt: new Date(req.createdAt),
      updatedAt: req.updatedAt ? new Date(req.updatedAt) : null,
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
