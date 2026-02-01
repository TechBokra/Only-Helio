
-- 1. Add Category Column
ALTER TABLE "PartnerService" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'General';

-- 2. Update existing services with categories based on titles (Heuristic update)
UPDATE "PartnerService"
SET "category" = CASE 
    WHEN "title_en" ILIKE '%Design%' THEN 'Design'
    WHEN "title_en" ILIKE '%Landscape%' OR "title_en" ILIKE '%Garden%' THEN 'Landscape'
    WHEN "title_en" ILIKE '%Smart%' OR "title_en" ILIKE '%Security%' THEN 'Technology'
    WHEN "title_en" ILIKE '%Finishing%' OR "title_en" ILIKE '%Gypsum%' THEN 'Finishing'
    ELSE 'General'
END;
