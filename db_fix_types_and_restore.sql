
-- 1. تنظيف الجداول المتعارضة (Lookups & Relations & CRM)
-- نستخدم CASCADE لحذف القيود المرتبطة تلقائياً
DROP TABLE IF EXISTS "AmenitiesOnProperties" CASCADE;
DROP TABLE IF EXISTS "Amenity" CASCADE;
DROP TABLE IF EXISTS "PropertyType" CASCADE;
DROP TABLE IF EXISTS "FinishingStatus" CASCADE;
DROP TABLE IF EXISTS "DecorationCategory" CASCADE;
DROP TABLE IF EXISTS "LeadMessage" CASCADE;
DROP TABLE IF EXISTS "Lead" CASCADE;

-- 2. إعادة إنشاء جداول البحث (Lookups) بنوع TEXT للمعرفات
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

-- 3. إعادة إنشاء جدول الربط (AmenitiesOnProperties) متوافق مع TEXT
CREATE TABLE "AmenitiesOnProperties" (
    "propertyId" TEXT REFERENCES "Property"("id") ON DELETE CASCADE,
    "amenityId" TEXT REFERENCES "Amenity"("id") ON DELETE CASCADE,
    PRIMARY KEY ("propertyId", "amenityId")
);

-- 4. إعادة إنشاء جداول الـ CRM (العملاء والرسائل)
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

-- 5. جداول الطلبات الأخرى (إن لم تكن موجودة)
CREATE TABLE IF NOT EXISTS "PartnerRequest" (
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

CREATE TABLE IF NOT EXISTS "PropertyListingRequest" (
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

CREATE TABLE IF NOT EXISTS "ContactRequest" (
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

CREATE TABLE IF NOT EXISTS "PropertyInquiry" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. جداول النظام (Banner, Notification, etc)
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "message" JSONB NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Banner" (
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

CREATE TABLE IF NOT EXISTS "SystemSetting" (
    "key" TEXT PRIMARY KEY,
    "value" JSONB NOT NULL,
    "group" TEXT,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Transaction" (
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

CREATE TABLE IF NOT EXISTS "PlanConfiguration" (
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

CREATE TABLE IF NOT EXISTS "RoutingRule" (
    "id" TEXT PRIMARY KEY,
    "name_en" TEXT, "name_ar" TEXT,
    "active" BOOLEAN DEFAULT true,
    "conditions" JSONB,
    "action" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "FormDefinition" (
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

-- 7. Seed Basic Lookups
INSERT INTO "PropertyType" (name_en, name_ar) VALUES 
('Apartment', 'شقة'), ('Villa', 'فيلا'), ('Commercial', 'تجاري'), ('Land', 'أرض')
ON CONFLICT DO NOTHING;

INSERT INTO "FinishingStatus" (name_en, name_ar, "applicableTo") VALUES 
('Core & Shell', 'بدون تشطيب', ARRAY['Apartment', 'Villa']),
('Semi-finished', 'نصف تشطيب', ARRAY['Apartment', 'Villa']),
('Fully Finished', 'تشطيب كامل', ARRAY['Apartment', 'Villa', 'Commercial'])
ON CONFLICT DO NOTHING;

INSERT INTO "Amenity" (name_en, name_ar) VALUES 
('Pool', 'حمام سباحة'), ('Garden', 'حديقة'), ('Security', 'أمن'), ('Parking', 'موقف سيارات')
ON CONFLICT DO NOTHING;
