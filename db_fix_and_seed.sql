
-- 1. حذف الجداول القديمة (باستخدام CASCADE لتجاوز قيود المفاتيح الأجنبية)
DROP TABLE IF EXISTS "AmenitiesOnProperties" CASCADE;
DROP TABLE IF EXISTS "LeadMessage" CASCADE;
DROP TABLE IF EXISTS "Lead" CASCADE;
DROP TABLE IF EXISTS "Request" CASCADE;
DROP TABLE IF EXISTS "PortfolioItem" CASCADE;
DROP TABLE IF EXISTS "Property" CASCADE;
DROP TABLE IF EXISTS "Project" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- 2. إعادة إنشاء جدول المستخدمين (User) - معرف نصي
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY, -- Text instead of UUID to support 'admin-user'
    "email" TEXT UNIQUE NOT NULL,
    "name_en" TEXT,
    "name_ar" TEXT,
    "password" TEXT,
    "type" TEXT NOT NULL, -- developer, agency, etc.
    "role" TEXT NOT NULL, -- SUPER_ADMIN, etc.
    "status" TEXT DEFAULT 'active',
    "imageUrl" TEXT,
    "subscriptionPlan" TEXT DEFAULT 'basic',
    "subscriptionEndDate" TIMESTAMP WITH TIME ZONE,
    "displayType" TEXT DEFAULT 'standard',
    "contactMethods" JSONB DEFAULT '{"whatsapp": {"enabled": false}, "phone": {"enabled": false}, "form": {"enabled": true}}'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. إعادة إنشاء جدول المشاريع (Project) - معرف نصي
CREATE TABLE "Project" (
    "id" TEXT PRIMARY KEY,
    "partnerId" TEXT REFERENCES "User"("id") ON DELETE CASCADE,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description_en" TEXT,
    "description_ar" TEXT,
    "imageUrl" TEXT,
    "features" JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. إعادة إنشاء جدول العقارات (Property) - معرف نصي
CREATE TABLE "Property" (
    "id" TEXT PRIMARY KEY,
    "partnerId" TEXT REFERENCES "User"("id") ON DELETE CASCADE,
    "projectId" TEXT REFERENCES "Project"("id") ON DELETE SET NULL,
    "title_en" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "description_en" TEXT,
    "description_ar" TEXT,
    "address_en" TEXT,
    "address_ar" TEXT,
    "price" NUMERIC NOT NULL,
    "price_en" TEXT,
    "price_ar" TEXT,
    "area" NUMERIC NOT NULL,
    "type_en" TEXT,
    "type_ar" TEXT,
    "status" TEXT, -- For Sale / For Rent (frontend string)
    "listingStatus" TEXT DEFAULT 'active', -- active, draft, sold
    "listingStartDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "listingEndDate" TIMESTAMP WITH TIME ZONE,
    "imageUrl" TEXT,
    "gallery" JSONB DEFAULT '[]'::jsonb,
    "location" JSONB DEFAULT '{"lat": 30.0, "lng": 31.0}'::jsonb,
    "beds" INTEGER DEFAULT 0,
    "baths" INTEGER DEFAULT 0,
    "floor" INTEGER DEFAULT 0,
    "finishingStatus_en" TEXT,
    "finishingStatus_ar" TEXT,
    "isInCompound" BOOLEAN DEFAULT false,
    "installmentsAvailable" BOOLEAN DEFAULT false,
    "realEstateFinanceAvailable" BOOLEAN DEFAULT false,
    "installments" JSONB,
    "amenities" JSONB DEFAULT '[]'::jsonb, -- Store amenities keys array
    "deliveryImmediate" BOOLEAN DEFAULT true,
    "deliveryDate" TEXT,
    "contactMethod" TEXT DEFAULT 'platform',
    "ownerPhone" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. إعادة إنشاء جدول المعرض (PortfolioItem) - معرف نصي
CREATE TABLE "PortfolioItem" (
    "id" TEXT PRIMARY KEY,
    "partnerId" TEXT REFERENCES "User"("id") ON DELETE CASCADE,
    "title_en" TEXT,
    "title_ar" TEXT,
    "category_en" TEXT,
    "category_ar" TEXT,
    "imageUrl" TEXT NOT NULL,
    "alt" TEXT,
    "price" NUMERIC,
    "dimensions" TEXT,
    "availability" TEXT DEFAULT 'In Stock',
    "categoryId" TEXT, -- Optional link to DecorationCategory
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 6. إدخال البيانات (الآن ستعمل المعرفات النصية بنجاح)

-- أ. المستخدمين
INSERT INTO "User" ("id", "email", "name_en", "name_ar", "type", "role", "status", "subscriptionPlan", "imageUrl", "createdAt")
VALUES 
('admin-user', 'admin@onlyhelio.com', 'Super Admin', 'المدير العام', 'admin', 'SUPER_ADMIN', 'active', 'elite', 'https://ui-avatars.com/api/?name=Admin&background=f59e0b&color=fff', NOW()),
('dev-partner-1', 'dev@heliopolis.com', 'Heliopolis Developers Group', 'مجموعة مطوري هليوبوليس', 'developer', 'DEVELOPER_PARTNER', 'active', 'elite', 'https://images.unsplash.com/photo-1486406149226-8fc5f2e293a0?w=150&h=150&fit=crop', NOW()),
('finish-partner-1', 'finish@decor.com', 'Elite Finishing Co.', 'شركة تشطيبات النخبة', 'finishing', 'FINISHING_PARTNER', 'active', 'professional', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=150&h=150&fit=crop', NOW()),
('agency-partner-1', 'sales@broker.com', 'Future Real Estate', 'المستقبل للتسويق العقاري', 'agency', 'AGENCY_PARTNER', 'active', 'basic', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop', NOW()),
('individual-listings', 'listings@onlyhelio.com', 'Individual Listings', 'عقارات الأفراد', 'agency', 'AGENCY_PARTNER', 'active', 'basic', 'https://via.placeholder.com/150', NOW())
ON CONFLICT ("id") DO NOTHING;

-- ب. المشاريع
INSERT INTO "Project" ("id", "partnerId", "name_en", "name_ar", "description_en", "description_ar", "imageUrl", "createdAt")
VALUES 
('project-1', 'dev-partner-1', 'Helio Gardens Compound', 'كمبوند حدائق هليوبوليس', 'A luxury residential compound in the heart of New Heliopolis.', 'مجمع سكني فاخر في قلب هليوبوليس الجديدة يتميز بالمساحات الخضراء.', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop', NOW())
ON CONFLICT ("id") DO NOTHING;

-- ج. العقارات
INSERT INTO "Property" (
    "id", "partnerId", "projectId", "title_en", "title_ar", 
    "description_en", "description_ar", "price", "price_en", "price_ar",
    "area", "type_en", "type_ar", "status", "listingStatus", "imageUrl"
) VALUES (
    'prop-1', 'dev-partner-1', 'project-1', 
    'Luxury Apartment in Helio Gardens', 'شقة فاخرة في حدائق هليوبوليس',
    'Spacious apartment overlooking the main garden.', 'شقة واسعة تطل على الحديقة الرئيسية.',
    3500000, '3,500,000 EGP', '3,500,000 ج.م',
    180, 'Apartment', 'شقة', 'For Sale', 'active', 
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'
), (
    'prop-2', 'agency-partner-1', NULL, 
    'Standalone Villa for Resale', 'فيلا مستقلة إعادة بيع',
    'Immediate delivery, core and shell.', 'استلام فوري، نصف تشطيب.',
    8200000, '8,200,000 EGP', '8,200,000 ج.م',
    450, 'Villa', 'فيلا', 'For Sale', 'active', 
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop'
) ON CONFLICT ("id") DO NOTHING;

-- د. المعرض
INSERT INTO "PortfolioItem" ("id", "partnerId", "title_en", "title_ar", "category_en", "category_ar", "imageUrl", "createdAt")
VALUES 
('port-1', 'finish-partner-1', 'Modern Living Room', 'غرفة معيشة مودرن', 'Interior Design', 'تصميم داخلي', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=800&fit=crop', NOW())
ON CONFLICT ("id") DO NOTHING;
