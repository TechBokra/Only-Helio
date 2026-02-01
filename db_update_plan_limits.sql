
-- ====================================================================================
-- ONLY HELIO - UPDATE PLAN LIMITS (Services & Portfolio)
-- ====================================================================================

-- 1. Engineer Plans
UPDATE "PlanConfiguration"
SET "limits" = "limits" || '{"services": 3, "portfolio": 5}'::jsonb
WHERE "category" = 'finishing' AND "subCategory" = 'engineer' AND "tier" = 'freelancer_basic';

UPDATE "PlanConfiguration"
SET "limits" = "limits" || '{"services": 10, "portfolio": -1}'::jsonb
WHERE "category" = 'finishing' AND "subCategory" = 'engineer' AND "tier" = 'freelancer_pro';

-- 2. Office Plans
UPDATE "PlanConfiguration"
SET "limits" = "limits" || '{"services": 15, "portfolio": 50}'::jsonb
WHERE "category" = 'finishing' AND "subCategory" = 'office' AND "tier" = 'studio_growth';

-- 3. Company Plans
UPDATE "PlanConfiguration"
SET "limits" = "limits" || '{"services": -1, "portfolio": -1}'::jsonb
WHERE "category" = 'finishing' AND "subCategory" = 'company' AND "tier" = 'corporate_elite';

-- 4. Legacy/General Finishing Plans (Fallback)
UPDATE "PlanConfiguration"
SET "limits" = "limits" || '{"services": 3, "portfolio": 5}'::jsonb
WHERE "category" = 'finishing' AND "tier" = 'commission' AND NOT ("limits" ? 'services');

UPDATE "PlanConfiguration"
SET "limits" = "limits" || '{"services": 10, "portfolio": 20}'::jsonb
WHERE "category" = 'finishing' AND "tier" = 'professional' AND NOT ("limits" ? 'services');

UPDATE "PlanConfiguration"
SET "limits" = "limits" || '{"services": -1, "portfolio": -1}'::jsonb
WHERE "category" = 'finishing' AND "tier" = 'elite' AND NOT ("limits" ? 'services');
