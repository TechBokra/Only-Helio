
-- ====================================================================================
-- ONLY HELIO - FIX PLANS SCHEMA
-- Ensure PlanConfiguration has JSONB limits and commission columns
-- ====================================================================================

-- 1. Add columns if they don't exist
ALTER TABLE "PlanConfiguration" ADD COLUMN IF NOT EXISTS "limits" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE "PlanConfiguration" ADD COLUMN IF NOT EXISTS "commissionRateSale" NUMERIC;
ALTER TABLE "PlanConfiguration" ADD COLUMN IF NOT EXISTS "commissionRateRent" NUMERIC;

-- 2. Update existing data with defaults if limits are null/empty
-- Developer Basic
UPDATE "PlanConfiguration" 
SET "limits" = '{"projects": 1, "units": 10}'::jsonb 
WHERE "category" = 'developer' AND "tier" = 'basic' AND ("limits" IS NULL OR "limits" = '{}'::jsonb);

-- Developer Professional
UPDATE "PlanConfiguration" 
SET "limits" = '{"projects": 5, "units": 50}'::jsonb 
WHERE "category" = 'developer' AND "tier" = 'professional' AND ("limits" IS NULL OR "limits" = '{}'::jsonb);

-- Agency Basic
UPDATE "PlanConfiguration" 
SET "limits" = '{"propertiesTotal": 3}'::jsonb 
WHERE "category" = 'agency' AND "tier" = 'basic' AND ("limits" IS NULL OR "limits" = '{}'::jsonb);

-- Agency Professional
UPDATE "PlanConfiguration" 
SET "limits" = '{"propertiesTotal": 15}'::jsonb 
WHERE "category" = 'agency' AND "tier" = 'professional' AND ("limits" IS NULL OR "limits" = '{}'::jsonb);

-- Finishing Commission
UPDATE "PlanConfiguration" 
SET "commissionRateSale" = 10, "limits" = '{"portfolio": -1}'::jsonb 
WHERE "category" = 'finishing' AND "tier" = 'commission';

-- Individual Commission Sale
UPDATE "PlanConfiguration" 
SET "commissionRateSale" = 2.5 
WHERE "category" = 'individual' AND "tier" = 'commission' AND "subCategory" = 'sale';

-- Individual Commission Rent
UPDATE "PlanConfiguration" 
SET "commissionRateRent" = 1 -- 1 month rent implies value 1 if logic treats it as month count, or specific value
WHERE "category" = 'individual' AND "tier" = 'commission' AND "subCategory" = 'rent';
