
-- ====================================================================================
-- FIX MESSAGING FOR ALL REQUEST TYPES
-- ====================================================================================

-- 1. Drop the Foreign Key constraint that forces messages to be linked only to "Lead" table.
-- This allows us to use "LeadMessage" table for PropertyRequests, PartnerRequests, etc.
ALTER TABLE "LeadMessage" DROP CONSTRAINT IF EXISTS "LeadMessage_leadId_fkey";

-- 2. Ensure "LeadMessage" exists (if not already)
CREATE TABLE IF NOT EXISTS "LeadMessage" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "leadId" TEXT NOT NULL, -- Generic ID reference
    "sender" TEXT NOT NULL,
    "senderId" TEXT,
    "type" TEXT DEFAULT 'note',
    "content" TEXT,
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
