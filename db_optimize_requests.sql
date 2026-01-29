
-- ====================================================================================
-- ONLY HELIO - REQUESTS OPTIMIZATION SCRIPT
-- Run this to support the new Admin Dashboard Sorting & Filtering features efficiently.
-- ====================================================================================

-- 1. DROP FK CONSTRAINT ON MESSAGES (Vital for Notes on Partner/Property Requests)
-- This allows attaching messages/notes to ANY request ID, not just Leads.
ALTER TABLE "LeadMessage" DROP CONSTRAINT IF EXISTS "LeadMessage_leadId_fkey";


-- 2. CREATE INDEXES (Performance for Sorting & Filtering)

-- Partner Requests
CREATE INDEX IF NOT EXISTS idx_preq_status ON "PartnerRequest" ("status");
CREATE INDEX IF NOT EXISTS idx_preq_created ON "PartnerRequest" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_preq_search ON "PartnerRequest" ("companyName", "contactPhone");

-- Property Requests
CREATE INDEX IF NOT EXISTS idx_propreq_status ON "PropertyListingRequest" ("status");
CREATE INDEX IF NOT EXISTS idx_propreq_created ON "PropertyListingRequest" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_propreq_search ON "PropertyListingRequest" ("customerName", "customerPhone");

-- Contact Requests
CREATE INDEX IF NOT EXISTS idx_contact_status ON "ContactRequest" ("status");
CREATE INDEX IF NOT EXISTS idx_contact_created ON "ContactRequest" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_contact_search ON "ContactRequest" ("name", "phone");

-- Property Inquiries
CREATE INDEX IF NOT EXISTS idx_inquiry_status ON "PropertyInquiry" ("status");
CREATE INDEX IF NOT EXISTS idx_inquiry_created ON "PropertyInquiry" ("createdAt" DESC);


-- 3. DATA NORMALIZATION (Ensure Status consistency for Tabs)
-- Convert any 'Pending', 'New' variations to lowercase to match frontend logic

UPDATE "PartnerRequest" SET "status" = LOWER("status");
UPDATE "PropertyListingRequest" SET "status" = LOWER("status");
UPDATE "ContactRequest" SET "status" = LOWER("status");
UPDATE "PropertyInquiry" SET "status" = LOWER("status");
UPDATE "Lead" SET "status" = LOWER("status");

-- Ensure default status is 'pending' if null
UPDATE "PartnerRequest" SET "status" = 'pending' WHERE "status" IS NULL;
UPDATE "PropertyListingRequest" SET "status" = 'pending' WHERE "status" IS NULL;
UPDATE "ContactRequest" SET "status" = 'pending' WHERE "status" IS NULL;
UPDATE "PropertyInquiry" SET "status" = 'pending' WHERE "status" IS NULL;
UPDATE "Lead" SET "status" = 'new' WHERE "status" IS NULL;
