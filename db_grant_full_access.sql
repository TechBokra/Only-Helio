
-- ====================================================================================
-- ONLY HELIO - GRANT FULL ACCESS SCRIPT
-- Purpose: Ensure Application has unrestricted CRUD access to all 27 tables.
-- WARNING: Use this for Development/MVP phase. For Production, specific RLS policies are recommended.
-- ====================================================================================

-- 1. Disable Row Level Security (RLS) on all tables to prevent permission blocks
-- This ensures 'service_role' and 'anon' (if configured) can write without complex policies.

ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Property" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "PortfolioItem" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "LeadMessage" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnerRequest" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "PropertyListingRequest" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ContactRequest" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "PropertyInquiry" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Banner" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemSetting" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "PlanConfiguration" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "RoutingRule" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "FormDefinition" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "PropertyType" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "FinishingStatus" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Amenity" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "DecorationCategory" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "AmenitiesOnProperties" DISABLE ROW LEVEL SECURITY;

-- If tables exist that we missed (future proofing):
-- Grant ALL privileges to the postgres and service_role users
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant usage on all sequences (for auto-incrementing IDs if any)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

