
-- ====================================================================================
-- ONLY HELIO - FLEXIBLE COMMISSION SETTINGS
-- Adds JSONB column to store advanced commission configuration
-- ====================================================================================

ALTER TABLE "PlanConfiguration" 
ADD COLUMN IF NOT EXISTS "commissionConfig" JSONB DEFAULT '{}'::jsonb;
