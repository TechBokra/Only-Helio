
-- 1. Remove Duplicate Property Listing Requests (Keep the oldest one)
DELETE FROM "PropertyListingRequest" a USING "PropertyListingRequest" b
WHERE a.id > b.id 
AND a."customerPhone" = b."customerPhone"
AND a."createdAt" = b."createdAt";

-- 2. Remove Properties with missing titles (caused by empty requests) to fix Dashboard Crash
DELETE FROM "Property" 
WHERE "title_en" IS NULL OR "title_ar" IS NULL;

-- 3. Remove Leads associated with deleted properties
DELETE FROM "Lead"
WHERE "propertyId" IS NOT NULL 
AND "propertyId" NOT IN (SELECT "id" FROM "Property");
