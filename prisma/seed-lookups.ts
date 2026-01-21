
// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Data Definitions
const propertyTypesData = [
    { name_en: 'Apartment', name_ar: 'شقة' },
    { name_en: 'Villa', name_ar: 'فيلا' },
    { name_en: 'Commercial', name_ar: 'تجاري' },
    { name_en: 'Land', name_ar: 'أرض' },
];

const finishingStatusesData = [
    { name_en: 'Fully Finished', name_ar: 'تشطيب كامل', applicableTo: ['Apartment', 'Villa', 'Commercial'] },
    { name_en: 'Semi-finished', name_ar: 'نصف تشطيب', applicableTo: ['Apartment', 'Villa', 'Commercial'] },
    { name_en: 'Without Finishing', name_ar: 'بدون تشطيب', applicableTo: ['Apartment', 'Villa', 'Commercial'] },
    { name_en: 'Super Lux', name_ar: 'سوبر لوكس', applicableTo: ['Apartment', 'Villa', 'Commercial'] },
    { name_en: 'Luxury Finishing', name_ar: 'تشطيب فاخر', applicableTo: ['Apartment', 'Villa', 'Commercial'] },
    { name_en: 'Fully Furnished', name_ar: 'مفروشة بالكامل', applicableTo: ['Apartment', 'Villa'] },
];

const amenitiesData = [
    { name_en: 'Private Garden', name_ar: 'حديقة خاصة', applicableTo: ['Villa'] },
    { name_en: 'Swimming Pool', name_ar: 'حمام سباحة', applicableTo: ['Villa'] },
    { name_en: 'Covered Parking', name_ar: 'موقف سيارات مغطى', applicableTo: [] },
    { name_en: '24/7 Security', name_ar: 'أمن 24/7', applicableTo: [] },
    { name_en: 'Balcony', name_ar: 'شرفة', applicableTo: ['Apartment', 'Villa'] },
    { name_en: "Maid's Room", name_ar: 'غرفة خادمة', applicableTo: ['Villa', 'Apartment'] },
    { name_en: 'Electricity Meter', name_ar: 'عداد كهرباء', applicableTo: [] },
    { name_en: 'Water Meter', name_ar: 'عداد مياه', applicableTo: [] },
    { name_en: 'Natural Gas', name_ar: 'غاز طبيعي', applicableTo: [] },
    { name_en: 'Panoramic View', name_ar: 'إطلالة بانورامية', applicableTo: [] },
    { name_en: 'Fully Air-Conditioned', name_ar: 'مكيف بالكامل', applicableTo: [] },
    { name_en: 'Security', name_ar: 'أمن وحراسة', applicableTo: [] },
    { name_en: 'Shared Health Club', name_ar: 'نادي صحي مشترك', applicableTo: [] },
    { name_en: 'Elevator', name_ar: 'مصعد', applicableTo: ['Apartment', 'Commercial'] },
    { name_en: 'Prime Location', name_ar: 'موقع متميز', applicableTo: [] },
    { name_en: 'Close to Services', name_ar: 'قريبة من الخدمات', applicableTo: [] },
    { name_en: 'Separate Meters', name_ar: 'عدادات منفصلة', applicableTo: [] },
    { name_en: 'Private Roof', name_ar: 'رووف خاص', applicableTo: ['Villa', 'Apartment'] },
    { name_en: 'Open View', name_ar: 'إطلالة مفتوحة', applicableTo: [] },
    { name_en: 'Jacuzzi', name_ar: 'جاكوزي', applicableTo: ['Villa', 'Apartment'] },
    { name_en: 'Dressing Room', name_ar: 'غرفة ملابس', applicableTo: ['Villa', 'Apartment'] },
    { name_en: 'Modern Design', name_ar: 'تصميم حديث', applicableTo: [] },
    { name_en: 'Large Garden', name_ar: 'حديقة كبيرة', applicableTo: ['Villa'] },
    { name_en: 'Complete Privacy', name_ar: 'خصوصية تامة', applicableTo: [] },
    { name_en: 'Panoramic Windows', name_ar: 'نوافذ بانورامية', applicableTo: [] },
    { name_en: 'Private Garage', name_ar: 'جراج خاص', applicableTo: ['Villa'] },
    { name_en: 'Fully Furnished', name_ar: 'مفروشة بالكامل', applicableTo: [] },
    { name_en: 'Modern Appliances', name_ar: 'أجهزة حديثة', applicableTo: [] },
    { name_en: 'Ready to Move In', name_ar: 'جاهزة للسكن', applicableTo: [] },
    { name_en: 'High-Speed Internet', name_ar: 'إنترنت فائق السرعة', applicableTo: [] },
    { name_en: 'Strategic Location', name_ar: 'موقع استراتيجي', applicableTo: [] },
    { name_en: 'Frontage on a Main Street', name_ar: 'واجهة على شارع رئيسي', applicableTo: ['Commercial'] },
    { name_en: 'Fully Serviced', name_ar: 'كاملة المرافق', applicableTo: [] },
    { name_en: 'Full Customization Potential', name_ar: 'إمكانية التخصيص الكامل', applicableTo: [] },
    { name_en: 'Quiet Area', name_ar: 'منطقة هادئة', applicableTo: [] },
    { name_en: 'Parking', name_ar: 'موقف سيارات', applicableTo: [] }
];

const decorationCategoriesData = [
    {
        name_en: 'Wall Sculptures', name_ar: 'منحوتات جدارية',
        description_en: 'We design and execute art sculptures directly on walls.',
        description_ar: 'نصمم وننفذ منحوتات فنية مباشرة على الجدران.'
    },
    {
        name_en: 'Canvas Paintings', name_ar: 'لوحات كانفس',
        description_en: 'A unique collection of art paintings.',
        description_ar: 'مجموعة فريدة من اللوحات الفنية.'
    },
    {
        name_en: 'Antiques & Decor', name_ar: 'تحف وديكورات',
        description_en: 'A curated selection of antiques and decor pieces.',
        description_ar: 'تشكيلة مختارة من التحف وقطع الديكور.'
    }
];

async function main() {
  console.log('🚀 Starting Safe Seed (UUID Compatible)...');

  // Helper to upsert by name
  async function upsertItem(model: any, where: any, data: any) {
      const existing = await model.findFirst({ where });
      if (existing) {
          await model.update({ where: { id: existing.id }, data });
      } else {
          await model.create({ data });
      }
  }

  // 1. Property Types
  console.log('📦 Seeding Property Types...');
  for (const item of propertyTypesData) {
      // @ts-ignore
      await upsertItem(prisma.propertyType, { name_en: item.name_en }, item);
  }

  // 2. Finishing Statuses
  console.log('🖌️  Seeding Finishing Statuses...');
  for (const item of finishingStatusesData) {
      // @ts-ignore
      await upsertItem(prisma.finishingStatus, { name_en: item.name_en }, item);
  }

  // 3. Amenities
  console.log('🏊 Seeding Amenities...');
  for (const item of amenitiesData) {
       // @ts-ignore
      await upsertItem(prisma.amenity, { name_en: item.name_en }, item);
  }

  // 4. Decoration Categories
  console.log('🎨 Seeding Decoration Categories...');
  for (const item of decorationCategoriesData) {
       // @ts-ignore
      await upsertItem(prisma.decorationCategory, { name_en: item.name_en }, item);
  }

  console.log('✅ Safe Seeding Completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    (process as any).exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
