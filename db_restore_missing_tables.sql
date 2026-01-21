
-- 1. جداول البحث (Lookups) - ضرورية للفلاتر
CREATE TABLE IF NOT EXISTS "PropertyType" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "FinishingStatus" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "applicableTo" TEXT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS "Amenity" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "applicableTo" TEXT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS "DecorationCategory" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description_en" TEXT,
    "description_ar" TEXT
);

-- 2. جدول الربط (AmenitiesOnProperties) - الذي سبب المشكلة سابقاً
CREATE TABLE IF NOT EXISTS "AmenitiesOnProperties" (
    "propertyId" TEXT REFERENCES "Property"("id") ON DELETE CASCADE,
    "amenityId" UUID REFERENCES "Amenity"("id") ON DELETE CASCADE,
    PRIMARY KEY ("propertyId", "amenityId")
);

-- 3. جداول الـ CRM (العملاء والطلبات) - حل مشكلة Lead Missing
CREATE TABLE IF NOT EXISTS "Lead" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "partnerId" TEXT REFERENCES "User"("id") ON DELETE SET NULL, -- من يملك هذا العميل
    "managerId" TEXT, -- للاستخدام الداخلي
    "propertyId" TEXT REFERENCES "Property"("id") ON DELETE SET NULL,
    "serviceType" TEXT NOT NULL, -- finishing, decorations, property
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "serviceTitle" TEXT,
    "status" TEXT DEFAULT 'new',
    "contactTime" TEXT,
    "notes" TEXT,
    "assignedTo" TEXT, -- User ID
    "referenceImage" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "LeadMessage" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "leadId" UUID REFERENCES "Lead"("id") ON DELETE CASCADE,
    "sender" TEXT NOT NULL, -- system, admin, partner, client
    "senderId" TEXT,
    "type" TEXT DEFAULT 'note', -- message, note
    "content" TEXT,
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. جداول الطلبات العامة (Requests Forms)
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
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. جداول النظام والمحتوى والمالية
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "message" JSONB NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Banner" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    "type" TEXT, -- subscription, listing_fee
    "status" TEXT, -- paid, pending
    "method" TEXT, -- instapay, card
    "description" TEXT,
    "relatedEntityId" TEXT,
    "receiptUrl" TEXT,
    "referenceNumber" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "PlanConfiguration" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- 6. Seed Basic Lookups (لضمان عمل الفلاتر)
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
