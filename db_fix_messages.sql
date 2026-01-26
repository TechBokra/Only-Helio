
-- ====================================================================================
-- FIX MESSAGING FOR ALL REQUEST TYPES
-- ====================================================================================

-- 1. Drop the Foreign Key constraint that forces messages to be linked only to "Lead" table.
-- This allows us to use "LeadMessage" table for PropertyRequests, PartnerRequests, etc.
ALTER TABLE "LeadMessage" DROP CONSTRAINT IF EXISTS "LeadMessage_leadId_fkey";

-- 2. Optional: Rename column for clarity (Not strictly necessary for logic, keeping it 'leadId' to minimize code changes)
-- ALTER TABLE "LeadMessage" RENAME COLUMN "leadId" TO "requestId";
