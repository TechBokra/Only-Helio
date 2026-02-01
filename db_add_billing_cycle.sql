
-- ====================================================================================
-- ONLY HELIO - ENHANCE FINANCIAL SETTINGS
-- Adds Billing Cycle to Plan Configuration
-- ====================================================================================

-- 1. Add billingCycle column
ALTER TABLE "PlanConfiguration" 
ADD COLUMN IF NOT EXISTS "billingCycle" TEXT DEFAULT 'monthly';

-- 2. Update existing data defaults based on price text logic (approximate)
UPDATE "PlanConfiguration" SET "billingCycle" = 'monthly' WHERE "price_en" ILIKE '%/mo%' OR "price_en" ILIKE '%month%';
UPDATE "PlanConfiguration" SET "billingCycle" = 'yearly' WHERE "price_en" ILIKE '%/yr%' OR "price_en" ILIKE '%year%';
UPDATE "PlanConfiguration" SET "billingCycle" = 'one_time' WHERE "price_en" NOT ILIKE '%/%' AND "price_en" != 'Free';
UPDATE "PlanConfiguration" SET "billingCycle" = 'one_time' WHERE "category" = 'finishing' AND "tier" = 'commission';
