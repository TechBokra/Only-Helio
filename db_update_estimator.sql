
-- This script updates the JSON structure in SystemSetting for 'ai_estimator_config'
-- It adds default values for min/max prices, labor costs, and supervision rate to existing data.

UPDATE "SystemSetting"
SET "value" = jsonb_set(
    "value",
    '{supervisionRate}',
    '15'::jsonb
)
WHERE "key" = 'ai_estimator_config' AND NOT ("value" ? 'supervisionRate');

-- Add Global Notes if missing
UPDATE "SystemSetting"
SET "value" = jsonb_set(
    "value",
    '{globalNotes}',
    '{"ar": "الأسعار استرشادية وتختلف حسب السوق.", "en": "Prices are indicative and subject to market changes."}'::jsonb
)
WHERE "key" = 'ai_estimator_config' AND NOT ("value" ? 'globalNotes');

-- NOTE: Updating nested arrays deeply with SQL JSONB functions is complex and error-prone if structure varies.
-- It is recommended to use the Admin Dashboard UI to re-save the configuration which will overwrite the JSON with the correct structure defined in the code.
-- The code fallback logic handles missing fields by treating 'price' as 'minPrice' temporarily if needed, but the Admin UI save is the cleanest migration path.
