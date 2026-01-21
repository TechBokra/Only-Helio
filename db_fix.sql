
-- تفعيل إضافة pgcrypto لتوليد UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. إصلاح هيكل الجداول (إضافة الأعمدة الناقصة إن لم تكن موجودة)

-- إضافة عمود applicableTo لجدول FinishingStatus
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'FinishingStatus' AND column_name = 'applicableTo') THEN
        ALTER TABLE "FinishingStatus" ADD COLUMN "applicableTo" text[];
    END IF;
END $$;

-- إضافة عمود applicableTo لجدول Amenity
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Amenity' AND column_name = 'applicableTo') THEN
        ALTER TABLE "Amenity" ADD COLUMN "applicableTo" text[];
    END IF;
END $$;


-- 2. إدخال البيانات (Data Seeding)

-- أ. أنواع العقارات (Property Types)
INSERT INTO "PropertyType" (id, name_en, name_ar)
SELECT gen_random_uuid(), 'Apartment', 'شقة'
WHERE NOT EXISTS (SELECT 1 FROM "PropertyType" WHERE name_en = 'Apartment');

INSERT INTO "PropertyType" (id, name_en, name_ar)
SELECT gen_random_uuid(), 'Villa', 'فيلا'
WHERE NOT EXISTS (SELECT 1 FROM "PropertyType" WHERE name_en = 'Villa');

INSERT INTO "PropertyType" (id, name_en, name_ar)
SELECT gen_random_uuid(), 'Commercial', 'تجاري'
WHERE NOT EXISTS (SELECT 1 FROM "PropertyType" WHERE name_en = 'Commercial');

INSERT INTO "PropertyType" (id, name_en, name_ar)
SELECT gen_random_uuid(), 'Land', 'أرض'
WHERE NOT EXISTS (SELECT 1 FROM "PropertyType" WHERE name_en = 'Land');


-- ب. حالات التشطيب (Finishing Statuses)
INSERT INTO "FinishingStatus" (id, name_en, name_ar, "applicableTo")
SELECT gen_random_uuid(), 'Fully Finished', 'تشطيب كامل', ARRAY['Apartment', 'Villa', 'Commercial']
WHERE NOT EXISTS (SELECT 1 FROM "FinishingStatus" WHERE name_en = 'Fully Finished');

INSERT INTO "FinishingStatus" (id, name_en, name_ar, "applicableTo")
SELECT gen_random_uuid(), 'Semi-finished', 'نصف تشطيب', ARRAY['Apartment', 'Villa', 'Commercial']
WHERE NOT EXISTS (SELECT 1 FROM "FinishingStatus" WHERE name_en = 'Semi-finished');

INSERT INTO "FinishingStatus" (id, name_en, name_ar, "applicableTo")
SELECT gen_random_uuid(), 'Without Finishing', 'بدون تشطيب', ARRAY['Apartment', 'Villa', 'Commercial']
WHERE NOT EXISTS (SELECT 1 FROM "FinishingStatus" WHERE name_en = 'Without Finishing');

INSERT INTO "FinishingStatus" (id, name_en, name_ar, "applicableTo")
SELECT gen_random_uuid(), 'Super Lux', 'سوبر لوكس', ARRAY['Apartment', 'Villa', 'Commercial']
WHERE NOT EXISTS (SELECT 1 FROM "FinishingStatus" WHERE name_en = 'Super Lux');

INSERT INTO "FinishingStatus" (id, name_en, name_ar, "applicableTo")
SELECT gen_random_uuid(), 'Luxury Finishing', 'تشطيب فاخر', ARRAY['Apartment', 'Villa', 'Commercial']
WHERE NOT EXISTS (SELECT 1 FROM "FinishingStatus" WHERE name_en = 'Luxury Finishing');

INSERT INTO "FinishingStatus" (id, name_en, name_ar, "applicableTo")
SELECT gen_random_uuid(), 'Fully Furnished', 'مفروشة بالكامل', ARRAY['Apartment', 'Villa']
WHERE NOT EXISTS (SELECT 1 FROM "FinishingStatus" WHERE name_en = 'Fully Furnished');


-- ج. المرافق (Amenities)
INSERT INTO "Amenity" (id, name_en, name_ar, "applicableTo")
SELECT gen_random_uuid(), val.en, val.ar, val.app
FROM (VALUES 
    ('Private Garden', 'حديقة خاصة', ARRAY['Villa']),
    ('Swimming Pool', 'حمام سباحة', ARRAY['Villa']),
    ('Covered Parking', 'موقف سيارات مغطى', CAST(ARRAY[] AS text[])),
    ('24/7 Security', 'أمن 24/7', CAST(ARRAY[] AS text[])),
    ('Balcony', 'شرفة', ARRAY['Apartment', 'Villa']),
    ('Maid''s Room', 'غرفة خادمة', ARRAY['Villa', 'Apartment']),
    ('Electricity Meter', 'عداد كهرباء', CAST(ARRAY[] AS text[])),
    ('Water Meter', 'عداد مياه', CAST(ARRAY[] AS text[])),
    ('Natural Gas', 'غاز طبيعي', CAST(ARRAY[] AS text[])),
    ('Panoramic View', 'إطلالة بانورامية', CAST(ARRAY[] AS text[])),
    ('Fully Air-Conditioned', 'مكيف بالكامل', CAST(ARRAY[] AS text[])),
    ('Security', 'أمن وحراسة', CAST(ARRAY[] AS text[])),
    ('Shared Health Club', 'نادي صحي مشترك', CAST(ARRAY[] AS text[])),
    ('Elevator', 'مصعد', ARRAY['Apartment', 'Commercial']),
    ('Prime Location', 'موقع متميز', CAST(ARRAY[] AS text[])),
    ('Close to Services', 'قريبة من الخدمات', CAST(ARRAY[] AS text[])),
    ('Separate Meters', 'عدادات منفصلة', CAST(ARRAY[] AS text[])),
    ('Private Roof', 'رووف خاص', ARRAY['Villa', 'Apartment']),
    ('Open View', 'إطلالة مفتوحة', CAST(ARRAY[] AS text[])),
    ('Jacuzzi', 'جاكوزي', ARRAY['Villa', 'Apartment']),
    ('Dressing Room', 'غرفة ملابس', ARRAY['Villa', 'Apartment']),
    ('Modern Design', 'تصميم حديث', CAST(ARRAY[] AS text[])),
    ('Large Garden', 'حديقة كبيرة', ARRAY['Villa']),
    ('Complete Privacy', 'خصوصية تامة', CAST(ARRAY[] AS text[])),
    ('Panoramic Windows', 'نوافذ بانورامية', CAST(ARRAY[] AS text[])),
    ('Private Garage', 'جراج خاص', ARRAY['Villa']),
    ('Fully Furnished', 'مفروشة بالكامل', CAST(ARRAY[] AS text[])),
    ('Modern Appliances', 'أجهزة حديثة', CAST(ARRAY[] AS text[])),
    ('Ready to Move In', 'جاهزة للسكن', CAST(ARRAY[] AS text[])),
    ('High-Speed Internet', 'إنترنت فائق السرعة', CAST(ARRAY[] AS text[])),
    ('Strategic Location', 'موقع استراتيجي', CAST(ARRAY[] AS text[])),
    ('Frontage on a Main Street', 'واجهة على شارع رئيسي', ARRAY['Commercial']),
    ('Fully Serviced', 'كاملة المرافق', CAST(ARRAY[] AS text[])),
    ('Full Customization Potential', 'إمكانية التخصيص الكامل', CAST(ARRAY[] AS text[])),
    ('Quiet Area', 'منطقة هادئة', CAST(ARRAY[] AS text[])),
    ('Parking', 'موقف سيارات', CAST(ARRAY[] AS text[]))
) AS val(en, ar, app)
WHERE NOT EXISTS (SELECT 1 FROM "Amenity" WHERE name_en = val.en);


-- د. فئات الديكور (Decoration Categories)
INSERT INTO "DecorationCategory" (id, name_en, name_ar, description_en, description_ar)
SELECT gen_random_uuid(), 'Wall Sculptures', 'منحوتات جدارية', 'We design and execute art sculptures directly on walls.', 'نصمم وننفذ منحوتات فنية مباشرة على الجدران.'
WHERE NOT EXISTS (SELECT 1 FROM "DecorationCategory" WHERE name_en = 'Wall Sculptures');

INSERT INTO "DecorationCategory" (id, name_en, name_ar, description_en, description_ar)
SELECT gen_random_uuid(), 'Canvas Paintings', 'لوحات كانفس', 'A unique collection of art paintings.', 'مجموعة فريدة من اللوحات الفنية.'
WHERE NOT EXISTS (SELECT 1 FROM "DecorationCategory" WHERE name_en = 'Canvas Paintings');

INSERT INTO "DecorationCategory" (id, name_en, name_ar, description_en, description_ar)
SELECT gen_random_uuid(), 'Antiques & Decor', 'تحف وديكورات', 'A curated selection of antiques and decor pieces.', 'تشكيلة مختارة من التحف وقطع الديكور.'
WHERE NOT EXISTS (SELECT 1 FROM "DecorationCategory" WHERE name_en = 'Antiques & Decor');

