
-- ====================================================================================
-- ONLY HELIO - FULL DATABASE RESET & SEED
-- ====================================================================================

-- 1. DROP ALL TABLES (Clean Slate)
DROP TABLE IF EXISTS "LeadMessage" CASCADE;
DROP TABLE IF EXISTS "Lead" CASCADE;
DROP TABLE IF EXISTS "AmenitiesOnProperties" CASCADE;
DROP TABLE IF EXISTS "Property" CASCADE;
DROP TABLE IF EXISTS "Project" CASCADE;
DROP TABLE IF EXISTS "PortfolioItem" CASCADE;
DROP TABLE IF EXISTS "PartnerRequest" CASCADE;
DROP TABLE IF EXISTS "PropertyListingRequest" CASCADE;
DROP TABLE IF EXISTS "ContactRequest" CASCADE;
DROP TABLE IF EXISTS "PropertyInquiry" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "Banner" CASCADE;
DROP TABLE IF EXISTS "SystemSetting" CASCADE;
DROP TABLE IF EXISTS "Transaction" CASCADE;
DROP TABLE IF EXISTS "PlanConfiguration" CASCADE;
DROP TABLE IF EXISTS "RoutingRule" CASCADE;
DROP TABLE IF EXISTS "FormDefinition" CASCADE;
DROP TABLE IF EXISTS "Amenity" CASCADE;
DROP TABLE IF EXISTS "PropertyType" CASCADE;
DROP TABLE IF EXISTS "FinishingStatus" CASCADE;
DROP TABLE IF EXISTS "DecorationCategory" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- 2. CREATE TABLES (Schema)

-- Users (Partners, Admins, etc.)
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT,
    "name_en" TEXT,
    "name_ar" TEXT,
    "description_en" TEXT,
    "description_ar" TEXT,
    "type" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT DEFAULT 'active',
    "imageUrl" TEXT,
    "subscriptionPlan" TEXT DEFAULT 'basic',
    "subscriptionEndDate" TIMESTAMP WITH TIME ZONE,
    "displayType" TEXT DEFAULT 'standard',
    "contactMethods" JSONB DEFAULT '{"whatsapp": {"enabled": false}, "phone": {"enabled": false}, "form": {"enabled": true}}'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lookups
CREATE TABLE "PropertyType" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL
);

CREATE TABLE "FinishingStatus" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "applicableTo" TEXT[] DEFAULT '{}'
);

CREATE TABLE "Amenity" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "applicableTo" TEXT[] DEFAULT '{}'
);

CREATE TABLE "DecorationCategory" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description_en" TEXT,
    "description_ar" TEXT
);

-- Projects
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

-- Properties
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
    "status" TEXT,
    "listingStatus" TEXT DEFAULT 'active',
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
    "amenities" JSONB DEFAULT '[]'::jsonb,
    "deliveryImmediate" BOOLEAN DEFAULT true,
    "deliveryDate" TEXT,
    "contactMethod" TEXT DEFAULT 'platform',
    "ownerPhone" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Amenities Relation
CREATE TABLE "AmenitiesOnProperties" (
    "propertyId" TEXT REFERENCES "Property"("id") ON DELETE CASCADE,
    "amenityId" TEXT REFERENCES "Amenity"("id") ON DELETE CASCADE,
    PRIMARY KEY ("propertyId", "amenityId")
);

-- Portfolio
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
    "categoryId" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRM: Leads & Messages
CREATE TABLE "Lead" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "partnerId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "managerId" TEXT,
    "propertyId" TEXT REFERENCES "Property"("id") ON DELETE SET NULL,
    "serviceType" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "serviceTitle" TEXT,
    "status" TEXT DEFAULT 'new',
    "contactTime" TEXT,
    "notes" TEXT,
    "assignedTo" TEXT,
    "referenceImage" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "LeadMessage" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "leadId" TEXT REFERENCES "Lead"("id") ON DELETE CASCADE,
    "sender" TEXT NOT NULL,
    "senderId" TEXT,
    "type" TEXT DEFAULT 'note',
    "content" TEXT,
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forms & Requests
CREATE TABLE "PartnerRequest" (
    "id" TEXT PRIMARY KEY,
    "companyName" TEXT,
    "companyType" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "description" TEXT,
    "website" TEXT,
    "companyAddress" TEXT,
    "logo" TEXT,
    "documents" JSONB DEFAULT '[]'::jsonb,
    "managementContacts" JSONB DEFAULT '[]'::jsonb,
    "subscriptionPlan" TEXT,
    "status" TEXT DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "PropertyListingRequest" (
    "id" TEXT PRIMARY KEY,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "contactTime" TEXT,
    "cooperationType" TEXT,
    "status" TEXT DEFAULT 'pending',
    "managerId" TEXT,
    "propertyDetails" JSONB DEFAULT '{}'::jsonb,
    "images" JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "ContactRequest" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT,
    "inquiryType" TEXT,
    "businessType" TEXT,
    "companyName" TEXT,
    "status" TEXT DEFAULT 'pending',
    "managerId" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "PropertyInquiry" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System
CREATE TABLE "Notification" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "message" JSONB NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "Banner" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "link" TEXT,
    "locations" TEXT[],
    "status" TEXT DEFAULT 'active',
    "startDate" TIMESTAMP WITH TIME ZONE,
    "endDate" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "SystemSetting" (
    "key" TEXT PRIMARY KEY,
    "value" JSONB NOT NULL,
    "group" TEXT,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "Transaction" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT,
    "userName" TEXT,
    "amount" NUMERIC,
    "currency" TEXT DEFAULT 'EGP',
    "type" TEXT,
    "status" TEXT,
    "method" TEXT,
    "description" TEXT,
    "relatedEntityId" TEXT,
    "receiptUrl" TEXT,
    "referenceNumber" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "PlanConfiguration" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "category" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "subCategory" TEXT,
    "name_en" TEXT, "name_ar" TEXT,
    "price_en" TEXT, "price_ar" TEXT,
    "description_en" TEXT, "description_ar" TEXT,
    "features_en" TEXT[], "features_ar" TEXT[],
    "commissionRate" NUMERIC,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "RoutingRule" (
    "id" TEXT PRIMARY KEY,
    "name_en" TEXT, "name_ar" TEXT,
    "active" BOOLEAN DEFAULT true,
    "conditions" JSONB,
    "action" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "FormDefinition" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "slug" TEXT UNIQUE NOT NULL,
    "title_en" TEXT, "title_ar" TEXT,
    "description_en" TEXT, "description_ar" TEXT,
    "category" TEXT,
    "destination" TEXT,
    "submitButtonLabel_en" TEXT, "submitButtonLabel_ar" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "fields" JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 3. SEED DATA

-- Lookups
INSERT INTO "PropertyType" (name_en, name_ar) VALUES 
('Apartment', 'شقة'), ('Villa', 'فيلا'), ('Commercial', 'تجاري'), ('Land', 'أرض');

INSERT INTO "FinishingStatus" (name_en, name_ar, "applicableTo") VALUES 
('Core & Shell', 'بدون تشطيب', ARRAY['Apartment', 'Villa']),
('Semi-finished', 'نصف تشطيب', ARRAY['Apartment', 'Villa']),
('Fully Finished', 'تشطيب كامل', ARRAY['Apartment', 'Villa', 'Commercial']);

INSERT INTO "Amenity" (name_en, name_ar) VALUES 
('Pool', 'حمام سباحة'), ('Garden', 'حديقة'), ('Security', 'أمن'), ('Parking', 'موقف سيارات');

INSERT INTO "DecorationCategory" (name_en, name_ar, description_en, description_ar) VALUES 
('Wall Sculptures', 'منحوتات جدارية', 'Art on walls', 'فن على الجدران'),
('Canvas Paintings', 'لوحات كانفس', 'Paintings', 'لوحات'),
('Antiques & Decor', 'تحف وديكورات', 'Decor items', 'قطع ديكور');

-- Users
INSERT INTO "User" 
("id", "email", "password", "name_en", "name_ar", "type", "role", "status", "subscriptionPlan", "imageUrl", "description_en", "description_ar", "contactMethods")
VALUES 
(
    'admin-user', 
    'admin@onlyhelio.com', 
    'password', 
    'Super Admin', 
    'المدير العام', 
    'admin', 
    'SUPER_ADMIN', 
    'active', 
    'elite', 
    'https://ui-avatars.com/api/?name=Admin&background=f59e0b&color=fff',
    'Platform Administrator',
    'مدير المنصة',
    '{"whatsapp": {"enabled": false}, "phone": {"enabled": false}, "form": {"enabled": true}}'
),
(
    'dev-partner-1', 
    'dev@heliopolis.com', 
    'password', 
    'Heliopolis Developers Group', 
    'مجموعة مطوري هليوبوليس', 
    'developer', 
    'DEVELOPER_PARTNER', 
    'active', 
    'elite', 
    'https://images.unsplash.com/photo-1486406149226-8fc5f2e293a0?w=150&h=150&fit=crop',
    'Leading developer',
    'مطور رائد',
    '{"whatsapp": {"enabled": true, "number": "01000000001"}, "phone": {"enabled": true, "number": "01000000001"}, "form": {"enabled": true}}'
),
(
    'finish-partner-1', 
    'finish@decor.com', 
    'password', 
    'Elite Finishing Co.', 
    'شركة تشطيبات النخبة', 
    'finishing', 
    'FINISHING_PARTNER', 
    'active', 
    'professional', 
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=150&h=150&fit=crop',
    'High end finishing',
    'تشطيبات راقية',
    '{"whatsapp": {"enabled": true, "number": "01222222222"}, "phone": {"enabled": true, "number": "01222222222"}, "form": {"enabled": true}}'
),
(
    'agency-partner-1', 
    'sales@broker.com', 
    'password', 
    'Future Real Estate', 
    'المستقبل للتسويق العقاري', 
    'agency', 
    'AGENCY_PARTNER', 
    'active', 
    'basic', 
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
    'Trusted broker',
    'وسيط موثوق',
    '{"whatsapp": {"enabled": true, "number": "01111111111"}, "phone": {"enabled": true, "number": "01111111111"}, "form": {"enabled": true}}'
),
(
    'individual-listings', 
    'listings@onlyhelio.com', 
    'password', 
    'Individual Listings', 
    'عقارات الأفراد', 
    'agency', 
    'AGENCY_PARTNER', 
    'active', 
    'basic', 
    'https://via.placeholder.com/150',
    'Platform account',
    'حساب المنصة',
    '{"whatsapp": {"enabled": false}, "phone": {"enabled": false}, "form": {"enabled": true}}'
);

-- Projects
INSERT INTO "Project" 
("id", "partnerId", "name_en", "name_ar", "description_en", "description_ar", "imageUrl", "features", "createdAt")
VALUES 
(
    'project-1', 
    'dev-partner-1', 
    'Helio Gardens Compound', 
    'كمبوند حدائق هليوبوليس', 
    'A luxury residential compound featuring vast green spaces and modern amenities.', 
    'مجمع سكني فاخر يتميز بمساحات خضراء واسعة وخدمات عصرية.', 
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop',
    '[{"icon": "ParkIcon", "text": {"en": "Large Parks", "ar": "حدائق واسعة"}}, {"icon": "SwimmingPoolIcon", "text": {"en": "Swimming Pools", "ar": "حمامات سباحة"}}]',
    NOW()
);

-- Properties
INSERT INTO "Property" 
("id", "partnerId", "projectId", "title_en", "title_ar", "description_en", "description_ar", "address_en", "address_ar", "price", "price_en", "price_ar", "area", "type_en", "type_ar", "status", "listingStatus", "imageUrl", "beds", "baths", "finishingStatus_en", "finishingStatus_ar", "isInCompound", "location", "createdAt")
VALUES 
(
    'prop-1', 
    'dev-partner-1', 
    'project-1', 
    'Luxury Apartment with Garden View', 
    'شقة فاخرة تطل على الحديقة', 
    'Beautiful apartment in the heart of Helio Gardens.', 
    'شقة جميلة في قلب حدائق هليوبوليس.', 
    'Helio Gardens, District 5', 
    'حدائق هليوبوليس، الحي الخامس', 
    3500000, '3,500,000 EGP', '3,500,000 ج.م', 
    180, 'Apartment', 'شقة', 'For Sale', 'active', 
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
    3, 2, 'Semi-finished', 'نصف تشطيب', true,
    '{"lat": 30.115, "lng": 31.630}',
    NOW()
),
(
    'prop-2', 
    'agency-partner-1', 
    NULL, 
    'Standalone Villa for Resale', 
    'فيلا مستقلة إعادة بيع', 
    'Spacious villa with private pool.', 
    'فيلا واسعة مع حمام سباحة خاص.', 
    'District 3, New Heliopolis', 
    'الحي الثالث، هليوبوليس الجديدة', 
    8200000, '8,200,000 EGP', '8,200,000 ج.م', 
    450, 'Villa', 'فيلا', 'For Sale', 'active', 
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop',
    5, 4, 'Core & Shell', 'بدون تشطيب', false,
    '{"lat": 30.120, "lng": 31.640}',
    NOW()
);

-- Portfolio
INSERT INTO "PortfolioItem" 
("id", "partnerId", "title_en", "title_ar", "category_en", "category_ar", "imageUrl", "availability", "price", "createdAt")
VALUES 
(
    'port-1', 
    'finish-partner-1', 
    'Modern Living Room Design', 
    'تصميم غرفة معيشة مودرن', 
    'Interior Design', 
    'تصميم داخلي', 
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&h=800&fit=crop',
    'Made to Order',
    15000,
    NOW()
);
