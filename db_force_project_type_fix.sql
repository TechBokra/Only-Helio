
-- 1. Ensure column exists (Safe add)
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "projectType" TEXT;

-- 2. Force PostgREST schema cache reload
-- This is critical for PGRST204 errors when column actually exists but API doesn't know it
NOTIFY pgrst, 'reload config';
