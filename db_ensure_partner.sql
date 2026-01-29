
-- Ensure the generic partner for individual listings exists
-- Updated to reflect "ONLY HELIO" branding
-- FIXED: Added quotes to EXCLUDED columns to match case-sensitive definition
INSERT INTO "User" (
    "id", 
    "email", 
    "name_en", 
    "name_ar", 
    "type", 
    "role", 
    "status", 
    "subscriptionPlan", 
    "contactMethods"
)
VALUES (
    'individual-listings', 
    'listings@onlyhelio.com', 
    'ONLY HELIO', 
    'أونلي هيليو', 
    'agency', 
    'AGENCY_PARTNER', 
    'active', 
    'elite', 
    '{"whatsapp": {"enabled": false}, "phone": {"enabled": false}, "form": {"enabled": true}}'::jsonb
)
ON CONFLICT ("id") DO UPDATE SET
    "name_en" = EXCLUDED."name_en",
    "name_ar" = EXCLUDED."name_ar",
    "subscriptionPlan" = EXCLUDED."subscriptionPlan";
