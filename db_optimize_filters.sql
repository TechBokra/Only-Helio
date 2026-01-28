
-- ====================================================================================
-- ONLY HELIO - FILTER OPTIMIZATION
-- Adding indexes for numerical range queries and status filters
-- Corrected with quotes for case-sensitive column names
-- ====================================================================================

-- 1. Index for Price filtering (Range)
CREATE INDEX IF NOT EXISTS idx_property_price ON "Property" ("price");

-- 2. Index for Area filtering (Range)
CREATE INDEX IF NOT EXISTS idx_property_area ON "Property" ("area");

-- 3. Index for Room counts (GTE queries)
CREATE INDEX IF NOT EXISTS idx_property_beds ON "Property" ("beds");
CREATE INDEX IF NOT EXISTS idx_property_baths ON "Property" ("baths");

-- 4. Compound Index for common combination: Status + Type
-- Note: 'listingStatus' and 'type_en' must be quoted if created with mixed case or specific naming
CREATE INDEX IF NOT EXISTS idx_property_status_type ON "Property" ("listingStatus", "type_en");

-- 5. Index for GIN (JSONB) filtering on Amenities
-- This significantly speeds up query.contains('amenities', ...)
CREATE INDEX IF NOT EXISTS idx_property_amenities ON "Property" USING GIN ("amenities");

-- 6. Index for Project ID (Foreign Key lookups are frequent)
CREATE INDEX IF NOT EXISTS idx_property_project ON "Property" ("projectId");

-- 7. Ensure Partner ID is indexed
CREATE INDEX IF NOT EXISTS idx_property_partner ON "Property" ("partnerId");
