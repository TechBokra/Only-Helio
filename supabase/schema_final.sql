
-- ====================================================================================
-- ONLY HELIO - PRODUCTION READY SCHEMA (v2.0)
-- Consolidated from all previous migrations
-- ====================================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CORE TABLES

-- Users (Partners & Admins)
CREATE TABLE IF NOT EXISTS "User" (
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

-- Projects
CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT PRIMARY KEY,
    "partnerId" TEXT REFERENCES "User"("id") ON DELETE CASCADE,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description_en" TEXT,
    "description_ar" TEXT,
    "projectType" TEXT,
    "imageUrl" TEXT,
    "features" JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties
CREATE TABLE IF NOT EXISTS "Property" (
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

-- Portfolio & Services
CREATE TABLE IF NOT EXISTS "PortfolioItem" (
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

CREATE TABLE IF NOT EXISTS "PartnerService" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "partnerId" TEXT REFERENCES "User"("id") ON DELETE CASCADE,
    "title_en" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "description_en" TEXT,
    "description_ar" TEXT,
    "category" TEXT DEFAULT 'General',
    "priceRange_en" TEXT,
    "priceRange_ar" TEXT,
    "estimatedTime_en" TEXT,
    "estimatedTime_ar" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRM TABLES

CREATE TABLE IF NOT EXISTS "Lead" (
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

CREATE TABLE IF NOT EXISTS "LeadMessage" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "leadId" TEXT NOT NULL, 
    "sender" TEXT NOT NULL,
    "senderId" TEXT,
    "type" TEXT DEFAULT 'note',
    "content" TEXT,
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forms Tables
CREATE TABLE IF NOT EXISTS "PartnerRequest" (
    "id" TEXT PRIMARY KEY,
    "companyName" TEXT, "companyType" TEXT, "contactName" TEXT, "contactEmail" TEXT, "contactPhone" TEXT,
    "description" TEXT, "website" TEXT, "companyAddress" TEXT, "logo" TEXT, 
    "documents" JSONB DEFAULT '[]'::jsonb, "managementContacts" JSONB DEFAULT '[]'::jsonb,
    "subscriptionPlan" TEXT, "status" TEXT DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "PropertyListingRequest" (
    "id" TEXT PRIMARY KEY,
    "customerName" TEXT, "customerPhone" TEXT, "contactTime" TEXT,
    "cooperationType" TEXT, "status" TEXT DEFAULT 'pending', "managerId" TEXT,
    "propertyDetails" JSONB DEFAULT '{}'::jsonb, "images" JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ContactRequest" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL, "phone" TEXT NOT NULL, "message" TEXT,
    "inquiryType" TEXT, "businessType" TEXT, "companyName" TEXT,
    "status" TEXT DEFAULT 'pending', "managerId" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "PropertyInquiry" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "customerName" TEXT NOT NULL, "customerPhone" TEXT NOT NULL, "details" TEXT,
    "status" TEXT DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SYSTEM & CONFIG

CREATE TABLE IF NOT EXISTS "SystemSetting" ( "key" TEXT PRIMARY KEY, "value" JSONB NOT NULL, "group" TEXT, "updatedAt" TIMESTAMP DEFAULT NOW() );
CREATE TABLE IF NOT EXISTS "FormDefinition" ( "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY, "slug" TEXT UNIQUE NOT NULL, "title_en" TEXT, "title_ar" TEXT, "description_en" TEXT, "description_ar" TEXT, "category" TEXT, "destination" TEXT, "submitButtonLabel_en" TEXT, "submitButtonLabel_ar" TEXT, "isActive" BOOLEAN DEFAULT true, "fields" JSONB DEFAULT '[]'::jsonb, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW() );
CREATE TABLE IF NOT EXISTS "PlanConfiguration" ( "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY, "category" TEXT NOT NULL, "tier" TEXT NOT NULL, "subCategory" TEXT, "name_en" TEXT, "name_ar" TEXT, "price_en" TEXT, "price_ar" TEXT, "description_en" TEXT, "description_ar" TEXT, "features_en" TEXT[], "features_ar" TEXT[], "commissionRate" NUMERIC, "billingCycle" TEXT, "limits" JSONB, "commissionConfig" JSONB, "updatedAt" TIMESTAMP DEFAULT NOW() );
CREATE TABLE IF NOT EXISTS "RoutingRule" ( "id" TEXT PRIMARY KEY, "name_en" TEXT, "name_ar" TEXT, "active" BOOLEAN DEFAULT true, "conditions" JSONB, "action" JSONB, "createdAt" TIMESTAMP DEFAULT NOW() );
CREATE TABLE IF NOT EXISTS "Notification" ( "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY, "userId" TEXT, "message" JSONB, "link" TEXT, "isRead" BOOLEAN, "createdAt" TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS "Banner" ( "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY, "title" TEXT, "imageUrl" TEXT, "link" TEXT, "locations" TEXT[], "status" TEXT, "startDate" TIMESTAMP, "endDate" TIMESTAMP, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS "Transaction" ( "id" TEXT PRIMARY KEY, "userId" TEXT, "userName" TEXT, "amount" NUMERIC, "currency" TEXT, "type" TEXT, "status" TEXT, "method" TEXT, "description" TEXT, "relatedEntityId" TEXT, "receiptUrl" TEXT, "referenceNumber" TEXT, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW());

-- Lookups
CREATE TABLE IF NOT EXISTS "PropertyType" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "name_en" TEXT, "name_ar" TEXT);
CREATE TABLE IF NOT EXISTS "FinishingStatus" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "name_en" TEXT, "name_ar" TEXT, "applicableTo" TEXT[]);
CREATE TABLE IF NOT EXISTS "Amenity" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "name_en" TEXT, "name_ar" TEXT, "applicableTo" TEXT[]);
CREATE TABLE IF NOT EXISTS "DecorationCategory" ("id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "name_en" TEXT, "name_ar" TEXT, "description_en" TEXT, "description_ar" TEXT);

-- 5. POLICIES (RLS)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Property" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Active Partners" ON "User";
CREATE POLICY "Public Active Partners" ON "User" FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Public Active Properties" ON "Property";
CREATE POLICY "Public Active Properties" ON "Property" FOR SELECT USING (listingStatus = 'active');

-- Grant Access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT SELECT ON "Property", "Project", "User", "PortfolioItem", "PartnerService", "Banner", "SystemSetting", "PlanConfiguration", "FormDefinition", "PropertyType", "FinishingStatus", "Amenity", "DecorationCategory" TO anon;
GRANT INSERT ON "Lead", "PartnerRequest", "PropertyListingRequest", "ContactRequest", "PropertyInquiry", "Transaction" TO anon;
